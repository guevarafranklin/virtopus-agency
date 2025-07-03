<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Work extends Model
{
    /** @use HasFactory<\Database\Factories\WorkFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'contract_type',
        'rate',
        'job_start_date',
        'duration',
        'skills',
        'status',
        'weekly_time_limit',
        'user_id',
    ];

    protected $casts = [
        'job_start_date' => 'date',
        'skills' => 'array',
    ];

    /**
     * Get the user that owns the work.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the contracts for the work.
     */
    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    // Helper method to check if work has an assigned freelancer
    public function hasAssignedFreelancer()
    {
        return $this->contracts()->exists();
    }

    // Helper method to get the assigned freelancer
    public function getAssignedFreelancer()
    {
        return $this->contracts()->with('user')->first()?->user;
    }
}
