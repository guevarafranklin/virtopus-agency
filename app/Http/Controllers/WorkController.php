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
        return Inertia::render('client/Work/Index', [
            'works' => Work::all(),
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
            'duration' => 'required|string',
            'skills' => 'required|string',
            'status' => 'required|in:active,paused,terminate',
            'weekly_time_limit' => 'required|integer|min:0',
        ]);

        // Convert skills string to JSON array
        $validated['skills'] = json_encode(array_map('trim', explode(',', $validated['skills'])));
        
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
        return Inertia::render('client/Work/Edit', [
            'work' => $work,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateWorkRequest $request, Work $work)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'contract_type' => 'required|in:hourly,monthly',
            'rate' => 'required|numeric|min:0',
            'job_start_date' => 'required|date|after:' . now()->addDays(14),
            'duration' => 'required|string',
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
        $work->delete();
        // Redirect to the correct route
    return redirect()->route('client.work.index')->with('success', 'Work deleted successfully.');
    }
}
