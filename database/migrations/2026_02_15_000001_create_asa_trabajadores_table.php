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
        Schema::create('asa_trabajadores', function (Blueprint $table) {
            $table->id();
            $table->string('cedtra', 18)->unique();
            $table->string('nombre', 120);
            $table->string('apellido', 120)->nullable();
            $table->string('email')->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('departamento', 100)->nullable();
            $table->string('cargo', 100)->nullable();
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            $table->date('fecha_ingreso')->nullable();
            $table->timestamps();
            
            $table->index('cedtra');
            $table->index('estado');
            $table->index('departamento');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asa_trabajadores');
    }
};