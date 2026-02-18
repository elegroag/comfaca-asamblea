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
        Schema::create('asa_asambleas', function (Blueprint $table) {
            $table->id();
            $table->enum('estado', ['P', 'A', 'F', 'C'])->default('P');
            $table->dateTime('fecha_programada')->nullable();
            $table->text('detalle')->nullable();
            $table->enum('modo', ['P', 'V', 'H'])->default('P'); // Presencial, Virtual, Híbrido
            $table->timestamps();

            $table->index('estado');
            $table->index('fecha_programada');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asa_asambleas');
    }
};
