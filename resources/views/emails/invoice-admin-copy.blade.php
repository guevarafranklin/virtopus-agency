<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[ADMIN COPY] Invoice {{ $invoice->invoice_number }}</title>
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
        .admin-header {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: white;
            padding: 20px;
            text-align: center;
            font-weight: 600;
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
        .admin-info {
            background: #fef2f2;
            border: 1px solid #dc2626;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .admin-info h3 {
            margin: 0 0 15px 0;
            color: #dc2626;
            font-size: 18px;
        }
        .admin-info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 4px 0;
        }
        .admin-info-label {
            font-weight: 600;
            color: #7f1d1d;
        }
        .admin-info-value {
            color: #991b1b;
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
            color: #1f2937;
        }
        .admin-actions {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .admin-actions h4 {
            margin: 0 0 15px 0;
            color: #0c4a6e;
        }
        .admin-actions a {
            display: inline-block;
            background: #0ea5e9;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 6px;
            margin: 5px 10px 5px 0;
            font-weight: 600;
        }
        .admin-actions a:hover {
            background: #0284c7;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="admin-header">
            🔒 ADMIN COPY - Internal Use Only
        </div>
        
        <div class="header">
            <img src="{{ $message->embed(public_path('assets/v-logo.png')) }}" alt="Virtopus Agency" class="logo">
            <h1>📄 Invoice Copy</h1>
            <p>Administrative copy of client invoice</p>
        </div>
        
        <div class="content">
            <div class="admin-info">
                <h3>🎯 Administrative Information</h3>
                <div class="admin-info-row">
                    <span class="admin-info-label">Client:</span>
                    <span class="admin-info-value">{{ $invoice->client->name }} ({{ $invoice->client->email }})</span>
                </div>
                <div class="admin-info-row">
                    <span class="admin-info-label">Invoice Sent At:</span>
                    <span class="admin-info-value">{{ $invoice->sent_at ? $invoice->sent_at->format('M j, Y g:i A') : 'Not sent' }}</span>
                </div>
                <div class="admin-info-row">
                    <span class="admin-info-label">Stripe Invoice ID:</span>
                    <span class="admin-info-value">{{ $invoice->stripe_invoice_id ?: 'Not created' }}</span>
                </div>
                <div class="admin-info-row">
                    <span class="admin-info-label">Payment Status:</span>
                    <span class="admin-info-value">{{ strtoupper($invoice->status) }}</span>
                </div>
                <div class="admin-info-row">
                    <span class="admin-info-label">Items Count:</span>
                    <span class="admin-info-value">{{ $invoice->invoiceItems->count() }} line items</span>
                </div>
            </div>
            
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
            <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 25px 0 15px 0;">📊 Work Summary</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Freelancer</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($invoice->invoiceItems as $item)
                    <tr>
                        <td>{{ $item->freelancer->name ?? 'N/A' }}</td>
                        <td>{{ $item->description }}</td>
                        <td>{{ $item->quantity == 1 ? '1 item' : number_format($item->quantity, 2) . ' hours' }}</td>
                        <td>${{ number_format($item->rate, 2) }}</td>
                        <td>${{ number_format($item->amount, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @endif
            
            <div class="admin-actions">
                <h4>🔧 Admin Actions</h4>
                <a href="{{ route('admin.invoice.show', $invoice->id) }}" target="_blank">View Full Invoice</a>
                @if($stripePaymentUrl)
                <a href="{{ $stripePaymentUrl }}" target="_blank">View Stripe Invoice</a>
                @endif
                <a href="{{ route('admin.invoice.index') }}" target="_blank">Manage Invoices</a>
            </div>
            
            <p style="color: #374151; margin-top: 25px;">
                This is an administrative copy sent to accounting/admin for record keeping. 
                The client has received their own copy with payment instructions.
            </p>
        </div>
        
        <div class="footer">
            <p>
                <strong>Internal Admin Copy</strong> - {{ config('app.name') }}
            </p>
            <p style="margin: 15px 0;">
                Generated on {{ now()->format('M j, Y g:i A') }}
            </p>
            <p>© {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>