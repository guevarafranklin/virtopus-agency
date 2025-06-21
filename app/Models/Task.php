<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start_time',
        'end_time',
        'duration',
        'status',
        'user_id',
        'contract_id',
        'is_billable',
        'billable_hours',
    ];

    protected $casts = [
        'is_billable' => 'boolean',
        'billable_hours' => 'decimal:2',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    // Accessor to calculate the duration
    public function getDurationAttribute()
    {
        if ($this->start_time && $this->end_time) {
            $start = Carbon::parse($this->start_time);
            $end = Carbon::parse($this->end_time);
            return $end->diffForHumans($start, true); // Returns a human-readable duration
        }
        return null;
    }

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Calculate billable hours from start and end time
    public function calculateBillableHours()
    {
        if ($this->start_time && $this->end_time) {
            $start = Carbon::parse($this->start_time);
            $end = Carbon::parse($this->end_time);
            return $end->diffInHours($start, true); // true for precise decimal hours
        }
        return 0;
    }

    // Get weekly hours for a specific contract and week
    public static function getWeeklyHoursForContract($contractId, $weekStart = null)
    {
        $weekStart = $weekStart ?: Carbon::now()->startOfWeek();
        $weekEnd = $weekStart->copy()->endOfWeek();

        return self::where('contract_id', $contractId)
            ->where('is_billable', true)
            ->whereBetween('start_time', [$weekStart, $weekEnd])
            ->sum('billable_hours');
    }
}
