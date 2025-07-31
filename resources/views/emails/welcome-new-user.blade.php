{{-- filepath: resources/views/emails/welcome-new-user.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{ $companyName }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #EE7820;
            color: white;
            padding: 30px 20px;
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
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1f2937;
        }
        .credentials-box {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            position: relative;
        }
        .credentials-box::before {
            content: "🔐";
            position: absolute;
            top: -10px;
            left: 20px;
            background: #ffffff;
            padding: 0 8px;
            font-size: 16px;
        }
        .credentials-box h3 {
            margin: 0 0 15px 0;
            color: #1e40af;
            font-size: 16px;
        }
        .credential-item {
            margin: 12px 0;
            display: flex;
            align-items: center;
        }
        .credential-label {
            font-weight: 600;
            color: #374151;
            min-width: 140px;
        }
        .credential-value {
            background-color: #ffffff;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #1e40af;
            border: 1px solid #3b82f6;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            margin: 25px 0;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(37, 99, 235, 0.25);
            transition: all 0.3s ease;
        }
        .button:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 8px rgba(37, 99, 235, 0.3);
        }
        .warning {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            position: relative;
        }
        .warning::before {
            content: "⚠️";
            position: absolute;
            top: -10px;
            left: 20px;
            background: #ffffff;
            padding: 0 8px;
            font-size: 16px;
        }
        .warning-title {
            font-weight: 600;
            color: #92400e;
            margin: 0 0 8px 0;
        }
        .warning p {
            margin: 0;
            color: #b45309;
        }
        .next-steps {
            margin: 30px 0;
        }
        .next-steps h3 {
            color: #1f2937;
            margin-bottom: 15px;
        }
        .steps-list {
            list-style: none;
            padding: 0;
        }
        .steps-list li {
            background: #f3f4f6;
            margin: 8px 0;
            padding: 12px 15px;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
            position: relative;
        }
        .steps-list li::before {
            content: "✓";
            color: #059669;
            font-weight: bold;
            margin-right: 8px;
        }
        .role-badge {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .footer {
            background: #f8f9fa;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .footer-links {
            margin: 15px 0;
        }
        .footer-links a {
            color: #3b82f6;
            text-decoration: none;
            margin: 0 10px;
        }
        .social-links {
            margin: 15px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 5px;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="{{ $message->embed(public_path('assets/v-logo.png')) }}" alt="Virtopus Agency" style="max-width: 180px; height: auto; margin-bottom: 15px; filter: brightness(0) invert(1);">
            <h1>Welcome to {{ $companyName }}!</h1>
            <p>Your journey starts here</p>
        </div>
        
        <div class="content">
            <div class="greeting">Hello {{ $user->name }},</div>
            
            <p>We're thrilled to welcome you to Virtopus Agency! Your account has been successfully created and you're now part of our growing community of talented professionals.</p>
            
            <div class="credentials-box">
                <h3>Your Login Credentials</h3>
                <div class="credential-item">
                    <span class="credential-label">Email:</span>
                    <span class="credential-value">{{ $user->email }}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Temporary Password:</span>
                    <span class="credential-value">{{ $temporaryPassword }}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Role:</span>
                    <span class="role-badge">{{ ucfirst($user->role) }}</span>
                </div>
            </div>
            
            <div class="warning">
                <div class="warning-title">Important Security Notice</div>
                <p>This is a temporary password generated by our system. For your security, please log in and change your password immediately after your first login.</p>
            </div>
            
            <div style="text-align: center;">
                <a href="{{ $loginUrl }}" class="button">Access Your Account</a>
            </div>
            
            <div class="next-steps">
                <h3>🚀 What's Next?</h3>
                <ul class="steps-list">
                    <li>Log in to your account using the credentials above</li>
                    <li>Change your password in the account settings</li>
                    <li>Complete your profile information</li>
                    @if($user->role === 'client')
                    <li>Post your first project and find talented freelancers</li>
                    <li>Explore our freelancer marketplace</li>
                    <li>Set up your payment preferences</li>
                    @elseif($user->role === 'freelancer')
                    <li>Complete your freelancer profile and showcase your skills</li>
                    <li>Browse available projects that match your expertise</li>
                    <li>Build your portfolio and set your rates</li>
                    @elseif($user->role === 'admin')
                    <li>Access the comprehensive admin dashboard</li>
                    <li>Manage users, contracts, and platform settings</li>
                    <li>Monitor platform activity and analytics</li>
                    @endif
                </ul>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937;">💡 Need Help Getting Started?</h3>
                <p style="margin: 0; color: #4b5563;">Our support team is here to help! If you have any questions or need assistance navigating the platform, don't hesitate to reach out to us at <a href="mailto:{{ $supportEmail }}" style="color: #3b82f6;">{{ $supportEmail }}</a>.</p>
            </div>
            
            <p style="margin: 30px 0 0 0; color: #4b5563;">
                Best regards,<br>
                <strong>The {{ $companyName }} Team</strong>
            </p>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="{{ $companyUrl }}">Visit Website</a>
                <a href="{{ $companyUrl }}/support">Support Center</a>
                <a href="{{ $companyUrl }}/privacy">Privacy Policy</a>
            </div>
            <p>This email was sent to {{ $user->email }}. If you didn't expect this email, please contact our support team immediately.</p>
            <p>© {{ date('Y') }} {{ $companyName }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>