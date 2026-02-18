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
        // Tabla: asa_interventores
        Schema::create('asa_interventores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asamblea_id')->constrained('asa_asambleas')->onDelete('cascade');
            $table->string('cedtra', 18);
            $table->enum('tipo_interventor', ['principal', 'suplente', 'delegado'])->default('principal');
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            $table->text('observaciones')->nullable();
            $table->timestamps();
            
            $table->foreign('cedtra')->references('cedtra')->on('asa_trabajadores')->onDelete('cascade');
            $table->index('asamblea_id');
            $table->index('cedtra');
            $table->index('tipo_interventor');
        });

        // Tabla: asa_representantes
        Schema::create('asa_representantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asamblea_id')->constrained('asa_asambleas')->onDelete('cascade');
            $table->string('cedtra', 18);
            $table->string('cedrep', 18);
            $table->string('nombre_representado');
            $table->enum('tipo_representacion', ['legal', 'voluntario', 'judicial'])->default('legal');
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            $table->text('observaciones')->nullable();
            $table->timestamps();
            
            $table->foreign('cedtra')->references('cedtra')->on('asa_trabajadores')->onDelete('cascade');
            $table->index('asamblea_id');
            $table->index('cedtra');
            $table->index('cedrep');
        });

        // Tabla: asa_correos
        Schema::create('asa_correos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asamblea_id')->constrained('asa_asambleas')->onDelete('cascade');
            $table->string('asunto');
            $table->text('mensaje');
            $table->enum('tipo_destino', ['todos', 'usuarios', 'interventores', 'representantes', 'personalizado'])->default('todos');
            $table->json('destinatarios')->nullable();
            $table->enum('estado_envio', ['pendiente', 'enviado', 'error', 'cancelado'])->default('pendiente');
            $table->dateTime('fecha_programada')->nullable();
            $table->dateTime('fecha_envio')->nullable();
            $table->integer('intentos')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamps();
            
            $table->index('asamblea_id');
            $table->index('estado_envio');
        });

        // Tabla: asa_antorami
        Schema::create('asa_antorami', function (Blueprint $table) {
            $table->id();
            $table->string('usuario');
            $table->string('clave');
            $table->string('cedrep', 18)->nullable();
            $table->timestamps();
            
            $table->index('usuario');
            $table->index('cedrep');
        });

        // Tabla: novedades
        Schema::create('novedades', function (Blueprint $table) {
            $table->id();
            $table->integer('linea');
            $table->boolean('syncro')->default(false);
            $table->enum('estado', ['A', 'I', 'R'])->default('A'); // Activar, Inactivar, Reemplazar
            $table->string('nit', 15);
            $table->string('razon_social');
            $table->string('cedula_representante', 18);
            $table->string('nombre_representante');
            $table->string('apoderado_nit', 15)->nullable();
            $table->string('apoderado_cedula', 18)->nullable();
            $table->string('apoderado_nombre')->nullable();
            $table->string('clave')->nullable();
            $table->timestamps();
            
            $table->index('nit');
            $table->index('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asa_interventores');
        Schema::dropIfExists('asa_representantes');
        Schema::dropIfExists('asa_correos');
        Schema::dropIfExists('asa_antorami');
        Schema::dropIfExists('novedades');
    }
};