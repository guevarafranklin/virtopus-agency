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
        // Ensure contracts table exists before adding foreign key
        if (Schema::hasTable('contracts') && Schema::hasTable('tasks')) {
            Schema::table('tasks', function (Blueprint $table) {
                // Check if columns don't exist before adding them
                if (!Schema::hasColumn('tasks', 'contract_id')) {
                    $table->foreignId('contract_id')->nullable()->constrained('contracts')->onDelete('cascade');
                }
                if (!Schema::hasColumn('tasks', 'is_billable')) {
                    $table->boolean('is_billable')->default(false);
                }
                if (!Schema::hasColumn('tasks', 'billable_hours')) {
                    $table->decimal('billable_hours', 8, 2)->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'contract_id')) {
                $table->dropForeign(['contract_id']);
                $table->dropColumn('contract_id');
            }
            if (Schema::hasColumn('tasks', 'is_billable')) {
                $table->dropColumn('is_billable');
            }
            if (Schema::hasColumn('tasks', 'billable_hours')) {
                $table->dropColumn('billable_hours');
            }
        });
    }
};
