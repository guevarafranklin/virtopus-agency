<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance']);
        
        // Register the role middleware alias
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        $middleware->validateCsrfTokens(except: [
        'stripe/*',
    ]);

    })
    ->withSchedule(function ($schedule) {
        // DISABLED: Sunday invoice generation and sending
        // Generate invoices every Sunday at 5:15 PM (after billing period ends at 5:00 PM)
        // $schedule->command('invoices:generate-weekly')
        //     ->weeklyOn(0, '17:15') // Sunday at 5:15 PM
        //     ->timezone('America/New_York'); // Set your timezone

        // Send invoices 30 minutes after generation to allow for review
        // $schedule->command('invoices:send-pending')
        //     ->weeklyOn(0, '17:45') // Sunday at 5:45 PM
        //     ->timezone('America/New_York');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
