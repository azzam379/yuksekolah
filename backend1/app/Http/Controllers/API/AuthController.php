<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use App\Models\School;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new school and admin user
     */
    public function registerSchool(Request $request)
    {
        try {
            $validated = $request->validate([
                'school_name' => 'required|string|max:255',
                'school_email' => 'required|email|unique:schools,email',
                'school_phone' => 'required|string|max:20',
                'school_address' => 'required|string',
                'admin_name' => 'required|string|max:255',
                'admin_email' => 'required|email|unique:users,email',
                'admin_password' => 'required|string|min:8|confirmed',
            ], [
                'school_email.unique' => 'Email sekolah sudah terdaftar.',
                'admin_email.unique' => 'Email admin sudah digunakan.',
                'admin_password.min' => 'Password minimal 8 karakter.',
                'admin_password.confirmed' => 'Konfirmasi password tidak cocok.',
            ]);

            // Start database transaction
            \DB::beginTransaction();

            // Create school
            $school = School::create([
                'name' => $validated['school_name'],
                'email' => $validated['school_email'],
                'phone' => $validated['school_phone'],
                'address' => $validated['school_address'],
                'status' => 'pending',
                'verified_at' => null,
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
                'email_verified_at' => null,
            ]);

            \DB::commit();

            // Send confirmation email
            // Send confirmation email
            try {
                \Illuminate\Support\Facades\Mail::to($admin->email)->send(new \App\Mail\SchoolRegistered($school));
            } catch (\Throwable $e) {
                \Log::error('Failed to send registration email: ' . $e->getMessage());
                // Don't fail the request if email fails
            }

            // Log activity
            \Log::info('New school registered', [
                'school_id' => $school->id,
                'school_name' => $school->name,
                'admin_id' => $admin->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran sekolah berhasil. Menunggu verifikasi admin.',
                'data' => [
                    'school' => [
                        'id' => $school->id,
                        'name' => $school->name,
                        'email' => $school->email,
                        'status' => $school->status,
                    ],
                    'admin' => [
                        'id' => $admin->id,
                        'name' => $admin->name,
                        'email' => $admin->email,
                        'role' => $admin->role,
                    ]
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            \DB::rollBack();
            \Log::error('School registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem. Silakan coba lagi.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Login user with email and password
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ], [
                'email.required' => 'Email harus diisi.',
                'email.email' => 'Format email tidak valid.',
                'password.required' => 'Password harus diisi.',
            ]);

            // Find user WITH school relation pre-loaded
            $user = User::with([
                'school' => function ($query) {
                    $query->select('id', 'name', 'email', 'phone', 'address', 'status', 'registration_link', 'verified_at');
                }
            ])->where('email', $request->email)->first();

            if (!$user) {
                throw ValidationException::withMessages([
                    'email' => ['Email tidak ditemukan.'],
                ]);
            }

            if (!Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'password' => ['Password salah.'],
                ]);
            }

            // Check if school is active (for school_admin only)
            if ($user->role === 'school_admin' && $user->school && $user->school->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akun sekolah Anda belum aktif. Silakan tunggu verifikasi admin.',
                    'school_status' => $user->school->status,
                ], 403);
            }

            // Create token with abilities based on role
            $tokenName = $user->role . '-token-' . now()->timestamp;
            $abilities = $this->getTokenAbilities($user->role);

            $token = $user->createToken($tokenName, $abilities)->plainTextToken;

            // Log successful login
            \Log::info('User logged in', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'school_id' => $user->school_id,
            ]);

            // Prepare response data
            $responseData = [
                'success' => true,
                'message' => 'Login berhasil.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'school_id' => $user->school_id,
                        'school' => $user->school ? [
                            'id' => $user->school->id,
                            'name' => $user->school->name,
                            'email' => $user->school->email,
                            'status' => $user->school->status,
                            'registration_link' => $user->school->registration_link,
                            'is_verified' => !is_null($user->school->verified_at),
                        ] : null,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                    'expires_in' => config('sanctum.expiration') ?: null,
                ]
            ];

            return response()->json($responseData, 200);

        } catch (ValidationException $e) {
            \Log::warning('Login validation failed', [
                'email' => $request->email,
                'errors' => $e->errors()
            ]);
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Login failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem. Silakan coba lagi.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get current authenticated user
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user();

            // Eager load school relation with specific fields
            $user->load([
                'school' => function ($query) {
                    $query->select('id', 'name', 'email', 'phone', 'address', 'status', 'registration_link', 'verified_at', 'created_at');
                }
            ]);

            // Log access
            \Log::info('User accessed profile', [
                'user_id' => $user->id,
                'role' => $user->role,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'school_id' => $user->school_id,
                    'school' => $user->school ? [
                        'id' => $user->school->id,
                        'name' => $user->school->name,
                        'email' => $user->school->email,
                        'phone' => $user->school->phone,
                        'address' => $user->school->address,
                        'status' => $user->school->status,
                        'registration_link' => $user->school->registration_link,
                        'verified_at' => $user->school->verified_at,
                        'created_at' => $user->school->created_at,
                    ] : null,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Get user profile failed', [
                'user_id' => $request->user()->id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pengguna.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Logout user (revoke current token)
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();
            $tokenId = $user->currentAccessToken()->id;

            // Revoke current token
            $user->currentAccessToken()->delete();

            \Log::info('User logged out', [
                'user_id' => $user->id,
                'token_id' => $tokenId,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil.',
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Logout failed', [
                'user_id' => $request->user()->id ?? 'unknown',
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal logout.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Logout from all devices (revoke all tokens)
     */
    public function logoutAll(Request $request)
    {
        try {
            $user = $request->user();
            $tokenCount = $user->tokens()->count();

            // Revoke all tokens
            $user->tokens()->delete();

            \Log::info('User logged out from all devices', [
                'user_id' => $user->id,
                'tokens_revoked' => $tokenCount,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Logout dari semua perangkat berhasil.',
                'tokens_revoked' => $tokenCount,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Logout all failed', [
                'user_id' => $request->user()->id ?? 'unknown',
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal logout dari semua perangkat.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Refresh user token (optional - for future implementation)
     */
    public function refresh(Request $request)
    {
        // This is a placeholder for token refresh functionality
        // Requires implementing refresh tokens in Sanctum

        return response()->json([
            'success' => false,
            'message' => 'Fitur refresh token belum tersedia.',
        ], 501);
    }

    /**
     * Get token abilities based on user role
     */
    private function getTokenAbilities(string $role): array
    {
        return match ($role) {
            'super_admin' => [
                'schools:manage',
                'users:manage',
                'registrations:view-all',
                'system:configure',
            ],
            'school_admin' => [
                'registrations:manage',
                'school:view',
                'school:update',
                'students:manage',
            ],
            'student' => [
                'registration:view-own',
                'profile:manage',
                'documents:upload',
            ],
            default => ['*'], // Fallback
        };
    }
}