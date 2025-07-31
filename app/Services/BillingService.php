<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Contract;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Stripe\Stripe;
use Stripe\Invoice as StripeInvoice;
use Stripe\InvoiceItem as StripeInvoiceItem;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\InvoiceSentNotification;
use App\Mail\InvoiceAdminCopy;

class BillingService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Get the current billing period (Sunday 5:01 PM to next Sunday 5:00 PM)
     */
    public function getCurrentBillingPeriod(): array
    {
        $now = Carbon::now();
        
        // Find the last Sunday at 5:01 PM
        $start = $now->copy()->previous(Carbon::SUNDAY)->setTime(17, 1, 0);
        
        // If we're before 5:01 PM on Sunday, go back one more week
        if ($now->dayOfWeek === Carbon::SUNDAY && $now->hour < 17) {
            $start->subWeek();
        } elseif ($now->dayOfWeek === Carbon::SUNDAY && $now->hour === 17 && $now->minute === 0) {
            $start->subWeek();
        }
        
        // End is next Sunday at 5:00 PM
        $end = $start->copy()->addWeek()->setTime(17, 0, 0);
        
        return [
            'start' => $start,
            'end' => $end
        ];
    }

    /**
     * Get the previous billing period for invoice generation
     */
    public function getPreviousBillingPeriod(): array
    {
        $current = $this->getCurrentBillingPeriod();
        
        return [
            'start' => $current['start']->copy()->subWeek(),
            'end' => $current['start']->copy()
        ];
    }

    /**
     * Generate invoices for all clients for the previous billing period
     */
    public function generateWeeklyInvoices(): array
    {
        $billingPeriod = $this->getPreviousBillingPeriod();
        $results = [];

        // Get all clients who have active works with billable hours in the period
        $clients = User::where('role', 'client')
            ->whereHas('works.contracts.tasks', function($query) use ($billingPeriod) {
                $query->where('is_billable', true)
                    ->whereBetween('start_time', [$billingPeriod['start'], $billingPeriod['end']]);
            })
            ->with(['works.contracts.tasks', 'works.contracts.user'])
            ->get();

        foreach ($clients as $client) {
            try {
                $invoice = $this->generateClientInvoice($client, $billingPeriod);
                if ($invoice) {
                    $results[] = [
                        'client' => $client->name,
                        'invoice' => $invoice->invoice_number,
                        'amount' => $invoice->total,
                        'status' => 'success'
                    ];
                }
            } catch (\Exception $e) {
                Log::error("Failed to generate invoice for client {$client->id}: " . $e->getMessage());
                $results[] = [
                    'client' => $client->name,
                    'error' => $e->getMessage(),
                    'status' => 'error'
                ];
            }
        }

        return $results;
    }

    /**
     * Generate invoice for a specific client
     */
    public function generateClientInvoice(User $client, array $billingPeriod): ?Invoice
    {
        // Get all billable tasks for this client in the billing period
        $contracts = Contract::with(['work', 'user', 'tasks' => function($query) use ($billingPeriod) {
            $query->where('is_billable', true)
                ->whereBetween('start_time', [$billingPeriod['start'], $billingPeriod['end']]);
        }])
        ->whereHas('work', function($query) use ($client) {
            $query->where('user_id', $client->id);
        })
        ->whereHas('tasks', function($query) use ($billingPeriod) {
            $query->where('is_billable', true)
                ->whereBetween('start_time', [$billingPeriod['start'], $billingPeriod['end']]);
        })
        ->get();

        if ($contracts->isEmpty()) {
            return null; // No billable work for this period
        }

        // Create invoice
        $invoice = Invoice::create([
            'client_id' => $client->id,
            'invoice_number' => Invoice::generateInvoiceNumber(),
            'billing_period_start' => $billingPeriod['start'],
            'billing_period_end' => $billingPeriod['end'],
            'due_date' => Carbon::now()->addDays(30), // 30 days payment terms
            'status' => 'draft',
        ]);

        $subtotal = 0;

        // Create invoice items for each contract
        foreach ($contracts as $contract) {
            $tasks = $contract->tasks;
            $totalHours = $tasks->sum('billable_hours');
            
            if ($totalHours <= 0) continue;

            // Calculate amount based on contract type (matching your existing logic)
            if ($contract->work->contract_type === 'monthly') {
                // Monthly contracts: client pays fixed rate if any hours worked
                $amount = floatval($contract->work->rate);
                $description = "Monthly contract: {$contract->work->title} - {$contract->user->name}";
                $quantity = 1;
                $rate = $amount;
            } else {
                // Hourly contracts: calculate based on hours
                $amount = $totalHours * floatval($contract->work->rate);
                $description = "Hourly work: {$contract->work->title} - {$contract->user->name} ({$totalHours} hours)";
                $quantity = $totalHours;
                $rate = floatval($contract->work->rate);
            }

            // Create invoice item
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'contract_id' => $contract->id,
                'work_id' => $contract->work->id,
                'freelancer_id' => $contract->user->id,
                'description' => $description,
                'quantity' => $quantity,
                'rate' => $rate,
                'amount' => $amount,
                'metadata' => [
                    'task_ids' => $tasks->pluck('id')->toArray(),
                    'contract_type' => $contract->work->contract_type,
                    'billing_period' => [
                        'start' => $billingPeriod['start']->toISOString(),
                        'end' => $billingPeriod['end']->toISOString(),
                    ]
                ]
            ]);

            $subtotal += $amount;
        }

        // Update invoice totals
        $invoice->update([
            'subtotal' => $subtotal,
            'total' => $subtotal, // Add taxes/fees here if needed
        ]);

        return $invoice;
    }

    /**
     * Send invoice via Stripe
     */
    public function sendInvoiceViaStripe(Invoice $invoice): bool
    {
        try {
            Log::info("Starting Stripe invoice send for invoice {$invoice->invoice_number}", [
                'invoice_id' => $invoice->id,
                'client_id' => $invoice->client_id,
                'client_email' => $invoice->client->email,
                'total_amount' => $invoice->total
            ]);

            // Ensure client has Stripe customer
            $stripeCustomer = $invoice->client->getStripeCustomer();
            
            Log::info("Stripe customer retrieved/created", [
                'stripe_customer_id' => $stripeCustomer->id,
                'customer_email' => $stripeCustomer->email
            ]);

            // Create Stripe invoice
            $stripeInvoice = StripeInvoice::create([
                'customer' => $stripeCustomer->id,
                'collection_method' => 'send_invoice',
                'days_until_due' => 30,
                'auto_advance' => false, // Don't auto-finalize
                'metadata' => [
                    'internal_invoice_id' => $invoice->id,
                    'billing_period_start' => $invoice->billing_period_start->toISOString(),
                    'billing_period_end' => $invoice->billing_period_end->toISOString(),
                ],
                'description' => "Weekly billing for period: {$invoice->billing_period_start->format('M j')} - {$invoice->billing_period_end->format('M j, Y')}",
                'footer' => "Thank you for your business! Payment is due within 30 days.",
            ]);

            Log::info("Stripe invoice created", [
                'stripe_invoice_id' => $stripeInvoice->id,
                'status' => $stripeInvoice->status
            ]);

            // Add line items to Stripe invoice
            foreach ($invoice->invoiceItems as $item) {
                $amount = floatval($item->amount);
                $description = $item->description;
                
                // Add details about hours and rate to description if it's hourly
                if ($item->quantity > 1 && $item->rate > 0) {
                    $description .= " ({$item->quantity} hours @ $" . number_format($item->rate, 2) . "/hour)";
                }

                Log::info("Creating invoice item", [
                    'description' => $description,
                    'amount' => $amount,
                    'amount_cents' => round($amount * 100),
                    'original_quantity' => $item->quantity,
                    'original_rate' => $item->rate
                ]);

                $stripeInvoiceItem = StripeInvoiceItem::create([
                    'customer' => $stripeCustomer->id,
                    'invoice' => $stripeInvoice->id,
                    'description' => $description,
                    'amount' => round($amount * 100), // Convert to cents (integer)
                    'currency' => 'usd',
                    'metadata' => [
                        'internal_item_id' => $item->id,
                        'contract_id' => $item->contract_id,
                        'work_id' => $item->work_id,
                        'freelancer_id' => $item->freelancer_id,
                        'original_quantity' => (string) $item->quantity,
                        'original_rate' => (string) $item->rate,
                    ]
                ]);

                Log::info("Stripe invoice item created", [
                    'stripe_item_id' => $stripeInvoiceItem->id,
                    'amount_cents' => round($amount * 100),
                    'amount_dollars' => $amount,
                ]);
            }

            // Refresh the invoice to get updated totals
            $stripeInvoice = StripeInvoice::retrieve($stripeInvoice->id);
            
            Log::info("Invoice before finalization", [
                'subtotal' => $stripeInvoice->subtotal,
                'total' => $stripeInvoice->total,
                'status' => $stripeInvoice->status
            ]);

            // Finalize the invoice
            Log::info("Finalizing Stripe invoice");
            $stripeInvoice = $stripeInvoice->finalizeInvoice();
            
            Log::info("Invoice finalized", [
                'status' => $stripeInvoice->status,
                'total' => $stripeInvoice->total,
                'hosted_invoice_url' => $stripeInvoice->hosted_invoice_url ?? 'Not available',
                'invoice_pdf' => $stripeInvoice->invoice_pdf ?? 'Not available'
            ]);

            // Send the invoice via email
            Log::info("Sending Stripe invoice via email");
            $sentInvoice = $stripeInvoice->sendInvoice();
            
            Log::info("Invoice send response", [
                'status' => $sentInvoice->status,
                'hosted_invoice_url' => $sentInvoice->hosted_invoice_url,
                'invoice_pdf' => $sentInvoice->invoice_pdf,
                'customer_email' => $stripeCustomer->email
            ]);

            // Update our internal invoice
            $invoice->update([
                'stripe_invoice_id' => $stripeInvoice->id,
                'status' => 'sent',
                'sent_at' => Carbon::now(),
                'metadata' => array_merge($invoice->metadata ?? [], [
                    'stripe_hosted_url' => $sentInvoice->hosted_invoice_url,
                    'stripe_pdf_url' => $sentInvoice->invoice_pdf,
                    'stripe_status' => $sentInvoice->status
                ])
            ]);

            Log::info("Invoice successfully sent via Stripe", [
                'invoice_number' => $invoice->invoice_number,
                'stripe_invoice_id' => $stripeInvoice->id,
                'client_email' => $invoice->client->email,
                'payment_url' => $sentInvoice->hosted_invoice_url
            ]);

            return true;

        } catch (\Stripe\Exception\InvalidRequestException $e) {
            Log::error("Stripe Invalid Request Error for invoice {$invoice->id}", [
                'error_message' => $e->getMessage(),
                'error_code' => $e->getStripeCode(),
                'error_type' => $e->getError()->type ?? null,
                'error_param' => $e->getError()->param ?? null,
                'stripe_request_id' => $e->getStripeParam() ?? null,
                'invoice_data' => [
                    'client_email' => $invoice->client->email,
                    'total' => $invoice->total,
                    'items_count' => $invoice->invoiceItems->count()
                ]
            ]);
            return false;
        } catch (\Stripe\Exception\AuthenticationException $e) {
            Log::error("Stripe Authentication Error", [
                'error_message' => $e->getMessage(),
                'stripe_key_configured' => !empty(config('services.stripe.secret'))
            ]);
            return false;
        } catch (\Stripe\Exception\ApiConnectionException $e) {
            Log::error("Stripe API Connection Error", [
                'error_message' => $e->getMessage()
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error("General error sending invoice {$invoice->id} via Stripe", [
                'error_message' => $e->getMessage(),
                'error_class' => get_class($e),
                'stack_trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Send invoice with email notification and admin copy
     */
    public function sendInvoiceWithNotification(Invoice $invoice): bool
    {
        // First send via Stripe
        $stripeSuccess = $this->sendInvoiceViaStripe($invoice);
        
        if (!$stripeSuccess) {
            return false;
        }

        // Get the payment URL from invoice metadata
        $paymentUrl = $invoice->fresh()->metadata['stripe_hosted_url'] ?? null;
        
        if (!$paymentUrl) {
            Log::warning("No payment URL found for invoice {$invoice->invoice_number}");
            return true; // Stripe sending was successful, just no email
        }

        // Send email notification to client
        try {
            Mail::to($invoice->client->email)->send(
                new InvoiceSentNotification($invoice, $paymentUrl)
            );
            
            Log::info("Invoice notification email sent to client", [
                'invoice_number' => $invoice->invoice_number,
                'client_email' => $invoice->client->email,
                'payment_url' => $paymentUrl
            ]);

            // Send admin copy
            $this->sendAdminCopy($invoice, $paymentUrl);

            // Update invoice to mark email sent
            $invoice->update([
                'metadata' => array_merge($invoice->metadata ?? [], [
                    'notification_email_sent' => true,
                    'admin_copy_sent' => true,
                    'notification_sent_at' => Carbon::now()->toISOString()
                ])
            ]);

            return true;
            
        } catch (\Exception $e) {
            Log::error("Failed to send invoice notification email", [
                'invoice_number' => $invoice->invoice_number,
                'client_email' => $invoice->client->email,
                'error' => $e->getMessage()
            ]);
            
            // Still try to send admin copy even if client email failed
            $this->sendAdminCopy($invoice, $paymentUrl);
            
            // Stripe was successful, but email failed - still return true
            return true;
        }
    }

    /**
     * Send admin copy of invoice
     */
    private function sendAdminCopy(Invoice $invoice, string $paymentUrl): void
    {
        $adminEmails = config('mail.invoice_bcc.addresses', []);
        
        if (empty($adminEmails)) {
            Log::info("No admin emails configured for invoice copies");
            return;
        }

        try {
            foreach ($adminEmails as $adminEmail) {
                Mail::to($adminEmail)->send(
                    new InvoiceAdminCopy($invoice, $paymentUrl)
                );
            }
            
            Log::info("Invoice admin copies sent", [
                'invoice_number' => $invoice->invoice_number,
                'admin_emails' => $adminEmails,
                'client' => $invoice->client->name,
                'amount' => $invoice->total
            ]);
            
        } catch (\Exception $e) {
            Log::error("Failed to send invoice admin copy", [
                'invoice_number' => $invoice->invoice_number,
                'admin_emails' => $adminEmails,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send all pending invoices
     */
    public function sendAllPendingInvoices(): array
    {
        $pendingInvoices = Invoice::where('status', 'draft')
            ->whereNull('stripe_invoice_id')
            ->with(['client', 'invoiceItems'])
            ->get();

        $results = [];

        foreach ($pendingInvoices as $invoice) {
            $success = $this->sendInvoiceViaStripe($invoice);
            $results[] = [
                'invoice' => $invoice->invoice_number,
                'client' => $invoice->client->name,
                'amount' => $invoice->total,
                'status' => $success ? 'sent' : 'failed'
            ];
        }

        return $results;
    }

    /**
     * Send all pending invoices with notifications
     */
    public function sendAllPendingInvoicesWithNotifications(): array
    {
        $pendingInvoices = Invoice::where('status', 'draft')
            ->whereNull('stripe_invoice_id')
            ->with(['client', 'invoiceItems'])
            ->get();

        $results = [];

        foreach ($pendingInvoices as $invoice) {
            $success = $this->sendInvoiceWithNotification($invoice);
            $results[] = [
                'invoice' => $invoice->invoice_number,
                'client' => $invoice->client->name,
                'amount' => $invoice->total,
                'status' => $success ? 'sent' : 'failed'
            ];
        }

        return $results;
    }
}
