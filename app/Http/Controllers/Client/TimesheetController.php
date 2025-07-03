<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Task;
use App\Models\Work;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class TimesheetController extends Controller
{
    public function index(Request $request)
    {
        \Log::info('Starting timesheet index');
        
        $clientId = auth()->id();
        \Log::info('Client ID: ' . $clientId);
        
        // Get date range based on filter
        $dateRange = $this->getDateRange(
            $request->filter ?? 'current_week', 
            $request->start_date, 
            $request->end_date
        );
        
        \Log::info('Date range: ' . $dateRange['start']->format('Y-m-d') . ' to ' . $dateRange['end']->format('Y-m-d'));
        
        // First, let's see what data we actually have
        $allWorks = Work::where('user_id', $clientId)->get();
        \Log::info('All works for client: ' . $allWorks->count());
        
        $allContracts = Contract::whereHas('work', function($query) use ($clientId) {
            $query->where('user_id', $clientId);
        })->get();
        \Log::info('All contracts for client works: ' . $allContracts->count());
        
        $allTasks = Task::whereHas('contract.work', function($query) use ($clientId) {
            $query->where('user_id', $clientId);
        })
        ->where('is_billable', true)
        ->whereBetween('start_time', [$dateRange['start'], $dateRange['end']])
        ->get();
        \Log::info('All billable tasks for client contracts in date range: ' . $allTasks->count());
        
        // Get works with proper relationships loaded - NO DATE FILTERING HERE YET
        $works = Work::with([
            'contracts' => function($query) {
                $query->with(['user', 'tasks' => function($taskQuery) {
                    $taskQuery->where('is_billable', true);
                }]);
            }
        ])
        ->where('user_id', $clientId)
        ->whereHas('contracts')
        ->get();
        
        \Log::info('Works with contracts loaded: ' . $works->count());
        
        // Apply freelancer filter if specified
        if ($request->freelancer_id) {
            $works = $works->filter(function($work) use ($request) {
                return $work->contracts->contains('user_id', $request->freelancer_id);
            });
            \Log::info('Works after freelancer filter: ' . $works->count());
        }
        
        // Get all freelancers who have contracts with this client's works
        $freelancers = Contract::with('user')
            ->whereHas('work', function($query) use ($clientId) {
                $query->where('user_id', $clientId);
            })
            ->get()
            ->map(function($contract) {
                return $contract->user;
            })
            ->unique('id')
            ->values();
        
        \Log::info('Freelancers found: ' . $freelancers->count());
        
        // Process works data for display - Apply date filtering DURING processing
        $processedWorks = $works->map(function($work) use ($dateRange, $request) {
            $contractData = $work->contracts
                ->when($request->freelancer_id, function($collection) use ($request) {
                    return $collection->where('user_id', $request->freelancer_id);
                })
                ->map(function($contract) use ($dateRange) {
                    // Filter tasks by date range DURING processing
                    $billableTasks = $contract->tasks
                        ->where('is_billable', true)
                        ->filter(function($task) use ($dateRange) {
                            $taskDate = Carbon::parse($task->start_time);
                            return $taskDate->between($dateRange['start'], $dateRange['end']);
                        });
                    
                    $totalHours = $billableTasks->sum('billable_hours');
                    
                    // Calculate client cost based on contract type
                    if ($contract->work->contract_type === 'monthly') {
                        // For monthly contracts, client pays the full monthly rate if there are any billable hours
                        $clientCost = $totalHours > 0 ? floatval($contract->work->rate) : 0;
                    } else {
                        // For hourly contracts, calculate based on hours worked
                        $clientCost = $totalHours * floatval($contract->work->rate);
                    }
                    
                    \Log::info("Processing contract {$contract->id}: {$billableTasks->count()} billable tasks in date range, {$totalHours} hours, \${$clientCost} cost");
                    
                    return [
                        'contract' => $contract,
                        'freelancer' => $contract->user,
                        'total_hours' => $totalHours,
                        'tasks_count' => $billableTasks->count(),
                        'contract_type' => $contract->work->contract_type,
                        'rate' => floatval($contract->work->rate), // What client pays per hour/month
                        'total_cost' => $clientCost, // Total cost for this contract in the period
                    ];
                });
            
            $workData = [
                'work' => $work,
                'contracts' => $contractData,
                'total_hours' => $contractData->sum('total_hours'),
                'tasks_count' => $contractData->sum('tasks_count'),
                'total_cost' => $contractData->sum('total_cost'), // Total cost for all contracts in this work
            ];
            
            \Log::info("Work {$work->id} processed: {$contractData->count()} contracts, {$workData['total_hours']} total hours, \${$workData['total_cost']} total cost in date range");
            
            return $workData;
        });
        
        // Only filter for specific date ranges if needed
        if ($request->filter !== 'current_week') {
            $processedWorks = $processedWorks->filter(function($work) {
                return $work['total_hours'] > 0 || $work['tasks_count'] > 0;
            });
        }
        $processedWorks = $processedWorks->values();
        
        \Log::info('Final processed works count after filtering: ' . $processedWorks->count());
        
        return Inertia::render('client/Timesheet/Index', [
            'works' => $processedWorks,
            'freelancers' => $freelancers,
            'filters' => [
                'filter' => $request->filter ?? 'current_week',
                'freelancer_id' => $request->freelancer_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ],
            'dateRange' => [
                'start' => $dateRange['start']->format('Y-m-d'),
                'end' => $dateRange['end']->format('Y-m-d'),
                'label' => $this->getDateRangeLabel($request->filter ?? 'current_week'),
            ],
            'debug' => [
                'client_id' => $clientId,
                'all_works' => $allWorks->count(),
                'all_contracts' => $allContracts->count(),
                'all_tasks' => $allTasks->count(),
                'works_with_contracts' => $works->count(),
                'freelancers_count' => $freelancers->count(),
                'processed_works' => $processedWorks->count(),
                'date_filter' => $request->filter ?? 'current_week',
                'date_range' => $dateRange['start']->format('Y-m-d') . ' to ' . $dateRange['end']->format('Y-m-d'),
                'freelancer_filter' => $request->freelancer_id,
            ]
        ]);
    }

    public function show(Work $work, Request $request)
    {
        if ($work->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Get date range based on filter
        $dateRange = $this->getDateRange(
            $request->filter ?? 'current_week', 
            $request->start_date, 
            $request->end_date
        );

        $work->load(['contracts.user']);

        $tasks = Task::with(['contract.user'])
            ->whereHas('contract', function($query) use ($work) {
                $query->where('work_id', $work->id);
            })
            ->where('is_billable', true)
            ->whereBetween('start_time', [$dateRange['start'], $dateRange['end']])
            ->orderBy('start_time', 'desc')
            ->get();

        // Calculate simple billing summary - only what client needs to know
        $summary = [
            'total_hours' => $tasks->sum('billable_hours'),
            'total_cost' => $tasks->sum(function($task) {
                // Client pays the full work rate
                return $task->billable_hours * $task->contract->work->rate;
            }),
        ];

        return Inertia::render('client/Timesheet/Show', [
            'work' => $work,
            'tasks' => $tasks,
            'summary' => $summary,
            'filters' => [
                'filter' => $request->filter ?? 'current_week',
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ],
            'dateRange' => [
                'start' => $dateRange['start']->format('Y-m-d'),
                'end' => $dateRange['end']->format('Y-m-d'),
                'label' => $this->getDateRangeLabel($request->filter ?? 'current_week'),
            ],
        ]);
    }

    private function getDateRange($filter, $customStart = null, $customEnd = null)
    {
        $now = Carbon::now();

        switch ($filter) {
            case 'last_week':
                return [
                    'start' => $now->copy()->subWeek()->startOfWeek(),
                    'end' => $now->copy()->subWeek()->endOfWeek(),
                ];
            case 'last_month':
                return [
                    'start' => $now->copy()->subMonth()->startOfMonth(),
                    'end' => $now->copy()->subMonth()->endOfMonth(),
                ];
            case 'last_3_months':
                return [
                    'start' => $now->copy()->subMonths(3)->startOfMonth(),
                    'end' => $now->copy()->subMonth()->endOfMonth(),
                ];
            case 'all_time':
                return [
                    'start' => Carbon::parse('2020-01-01')->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                ];
            case 'custom':
                return [
                    'start' => $customStart ? Carbon::parse($customStart)->startOfDay() : $now->startOfWeek(),
                    'end' => $customEnd ? Carbon::parse($customEnd)->endOfDay() : $now->endOfWeek(),
                ];
            case 'current_week':
            default:
                return [
                    'start' => $now->copy()->startOfWeek(),
                    'end' => $now->copy()->endOfWeek(),
                ];
        }
    }

    private function getDateRangeLabel($filter)
    {
        switch ($filter) {
            case 'last_week':
                return 'Last Week';
            case 'last_month':
                return 'Last Month';
            case 'last_3_months':
                return 'Last 3 Months';
            case 'all_time':
                return 'All Time';
            case 'custom':
                return 'Custom Range';
            case 'current_week':
            default:
                return 'Current Week';
        }
    }
}
