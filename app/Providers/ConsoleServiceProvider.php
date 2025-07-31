<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Console\Commands\GenerateWeeklyInvoices;
use App\Console\Commands\SendPendingInvoices;

class ConsoleServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                GenerateWeeklyInvoices::class,
                SendPendingInvoices::class,
            ]);
        }
    }
}
