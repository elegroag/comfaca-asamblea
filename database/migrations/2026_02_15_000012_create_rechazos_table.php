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
        Schema::create('rechazos', function (Blueprint $table) {
            $table->id();
            $table->date('dia');
            $table->time('hora');
            $table->foreignId('regingre_id')->constrained('registro_ingresos')->onDelete('cascade');
            $table->foreignId('criterio_id')->constrained('criterios_rechazos')->onDelete('cascade');
            $table->timestamps();
            
            $table->index('dia');
            $table->index('regingre_id');
            $table->index('criterio_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rechazos');
    }
};