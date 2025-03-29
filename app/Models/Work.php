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
        'skills',
        'budget',
        'duration',
        'status',
        'user_id',
    ];
    protected function casts(): array
    {
        return [
            'skills' => 'array',
        ];
    }
}
