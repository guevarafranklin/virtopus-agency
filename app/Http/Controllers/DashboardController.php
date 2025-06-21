<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        switch ($user->role) {
            case 'admin':
                return $this->adminDashboard();
            case 'client':
                return $this->clientDashboard();
            case 'freelancer':
                return $this->freelancerDashboard();
            default:
                return Inertia::render('dashboard');
        }
    }

    private function adminDashboard()
    {
        // 1. Count active contracts with freelancers assigned
        $activeContracts = Contract::whereHas('work', function($query) {
            $query->where('status', 'active');
        })->count();

        // 2. Total hours worked by freelancers this month
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        
        $totalHours = Task::where('is_billable', true)
            ->whereMonth('start_time', $currentMonth)
            ->whereYear('start_time', $currentYear)
            ->sum('billable_hours');

        // 3. Agency earnings by month for current year
        $monthlyEarnings = collect();
        for ($month = 1; $month <= 12; $month++) {
            $earnings = Task::where('is_billable', true)
                ->whereYear('start_time', $currentYear)
                ->whereMonth('start_time', $month)
                ->with('contract')
                ->get()
                ->sum(function($task) {
                    if ($task->contract) {
                        $agencyRate = $task->contract->agency_rate / 100;
                        return ($task->billable_hours * $task->contract->work->rate) * $agencyRate;
                    }
                    return 0;
                });
            
            $monthlyEarnings->push([
                'month' => Carbon::create($currentYear, $month, 1)->format('M'),
                'earnings' => round($earnings, 2)
            ]);
        }

        return Inertia::render('dashboard/AdminDashboard', [
            'activeContracts' => $activeContracts,
            'totalHours' => round($totalHours, 2),
            'monthlyEarnings' => $monthlyEarnings,
            'currentYear' => $currentYear
        ]);
    }

    private function clientDashboard()
    {
        $user = auth()->user();
        
        // Get user's works and related data
        $totalProjects = $user->works()->count();
        $activeProjects = $user->works()->where('status', 'active')->count();
        
        // Get contracts for user's works
        $totalContracts = Contract::whereHas('work', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })->count();

        // Monthly spending for current year
        $currentYear = Carbon::now()->year;
        $monthlySpending = collect();
        
        for ($month = 1; $month <= 12; $month++) {
            $spending = Task::where('is_billable', true)
                ->whereYear('start_time', $currentYear)
                ->whereMonth('start_time', $month)
                ->whereHas('contract.work', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->with('contract.work')
                ->get()
                ->sum(function($task) {
                    if ($task->contract && $task->contract->work) {
                        return $task->billable_hours * $task->contract->work->rate;
                    }
                    return 0;
                });
            
            $monthlySpending->push([
                'month' => Carbon::create($currentYear, $month, 1)->format('M'),
                'spending' => round($spending, 2)
            ]);
        }

        return Inertia::render('dashboard/ClientDashboard', [
            'totalProjects' => $totalProjects,
            'activeProjects' => $activeProjects,
            'totalContracts' => $totalContracts,
            'monthlySpending' => $monthlySpending,
            'currentYear' => $currentYear
        ]);
    }

    private function freelancerDashboard()
    {
        $user = auth()->user();
        
        // Get freelancer's contracts
        $totalContracts = $user->contracts()->count();
        $activeContracts = $user->contracts()->whereHas('work', function($query) {
            $query->where('status', 'active');
        })->count();

        // This month's billable hours
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        
        $monthlyHours = $user->tasks()
            ->where('is_billable', true)
            ->whereMonth('start_time', $currentMonth)
            ->whereYear('start_time', $currentYear)
            ->sum('billable_hours');

        // Monthly earnings for current year
        $monthlyEarnings = collect();
        
        for ($month = 1; $month <= 12; $month++) {
            $earnings = $user->tasks()
                ->where('is_billable', true)
                ->whereYear('start_time', $currentYear)
                ->whereMonth('start_time', $month)
                ->with('contract.work')
                ->get()
                ->sum(function($task) {
                    if ($task->contract && $task->contract->work) {
                        $freelancerRate = (100 - $task->contract->agency_rate) / 100;
                        return ($task->billable_hours * $task->contract->work->rate) * $freelancerRate;
                    }
                    return 0;
                });
            
            $monthlyEarnings->push([
                'month' => Carbon::create($currentYear, $month, 1)->format('M'),
                'earnings' => round($earnings, 2)
            ]);
        }

        return Inertia::render('dashboard/FreelancerDashboard', [
            'totalContracts' => $totalContracts,
            'activeContracts' => $activeContracts,
            'monthlyHours' => round($monthlyHours, 2),
            'monthlyEarnings' => $monthlyEarnings,
            'currentYear' => $currentYear
        ]);
    }
}
