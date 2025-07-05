<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Check if duration column exists and modify it
            if (Schema::hasColumn('tasks', 'duration')) {
                $table->integer('duration')->nullable()->change();
            } else {
                $table->integer('duration')->nullable()->after('end_time');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'duration')) {
                $table->dropColumn('duration');
            }
        });
    }
};
