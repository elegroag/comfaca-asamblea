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
        Schema::create('registro_ingresos', function (Blueprint $table) {
            $table->id();
            $table->string('documento', 50);
            $table->date('fecha');
            $table->time('hora');
            $table->string('nit', 15)->nullable();
            $table->string('usuario');
            $table->enum('estado', ['pendiente', 'aprobado', 'rechazado', 'asistio', 'no_asistio'])->default('pendiente');
            $table->integer('votos')->default(0);
            $table->foreignId('mesa_id')->nullable()->constrained('asa_mesas')->onDelete('set null');
            $table->foreignId('asamblea_id')->nullable()->constrained('asa_asambleas')->onDelete('cascade');
            $table->enum('tipo_ingreso', ['participante', 'invitado', 'observador', 'interventor'])->default('participante');
            $table->dateTime('fecha_asistencia')->nullable();
            $table->string('cedula_representa', 18)->nullable();
            $table->string('nombre_representa')->nullable();
            $table->integer('orden')->default(0);
            $table->timestamps();
            
            $table->index('documento');
            $table->index('fecha');
            $table->index('nit');
            $table->index('estado');
            $table->index('mesa_id');
            $table->index('asamblea_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registro_ingresos');
    }
};