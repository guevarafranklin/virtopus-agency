<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\User;
use App\Services\BillingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    protected $billingService;

    public function __construct(BillingService $billingService)
    {
        $this->billingService = $billingService;
    }

    /**
     * Display a listing of invoices.
     */
    public function index(Request $request)
    {
        $query = Invoice::with(['client', 'invoiceItems'])
            ->orderBy('created_at', 'desc');

        // Filter by client
        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('billing_period_start', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('billing_period_end', '<=', $request->date_to);
        }

        $invoices = $query->paginate(15)->withQueryString();

        // Get clients for filter dropdown
        $clients = User::where('role', 'client')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/invoice/Index', [
            'invoices' => $invoices,
            'clients' => $clients,
            'filters' => [
                'client_id' => $request->client_id,
                'status' => $request->status,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
        ]);
    }

    /**
     * Show invoice details.
     */
    public function show(Invoice $invoice)
    {
        $invoice->load(['client', 'invoiceItems.contract.work', 'invoiceItems.freelancer']);

        return Inertia::render('admin/invoice/Show', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * Generate invoices for current billing period.
     */
    public function generate(Request $request)
    {
        try {
            $results = $this->billingService->generateWeeklyInvoices();

            return back()->with('success', 'Generated ' . collect($results)->where('status', 'success')->count() . ' invoices successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to generate invoices: ' . $e->getMessage()]);
        }
    }

    /**
     * Send all pending invoices.
     */
    public function sendPending()
    {
        try {
            $results = $this->billingService->sendAllPendingInvoicesWithNotifications();

            return back()->with('success', 'Sent ' . collect($results)->where('status', 'sent')->count() . ' invoices successfully with email notifications.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to send invoices: ' . $e->getMessage()]);
        }
    }

    /**
     * Send specific invoice.
     */
    public function send(Invoice $invoice)
    {
        if ($invoice->status !== 'draft') {
            return back()->withErrors(['error' => 'Invoice has already been sent.']);
        }

        try {
            $success = $this->billingService->sendInvoiceWithNotification($invoice);

            if ($success) {
                return back()->with('success', "Invoice {$invoice->invoice_number} sent successfully to {$invoice->client->email} via Stripe with email notification.");
            } else {
                return back()->withErrors(['error' => 'Failed to send invoice via Stripe.']);
            }
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to send invoice: ' . $e->getMessage()]);
        }
    }

    /**
     * Get current billing period info.
     */
    public function billingPeriod()
    {
        $current = $this->billingService->getCurrentBillingPeriod();
        $previous = $this->billingService->getPreviousBillingPeriod();

        return response()->json([
            'current' => [
                'start' => $current['start']->format('Y-m-d H:i:s'),
                'end' => $current['end']->format('Y-m-d H:i:s'),
                'label' => $current['start']->format('M j') . ' - ' . $current['end']->format('M j, Y'),
            ],
            'previous' => [
                'start' => $previous['start']->format('Y-m-d H:i:s'),
                'end' => $previous['end']->format('Y-m-d H:i:s'),
                'label' => $previous['start']->format('M j') . ' - ' . $previous['end']->format('M j, Y'),
            ]
        ]);
    }
}
