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
        return Inertia::render('client/Timesheet/Index', [
        'works' => [],
        'freelancers' => [],
        'filters' => [
            'filter' => 'current_week',
            'freelancer_id' => null,
            'start_date' => null,
            'end_date' => null,
        ],
        'dateRange' => [
            'start' => now()->format('Y-m-d'),
            'end' => now()->format('Y-m-d'),
            'label' => 'Current Week',
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

        return Inertia::render('client/Timesheet/Show', [
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
