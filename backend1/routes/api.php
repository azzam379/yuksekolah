<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\SchoolController;
use App\Http\Controllers\API\RegistrationController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\RegistrationPeriodController;


// Public routes (tidak butuh authentication)
Route::post('/register-school', [AuthController::class, 'registerSchool']);
Route::post('/login', [AuthController::class, 'login']);

// Form submission via school link (public)
Route::post('/submit-registration', [RegistrationController::class, 'submit']);
Route::get('/school-by-link/{link}', [SchoolController::class, 'getByLink']);

// Public: Get period by registration link
Route::get('/period-by-link/{link}', [RegistrationPeriodController::class, 'getByLink']);

// Protected routes (butuh authentication)
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard/school-stats', [DashboardController::class, 'schoolStats']);
    Route::get('/dashboard/student', [DashboardController::class, 'studentDashboard']);
    Route::get('/dashboard/super-admin', [DashboardController::class, 'superAdminStats']);

    // Registrations
    Route::get('/registrations', [RegistrationController::class, 'index']);
    Route::post('/registrations/{id}/status', [RegistrationController::class, 'updateStatus']);
    Route::post('/registrations/{id}/upload', [RegistrationController::class, 'uploadFile']);
    Route::post('/registrations/{id}/reset-password', [RegistrationController::class, 'resetStudentPassword']);

    // Registration Periods (school_admin)
    Route::prefix('periods')->group(function () {
        Route::get('/', [RegistrationPeriodController::class, 'index']);
        Route::get('/active', [RegistrationPeriodController::class, 'getActive']);
        Route::post('/', [RegistrationPeriodController::class, 'store']);
        Route::put('/{id}', [RegistrationPeriodController::class, 'update']);
        Route::delete('/{id}', [RegistrationPeriodController::class, 'destroy']);
        Route::post('/{id}/toggle-status', [RegistrationPeriodController::class, 'toggleStatus']);
        Route::post('/{id}/end', [RegistrationPeriodController::class, 'endPeriod']);
        Route::post('/{id}/regenerate-link', [RegistrationPeriodController::class, 'regenerateLink']);
    });

    // Schools (admin access)
    Route::prefix('schools')->group(function () {
        Route::put('/{id}', [SchoolController::class, 'update']);
        Route::post('/{id}/regenerate-link', [SchoolController::class, 'regenerateLink']);
    });

    // School Admin Settings
    Route::prefix('settings')->group(function () {
        Route::get('/', [\App\Http\Controllers\API\SettingsController::class, 'index']);
        Route::put('/password', [\App\Http\Controllers\API\SettingsController::class, 'updatePassword']);
        Route::post('/maintenance', [\App\Http\Controllers\API\SettingsController::class, 'toggleMaintenance']);
    });

    // User Management (Controller handles authorization)
    Route::put('/users/{id}', [\App\Http\Controllers\API\UserController::class, 'update']);
    Route::delete('/users/{id}', [\App\Http\Controllers\API\UserController::class, 'destroy']);
    Route::get('/users', [\App\Http\Controllers\API\UserController::class, 'index'])->middleware('check.superadmin'); // List all users still superadmin only

    // Super admin only routes
    Route::middleware(['check.superadmin'])->group(function () {
        Route::get('/schools', [SchoolController::class, 'index'])->middleware('check.superadmin');
        Route::post('/schools/{id}/verify', [SchoolController::class, 'verify'])->middleware('check.superadmin');
        Route::post('/schools/{id}/reject', [SchoolController::class, 'reject'])->middleware('check.superadmin');

        // Block and Password Reset specific actions
        Route::post('/users/{id}/block', [\App\Http\Controllers\API\UserController::class, 'toggleBlock']);
        Route::post('/users/{id}/reset-password', [\App\Http\Controllers\API\UserController::class, 'resetPassword']);

        // System Settings
        Route::get('/settings', [\App\Http\Controllers\API\SystemController::class, 'index']);
        Route::post('/settings', [\App\Http\Controllers\API\SystemController::class, 'update']);
    });
});

// Test route (bisa dihapus nanti)
Route::get('/test', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'API Yuksekolah berjalan!',
        'timestamp' => now()->toDateTimeString()
    ]);
});

Route::get('/schools/{id}', [SchoolController::class, 'show'])->middleware('auth:sanctum');
