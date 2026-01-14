<?php

namespace App\Http\Controllers\API;

use App\Models\School;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SchoolController extends Controller
{
    // Get all schools (for super admin)
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $status = $request->query('status');
        $search = $request->query('search');

        $query = School::with(['admins:id,name,email,school_id'])
            ->withCount([
                    'registrations',
                    'registrations as verified_count' => fn($q) => $q->where('status', 'verified'),
                    'registrations as pending_count' => fn($q) => $q->where('status', 'submitted'),
                ]);

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $schools = $query->orderBy('created_at', 'desc')->paginate(20);

        // Add active period and program breakdown for each school
        $schools->getCollection()->transform(function ($school) {
            // Get active period
            $activePeriod = $school->periods()->where('is_open', true)->whereNull('ended_at')->first();
            $school->active_period = $activePeriod ? [
                'id' => $activePeriod->id,
                'name' => $activePeriod->name,
                'academic_year' => $activePeriod->academic_year,
            ] : null;

            // Get program breakdown from registrations
            $programBreakdown = \DB::table('registrations')
                ->where('school_id', $school->id)
                ->selectRaw('program, COUNT(*) as count')
                ->groupBy('program')
                ->pluck('count', 'program')
                ->toArray();
            $school->program_breakdown = $programBreakdown;

            // Get first admin
            $school->admin = $school->admins->first();

            return $school;
        });

        return response()->json($schools);
    }

    // Verify school (approve)
    public function verify(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $school = School::findOrFail($id);

        $validated = $request->validate([
            'notes' => 'nullable|string|max:500'
        ]);

        // Update school status
        $school->update([
            'status' => 'active',
            'verified_at' => now(),
        ]);

        // Generate registration link jika belum ada
        if (!$school->registration_link) {
            $school->generateRegistrationLink();
        }

        // Reload school dengan data terbaru
        $school->refresh();

        // TODO: Send email notification to school admin
        try {
            $admin = $school->admins()->first();
            if ($admin) {
                // Construct Registration Link (Check if legacy Full URL or Token)
                $token = $school->registration_link;
                $isToken = strpos($token, 'http') === false;
                $APP_URL = env('FRONTEND_URL', 'http://localhost:3000');
                $fullLink = $isToken ? "{$APP_URL}/register/{$token}" : $token;

                \Illuminate\Support\Facades\Mail::to($admin->email)->send(
                    new \App\Mail\SchoolVerified($school, $fullLink)
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send verification email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Sekolah berhasil diverifikasi',
            'school' => $school,
            'registration_link' => $school->registration_link // ⭐ KIRIM LINK DI RESPONSE
        ]);
    }

    // Reject school registration
    public function reject(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $school = School::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        // Update school status
        $school->update([
            'status' => 'inactive',
            'verified_at' => null,
        ]);

        // TODO: Send email notification with rejection reason

        return response()->json([
            'message' => 'Pendaftaran sekolah ditolak',
            'school' => $school
        ]);
    }

    // Get school by registration link (public)
    public function getByLink($link)
    {
        $school = School::where(function ($q) use ($link) {
            $q->where('registration_link', $link)
                ->orWhere('registration_link', 'LIKE', "%/$link");
        })
            ->where('status', 'active')
            ->firstOrFail();

        return response()->json([
            'school' => $school,
            'programs' => ['IPA', 'IPS', 'Bahasa', 'Agama'] // Example programs
        ]);
    }

    // Update school info (admin only)
    public function update(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->isSchoolAdmin() || $user->school_id != $id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $school = School::findOrFail($id);

        $validated = $request->validate([
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $school->update($validated);

        return response()->json([
            'message' => 'Informasi sekolah berhasil diperbarui',
            'school' => $school
        ]);
    }

    // Regenerate registration link
    public function regenerateLink(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->isSchoolAdmin() || $user->school_id != $id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $school = School::findOrFail($id);
        $newLink = $school->generateRegistrationLink();

        return response()->json([
            'message' => 'Link pendaftaran baru berhasil dibuat',
            'registration_link' => $newLink
        ]);
    }

    public function show($id)
    {
        $school = School::findOrFail($id);

        // Cek authorization
        if (auth()->user()->school_id != $id && !auth()->user()->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($school);
    }
}