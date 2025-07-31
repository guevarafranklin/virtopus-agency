<?php
namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceAdminCopy extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Invoice $invoice,
        public string $stripePaymentUrl
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[ADMIN COPY] Invoice {$this->invoice->invoice_number} - {$this->invoice->client->name}",
            from: config('mail.from.address', 'no-reply@virtopusagency.com'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice-admin-copy',
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