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
        try {
            $freelancerId = auth()->id();
            
            // Get date range based on filter
            $dateRange = $this->getDateRange(
                $request->filter ?? 'current_week', 
                $request->start_date, 
                $request->end_date
            );
            
            // Get freelancer's contracts with proper relationships
            $contracts = Contract::with(['work.user'])
                ->where('user_id', $freelancerId)
                ->get();
            
            // Filter by specific contract if requested
            if ($request->contract_id) {
                $contracts = $contracts->where('id', $request->contract_id);
            }
            
            // Get all billable tasks for the freelancer in the date range
            $allTasks = Task::whereIn('contract_id', $contracts->pluck('id'))
                ->where('is_billable', true)
                ->whereBetween('start_time', [$dateRange['start'], $dateRange['end']])
                ->with(['contract.work.user'])
                ->get();
            
            // Process contract earnings
            $contractEarnings = $contracts->map(function($contract) use ($allTasks) {
                // Get tasks for this specific contract
                $contractTasks = $allTasks->where('contract_id', $contract->id);
                $totalHours = $contractTasks->sum('billable_hours') ?? 0;
                
                // Calculate freelancer rate (what they earn after agency fee)
                $workRate = floatval($contract->work->rate ?? 0);
                $agencyRate = floatval($contract->agency_rate ?? 0);
                $freelancerRate = $workRate * (100 - $agencyRate) / 100;
                
                // Calculate earnings based on contract type
                if ($contract->work->contract_type === 'monthly') {
                    // For monthly contracts, freelancer gets paid the fixed rate if there are any billable hours
                    $earnings = $totalHours > 0 ? $freelancerRate : 0;
                } else {
                    // For hourly contracts, calculate based on hours worked
                    $earnings = $totalHours * $freelancerRate;
                }
                
                return [
                    'contract' => $contract,
                    'client_name' => $contract->work->user->name ?? 'Unknown Client',
                    'project_title' => $contract->work->title ?? 'Unknown Project',
                    'total_hours' => $totalHours,
                    'task_count' => $contractTasks->count(),
                    'freelancer_rate' => $freelancerRate,
                    'earnings' => $earnings,
                    'contract_type' => $contract->work->contract_type ?? 'hourly',
                ];
            })->filter(function($item) {
                // Show contracts with tasks or monthly contracts that have been worked on
                return $item['task_count'] > 0 || ($item['contract_type'] === 'monthly' && $item['total_hours'] > 0);
            })->values();
            
            // Calculate totals
            $totalHours = $contractEarnings->sum('total_hours') ?? 0;
            $totalEarnings = $contractEarnings->sum('earnings') ?? 0;
            $totalTasks = $contractEarnings->sum('task_count') ?? 0;
            
            // Get recent tasks - limited and sorted
            $recentTasks = $allTasks->sortByDesc('start_time')->take(10)->map(function($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'start_time' => $task->start_time,
                    'end_time' => $task->end_time,
                    'billable_hours' => $task->billable_hours ?? 0,
                    'status' => $task->status,
                    'contract' => [
                        'work' => [
                            'title' => $task->contract->work->title ?? 'Unknown Project',
                            'user' => [
                                'name' => $task->contract->work->user->name ?? 'Unknown Client'
                            ]
                        ]
                    ]
                ];
            })->values();
            
            // Monthly earnings for current year
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
                        $workRate = floatval($task->contract->work->rate ?? 0);
                        $agencyRate = floatval($task->contract->agency_rate ?? 0);
                        $freelancerRate = $workRate * (100 - $agencyRate) / 100;
                        
                        if ($task->contract->work->contract_type === 'monthly') {
                            // For monthly contracts, count the fixed rate once per month if there are hours
                            return $task->billable_hours > 0 ? $freelancerRate : 0;
                        } else {
                            return ($task->billable_hours ?? 0) * $freelancerRate;
                        }
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
            
        } catch (\Exception $e) {
            \Log::error('Earnings page error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return empty data structure to prevent page crash
            return Inertia::render('freelancer/earnings/Index', [
                'contractEarnings' => collect(),
                'contracts' => collect(),
                'tasks' => collect(),
                'summary' => [
                    'total_hours' => 0,
                    'total_earnings' => 0,
                    'total_tasks' => 0,
                    'avg_hourly_rate' => 0,
                ],
                'monthlyEarnings' => collect(range(1, 12))->map(function($month) {
                    return [
                        'month' => Carbon::create(null, $month, 1)->format('M'),
                        'earnings' => 0
                    ];
                }),
                'currentYear' => Carbon::now()->year,
                'filters' => [
                    'filter' => 'current_week',
                    'contract_id' => null,
                    'start_date' => null,
                    'end_date' => null,
                ],
                'dateRange' => [
                    'start' => Carbon::now()->startOfWeek()->format('Y-m-d'),
                    'end' => Carbon::now()->endOfWeek()->format('Y-m-d'),
                    'label' => 'Current Week',
                ],
            ]);
        }
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
