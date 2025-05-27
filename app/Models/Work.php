<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Work extends Model
{
    /** @use HasFactory<\Database\Factories\WorkFactory> */
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'contract_type',
        'rate',
        'job_start_date',
        'duration',
        'skills',
        'status',
        'weekly_time_limit',
    ];

    protected $casts = [
        'skills' => 'array',
        'job_start_date' => 'datetime',
        'rate' => 'decimal:2',
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
}
