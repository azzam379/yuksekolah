<?php

namespace App\Http\Controllers\API;

use App\Models\Registration;
use App\Models\School;
use App\Models\User;
use App\Models\RegistrationFile;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RegistrationController extends Controller
{
    // Submit registration form (via school link)
    // Submit registration form (via school link)
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'school_link' => 'required|string',
            'form_data' => 'required|array',
            'form_data.name' => 'required|string',
            'form_data.email' => 'required|email', // Removed unique:users,email
            'form_data.phone' => 'required|string',
            'form_data.program' => 'required|string|in:IPA,IPS,Bahasa,Agama',
        ]);

        // Cari sekolah berdasarkan link (exact match OR suffix match for legacy data)
        $link = $validated['school_link'];
        $school = School::where(function ($q) use ($link) {
            $q->where('registration_link', $link)
                ->orWhere('registration_link', 'LIKE', "%/$link");
        })
            ->where('status', 'active')
            ->firstOrFail();

        // Start Transaction
        \DB::beginTransaction();

        try {
            $email = $validated['form_data']['email'];
            $existingUser = User::where('email', $email)->first();
            $student = null;
            $password = null;

            if ($existingUser) {
                // Jika user sudah ada, cek apakah request ini dari user yang sudah login
                $currentUser = auth('sanctum')->user();

                if ($currentUser && $currentUser->id === $existingUser->id) {
                    // User valid dan sedang login -> Gunakan user ini
                    $student = $existingUser;
                } else {
                    \DB::rollBack();
                    // User ada tapi tidak login / token salah -> Minta login
                    return response()->json([
                        'message' => 'Email sudah terdaftar. Silakan login terlebih dahulu untuk mendaftar ke sekolah baru.',
                        'code' => 'EMAIL_EXISTS'
                    ], 409);
                }
            } else {
                // User baru -> Create with Random Password
                $password = \Illuminate\Support\Str::random(8);
                $student = User::create([
                    'name' => $validated['form_data']['name'],
                    'email' => $validated['form_data']['email'],
                    'password' => Hash::make($password),
                    'role' => 'student',
                    'school_id' => $school->id, // Set initial school
                ]);
            }

            // Cek duplicate registration di sekolah yang sama
            $existingRegistration = Registration::where('student_id', $student->id)
                ->where('school_id', $school->id)
                ->first();

            if ($existingRegistration) {
                \DB::rollBack();
                return response()->json([
                    'message' => 'Anda sudah terdaftar di sekolah ini.',
                    'registration_id' => $existingRegistration->id
                ], 409);
            }

            // Create registration
            $registration = Registration::create([
                'student_id' => $student->id,
                'school_id' => $school->id,
                'program' => $validated['form_data']['program'],
                'academic_year' => date('Y') . '/' . (date('Y') + 1),
                'status' => 'submitted',
                'form_data' => $validated['form_data'],
            ]);

            \DB::commit();

            // Send welcome email (Queue capable)
            // Only send if new user (password is generated)
            if ($password) {
                try {
                    \Illuminate\Support\Facades\Mail::to($student->email)->send(
                        new \App\Mail\StudentRegistered($student, $school, $password)
                    );
                } catch (\Throwable $e) {
                    \Log::error('Failed to send student registration email: ' . $e->getMessage());
                    // Email fail shouldn't rollback registration
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
            $registrations = Registration::with('student')
                ->where('school_id', $user->school_id)
                ->orderBy('created_at', 'desc')
                ->paginate(20);
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
}