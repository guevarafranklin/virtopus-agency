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
        'duration' => 'integer',
    ];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Simplified and more reliable weekly hours calculation
    public static function getWeeklyHoursForContract($contractId, $weekStart = null)
    {
        if (!$weekStart) {
            $weekStart = Carbon::now()->startOfWeek();
        }
        
        $weekEnd = $weekStart->copy()->endOfWeek();

        return self::where('contract_id', $contractId)
            ->where('is_billable', true)
            ->whereBetween('start_time', [$weekStart, $weekEnd])
            ->sum('billable_hours') ?? 0;
    }
}
