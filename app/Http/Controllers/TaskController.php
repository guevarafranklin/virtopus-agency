<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('freelancer/task/Index', [
            'tasks' => Task::with('user')->get(), // Eager load the user relationship
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('freelancer/task/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'status' => 'required|in:pending,in-progress,completed',
        ]);
    
        // Calculate duration in minutes
        $duration = null;
        if ($request->start_time && $request->end_time) {
            $start = Carbon::parse($request->start_time);
            $end = Carbon::parse($request->end_time);
            $duration = $end->diffInMinutes($start);
        }
    
        Task::create($validated + [
            'duration' => $duration,
            'user_id' => auth()->id(),
        ]);
    
        return redirect()->route('freelancer.task.index')->with('success', 'Task created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        return Inertia::render('freelancer/Task/Edit', [
            'task' => $task,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'status' => 'required|in:pending,in-progress,completed',
        ]);
    
        // Calculate duration in minutes
        $duration = null;
        if ($request->start_time && $request->end_time) {
            $start = Carbon::parse($request->start_time);
            $end = Carbon::parse($request->end_time);
            $duration = $end->diffInMinutes($start);
        }
    
        $task->update($validated + [
            'duration' => $duration,
        ]);
    
        return redirect()->route('freelancer.task.index')->with('success', 'Task updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $task->delete();

        return redirect()->route('freelancer.task.index')->with('success', 'Task deleted successfully.');
    }
}
