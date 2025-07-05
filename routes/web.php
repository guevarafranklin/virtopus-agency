<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WorkController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\Admin\PayrollController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Freelancer\EarningsController;

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
    Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
        // Place admin-specific routes here
        Route::resource('user', UserController::class)->names([
            'index' => 'admin.user.index',
            'create' => 'admin.user.create',
            'store' => 'admin.user.store',
            'show' => 'admin.user.show',
            'edit' => 'admin.user.edit',
            'update' => 'admin.user.update',
            'destroy' => 'admin.user.destroy',
        ]);
        Route::put('/admin/users/{user}/reset-password', [UserController::class, 'resetPassword'])
            ->name('admin.user.resetPassword');
    });

    // Allow both admin and client to access client routes
    Route::middleware(['auth', 'role:admin,client'])->prefix('client')->group(function () {
        Route::resource('work', WorkController::class)->names([
            'index' => 'client.work.index',
            'create' => 'client.work.create',
            'store' => 'client.work.store',
            'show' => 'client.work.show',
            'edit' => 'client.work.edit',
            'update' => 'client.work.update',
            'destroy' => 'client.work.destroy',
        ]);

        // Client timesheet routes
        Route::get('/timesheet', [App\Http\Controllers\Client\TimesheetController::class, 'index'])->name('client.timesheet.index');
        Route::get('/timesheet/{work}', [App\Http\Controllers\Client\TimesheetController::class, 'show'])->name('client.timesheet.show');
    });

    // Allow both admin and freelancer to access freelancer routes
    Route::middleware(['auth', 'role:admin,freelancer'])->prefix('freelancer')->group(function () {
        Route::resource('task', TaskController::class)->names([
            'index' => 'freelancer.task.index',
            'create' => 'freelancer.task.create',
            'store' => 'freelancer.task.store',
            'show' => 'freelancer.task.show',
            'edit' => 'freelancer.task.edit',
            'update' => 'freelancer.task.update',
            'destroy' => 'freelancer.task.destroy',
        ]);

        // Freelancer contract routes (read-only)
        Route::get('/contracts', [ContractController::class, 'freelancerIndex'])->name('freelancer.contract.index');
        Route::get('/contracts/{contract}', [ContractController::class, 'freelancerShow'])->name('freelancer.contract.show');
        
        // Freelancer earnings routes
        Route::get('/earnings', [EarningsController::class, 'index'])->name('freelancer.earnings.index');
    });

    // Freelancer-specific routes
    Route::middleware(['auth', 'role:freelancer'])->prefix('freelancer')->name('freelancer.')->group(function () {
        // Task routes
        Route::resource('task', TaskController::class);
        Route::get('/task/weekly-hours', [TaskController::class, 'getWeeklyHours'])->name('task.weekly-hours');
    });

    // Admin routes
    Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
        Route::resource('contract', ContractController::class)->names([
            'index' => 'admin.contract.index',
            'create' => 'admin.contract.create',
            'store' => 'admin.contract.store',
            'show' => 'admin.contract.show',
            'edit' => 'admin.contract.edit',
            'update' => 'admin.contract.update',
            'destroy' => 'admin.contract.destroy',
        ]);
        
        Route::resource('user', UserController::class)->names([
            'index' => 'admin.user.index',
            'create' => 'admin.user.create',
            'store' => 'admin.user.store',
            'show' => 'admin.user.show',
            'edit' => 'admin.user.edit',
            'update' => 'admin.user.update',
            'destroy' => 'admin.user.destroy',
        ]);

        Route::get('/payroll', [PayrollController::class, 'index'])->name('admin.payroll.index');
        Route::get('/payroll/{contract}', [PayrollController::class, 'show'])->name('admin.payroll.show');
    });

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
