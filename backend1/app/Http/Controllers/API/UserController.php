<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * List all users with filtering
     */
    public function index(Request $request)
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $search = $request->query('search');
        $role = $request->query('role');
        $schoolId = $request->query('school_id');
        $limit = $request->query('limit', 20);

        $query = User::with('school:id,name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role) {
            $query->where('role', $role);
        }

        if ($schoolId && $schoolId !== 'all') {
            $query->where('school_id', $schoolId);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate($limit);

        return response()->json($users);
    }

    /**
     * Block/Unblock User
     */
    public function toggleBlock(Request $request, $id)
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Prevent self-block
        if ($request->user()->id == $id) {
            return response()->json(['error' => 'Cannot block yourself'], 422);
        }

        $user = User::findOrFail($id);

        // Toggle is_active status
        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'unblocked' : 'blocked';

        return response()->json([
            'message' => "User successfully {$status}",
            'user' => $user,
            'is_active' => $user->is_active
        ]);
    }

    /**
     * Update user profile
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Authorization check
        if ($request->user()->isSuperAdmin()) {
            // Super Admin can update anyone
        } elseif ($request->user()->isSchoolAdmin()) {
            // School Admin can only update students from their school
            if (!$user->isStudent() || $user->school_id !== $request->user()->school_id) {
                return response()->json(['error' => 'Unauthorized: Can only update students from your school'], 403);
            }
        } else {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:super_admin,school_admin,student',
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Delete user
     */
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Authorization check
        if ($request->user()->isSuperAdmin()) {
            // Super Admin can delete anyone (except self)
        } elseif ($request->user()->isSchoolAdmin()) {
            // School Admin can only delete students from their school
            if (!$user->isStudent() || $user->school_id !== $request->user()->school_id) {
                return response()->json(['error' => 'Unauthorized: Can only delete students from your school'], 403);
            }
        } else {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Prevent self-deletion (redundant for School Admin deleting Student, but good for Super Admin)
        if ($request->user()->id == $id) {
            return response()->json(['error' => 'Cannot delete yourself'], 422);
        }

        $userName = $user->name;

        // Delete associated tokens
        $user->tokens()->delete();

        // Delete user
        $user->delete();

        return response()->json([
            'message' => "User '{$userName}' deleted successfully"
        ]);
    }

    /**
     * Reset Password (Force)
     */
    public function resetPassword(Request $request, $id)
    {
        if (!$request->user()->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        // Generate random password
        $newPassword = Str::random(10);

        $user->update([
            'password' => Hash::make($newPassword)
        ]);

        return response()->json([
            'message' => 'Password reset successfully',
            'new_password' => $newPassword,
            'user' => $user->name
        ]);
    }
}

