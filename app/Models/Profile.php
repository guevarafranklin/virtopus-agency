<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    /** @use HasFactory<\Database\Factories\ProfileFactory> */
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'title',
        'bio',
        'skills',
        'avatar',
        'verified',
    ];
   protected function casts(): array
    {
        return [
            'verified' => 'boolean',
        ];
    }
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
