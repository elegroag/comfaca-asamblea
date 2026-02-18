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
        Schema::create('asa_consensos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asamblea_id')->constrained('asa_asambleas')->onDelete('cascade');
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['activo', 'votacion', 'finalizado'])->default('activo');
            $table->enum('tipo_votacion', ['simple', 'calificada', 'unanime'])->default('simple');
            $table->integer('votos_favor')->default(0);
            $table->integer('votos_contra')->default(0);
            $table->integer('votos_abstencion')->default(0);
            $table->integer('votos_blancos')->default(0);
            $table->integer('votos_nulos')->default(0);
            $table->integer('total_votantes')->default(0);
            $table->dateTime('fecha_inicio')->nullable();
            $table->dateTime('fecha_fin')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
            
            $table->index('asamblea_id');
            $table->index('estado');
            $table->index('tipo_votacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asa_consensos');
    }
};