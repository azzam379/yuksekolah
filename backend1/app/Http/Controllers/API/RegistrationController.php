<?php

namespace App\Http\Controllers\API;

use App\Models\Registration;
use App\Models\RegistrationPeriod;
use App\Models\School;
use App\Models\User;
use App\Models\RegistrationFile;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RegistrationController extends Controller
{
    // Submit registration form (via period link or school link)
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'period_link' => 'nullable|string',
            'school_link' => 'nullable|string',
            'form_data' => 'required|array',
            'form_data.name' => 'required|string',
            'form_data.email' => 'required|email',
            'form_data.phone' => 'required|string',
            'form_data.program' => 'required|string',
        ]);

        // Determine if using period or school link
        $period = null;
        $school = null;
        $academicYear = date('Y') . '/' . (date('Y') + 1);

        if (!empty($validated['period_link'])) {
            // New flow: via RegistrationPeriod
            $period = RegistrationPeriod::where('registration_link', $validated['period_link'])->first();

            if (!$period) {
                return response()->json(['message' => 'Link pendaftaran tidak valid'], 404);
            }

            // Check if period is open
            if (!$period->is_open) {
                return response()->json(['message' => 'Pendaftaran untuk periode ini sudah ditutup'], 400);
            }

            // Check quota
            if ($period->quota !== null && $period->registered_count >= $period->quota) {
                return response()->json(['message' => 'Kuota pendaftaran untuk periode ini sudah penuh'], 400);
            }

            // Validate program is in period's programs list
            if (!in_array($validated['form_data']['program'], $period->programs)) {
                return response()->json(['message' => 'Program/jurusan tidak tersedia untuk periode ini'], 400);
            }

            $school = $period->school;
            $academicYear = $period->academic_year;

        } elseif (!empty($validated['school_link'])) {
            // Legacy flow: via School link
            $link = $validated['school_link'];
            $school = School::where(function ($q) use ($link) {
                $q->where('registration_link', $link)
                    ->orWhere('registration_link', 'LIKE', "%/$link");
            })
                ->where('status', 'active')
                ->first();

            if (!$school) {
                return response()->json(['message' => 'Link pendaftaran tidak valid atau sekolah belum aktif'], 404);
            }
        } else {
            return response()->json(['message' => 'Link pendaftaran diperlukan'], 400);
        }

        // Start Transaction
        \DB::beginTransaction();

        try {
            $email = $validated['form_data']['email'];
            $existingUser = User::where('email', $email)->first();
            $student = null;
            $password = null;

            if ($existingUser) {
                $currentUser = auth('sanctum')->user();

                if ($currentUser && $currentUser->id === $existingUser->id) {
                    $student = $existingUser;
                } else {
                    \DB::rollBack();
                    return response()->json([
                        'message' => 'Email sudah terdaftar. Silakan login terlebih dahulu untuk mendaftar ke sekolah baru.',
                        'code' => 'EMAIL_EXISTS'
                    ], 409);
                }
            } else {
                $password = \Illuminate\Support\Str::random(8);
                $student = User::create([
                    'name' => $validated['form_data']['name'],
                    'email' => $validated['form_data']['email'],
                    'password' => Hash::make($password),
                    'role' => 'student',
                    'school_id' => $school->id,
                ]);
            }

            // Check duplicate registration
            $existingRegistration = Registration::where('student_id', $student->id)
                ->where('school_id', $school->id)
                ->when($period, function ($q) use ($period) {
                    return $q->where('period_id', $period->id);
                })
                ->first();

            if ($existingRegistration) {
                \DB::rollBack();
                return response()->json([
                    'message' => 'Anda sudah terdaftar di periode/sekolah ini.',
                    'registration_id' => $existingRegistration->id
                ], 409);
            }

            // Create registration
            $registration = Registration::create([
                'student_id' => $student->id,
                'school_id' => $school->id,
                'period_id' => $period?->id,
                'program' => $validated['form_data']['program'],
                'academic_year' => $academicYear,
                'status' => 'submitted',
                'form_data' => $validated['form_data'],
            ]);

            // Increment period registered count
            if ($period) {
                $period->incrementRegistered();
            }

            \DB::commit();

            // Send welcome email
            if ($password) {
                try {
                    \Illuminate\Support\Facades\Mail::to($student->email)->send(
                        new \App\Mail\StudentRegistered($student, $school, $password)
                    );
                } catch (\Throwable $e) {
                    \Log::error('Failed to send student registration email: ' . $e->getMessage());
                }
            }

            return response()->json([
                'message' => 'Pendaftaran berhasil dikirim',
                'registration_id' => $registration->id,
                'student_account' => $password ? [
                    'email' => $student->email,
                    'password' => $password
                ] : null
            ], 201);

        } catch (\Exception $e) {
            \DB::rollBack();
            throw $e;
        }
    }


    // Get registrations for school admin
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isSchoolAdmin()) {
            $query = Registration::with(['student', 'period:id,name,academic_year'])
                ->where('school_id', $user->school_id);

            // Filter by period_id if provided
            if ($request->has('period_id') && $request->period_id !== 'all') {
                $query->where('period_id', $request->period_id);
            }

            $registrations = $query->orderBy('created_at', 'desc')->paginate(20);
        } elseif ($user->isStudent()) {
            $registrations = $user->registrations()->with('school')->paginate(10);
        } else {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($registrations);
    }

    // Update registration status (verify/reject)
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->isSchoolAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:verified,rejected',
            'notes' => 'nullable|string'
        ]);

        $registration = Registration::where('id', $id)
            ->where('school_id', $user->school_id)
            ->firstOrFail();

        $registration->update([
            'status' => $validated['status'],
            'form_data' => array_merge($registration->form_data, [
                'admin_notes' => $validated['notes'] ?? '',
                'verified_at' => now()->toDateTimeString(),
                'verified_by' => $user->id
            ])
        ]);

        return response()->json([
            'message' => 'Status pendaftaran diperbarui',
            'registration' => $registration
        ]);
    }

    // Upload file for registration
    public function uploadFile(Request $request, $registrationId)
    {
        $request->validate([
            'file' => 'required|file|max:5120', // 5MB max
            'type' => 'required|in:photo,ijazah,kartu_keluarga,akta_lahir,transkrip_nilai,sertifikat_prestasi,other'
        ]);

        $registration = Registration::findOrFail($registrationId);

        // Verify ownership
        if ($request->user()->id !== $registration->student_id && !$request->user()->isSchoolAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $file = $request->file('file');
        $path = $file->store("registrations/{$registrationId}", 'public');

        $fileRecord = RegistrationFile::create([
            'registration_id' => $registrationId,
            'file_type' => $request->type,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName()
        ]);

        return response()->json([
            'message' => 'File berhasil diupload',
            'file' => $fileRecord
        ], 201);
    }

    // Reset student password (for school admin)
    public function resetStudentPassword(Request $request, $registrationId)
    {
        $user = $request->user();

        if (!$user->isSchoolAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $registration = Registration::where('id', $registrationId)
            ->where('school_id', $user->school_id)
            ->with('student')
            ->firstOrFail();

        if (!$registration->student) {
            return response()->json(['error' => 'Student not found'], 404);
        }

        // Generate new password
        $newPassword = Str::random(10);

        $registration->student->update([
            'password' => Hash::make($newPassword)
        ]);

        return response()->json([
            'message' => 'Password berhasil direset',
            'new_password' => $newPassword,
            'student_name' => $registration->student->name
        ]);
    }
}