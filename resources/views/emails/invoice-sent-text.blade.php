
Invoice {{ $invoice->invoice_number }} - Payment Required

========================================
VIRTOPUS AGENCY
========================================

Hello {{ $invoice->client->name }},

We hope this email finds you well! We've generated your invoice for the recent work completed during the billing period.

=== INVOICE DETAILS ===
Invoice Number: {{ $invoice->invoice_number }}
Billing Period: {{ $invoice->billing_period_start->format('M j, Y') }} - {{ $invoice->billing_period_end->format('M j, Y') }}
Due Date: {{ $invoice->due_date->format('M j, Y') }}
Total Amount: ${{ number_format($invoice->total, 2) }}

=== WORK SUMMARY ===
@foreach($invoice->invoiceItems as $item)
- {{ $item->description }}
  Quantity: {{ $item->quantity == 1 ? '1 item' : number_format($item->quantity, 2) . ' hours' }}
  Rate: ${{ number_format($item->rate, 2) }}
  Amount: ${{ number_format($item->amount, 2) }}

@endforeach

💳 PAY NOW WITH STRIPE
{{ $stripePaymentUrl }}

🔒 SECURE PAYMENT INFORMATION
- Payment is due within 30 days of invoice date
- Click the link above to pay securely via Stripe
- We accept all major credit cards and bank transfers  
- All payments are processed through bank-level encryption
- If you have any questions, please contact our support team

Thank you for choosing {{ $companyName }}! We appreciate your business and look forward to continuing our partnership.

---
Need help? Contact us at {{ $supportEmail }}

{{ $companyName }} | {{ $companyUrl }}
© {{ date('Y') }} {{ $companyName }}. All rights reserved.

This email was sent to {{ $invoice->client->email }}.
View invoice online: {{ $stripePaymentUrl }}