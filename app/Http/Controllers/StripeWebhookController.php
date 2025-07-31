<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;
use Carbon\Carbon;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook.secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (SignatureVerificationException $e) {
            Log::error('Stripe webhook signature verification failed: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event['type']) {
            case 'invoice.payment_succeeded':
                $this->handleInvoicePaymentSucceeded($event['data']['object']);
                break;
                
            case 'invoice.payment_failed':
                $this->handleInvoicePaymentFailed($event['data']['object']);
                break;
                
            case 'invoice.sent':
                $this->handleInvoiceSent($event['data']['object']);
                break;
                
            case 'invoice.finalized':
                $this->handleInvoiceFinalized($event['data']['object']);
                break;
                
            default:
                Log::info('Unhandled Stripe webhook event type: ' . $event['type']);
        }

        return response()->json(['received' => true]);
    }

    private function handleInvoicePaymentSucceeded($stripeInvoice)
    {
        $invoice = Invoice::where('stripe_invoice_id', $stripeInvoice['id'])->first();
        
        if ($invoice) {
            $invoice->update([
                'status' => 'paid',
                'paid_at' => Carbon::now(),
            ]);
            
            Log::info("Invoice {$invoice->invoice_number} marked as paid");
        }
    }

    private function handleInvoicePaymentFailed($stripeInvoice)
    {
        $invoice = Invoice::where('stripe_invoice_id', $stripeInvoice['id'])->first();
        
        if ($invoice) {
            $invoice->update(['status' => 'overdue']);
            Log::info("Invoice {$invoice->invoice_number} marked as overdue");
        }
    }

    private function handleInvoiceSent($stripeInvoice)
    {
        $invoice = Invoice::where('stripe_invoice_id', $stripeInvoice['id'])->first();
        
        if ($invoice && $invoice->status === 'draft') {
            $invoice->update([
                'status' => 'sent',
                'sent_at' => Carbon::now(),
            ]);
        }
    }

    private function handleInvoiceFinalized($stripeInvoice)
    {
        $invoice = Invoice::where('stripe_invoice_id', $stripeInvoice['id'])->first();
        
        if ($invoice) {
            Log::info("Stripe invoice {$stripeInvoice['id']} finalized for internal invoice {$invoice->invoice_number}");
        }
    }
}
