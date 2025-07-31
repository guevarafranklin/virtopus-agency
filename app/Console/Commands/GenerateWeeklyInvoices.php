<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BillingService;

class GenerateWeeklyInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:generate-weekly';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate weekly invoices for all clients';

    /**
     * Execute the console command.
     */
    public function handle(BillingService $billingService)
    {
        $this->info('Starting weekly invoice generation...');

        $results = $billingService->generateWeeklyInvoices();

        $this->info('Invoice generation completed:');
        
        foreach ($results as $result) {
            if ($result['status'] === 'success') {
                $this->line("✅ {$result['client']}: {$result['invoice']} - $" . number_format($result['amount'], 2));
            } else {
                $this->error("❌ {$result['client']}: {$result['error']}");
            }
        }

        $successCount = collect($results)->where('status', 'success')->count();
        $this->info("Generated {$successCount} invoices successfully.");

        return Command::SUCCESS;
    }
}
