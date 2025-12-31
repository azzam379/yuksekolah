<?php

namespace App\Http\Controllers\API;

use App\Models\Registration;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    // Get dashboard stats for school admin
    public function schoolStats(Request $request)
    {
        $user = $request->user();

        if (!$user->isSchoolAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $schoolId = $user->school_id;

        $stats = [
            'total_registrations' => Registration::where('school_id', $schoolId)->count(),
            'pending_verification' => Registration::where('school_id', $schoolId)
                ->where('status', 'submitted')->count(),
            'verified' => Registration::where('school_id', $schoolId)
                ->where('status', 'verified')->count(),
            'today_registrations' => Registration::where('school_id', $schoolId)
                ->whereDate('created_at', today())->count(),
        ];

        // Weekly chart data
        $weeklyData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $weeklyData[] = [
                'date' => $date,
                'count' => Registration::where('school_id', $schoolId)
                    ->whereDate('created_at', $date)
                    ->count()
            ];
        }

        return response()->json([
            'stats' => $stats,
            'weekly_data' => $weeklyData,
            'school_info' => $user->school, // Include school model
            'recent_registrations' => Registration::with('student')
                ->where('school_id', $schoolId)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
        ]);
    }

    // Get student dashboard
    public function studentDashboard(Request $request)
    {
        $user = $request->user();

        if (!$user->isStudent()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $registration = $user->registrations()
            ->with('school')
            ->latest()
            ->first();

        return response()->json([
            'user' => $user,
            'registration' => $registration,
            'school' => $registration ? $registration->school : null
        ]);
    }

    // Get super admin dashboard
    public function superAdminStats(Request $request)
    {
        $user = $request->user();

        if (!$user->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $stats = [
            'total_schools' => \App\Models\School::count(),
            'pending_schools' => \App\Models\School::where('status', 'pending')->count(),
            'active_schools' => \App\Models\School::where('status', 'active')->count(),
            'total_registrations' => Registration::count(),
        ];

        // Recent pending schools
        $pendingSchools = \App\Models\School::with('admins')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'pending_schools' => $pendingSchools
        ]);
    }
}