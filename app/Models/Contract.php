<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'work_id',
        'user_id',
        'agency_rate',
    ];

    protected $casts = [
        'agency_rate' => 'decimal:2',
    ];

    /**
     * Get the work that owns the contract.
     */
    public function work()
    {
        return $this->belongsTo(Work::class);
    }

    /**
     * Get the user that owns the contract.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the tasks for the contract.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
