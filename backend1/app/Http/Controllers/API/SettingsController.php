<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\School;

class SettingsController extends Controller
{
    // Update Admin Password
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Password saat ini salah.'], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Password berhasil diperbarui.']);
    }

    // Toggle Global Maintenance Mode (Pause all periods)
    // In this context, we will use a flag on the School model or simulate it by closing all active periods
    // For better control, let's add 'is_maintenance_mode' to School table or just close periods.
    // Given the constraints, pausing periods seems safer as "Jeda Pendaftaran".
    public function toggleMaintenance(Request $request)
    {
        $user = $request->user();
        $school = $user->school;

        if (!$school) {
            return response()->json(['message' => 'Sekolah tidak ditemukan'], 404);
        }

        // Since we don't have 'is_maintenance' column on School yet, let's add it via migration first?
        // Or we can just toggle all active periods to closed? But then we lose state of which was open.
        // Better: Add 'is_maintenance' to schools table.

        $school->is_maintenance = !$school->is_maintenance;
        $school->save();

        return response()->json([
            'message' => 'Mode maintenance berhasil ' . ($school->is_maintenance ? 'diaktifkan' : 'dinonaktifkan'),
            'is_maintenance' => $school->is_maintenance
        ]);
    }

    // Get Settings
    public function index(Request $request)
    {
        $user = $request->user();
        $school = $user->school;

        return response()->json([
            'school' => $school,
            'is_maintenance' => $school ? $school->is_maintenance : false
        ]);
    }
}
