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
                    
                    \Log::info("Processing contract {$contract->id}: {$billableTasks->count()} billable tasks in date range, {$totalHours} hours");
                    
                    return [
                        'contract' => $contract,
                        'freelancer' => $contract->user,
                        'total_hours' => $totalHours,
                        'tasks_count' => $billableTasks->count(),
                        'contract_type' => $contract->work->contract_type,
                        'client_rate' => floatval($contract->work->rate),
                        'freelancer_rate' => floatval($contract->work->rate * (100 - $contract->agency_rate) / 100),
                    ];
                });
            
            $workData = [
                'work' => $work,
                'contracts' => $contractData,
                'total_hours' => $contractData->sum('total_hours'),
                'tasks_count' => $contractData->sum('tasks_count'),
            ];
            
            \Log::info("Work {$work->id} processed: {$contractData->count()} contracts, {$workData['total_hours']} total hours in date range");
            
            return $workData;
        });
        
        // REMOVE THIS LINE - Don't filter out works with 0 hours for current_week
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

        $summary = [
            'total_hours' => $tasks->sum('billable_hours'),
            'total_cost' => $tasks->sum(function($task) {
                return $task->billable_hours * $task->contract->work->rate;
            }),
            'total_freelancer_earnings' => $tasks->sum(function($task) {
                $freelancerRate = $task->contract->work->rate * (100 - $task->contract->agency_rate) / 100;
                return $task->billable_hours * $freelancerRate;
            }),
            'total_agency_earnings' => 0,
        ];
        
        $summary['total_agency_earnings'] = $summary['total_cost'] - $summary['total_freelancer_earnings'];

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
            ]
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
