<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WorkController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\Admin\PayrollController;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

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
    });

    Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    // ...existing routes...
    
    Route::resource('contract', ContractController::class)->names([
        'index' => 'admin.contract.index',
        'create' => 'admin.contract.create',
        'store' => 'admin.contract.store',
        'show' => 'admin.contract.show',
        'edit' => 'admin.contract.edit',
        'update' => 'admin.contract.update',
        'destroy' => 'admin.contract.destroy',
    ]);

    // Payroll routes
    Route::get('/payroll', [PayrollController::class, 'index'])->name('admin.payroll.index');
    Route::get('/payroll/contract/{contract}', [PayrollController::class, 'show'])->name('admin.payroll.show');
});

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
