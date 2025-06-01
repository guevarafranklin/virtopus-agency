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
        
        // First, let's see what data we actually have
        $allWorks = Work::where('user_id', $clientId)->get();
        \Log::info('All works for client: ' . $allWorks->count());
        
        $allContracts = Contract::whereHas('work', function($query) use ($clientId) {
            $query->where('user_id', $clientId);
        })->get();
        \Log::info('All contracts for client works: ' . $allContracts->count());
        
        $allTasks = Task::whereHas('contract.work', function($query) use ($clientId) {
            $query->where('user_id', $clientId);
        })->where('is_billable', true)->get();
        \Log::info('All billable tasks for client contracts: ' . $allTasks->count());
        
        // Get works with proper relationships loaded
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
        
        // Log individual work details
        foreach($works as $work) {
            \Log::info("Work {$work->id}: {$work->title} has {$work->contracts->count()} contracts");
            foreach($work->contracts as $contract) {
                \Log::info("  Contract {$contract->id} with user {$contract->user->name} has {$contract->tasks->count()} billable tasks");
            }
        }
        
        // Get all freelancers who have contracts with this client's works
        $freelancers = Contract::with('user')
            ->whereHas('work', function($query) use ($clientId) {
                $query->where('user_id', $clientId);
            })
            ->get()
            ->pluck('user')
            ->unique('id')
            ->values();
        
        \Log::info('Freelancers found: ' . $freelancers->count());
        
        // Process works data for display - FIXED STRUCTURE
        $processedWorks = $works->map(function($work) {
            $contractData = $work->contracts->map(function($contract) {
                $billableTasks = $contract->tasks->where('is_billable', true);
                $totalHours = $billableTasks->sum('billable_hours');
                
                \Log::info("Processing contract {$contract->id}: {$billableTasks->count()} billable tasks, {$totalHours} hours");
                
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
            
            \Log::info("Work {$work->id} processed: {$contractData->count()} contracts, {$workData['total_hours']} total hours");
            
            return $workData;
        });
        
        \Log::info('Final processed works count: ' . $processedWorks->count());
        
        return Inertia::render('client/Timesheet/Index', [
            'works' => $processedWorks,
            'freelancers' => $freelancers,
            'filters' => [
                'filter' => 'current_week',
                'freelancer_id' => null,
                'start_date' => null,
                'end_date' => null,
            ],
            'dateRange' => [
                'start' => now()->startOfWeek()->format('Y-m-d'),
                'end' => now()->endOfWeek()->format('Y-m-d'),
                'label' => 'Current Week',
            ],
            'debug' => [
                'client_id' => $clientId,
                'all_works' => $allWorks->count(),
                'all_contracts' => $allContracts->count(),
                'all_tasks' => $allTasks->count(),
                'works_with_contracts' => $works->count(),
                'freelancers_count' => $freelancers->count(),
                'processed_works' => $processedWorks->count(),
            ]
        ]);
    }

    public function show(Work $work, Request $request)
    {
        if ($work->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Load the work with all its contracts and tasks
        $work->load([
            'contracts.user',
            'contracts.tasks' => function($query) {
                $query->where('is_billable', true);
            }
        ]);

        // Get all billable tasks for this work
        $tasks = Task::with(['contract.user'])
            ->whereHas('contract', function($query) use ($work) {
                $query->where('work_id', $work->id);
            })
            ->where('is_billable', true)
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
            'total_agency_earnings' => 0, // Will calculate this
        ];
        
        $summary['total_agency_earnings'] = $summary['total_cost'] - $summary['total_freelancer_earnings'];

        return Inertia::render('client/Timesheet/Show', [
            'work' => $work,
            'tasks' => $tasks,
            'summary' => $summary,
            'filters' => [
                'filter' => 'current_week',
                'start_date' => null,
                'end_date' => null,
            ],
            'dateRange' => [
                'start' => now()->startOfWeek()->format('Y-m-d'),
                'end' => now()->endOfWeek()->format('Y-m-d'),
                'label' => 'Current Week',
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
            case 'custom':
                return 'Custom Range';
            case 'current_week':
            default:
                return 'Current Week';
        }
    }
}
