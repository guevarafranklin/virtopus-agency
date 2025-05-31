<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWorkRequest;
use App\Http\Requests\UpdateWorkRequest;
use App\Models\Work;
use Inertia\Inertia;

class WorkController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        
        // Admin can see all works, clients only see their own
        if ($user->role === 'admin') {
            $works = Work::with('user')
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Clients only see works they created
            $works = Work::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render('client/Work/Index', [
            'works' => $works,
            'isAdmin' => $user->role === 'admin'
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('client/Work/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreWorkRequest $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'contract_type' => 'required|in:hourly,monthly',
            'rate' => 'required|numeric|min:0',
            'job_start_date' => 'required|date|after:' . now()->addDays(14),
            'duration' => 'required|in:short-term,long-term,indefinite',
            'skills' => 'required|string',
            'status' => 'required|in:active,paused,terminate',
            'weekly_time_limit' => 'required|integer|min:0',
        ]);

        // Convert skills string to JSON array
        $validated['skills'] = json_encode(array_map('trim', explode(',', $validated['skills'])));
        
        // Associate work with authenticated user
        Work::create($validated + ['user_id' => auth()->id()]);

        return redirect()->route('client.work.index')
            ->with('success', 'Work created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Work $work)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Work $work)
    {
        $user = auth()->user();
        
        // Admin can edit any work, clients can only edit their own
        if ($user->role !== 'admin' && $work->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('client/Work/Edit', [
            'work' => $work,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateWorkRequest $request, Work $work)
    {
        $user = auth()->user();
        
        if ($user->role !== 'admin' && $work->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'contract_type' => 'required|in:hourly,monthly',
            'rate' => 'required|numeric|min:0',
            'job_start_date' => 'required|date|after:' . now()->addDays(14),
            'duration' => 'required|in:short-term,long-term,indefinite',
            'skills' => 'required|string',
            'status' => 'required|in:active,paused,terminate',
            'weekly_time_limit' => 'required|integer|min:0',
        ]);

        // Convert skills string to JSON array
        $validated['skills'] = json_encode(array_map('trim', explode(',', $validated['skills'])));

        $work->update($validated);

        return redirect()->route('client.work.index')
            ->with('success', 'Work updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Work $work)
    {
        $user = auth()->user();
        
        // Admin can delete any work, clients can only delete their own
        if ($user->role !== 'admin' && $work->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $work->delete();
        
        return redirect()->route('client.work.index')
            ->with('success', 'Work deleted successfully.');
    }
}
