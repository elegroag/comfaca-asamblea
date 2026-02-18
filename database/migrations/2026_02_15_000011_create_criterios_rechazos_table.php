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
        Schema::create('criterios_rechazos', function (Blueprint $table) {
            $table->id();
            $table->text('detalle');
            $table->text('estatutos')->nullable();
            $table->enum('tipo', ['POD', 'POA', 'CAR', 'TRA', 'HAB']); // Poderes Revocados, Poderdante, Cartera, Funcionario Caja, No Hábil
            $table->timestamps();
            
            $table->index('tipo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('criterios_rechazos');
    }
};