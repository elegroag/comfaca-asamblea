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
        Schema::create('asa_mesas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique();
            $table->string('cedtra_responsable', 18)->nullable();
            $table->enum('estado', ['espera', 'abierta', 'cerrada'])->default('espera');
            $table->foreignId('consenso_id')->nullable()->constrained('asa_consensos')->onDelete('set null');
            $table->dateTime('hora_apertura')->nullable();
            $table->dateTime('hora_cierre_mesa')->nullable();
            $table->integer('cantidad_votantes')->default(0);
            $table->integer('cantidad_votos')->default(0);
            $table->timestamps();
            
            $table->foreign('cedtra_responsable')->references('cedtra')->on('asa_trabajadores')->onDelete('set null');
            $table->index('codigo');
            $table->index('estado');
            $table->index('consenso_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asa_mesas');
    }
};