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
        if (!Schema::hasTable('tasks')) {
            Schema::create('tasks', function (Blueprint $table) {
                $table->id();
                $table->string('title'); // Task title
                $table->text('description')->nullable(); // Task description
                $table->timestamp('start_time')->nullable(); // Initiation time
                $table->timestamp('end_time')->nullable(); // Finalization time
                $table->enum('status', ['pending', 'in-progress', 'completed'])->default('pending'); // Task status
                $table->foreignId('user_id')->constrained()->onDelete('cascade'); // User who created the task
                // Note: contract_id, is_billable, and billable_hours will be added later in 2025_05_27_012624_add_contract_and_billing_fields_to_tasks_table.php
                $table->timestamps(); // Created at and updated at
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
