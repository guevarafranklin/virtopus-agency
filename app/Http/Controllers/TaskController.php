<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use App\Models\Contract;
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
        $tasks = Task::with(['user', 'contract.work'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('freelancer/task/Index', [
            'tasks' => $tasks
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get contracts for the authenticated freelancer
        $contracts = Contract::with('work')
            ->where('user_id', auth()->id())
            ->get();

        return Inertia::render('freelancer/task/Create', [
            'contracts' => $contracts
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'status' => 'required|in:pending,in-progress,completed',
            'contract_id' => 'nullable|exists:contracts,id',
            'is_billable' => 'boolean',
        ]);

        // Calculate duration and billable hours
        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);
        $durationMinutes = $end->diffInMinutes($start);
        $billableHours = $end->diffInHours($start, true);

        // Check weekly limit if billable and has contract
        if ($validated['is_billable'] && $validated['contract_id']) {
            $contract = Contract::with('work')->find($validated['contract_id']);
            
            if ($contract) {
                $weekStart = $start->copy()->startOfWeek();
                $currentWeeklyHours = Task::getWeeklyHoursForContract($contract->id, $weekStart);
                $weeklyLimit = $contract->work->weekly_time_limit;

                if (($currentWeeklyHours + $billableHours) > $weeklyLimit) {
                    return back()->withErrors([
                        'billable_hours' => "Adding {$billableHours} hours would exceed the weekly limit of {$weeklyLimit} hours. Current weekly hours: {$currentWeeklyHours}"
                    ]);
                }
            }
        }

        Task::create($validated + [
            'duration' => $durationMinutes,
            'billable_hours' => $validated['is_billable'] ? $billableHours : 0,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('freelancer.task.index')
            ->with('success', 'Task created successfully.');
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
        // Ensure task belongs to authenticated user
        if ($task->user_id !== auth()->id()) {
            abort(403);
        }

        $contracts = Contract::with('work')
            ->where('user_id', auth()->id())
            ->get();

        return Inertia::render('freelancer/task/Edit', [
            'task' => $task->load('contract.work'),
            'contracts' => $contracts
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        // Ensure task belongs to authenticated user
        if ($task->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'status' => 'required|in:pending,in-progress,completed',
            'contract_id' => 'nullable|exists:contracts,id',
            'is_billable' => 'boolean',
        ]);

        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);
        $durationMinutes = $end->diffInMinutes($start);
        $billableHours = $end->diffInHours($start, true);

        // Check weekly limit if billable and has contract
        if ($validated['is_billable'] && $validated['contract_id']) {
            $contract = Contract::with('work')->find($validated['contract_id']);
            
            if ($contract) {
                $weekStart = $start->copy()->startOfWeek();
                $currentWeeklyHours = Task::getWeeklyHoursForContract($contract->id, $weekStart);
                
                // Subtract current task hours if it was already billable
                if ($task->is_billable && $task->contract_id === $contract->id) {
                    $currentWeeklyHours -= $task->billable_hours;
                }
                
                $weeklyLimit = $contract->work->weekly_time_limit;

                if (($currentWeeklyHours + $billableHours) > $weeklyLimit) {
                    return back()->withErrors([
                        'billable_hours' => "Adding {$billableHours} hours would exceed the weekly limit of {$weeklyLimit} hours. Current weekly hours: {$currentWeeklyHours}"
                    ]);
                }
            }
        }

        $task->update($validated + [
            'duration' => $durationMinutes,
            'billable_hours' => $validated['is_billable'] ? $billableHours : 0,
        ]);

        return redirect()->route('freelancer.task.index')
            ->with('success', 'Task updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        if ($task->user_id !== auth()->id()) {
            abort(403);
        }

        $task->delete();

        return redirect()->route('freelancer.task.index')
            ->with('success', 'Task deleted successfully.');
    }
}
