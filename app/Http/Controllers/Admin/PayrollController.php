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
        \Log::info('Starting admin payroll index');
        
        // Get date range based on filter
        $dateRange = $this->getDateRange(
            $request->filter ?? 'current_week', 
            $request->start_date, 
            $request->end_date
        );
        
        \Log::info('Date range: ' . $dateRange['start']->format('Y-m-d') . ' to ' . $dateRange['end']->format('Y-m-d'));
        \Log::info('Filters received:', $request->all());
        
        // Get all contracts with relationships loaded first - NO FILTERING YET
        $allContracts = Contract::with(['work.user', 'user', 'tasks' => function($query) {
            $query->where('is_billable', true);
        }])->get();
        
        \Log::info('All contracts found: ' . $allContracts->count());

        // Apply user filters to the collection (not query)
        $filteredContracts = $allContracts;
        
        // Filter by freelancer if specified
        if ($request->freelancer_id) {
            $filteredContracts = $filteredContracts->where('user_id', $request->freelancer_id);
            \Log::info('Contracts after freelancer filter: ' . $filteredContracts->count());
        }

        // Filter by client if specified
        if ($request->client_id) {
            $filteredContracts = $filteredContracts->filter(function($contract) use ($request) {
                return $contract->work && $contract->work->user_id == $request->client_id;
            });
            \Log::info('Contracts after client filter: ' . $filteredContracts->count());
        }

        // Process contracts and apply date filtering during processing
        $processedContracts = $filteredContracts->map(function ($contract) use ($dateRange) {
            // Get billable tasks for this contract within the date range
            $tasks = $contract->tasks
                ->where('is_billable', true)
                ->filter(function($task) use ($dateRange) {
                    $taskDate = Carbon::parse($task->start_time);
                    return $taskDate->between($dateRange['start'], $dateRange['end']);
                });

            $totalHours = $tasks->sum('billable_hours');
            $freelancerRate = $contract->work->rate * (100 - $contract->agency_rate) / 100;
            
            // Calculate earnings based on contract type
            if ($contract->work->contract_type === 'monthly') {
                // For monthly contracts, use the fixed monthly rate regardless of hours
                $totalEarnings = $freelancerRate;
                $agencyEarnings = $contract->work->rate * $contract->agency_rate / 100;
            } else {
                // For hourly contracts, calculate based on hours worked
                $totalEarnings = $totalHours * $freelancerRate;
                $agencyEarnings = $totalHours * ($contract->work->rate * $contract->agency_rate / 100);
            }

            \Log::info("Processing contract {$contract->id}: {$tasks->count()} tasks in date range, {$totalHours} hours");

            return [
                'contract' => $contract,
                'total_hours' => $totalHours,
                'total_earnings' => $totalEarnings,
                'agency_earnings' => $agencyEarnings,
                'freelancer_rate' => $freelancerRate,
                'tasks' => $tasks,
                'contract_type' => $contract->work->contract_type,
                'client' => $contract->work->user, // Add client info
            ];
        });

        // Only filter out contracts with 0 hours for specific date ranges (not current_week)
        if ($request->filter !== 'current_week' && $request->filter !== 'all_time') {
            $processedContracts = $processedContracts->filter(function ($item) {
                // For monthly contracts, show them even if no hours are logged
                // For hourly contracts, only show if there are billable hours
                return $item['contract_type'] === 'monthly' || $item['total_hours'] > 0;
            });
        }
        
        $processedContracts = $processedContracts->values();

        // Get all freelancers and clients
        $freelancers = User::where('role', 'freelancer')->get();
        $clients = User::where('role', 'client')->get();

        \Log::info('Final processed contracts: ' . $processedContracts->count());
        \Log::info('Freelancers: ' . $freelancers->count());
        \Log::info('Clients: ' . $clients->count());

        return Inertia::render('admin/payroll/Index', [
            'contracts' => $processedContracts,
            'freelancers' => $freelancers,
            'clients' => $clients,
            'filters' => [
                'filter' => $request->filter ?? 'current_week',
                'freelancer_id' => $request->freelancer_id,
                'client_id' => $request->client_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ],
            'dateRange' => [
                'start' => $dateRange['start']->format('Y-m-d'),
                'end' => $dateRange['end']->format('Y-m-d'),
                'label' => $this->getDateRangeLabel($request->filter ?? 'current_week'),
            ],
            'debug' => [
                'all_contracts' => $allContracts->count(),
                'filtered_contracts' => $filteredContracts->count(),
                'contracts_count' => $processedContracts->count(),
                'freelancers_count' => $freelancers->count(),
                'clients_count' => $clients->count(),
                'date_filter' => $request->filter ?? 'current_week',
                'date_range' => $dateRange['start']->format('Y-m-d') . ' to ' . $dateRange['end']->format('Y-m-d'),
                'freelancer_filter' => $request->freelancer_id,
                'client_filter' => $request->client_id,
            ]
        ]);
    }

    public function show(Contract $contract, Request $request)
    {
        $contract->load(['work.user', 'user']);

        // Get date range based on filter
        $dateRange = $this->getDateRange(
            $request->filter ?? 'current_week', 
            $request->start_date, 
            $request->end_date
        );

        $tasksQuery = Task::where('contract_id', $contract->id)
            ->where('is_billable', true)
            ->orderBy('start_time', 'desc');

        // Apply date filter
        $tasksQuery->whereBetween('start_time', [$dateRange['start'], $dateRange['end']]);

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
