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
        Schema::table('works', function (Blueprint $table) {
            // First drop the existing status column
            $table->dropColumn('status');
        });

        Schema::table('works', function (Blueprint $table) {
            $table->enum('contract_type', ['hourly', 'monthly'])->after('description');
            $table->decimal('rate', 10, 2)->after('contract_type');
            $table->date('job_start_date')->after('rate');
            $table->enum('status', ['active', 'paused', 'terminate'])->after('skills')->default('active');
            $table->integer('weekly_time_limit')->after('status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('works', function (Blueprint $table) {
            $table->dropColumn([
                'contract_type',
                'rate',
                'job_start_date',
                'status',
                'weekly_time_limit'
            ]);
        });

        Schema::table('works', function (Blueprint $table) {
            // Restore the original status column
            $table->string('status')->nullable();
        });
    }
};
