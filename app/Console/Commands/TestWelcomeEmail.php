<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestWelcomeEmail extends Command
{
    protected $signature = 'email:test-welcome {email} {--name=Test User} {--role=client}';
    protected $description = 'Send a test welcome email to verify email configuration';

    public function handle()
    {
        $email = $this->argument('email');
        
        try {
            Mail::raw('This is a test email from Virtopus Agency', function ($message) use ($email) {
                $message->to($email)
                        ->subject('Test Email from Virtopus Agency');
            });
            
            $this->info("✅ Test email sent successfully to {$email}");
        } catch (\Exception $e) {
            $this->error("❌ Failed to send email: " . $e->getMessage());
            $this->line("Stack trace: " . $e->getTraceAsString());
        }
    }
}
