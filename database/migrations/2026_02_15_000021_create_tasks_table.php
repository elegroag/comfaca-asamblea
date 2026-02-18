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
            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('completed')->default(false);
            $table->unsignedBigInteger('usuario_sisu_id')->nullable();
            $table->timestamps();
            
            // Foreign key a usuario_sisu
            $table->foreign('usuario_sisu_id')
                  ->references('id')
                  ->on('usuario_sisu')
                  ->onDelete('set null');
            
            // Índices para mejor rendimiento
            $table->index(['usuario_sisu_id']);
            $table->index(['completed']);
            $table->index(['usuario_sisu_id', 'completed']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};