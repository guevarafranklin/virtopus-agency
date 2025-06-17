<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeNewUser extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $temporaryPassword
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Virtopus Agency - Your Account Details',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome-new-user',
            with: [
                'user' => $this->user,
                'temporaryPassword' => $this->temporaryPassword,
                'loginUrl' => env('APP_TESTING_URL'),
                'companyName' => config('app.name', 'Virtopus Agency'),
                'supportEmail' => config('mail.from.address'),
                'companyUrl' => config('app.url'),
            ]
        );
    }
}
