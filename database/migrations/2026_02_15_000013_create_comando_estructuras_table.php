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
        Schema::create('comando_estructuras', function (Blueprint $table) {
            $table->id();
            $table->string('procesador');
            $table->text('estructura');
            $table->json('variables')->nullable();
            $table->enum('tipo', ['batch', 'interactivo', 'servicio', 'api'])->default('batch');
            $table->enum('sistema', ['linux', 'windows', 'mac'])->nullable();
            $table->enum('env', ['desarrollo', 'pruebas', 'produccion'])->nullable();
            $table->text('descripcion')->nullable();
            $table->boolean('asyncro')->default(false);
            $table->timestamps();
            
            $table->index('tipo');
            $table->index('sistema');
            $table->index('env');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comando_estructuras');
    }
};