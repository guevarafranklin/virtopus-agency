<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 8px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 30px;
        }
        .invoice-details {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        .invoice-details h3 {
            margin: 0 0 15px 0;
            color: #1e40af;
            font-size: 18px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e0e7ff;
        }
        .detail-row:last-child {
            border-bottom: none;
            font-weight: 600;
            font-size: 18px;
            color: #1e40af;
        }
        .detail-label {
            font-weight: 600;
            color: #374151;
        }
        .detail-value {
            color: #1f2937;
        }
        .payment-button {
            display: inline-block;
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            margin: 25px 0;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(5, 150, 105, 0.25);
            transition: all 0.3s ease;
            text-align: center;
            display: block;
            max-width: 250px;
            margin: 25px auto;
        }
        .payment-button:hover {
            background: linear-gradient(135deg, #047857 0%, #059669 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 8px rgba(5, 150, 105, 0.3);
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .items-table th {
            background-color: #f3f4f6;
            font-weight: 600;
            color: #374151;
        }
        .items-table tr:hover {
            background-color: #f9fafb;
        }
        .footer {
            background: #f8f9fa;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 New Invoice</h1>
            <p>Your invoice is ready for payment</p>
        </div>
        
        <div class="content">
            <p class="greeting">Hello {{ $invoice->client->name }},</p>
            
            <p>We hope this email finds you well! We've generated your invoice for the recent work completed during the billing period. Please find the details below:</p>
            
            <div class="invoice-details">
                <h3>📋 Invoice Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Invoice Number:</span>
                    <span class="detail-value">{{ $invoice->invoice_number }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Billing Period:</span>
                    <span class="detail-value">{{ $invoice->billing_period_start->format('M j, Y') }} - {{ $invoice->billing_period_end->format('M j, Y') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Due Date:</span>
                    <span class="detail-value">{{ $invoice->due_date->format('M j, Y') }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value">${{ number_format($invoice->total, 2) }}</span>
                </div>
            </div>

            @if($invoice->invoiceItems->count() > 0)
            <h3>📊 Work Summary</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($invoice->invoiceItems as $item)
                    <tr>
                        <td>{{ $item->description }}</td>
                        <td>{{ $item->quantity == 1 ? '1 item' : number_format($item->quantity, 2) . ' hours' }}</td>
                        <td>${{ number_format($item->rate, 2) }}</td>
                        <td>${{ number_format($item->amount, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @endif
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ $stripePaymentUrl }}" class="payment-button">
                    💳 Pay Invoice Online
                </a>
                <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
                    Secure payment powered by Stripe
                </p>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">💡 Payment Information</h4>
                <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                    <li>Payment is due within 30 days of invoice date</li>
                    <li>You can pay securely online using the button above</li>
                    <li>We accept all major credit cards and bank transfers</li>
                    <li>If you have any questions, please contact our support team</li>
                </ul>
            </div>
            
            <p>Thank you for choosing {{ $companyName }}! We appreciate your business and look forward to continuing our partnership.</p>
        </div>
        
        <div class="footer">
            <p>
                Need help? Contact us at <a href="mailto:{{ $supportEmail }}">{{ $supportEmail }}</a>
            </p>
            <p style="margin: 15px 0;">
                <a href="{{ $companyUrl }}">{{ $companyName }}</a> | 
                <a href="{{ $stripePaymentUrl }}">View Invoice Online</a>
            </p>
            <p>© {{ date('Y') }} {{ $companyName }}. All rights reserved.</p>
            <p style="font-size: 12px; margin-top: 15px;">
                This email was sent to {{ $invoice->client->email }}. This is an automated message, please do not reply.
            </p>
        </div>
    </div>
</body>
</html>