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
            background: #ffffff;
            color: #1f2937;
            padding: 30px;
            text-align: center;
            position: relative;
            border-bottom: 3px solid #EE7820;
        }
        .logo {
            width: 48px;
            height: auto;
            margin-bottom: 15px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
        }
        .header p {
            margin: 8px 0 0 0;
            color: #6b7280;
            font-size: 16px;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1f2937;
        }
        .invoice-details {
            background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
            border: 1px solid #EE7820;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        .invoice-details h3 {
            margin: 0 0 15px 0;
            color: #c2410c;
            font-size: 18px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #fed7aa;
        }
        .detail-row:last-child {
            border-bottom: none;
            font-weight: 600;
            font-size: 18px;
            color: #c2410c;
        }
        .detail-label {
            font-weight: 600;
            color: #374151;
        }
        .detail-value {
            color: #1f2937;
        }
        /* Improved Stripe-branded payment button */
        .payment-button {
            display: inline-block;
            background: linear-gradient(135deg, #635bff 0%, #4f46e5 100%);
            color: #000 !important; /* Force black text */
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 6px;
            margin: 25px 0;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 14px 0 rgba(99, 91, 255, 0.39);
            transition: all 0.3s ease;
            text-align: center;
            display: block;
            max-width: 200px;
            margin: 25px auto;
            border: none;
            font-family: inherit;
        }
        .payment-button:hover {
            background: linear-gradient(135deg, #5a52ff 0%, #4338ca 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 20px 0 rgba(99, 91, 255, 0.5);
            color: #000 !important; /* Ensure black text on hover */
        }
        .stripe-logo {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
            color: #000 !important; /* Force black for logo and text */
        }
        .stripe-wordmark {
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.5px;
            color: #000 !important; /* Force black text */
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
        .items-table td {
            color: #1f2937; /* Dark text for table content */
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
            color: #EE7820;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .stripe-secure {
            background: #f8faff;
            border: 1px solid #e6f0ff;
            border-radius: 6px;
            padding: 12px;
            font-size: 12px;
            color: #374151; /* Darker text for better readability */
            margin-top: 15px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
        }
        .stripe-secure-icon {
            width: 16px;
            height: 16px;
            color: #374151; /* Darker icon color */
        }
        .section-title {
            color: #1f2937;
            font-size: 18px;
            font-weight: 600;
            margin: 25px 0 15px 0;
        }
        .main-text {
            color: #374151;
            margin-bottom: 20px;
        }
        .payment-info {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .payment-info h4 {
            margin: 0 0 10px 0;
            color: #92400e;
        }
        .payment-info ul {
            margin: 0;
            padding-left: 20px;
            color: #92400e;
        }
        .closing-text {
            color: #374151;
            margin-top: 25px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{ $message->embed(public_path('assets/v-logo.png')) }}" alt="Virtopus Agency" class="logo">
            <h1>📧 New Invoice</h1>
            <p>Your invoice is ready for payment</p>
        </div>
        
        <div class="content">
            <p class="greeting">Hello {{ $invoice->client->name }},</p>
            
            <p class="main-text">We hope this email finds you well! We've generated your invoice for the recent work completed during the billing period. Please find the details below:</p>
            
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
            <h3 class="section-title">📊 Work Summary</h3>
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
                <a href="{{ $stripePaymentUrl }}" class="payment-button" target="_blank" rel="noopener noreferrer">
                    <div class="stripe-logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" fill="currentColor"/>
                        </svg>
                        <span class="stripe-wordmark">Pay now</span>
                    </div>
                </a>
                <div class="stripe-secure">
                    <svg class="stripe-secure-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 7V5a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1zm2 0h4V5a2 2 0 1 0-4 0v2z" fill="currentColor"/>
                    </svg>
                    <span>Secure payment powered by Stripe</span>
                </div>
            </div>
            
            <div class="payment-info">
                <h4>💡 Payment Information</h4>
                <ul>
                    <li>Payment is due within 30 days of invoice date</li>
                    <li>Click the "Pay now" button above to pay securely via Stripe</li>
                    <li>We accept all major credit cards and bank transfers</li>
                    <li>All payments are processed through bank-level encryption</li>
                    <li>If you have any questions, please contact our support team</li>
                </ul>
            </div>
            
            <p class="closing-text">Thank you for choosing {{ $companyName }}! We appreciate your business and look forward to continuing our partnership.</p>
        </div>
        
        <div class="footer">
            <p>
                Need help? Contact us at <a href="mailto:{{ $supportEmail }}">{{ $supportEmail }}</a>
            </p>
            <p style="margin: 15px 0;">
                <a href="{{ $companyUrl }}">{{ $companyName }}</a> | 
                <a href="{{ $stripePaymentUrl }}" target="_blank" rel="noopener noreferrer">View Invoice Online</a>
            </p>
            <p>© {{ date('Y') }} {{ $companyName }}. All rights reserved.</p>
            <p style="font-size: 12px; margin-top: 15px;">
                This email was sent to {{ $invoice->client->email }}. This is an automated message, please do not reply.
            </p>
        </div>
    </div>
</body>
</html>