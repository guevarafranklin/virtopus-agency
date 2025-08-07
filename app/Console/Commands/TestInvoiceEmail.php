<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Invoice;
use App\Mail\InvoiceSentNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TestInvoiceEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test-invoice {invoice_id} {email?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test sending an invoice email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $invoiceId = $this->argument('invoice_id');
        $email = $this->argument('email') ?: 'test@example.com';
        
        $invoice = Invoice::with(['client', 'invoiceItems'])->find($invoiceId);
        
        if (!$invoice) {
            $this->error("Invoice with ID {$invoiceId} not found");
            return Command::FAILURE;
        }

        $testPaymentUrl = "https://invoice.stripe.com/i/test-payment-link";
        
        try {
            $this->info("Testing email configuration...");
            $this->info("Invoice: {$invoice->invoice_number}");
            $this->info("Client: {$invoice->client->name}");
            $this->info("Email: {$email}");
            $this->info("Payment URL: {$testPaymentUrl}");
            
            Mail::to($email)->send(new InvoiceSentNotification($invoice, $testPaymentUrl));
            
            $this->info("✅ Test invoice email sent successfully to {$email}");
            
            // Check if BCC is configured
            $bccEmails = config('mail.invoice_bcc.addresses', []);
            if (!empty($bccEmails)) {
                $this->info("📧 BCC emails configured: " . implode(', ', $bccEmails));
            } else {
                $this->warn("⚠️ No BCC emails configured");
            }
            
        } catch (\Exception $e) {
            $this->error("❌ Failed to send email: " . $e->getMessage());
            $this->error("Error details: " . $e->getTraceAsString());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
