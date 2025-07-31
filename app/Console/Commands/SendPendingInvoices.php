<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BillingService;

class SendPendingInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:send-pending';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send all pending invoices via Stripe with email notifications';

    /**
     * Execute the console command.
     */
    public function handle(BillingService $billingService)
    {
        $this->info('Sending pending invoices via Stripe with email notifications...');

        $results = $billingService->sendAllPendingInvoicesWithNotifications();

        $this->info('Invoice sending completed:');
        
        foreach ($results as $result) {
            if ($result['status'] === 'sent') {
                $this->line("✅ {$result['invoice']} to {$result['client']}: $" . number_format($result['amount'], 2));
            } else {
                $this->error("❌ {$result['invoice']} to {$result['client']}: Failed to send");
            }
        }

        $sentCount = collect($results)->where('status', 'sent')->count();
        $this->info("Sent {$sentCount} invoices successfully with email notifications.");

        return Command::SUCCESS;
    }
}
