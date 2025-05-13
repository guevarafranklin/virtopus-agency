<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
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
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:admin,client,freelancer',
        ]);

        User::create($validated);

        return redirect()->route('admin.user.index')
            ->with('message', 'User created successfully');
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
            ->with('message', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin.user.index')
            ->with('message', 'User deleted successfully');
    }
}