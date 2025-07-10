<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WorkController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\Admin\PayrollController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Freelancer\EarningsController;
use App\Http\Controllers\Client\TimesheetController;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect root to login for unauthenticated users, dashboard for authenticated
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('profile', ProfileController::class);

    // Admin-only routes (user management)
    Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
        // User management
        Route::resource('user', UserController::class);
        Route::put('/users/{user}/reset-password', [UserController::class, 'resetPassword'])
            ->name('user.resetPassword');
        
        // Contract management
        Route::resource('contract', ContractController::class);
        
        // Payroll management
        Route::get('/payroll', [PayrollController::class, 'index'])->name('payroll.index');
        Route::get('/payroll/{contract}', [PayrollController::class, 'show'])->name('payroll.show');
    });

    // Client routes (admin and client can access)
    Route::middleware(['auth', 'role:admin,client'])->prefix('client')->name('client.')->group(function () {
        // Work management
        Route::resource('work', WorkController::class);
        
        // Timesheet routes
        Route::get('/timesheet', [TimesheetController::class, 'index'])->name('timesheet.index');
        Route::get('/timesheet/{work}', [TimesheetController::class, 'show'])->name('timesheet.show');
    });

    // Freelancer routes (admin and freelancer can access)
    Route::middleware(['auth', 'role:admin,freelancer'])->prefix('freelancer')->name('freelancer.')->group(function () {
        // Task management
        Route::resource('task', TaskController::class);
        Route::get('/task/weekly-hours', [TaskController::class, 'getWeeklyHours'])->name('task.weekly-hours');
        
        // Contract viewing (read-only for freelancers)
        Route::get('/contracts', [ContractController::class, 'freelancerIndex'])->name('contract.index');
        Route::get('/contracts/{contract}', [ContractController::class, 'freelancerShow'])->name('contract.show');
        
        // Earnings tracking
        Route::get('/earnings', [EarningsController::class, 'index'])->name('earnings.index');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
