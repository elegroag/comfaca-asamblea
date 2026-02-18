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
        Schema::create('carteras', function (Blueprint $table) {
            $table->id();
            $table->string('nit', 15);
            $table->text('concepto');
            $table->foreignId('asamblea_id')->nullable()->constrained('asa_asambleas')->onDelete('cascade');
            $table->enum('codigo', ['A', 'S', 'L'])->default('A'); // Aportes, Servicios, Libranza
            $table->timestamps();
            
            $table->foreign('nit')->references('nit')->on('empresas')->onDelete('cascade');
            $table->index('nit');
            $table->index('asamblea_id');
            $table->index('codigo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carteras');
    }
};