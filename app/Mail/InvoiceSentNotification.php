<?php

namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class InvoiceSentNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Invoice $invoice,
        public string $stripePaymentUrl
    ) {
        // Load relationships to avoid lazy loading issues in email templates
        $this->invoice->load(['client', 'invoiceItems']);
        
        Log::info("InvoiceSentNotification created", [
            'invoice_number' => $this->invoice->invoice_number,
            'client_email' => $this->invoice->client->email,
            'payment_url' => $this->stripePaymentUrl
        ]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $bccAddresses = [];
        
        // Add BCC addresses if configured
        $bccEmails = config('mail.invoice_bcc.addresses', []);
        if (!empty($bccEmails)) {
            $bccAddresses = collect($bccEmails)
                ->filter()
                ->map(fn($email) => new Address(trim($email)))
                ->toArray();
        }

        return new Envelope(
            subject: "Invoice {$this->invoice->invoice_number} - Payment Required",
            from: config('mail.from.address', 'no-reply@virtopusagency.com'),
            bcc: $bccAddresses,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice-sent',
            text: 'emails.invoice-sent-text',
            with: [
                'invoice' => $this->invoice,
                'stripePaymentUrl' => $this->stripePaymentUrl,
                'companyName' => config('app.name', 'Virtopus Agency'),
                'supportEmail' => config('mail.from.address'),
                'companyUrl' => config('app.url'),
            ]
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
