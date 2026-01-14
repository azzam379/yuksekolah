<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\RegistrationPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RegistrationPeriodController extends Controller
{
    /**
     * List all periods for the authenticated school admin's school
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'school_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $periods = RegistrationPeriod::where('school_id', $user->school_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $periods
        ]);
    }

    /**
     * Create a new registration period
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'school_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'academic_year' => 'required|string|max:20',
            'quota' => 'nullable|integer|min:1',
            'programs' => 'required|array|min:1',
            'programs.*' => 'string|max:100',
            'is_open' => 'boolean'
        ]);

        $period = RegistrationPeriod::create([
            'school_id' => $user->school_id,
            'name' => $validated['name'],
            'academic_year' => $validated['academic_year'],
            'quota' => $validated['quota'] ?? null,
            'programs' => $validated['programs'],
            'is_open' => $validated['is_open'] ?? true,
            'registration_link' => Str::random(32),
            'registered_count' => 0
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Periode pendaftaran berhasil dibuat',
            'data' => $period
        ], 201);
    }

    /**
     * Update a registration period
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();

        $period = RegistrationPeriod::where('id', $id)
            ->where('school_id', $user->school_id)
            ->first();

        if (!$period) {
            return response()->json(['message' => 'Periode tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'academic_year' => 'sometimes|string|max:20',
            'quota' => 'nullable|integer|min:1',
            'programs' => 'sometimes|array|min:1',
            'programs.*' => 'string|max:100',
            'is_open' => 'sometimes|boolean'
        ]);

        $period->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Periode berhasil diupdate',
            'data' => $period->fresh()
        ]);
    }

    /**
     * Toggle open/close status (only one period can be active at a time)
     */
    public function toggleStatus(Request $request, $id)
    {
        $user = $request->user();

        $period = RegistrationPeriod::where('id', $id)
            ->where('school_id', $user->school_id)
            ->first();

        if (!$period) {
            return response()->json(['message' => 'Periode tidak ditemukan'], 404);
        }

        // Cannot toggle if period has ended
        if ($period->isEnded()) {
            return response()->json(['message' => 'Periode yang sudah diakhiri tidak dapat diubah'], 400);
        }

        $newStatus = !$period->is_open;

        // If activating, deactivate all other periods first
        if ($newStatus === true) {
            RegistrationPeriod::where('school_id', $user->school_id)
                ->where('id', '!=', $id)
                ->whereNull('ended_at')
                ->update(['is_open' => false]);
        }

        $period->update(['is_open' => $newStatus]);

        return response()->json([
            'status' => 'success',
            'message' => $newStatus ? 'Pendaftaran dibuka' : 'Pendaftaran ditutup',
            'data' => $period->fresh()
        ]);
    }

    /**
     * Get active period for dashboard
     */
    public function getActive(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'school_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $period = RegistrationPeriod::where('school_id', $user->school_id)
            ->where('is_open', true)
            ->whereNull('ended_at')
            ->first();

        if (!$period) {
            return response()->json([
                'status' => 'success',
                'data' => null,
                'message' => 'Tidak ada periode aktif'
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $period->id,
                'name' => $period->name,
                'academic_year' => $period->academic_year,
                'is_open' => $period->is_open,
                'quota' => $period->quota,
                'registered_count' => $period->registered_count,
                'remaining_quota' => $period->remaining_quota,
                'programs' => $period->programs,
                'registration_link' => $period->registration_link,
            ]
        ]);
    }

    /**
     * End a period (cannot be reopened)
     */
    public function endPeriod(Request $request, $id)
    {
        $user = $request->user();

        $period = RegistrationPeriod::where('id', $id)
            ->where('school_id', $user->school_id)
            ->first();

        if (!$period) {
            return response()->json(['message' => 'Periode tidak ditemukan'], 404);
        }

        if ($period->isEnded()) {
            return response()->json(['message' => 'Periode sudah diakhiri sebelumnya'], 400);
        }

        $period->update([
            'is_open' => false,
            'ended_at' => now()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Periode berhasil diakhiri. Periode tidak dapat dibuka kembali.',
            'data' => $period->fresh()
        ]);
    }

    /**
     * Delete a registration period
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $period = RegistrationPeriod::where('id', $id)
            ->where('school_id', $user->school_id)
            ->first();

        if (!$period) {
            return response()->json(['message' => 'Periode tidak ditemukan'], 404);
        }

        // Check if there are registrations
        if ($period->registrations()->count() > 0) {
            return response()->json([
                'message' => 'Tidak dapat menghapus periode yang sudah memiliki pendaftar'
            ], 400);
        }

        $period->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Periode berhasil dihapus'
        ]);
    }

    /**
     * Get period by registration link (public)
     */
    public function getByLink($link)
    {
        $period = RegistrationPeriod::with('school:id,name,address,npsn')
            ->where('registration_link', $link)
            ->first();

        if (!$period) {
            return response()->json(['message' => 'Link pendaftaran tidak valid'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $period->id,
                'name' => $period->name,
                'academic_year' => $period->academic_year,
                'is_open' => $period->is_open,
                'programs' => $period->programs,
                'quota' => $period->quota,
                'registered_count' => $period->registered_count,
                'remaining_quota' => $period->remaining_quota,
                'can_register' => $period->canAcceptRegistration(),
                'school' => $period->school
            ]
        ]);
    }

    /**
     * Regenerate registration link
     */
    public function regenerateLink(Request $request, $id)
    {
        $user = $request->user();

        $period = RegistrationPeriod::where('id', $id)
            ->where('school_id', $user->school_id)
            ->first();

        if (!$period) {
            return response()->json(['message' => 'Periode tidak ditemukan'], 404);
        }

        $period->update(['registration_link' => Str::random(32)]);

        return response()->json([
            'status' => 'success',
            'message' => 'Link pendaftaran berhasil di-generate ulang',
            'data' => $period->fresh()
        ]);
    }
}
