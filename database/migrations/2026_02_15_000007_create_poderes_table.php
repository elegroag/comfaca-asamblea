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
        Schema::create('poderes', function (Blueprint $table) {
            $table->id();
            $table->string('documento', 50);
            $table->date('fecha');
            $table->string('poderdante_nit', 15); // poderdante
            $table->string('poderdante_repleg')->nullable();
            $table->string('poderdante_cedrep', 18)->nullable();
            $table->string('apoderado_nit', 15); // apoderado
            $table->string('apoderado_repleg')->nullable();
            $table->string('apoderado_cedrep', 18)->nullable();
            $table->enum('estado', ['A', 'I', 'R'])->default('A'); // Aprobado, Rechazado, Revocado
            $table->string('radicado', 50)->nullable();
            $table->text('notificacion')->nullable();
            $table->foreignId('asamblea_id')->nullable()->constrained('asa_asambleas')->onDelete('cascade');
            $table->timestamps();

            $table->index('documento');
            $table->index('poderdante_nit');
            $table->index('apoderado_nit');
            $table->index('estado');
            $table->index('asamblea_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('poderes');
    }
};
