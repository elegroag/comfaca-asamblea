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
        Schema::create('empresas', function (Blueprint $table) {
            $table->string('nit', 15)->primary();
            $table->string('razsoc', 200);
            $table->string('cedrep', 18)->nullable();
            $table->string('repleg')->nullable();
            $table->string('email')->nullable();
            $table->string('telefono', 20)->nullable();
            $table->foreignId('asamblea_id')->nullable()->constrained('asa_asambleas')->onDelete('cascade');
            $table->timestamps();
            
            $table->index('razsoc');
            $table->index('asamblea_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empresas');
    }
};