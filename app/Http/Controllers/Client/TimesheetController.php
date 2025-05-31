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
        // Get date range based on filter
        $dateRange = $this->getDateRange($request->filter ?? 'current_week', $request->start_date, $request->end_date);
        
        // Get works (jobs) posted by the authenticated client
        $worksQuery = Work::with(['contracts.user', 'contracts.tasks' => function($query) use ($dateRange) {
            $query->where('is_billable', true)
                  ->whereBetween('start_time', [$dateRange['start'], $dateRange['end']]);
        }])
        ->where('user_id', auth()->id())
        ->whereHas('contracts'); // Only works that have contracts

        // Filter by freelancer if specified
        if ($request->freelancer_id) {
            $worksQuery->whereHas('contracts', function($query) use ($request) {
                $query->where('user_id', $request->freelancer_id);
            });
        }

        $works = $worksQuery->get()->map(function ($work) use ($dateRange) {
            $contractsData = $work->contracts->map(function ($contract) use ($dateRange) {
                // Get billable tasks for this contract in date range
                $tasks = Task::where('contract_id', $contract->id)
                    ->where('is_billable', true)
                    ->whereBetween('start_time', [$dateRange['start'], $dateRange['end']])
                    ->get();

                $totalHours = $tasks->sum('billable_hours');
                $freelancerRate = $contract->work->rate * (100 - $contract->agency_rate) / 100;
                
                // Calculate earnings based on contract type
                if ($contract->work->contract_type === 'monthly') {
                    // For monthly contracts, use fixed rate
                    $freelancerEarnings = $freelancerRate;
                    $totalCost = $contract->work->rate;
                } else {
                    // For hourly contracts, calculate based on hours
                    $freelancerEarnings = $totalHours * $freelancerRate;
                    $totalCost = $totalHours * $contract->work->rate;
                }

                $agencyEarnings = $totalCost - $freelancerEarnings;

                return [
                    'contract' => $contract,
                    'freelancer' => $contract->user,
                    'total_hours' => $totalHours,
                    'freelancer_earnings' => $freelancerEarnings,
                    'agency_earnings' => $agencyEarnings,
                    'total_cost' => $totalCost,
                    'freelancer_rate' => $freelancerRate,
                    'client_rate' => $contract->work->rate,
                    'contract_type' => $contract->work->contract_type,
                    'tasks_count' => $tasks->count(),
                ];
            })->filter(function ($contractData) {
                // For monthly contracts, show even if no hours logged
                // For hourly contracts, only show if there are billable hours
                return $contractData['contract_type'] === 'monthly' || $contractData['total_hours'] > 0;
            });

            return [
                'work' => $work,
                'contracts' => $contractsData,
                'total_cost' => $contractsData->sum('total_cost'),
                'total_hours' => $contractsData->sum('total_hours'),
            ];
        })->filter(function ($workData) {
            return $workData['contracts']->isNotEmpty();
        });

        // Get all freelancers working on client's projects
        $freelancers = Contract::with('user')
            ->whereHas('work', function($query) {
                $query->where('user_id', auth()->id());
            })
            ->get()
            ->pluck('user')
            ->unique('id')
            ->values();

        return Inertia::render('client/timesheet/Index', [
            'works' => $works,
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
            ]
        ]);
    }

    public function show(Work $work, Request $request)
    {
        // Ensure the work belongs to the authenticated client
        if ($work->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $dateRange = $this->getDateRange($request->filter ?? 'current_week', $request->start_date, $request->end_date);

        $work->load(['contracts.user']);

        // Get all tasks for this work's contracts within date range
        $tasks = Task::with(['contract.user'])
            ->whereHas('contract', function($query) use ($work) {
                $query->where('work_id', $work->id);
            })
            ->where('is_billable', true)
            ->whereBetween('start_time', [$dateRange['start'], $dateRange['end']])
            ->orderBy('start_time', 'desc')
            ->get();

        // Calculate summary
        $totalHours = $tasks->sum('billable_hours');
        $totalCost = $tasks->sum(function($task) {
            return $task->billable_hours * $task->contract->work->rate;
        });
        $totalFreelancerEarnings = $tasks->sum(function($task) {
            $freelancerRate = $task->contract->work->rate * (100 - $task->contract->agency_rate) / 100;
            return $task->billable_hours * $freelancerRate;
        });
        $totalAgencyEarnings = $totalCost - $totalFreelancerEarnings;

        return Inertia::render('client/timesheet/Show', [
            'work' => $work,
            'tasks' => $tasks,
            'summary' => [
                'total_hours' => $totalHours,
                'total_cost' => $totalCost,
                'total_freelancer_earnings' => $totalFreelancerEarnings,
                'total_agency_earnings' => $totalAgencyEarnings,
            ],
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
