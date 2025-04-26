<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WorkController;
use App\Http\Controllers\TaskController;
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

    Route::prefix('client')->group(function () {
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

    Route::prefix('freelancer')->group(function () {
        Route::resource('task', TaskController::class)->only(['store', 'index']);
    });

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
