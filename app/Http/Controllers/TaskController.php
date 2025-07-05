<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Contract;
use Illuminate\Http\Request;
use Inertia\Inertia;
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
     * Get weekly hours info for a contract
     */
    public function getWeeklyHours(Request $request)
    {
        $contractId = $request->get('contract_id');
        $startTime = $request->get('start_time');
        
        if (!$contractId || !$startTime) {
            return response()->json(['error' => 'Missing required parameters'], 400);
        }

        try {
            $contract = Contract::with('work')->find($contractId);
            
            if (!$contract || !$contract->work) {
                return response()->json(['error' => 'Contract not found'], 404);
            }

            $weekStart = Carbon::createFromFormat('Y-m-d\TH:i', $startTime)->startOfWeek();
            
            // Get current weekly hours
            $currentWeeklyHours = Task::where('contract_id', $contract->id)
                ->where('is_billable', true)
                ->whereBetween('start_time', [$weekStart, $weekStart->copy()->endOfWeek()])
                ->sum('billable_hours') ?? 0;
            
            $weeklyLimit = $contract->work->weekly_time_limit ?? 40;
            $remainingHours = max(0, $weeklyLimit - $currentWeeklyHours);

            return response()->json([
                'current_hours' => $currentWeeklyHours,
                'weekly_limit' => $weeklyLimit,
                'remaining_hours' => $remainingHours,
                'week_start' => $weekStart->format('M j'),
                'week_end' => $weekStart->copy()->endOfWeek()->format('M j, Y'),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to calculate weekly hours'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'status' => 'required|in:pending,in-progress,completed',
            'contract_id' => 'nullable|exists:contracts,id',
            'is_billable' => 'boolean',
        ]);

        // Parse the datetime strings - they come in format 'Y-m-d\TH:i' from frontend
        try {
            $startTime = Carbon::createFromFormat('Y-m-d\TH:i', $validated['start_time']);
            $endTime = Carbon::createFromFormat('Y-m-d\TH:i', $validated['end_time']);
        } catch (\Exception $e) {
            \Log::error('Date parsing error: ' . $e->getMessage(), [
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time']
            ]);
            
            return back()->withErrors([
                'start_time' => 'Invalid date format for start time.',
                'end_time' => 'Invalid date format for end time.'
            ]);
        }

        // Validate that end time is after start time
        if ($endTime->lte($startTime)) {
            return back()->withErrors([
                'end_time' => 'End time must be after start time.'
            ]);
        }
        
        // Calculate billable hours and duration
        $billableHours = $endTime->diffInHours($startTime, true);
        $durationMinutes = $endTime->diffInMinutes($startTime);
        
        // Check weekly limit if billable and has contract
        if ($validated['is_billable'] && $validated['contract_id']) {
            try {
                $contract = Contract::with('work')->find($validated['contract_id']);
                
                if ($contract && $contract->work) {
                    $weekStart = $startTime->copy()->startOfWeek();
                    
                    // Get weekly hours more safely
                    $currentWeeklyHours = Task::where('contract_id', $contract->id)
                        ->where('is_billable', true)
                        ->whereBetween('start_time', [$weekStart, $weekStart->copy()->endOfWeek()])
                        ->sum('billable_hours') ?? 0;
                    
                    $weeklyLimit = $contract->work->weekly_time_limit ?? 40;
                    $remainingHours = max(0, $weeklyLimit - $currentWeeklyHours);
                    $totalAfterAdd = $currentWeeklyHours + $billableHours;

                    \Log::info('Weekly limit check:', [
                        'contract_id' => $contract->id,
                        'current_weekly_hours' => $currentWeeklyHours,
                        'new_task_hours' => $billableHours,
                        'weekly_limit' => $weeklyLimit,
                        'remaining_hours' => $remainingHours,
                        'total_after_add' => $totalAfterAdd
                    ]);

                    if ($totalAfterAdd > $weeklyLimit) {
                        return back()->withErrors([
                            'is_billable' => "❌ Weekly limit exceeded! You're trying to add {$billableHours} hours but only have {$remainingHours} hours remaining this week. Current: {$currentWeeklyHours}h / {$weeklyLimit}h (Week of {$weekStart->format('M j')} - {$weekStart->copy()->endOfWeek()->format('M j, Y')})"
                        ]);
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Weekly limit check failed: ' . $e->getMessage());
                // Continue with task creation but log the error
            }
        }
        
        // Create task with all required fields
        try {
            $taskData = [
                'title' => $validated['title'],
                'description' => $validated['description'],
                'start_time' => $startTime,
                'end_time' => $endTime,
                'duration' => $durationMinutes,
                'billable_hours' => $validated['is_billable'] ? $billableHours : 0,
                'status' => $validated['status'],
                'contract_id' => $validated['contract_id'],
                'is_billable' => $validated['is_billable'] ?? false,
                'user_id' => auth()->id(),
            ];

            \Log::info('Creating task with data:', $taskData);

            $task = Task::create($taskData);

            \Log::info('Task created successfully', [
                'task_id' => $task->id,
                'user_id' => auth()->id()
            ]);

            return redirect()->route('freelancer.task.index')
                ->with('success', 'Task created successfully.');
                
        } catch (\Exception $e) {
            \Log::error('Task creation failed: ' . $e->getMessage(), [
                'validated_data' => $validated,
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors([
                'error' => 'Failed to create task: ' . $e->getMessage()
            ]);
        }
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
    public function update(Request $request, Task $task)
    {
        // Ensure task belongs to authenticated user
        if ($task->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'status' => 'required|in:pending,in-progress,completed',
            'contract_id' => 'nullable|exists:contracts,id',
            'is_billable' => 'boolean',
        ]);

        // Parse the datetime strings
        try {
            $startTime = Carbon::createFromFormat('Y-m-d\TH:i', $validated['start_time']);
            $endTime = Carbon::createFromFormat('Y-m-d\TH:i', $validated['end_time']);
        } catch (\Exception $e) {
            return back()->withErrors([
                'start_time' => 'Invalid date format for start time.',
                'end_time' => 'Invalid date format for end time.'
            ]);
        }

        // Validate that end time is after start time
        if ($endTime->lte($startTime)) {
            return back()->withErrors([
                'end_time' => 'End time must be after start time.'
            ]);
        }

        $billableHours = $endTime->diffInHours($startTime, true);
        $durationMinutes = $endTime->diffInMinutes($startTime);

        // Check weekly limit if billable and has contract
        if ($validated['is_billable'] && $validated['contract_id']) {
            try {
                $contract = Contract::with('work')->find($validated['contract_id']);
                
                if ($contract && $contract->work) {
                    $weekStart = $startTime->copy()->startOfWeek();
                    
                    // Get current weekly hours excluding this task
                    $currentWeeklyHours = Task::where('contract_id', $contract->id)
                        ->where('is_billable', true)
                        ->where('id', '!=', $task->id) // Exclude current task
                        ->whereBetween('start_time', [$weekStart, $weekStart->copy()->endOfWeek()])
                        ->sum('billable_hours') ?? 0;
                    
                    $weeklyLimit = $contract->work->weekly_time_limit ?? 40;

                    if (($currentWeeklyHours + $billableHours) > $weeklyLimit) {
                        return back()->withErrors([
                            'is_billable' => "Adding {$billableHours} hours would exceed the weekly limit of {$weeklyLimit} hours. Current weekly hours: {$currentWeeklyHours}"
                        ]);
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Weekly limit check failed during update: ' . $e->getMessage());
            }
        }

        $task->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_time' => $startTime,
            'end_time' => $endTime,
            'duration' => $durationMinutes,
            'billable_hours' => $validated['is_billable'] ? $billableHours : 0,
            'status' => $validated['status'],
            'contract_id' => $validated['contract_id'],
            'is_billable' => $validated['is_billable'] ?? false,
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
