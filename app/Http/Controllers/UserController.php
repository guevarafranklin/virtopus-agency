<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeNewUser;
use App\Models\User;
use App\Services\PasswordService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/user/Index', [
            'users' => User::all()
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/user/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|string|in:admin,client,freelancer',
        ]);

        // Generate a secure temporary password - FIXED METHOD NAME
        $temporaryPassword = PasswordService::generateTemporaryPassword();
        $validated['password'] = Hash::make($temporaryPassword);
        $validated['email_verified_at'] = now(); // Auto-verify admin-created users

        // Create the user
        $user = User::create($validated);

        // Send welcome email with temporary password
        try {
            Mail::to($user->email)->send(new WelcomeNewUser($user, $temporaryPassword));
            
            Log::info("Welcome email sent successfully to {$user->email}", [
                'user_id' => $user->id,
                'user_role' => $user->role
            ]);
            
            return redirect()->route('admin.user.index')
                ->with('success', 'User created successfully! Welcome email sent to ' . $user->email);
        } catch (\Exception $e) {
            // Log the error but don't fail the user creation
            Log::error('Failed to send welcome email', [
                'user_email' => $user->email,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('admin.user.index')
                ->with('warning', 'User created successfully, but welcome email failed to send. Please check email configuration or manually send credentials to ' . $user->email);
        }
    }

    public function edit(User $user)
    {
        return Inertia::render('admin/user/Edit', [
            'user' => $user
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'role' => 'required|string|in:admin,client,freelancer',
        ]);

        $user->update($validated);

        return redirect()->route('admin.user.index')
            ->with('success', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin.user.index')
            ->with('success', 'User deleted successfully');
    }

    public function resetPassword(User $user)
    {
        try {
            // Generate a new temporary password - FIXED METHOD NAME
            $temporaryPassword = PasswordService::generateTemporaryPassword();
            
            $user->forceFill([
                'password' => Hash::make($temporaryPassword)
            ])->save();

            // Send email with new password
            Mail::to($user->email)->send(new WelcomeNewUser($user, $temporaryPassword));

            Log::info("Password reset email sent to {$user->email}", [
                'user_id' => $user->id,
                'admin_user' => auth()->id()
            ]);

            return redirect()->back()->with('success', 'Password reset successfully and email sent to ' . $user->email);
        } catch (\Exception $e) {
            Log::error('Failed to reset password or send email', [
                'user_email' => $user->email,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return redirect()->back()->with('error', 'Failed to reset password or send email. Please try again.');
        }
    }
}