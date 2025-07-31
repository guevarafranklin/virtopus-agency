<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Stripe\Stripe;
use Stripe\Customer;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'stripe_customer_id', // Add this
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the works for the user.
     */
    public function works()
    {
        return $this->hasMany(Work::class);
    }

    /**
     * Get the contracts for the user.
     */
    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    /**
     * Get the tasks for the user.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get or create Stripe customer
     */
    public function getStripeCustomer()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        
        if ($this->stripe_customer_id) {
            try {
                return Customer::retrieve($this->stripe_customer_id);
            } catch (\Exception $e) {
                // Customer might have been deleted, create a new one
            }
        }

        // Create new Stripe customer
        $customer = Customer::create([
            'email' => $this->email,
            'name' => $this->name,
            'metadata' => [
                'user_id' => $this->id,
                'role' => $this->role,
            ],
        ]);

        $this->update(['stripe_customer_id' => $customer->id]);

        return $customer;
    }
}
