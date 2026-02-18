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
        Schema::create('sidebar_permisos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sidebar_id')->constrained('sidebar')->onDelete('cascade');
            $table->enum('rol', ['administrador', 'supervisor', 'operador', 'invitado', 'consulta']);
            $table->timestamps();
            
            $table->unique(['sidebar_id', 'rol']);
            $table->index('rol');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sidebar_permisos');
    }
};