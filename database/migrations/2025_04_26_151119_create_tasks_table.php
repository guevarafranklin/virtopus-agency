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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Task title
            $table->text('description')->nullable(); // Task description
            $table->timestamp('start_time')->nullable(); // Initiation time
            $table->timestamp('end_time')->nullable(); // Finalization time
            $table->enum('status', ['pending', 'in-progress', 'completed'])->default('pending'); // Task status
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // User who created the task
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->onDelete('cascade');
            $table->boolean('is_billable')->default(false);
            $table->decimal('billable_hours', 8, 2)->nullable(); // Hours worked on this task
            $table->timestamps(); // Created at and updated at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['contract_id']);
            $table->dropColumn(['contract_id', 'is_billable', 'billable_hours']);
        });
    }
};
