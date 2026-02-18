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
        Schema::create('asa_usuarios', function (Blueprint $table) {
            $table->id();
            $table->enum('rol', ['administrador', 'votante', 'interventor', 'observador'])->default('votante');
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            $table->foreignId('asamblea_id')->constrained('asa_asambleas')->onDelete('cascade');
            $table->string('cedtra', 18);
            $table->timestamps();
            
            $table->foreign('cedtra')->references('cedtra')->on('asa_trabajadores')->onDelete('cascade');
            $table->index('asamblea_id');
            $table->index('cedtra');
            $table->index('rol');
            $table->index('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asa_usuarios');
    }
};