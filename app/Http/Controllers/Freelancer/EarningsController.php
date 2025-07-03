<?php

namespace App\Http\Controllers\Freelancer;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class EarningsController extends Controller
{
    public function index(Request $request)
    {
        $freelancerId = auth()->id();
        
        // Get date range based on filter
        $dateRange = $this->getDateRange(
            $request->filter ?? 'current_week', 
            $request->start_date, 
            $request->end_date
        );
        
        // Get freelancer's contracts
        $contracts = Contract::with(['work.user'])
            ->where('user_id', $freelancerId)
            ->get();
        
        // Filter by specific contract if requested
        if ($request->contract_id) {
            $contracts = $contracts->where('id', $request->contract_id);
        }
        
        // Get all tasks for the freelancer in the date range
        $allTasks = Task::whereIn('contract_id', $contracts->pluck('id'))
            ->where('is_billable', true)
            ->whereBetween('start_time', [$dateRange['start'], $dateRange['end']])
            ->with('contract.work')
            ->get();
        
        // Process contract earnings
        $contractEarnings = $contracts->map(function($contract) use ($allTasks) {
            // Get tasks for this specific contract
            $contractTasks = $allTasks->where('contract_id', $contract->id);
            $totalHours = $contractTasks->sum('billable_hours');
            
            // Calculate freelancer rate (what they earn after agency fee)
            $freelancerRate = $contract->work->rate * (100 - $contract->agency_rate) / 100;
            
            // Calculate earnings
            if ($contract->work->contract_type === 'monthly') {
                $earnings = $totalHours > 0 ? $freelancerRate : 0;
            } else {
                $earnings = $totalHours * $freelancerRate;
            }
            
            return [
                'contract' => $contract,
                'total_hours' => $totalHours,
                'task_count' => $contractTasks->count(),
                'freelancer_rate' => $freelancerRate,
                'earnings' => $earnings,
                'contract_type' => $contract->work->contract_type,
            ];
        })->filter(function($item) use ($request) {
            // Show contracts with tasks or monthly contracts
            return $item['task_count'] > 0 || $item['contract_type'] === 'monthly';
        })->values();
        
        // Calculate totals
        $totalHours = $contractEarnings->sum('total_hours');
        $totalEarnings = $contractEarnings->sum('earnings');
        $totalTasks = $contractEarnings->sum('task_count');
        
        // Get recent tasks - simplified
        $recentTasks = $allTasks->sortByDesc('start_time')->take(20);
        
        // Monthly earnings - simplified
        $currentYear = Carbon::now()->year;
        $monthlyEarnings = collect();
        
        for ($month = 1; $month <= 12; $month++) {
            $monthlyTasks = Task::whereIn('contract_id', $contracts->pluck('id'))
                ->where('is_billable', true)
                ->whereYear('start_time', $currentYear)
                ->whereMonth('start_time', $month)
                ->with('contract.work')
                ->get();
                
            $monthEarnings = $monthlyTasks->sum(function($task) {
                if ($task->contract && $task->contract->work) {
                    $freelancerRate = (100 - $task->contract->agency_rate) / 100;
                    return ($task->billable_hours * $task->contract->work->rate) * $freelancerRate;
                }
                return 0;
            });
            
            $monthlyEarnings->push([
                'month' => Carbon::create($currentYear, $month, 1)->format('M'),
                'earnings' => round($monthEarnings, 2)
            ]);
        }
        
        return Inertia::render('freelancer/earnings/Index', [
            'contractEarnings' => $contractEarnings,
            'contracts' => $contracts, // All contracts for dropdown
            'tasks' => $recentTasks,
            'summary' => [
                'total_hours' => round($totalHours, 2),
                'total_earnings' => round($totalEarnings, 2),
                'total_tasks' => $totalTasks,
                'avg_hourly_rate' => $totalHours > 0 ? round($totalEarnings / $totalHours, 2) : 0,
            ],
            'monthlyEarnings' => $monthlyEarnings,
            'currentYear' => $currentYear,
            'filters' => [
                'filter' => $request->filter ?? 'current_week',
                'contract_id' => $request->contract_id,
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
