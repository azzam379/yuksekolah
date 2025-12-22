<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use App\Models\School;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Register School Admin
    public function registerSchool(Request $request)
    {
        $validated = $request->validate([
            'school_name' => 'required|string|max:255',
            'school_email' => 'required|email|unique:schools,email',
            'school_phone' => 'required|string',
            'school_address' => 'required|string',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|unique:users,email',
            'admin_password' => 'required|string|min:8',
        ]);

        // Create school
        $school = School::create([
            'name' => $validated['school_name'],
            'email' => $validated['school_email'],
            'phone' => $validated['school_phone'],
            'address' => $validated['school_address'],
            'status' => 'pending',
        ]);

        // Generate registration link
        $school->generateRegistrationLink();

        // Create admin user
        $admin = User::create([
            'name' => $validated['admin_name'],
            'email' => $validated['admin_email'],
            'password' => Hash::make($validated['admin_password']),
            'role' => 'school_admin',
            'school_id' => $school->id,
        ]);

        return response()->json([
            'message' => 'Pendaftaran sekolah berhasil. Menunggu verifikasi admin.',
            'school' => $school,
            'admin' => $admin
        ], 201);
    }

    // Login All Users
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        //  LOAD SCHOOL RELATION JIKA ADA 
        if ($user->school_id) {
            $user->load('school');
        }

        // Create token berdasarkan role
        $tokenName = $user->role . '-token';
        $token = $user->createToken($tokenName)->plainTextToken;

        return response()->json([
            'user' => $user,  //  SEKARANG USER SUDAH PAKAI SCHOOL DATA 
            'token' => $token,
            'role' => $user->role
        ]);
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil']);
    }

    // Get Current User
    public function me(Request $request)
    {
        $user = $request->user();
        
        // ⭐⭐ TAMBAHKAN INI: Load school relation jika user punya school_id ⭐⭐
        if ($user->school_id) {
            $user->load('school');
        }
        
        return response()->json($user);
    }
}