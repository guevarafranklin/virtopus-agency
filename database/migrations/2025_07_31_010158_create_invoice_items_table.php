<?php
// filepath: database/migrations/xxxx_xx_xx_create_invoice_items_table.php

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
        if (!Schema::hasTable('invoice_items')) {
            Schema::create('invoice_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
                $table->foreignId('contract_id')->nullable()->constrained()->onDelete('set null');
                $table->foreignId('work_id')->nullable()->constrained()->onDelete('set null');
                $table->foreignId('freelancer_id')->constrained('users')->onDelete('cascade');
                $table->text('description');
                $table->decimal('quantity', 8, 2); // Hours or fixed quantity
                $table->decimal('rate', 10, 2); // Rate per hour or fixed rate
                $table->decimal('amount', 10, 2); // Total amount for this line item
                $table->json('metadata')->nullable(); // Store task IDs, etc.
                $table->timestamps();
            });
        }
    }    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
