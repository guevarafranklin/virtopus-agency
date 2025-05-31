<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, let's check and update existing data to match our enum values
        DB::statement("UPDATE works SET duration = 'short-term' WHERE duration IS NULL OR duration = '' OR duration NOT IN ('short-term', 'long-term', 'indefinite')");
        
        // Convert any existing string durations to our enum values
        DB::statement("UPDATE works SET duration = CASE 
            WHEN duration LIKE '%month%' AND (duration LIKE '%1%' OR duration LIKE '%2%' OR duration LIKE '%3%') THEN 'short-term'
            WHEN duration LIKE '%month%' AND (duration LIKE '%6%' OR duration LIKE '%12%' OR duration LIKE '%year%') THEN 'long-term'
            WHEN duration LIKE '%indefinite%' OR duration LIKE '%ongoing%' OR duration LIKE '%permanent%' THEN 'indefinite'
            WHEN duration = 'short-term' THEN 'short-term'
            WHEN duration = 'long-term' THEN 'long-term'
            WHEN duration = 'indefinite' THEN 'indefinite'
            ELSE 'short-term'
        END");

        // Now we can safely change the column type
        Schema::table('works', function (Blueprint $table) {
            $table->enum('duration', ['short-term', 'long-term', 'indefinite'])->default('short-term')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('works', function (Blueprint $table) {
            // Revert back to string
            $table->string('duration')->nullable()->change();
        });
    }
};
