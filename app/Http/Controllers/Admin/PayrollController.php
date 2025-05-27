<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $query = Contract::with(['work', 'user', 'tasks' => function($query) {
            $query->where('is_billable', true);
        }]);

        // Filter by freelancer if specified
        if ($request->freelancer_id) {
            $query->where('user_id', $request->freelancer_id);
        }

        // Filter by date range if specified
        if ($request->start_date && $request->end_date) {
            $query->whereHas('tasks', function($taskQuery) use ($request) {
                $taskQuery->whereBetween('start_time', [
                    Carbon::parse($request->start_date)->startOfDay(),
                    Carbon::parse($request->end_date)->endOfDay()
                ]);
            });
        }

        $contracts = $query->get()->map(function ($contract) use ($request) {
            // Get billable tasks for this contract
            $tasksQuery = Task::where('contract_id', $contract->id)
                ->where('is_billable', true);

            // Apply date filter to tasks if specified
            if ($request->start_date && $request->end_date) {
                $tasksQuery->whereBetween('start_time', [
                    Carbon::parse($request->start_date)->startOfDay(),
                    Carbon::parse($request->end_date)->endOfDay()
                ]);
            }

            $tasks = $tasksQuery->get();
            $totalHours = $tasks->sum('billable_hours');
            $freelancerRate = $contract->work->rate * (100 - $contract->agency_rate) / 100;
            
            // Calculate earnings based on contract type
            if ($contract->work->contract_type === 'monthly') {
                // For monthly contracts, use the fixed monthly rate regardless of hours
                $totalEarnings = $freelancerRate;
                $agencyEarnings = $contract->work->rate * $contract->agency_rate / 100;
            } else {
                // For hourly contracts, calculate based on total hours worked
                $totalEarnings = $totalHours * $freelancerRate;
                $agencyEarnings = $totalHours * ($contract->work->rate * $contract->agency_rate / 100);
            }

            return [
                'contract' => $contract,
                'total_hours' => $totalHours,
                'total_earnings' => $totalEarnings,
                'agency_earnings' => $agencyEarnings,
                'freelancer_rate' => $freelancerRate,
                'tasks' => $tasks,
                'contract_type' => $contract->work->contract_type
            ];
        })->filter(function ($item) {
            // For monthly contracts, show them even if no hours are logged
            // For hourly contracts, only show if there are billable hours
            return $item['contract_type'] === 'monthly' || $item['total_hours'] > 0;
        });

        $freelancers = User::where('role', 'freelancer')->get();

        return Inertia::render('admin/payroll/Index', [
            'contracts' => $contracts,
            'freelancers' => $freelancers,
            'filters' => [
                'freelancer_id' => $request->freelancer_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ]
        ]);
    }

    public function show(Contract $contract, Request $request)
    {
        $contract->load(['work', 'user']);

        $tasksQuery = Task::where('contract_id', $contract->id)
            ->where('is_billable', true)
            ->orderBy('start_time', 'desc');

        // Apply date filter if specified
        if ($request->start_date && $request->end_date) {
            $tasksQuery->whereBetween('start_time', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay()
            ]);
        }

        $tasks = $tasksQuery->get();
        $totalHours = $tasks->sum('billable_hours');
        $freelancerRate = $contract->work->rate * (100 - $contract->agency_rate) / 100;
        
        // Calculate earnings based on contract type
        if ($contract->work->contract_type === 'monthly') {
            // For monthly contracts, use the fixed monthly rate
            $totalEarnings = $freelancerRate;
            $agencyEarnings = $contract->work->rate * $contract->agency_rate / 100;
        } else {
            // For hourly contracts, calculate based on hours worked
            $totalEarnings = $totalHours * $freelancerRate;
            $agencyEarnings = $totalHours * ($contract->work->rate * $contract->agency_rate / 100);
        }

        return Inertia::render('admin/payroll/Show', [
            'contract' => $contract,
            'tasks' => $tasks,
            'summary' => [
                'total_hours' => $totalHours,
                'total_earnings' => $totalEarnings,
                'agency_earnings' => $agencyEarnings,
                'freelancer_rate' => $freelancerRate,
                'agency_rate' => $contract->agency_rate,
                'work_rate' => $contract->work->rate,
                'contract_type' => $contract->work->contract_type,
            ],
            'filters' => [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ]
        ]);
    }
}
