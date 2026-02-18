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
        Schema::create('usuario_sisu', function (Blueprint $table) {
            $table->id();
            $table->string('usuario', 50)->unique();
            $table->string('cedtra', 18)->nullable();
            $table->string('nombre');
            $table->string('password'); // contraseña encriptada
            $table->string('email')->nullable();
            $table->char('is_active', 1)->default('S');
            $table->timestamps();

            $table->index('usuario');
            $table->index('cedtra');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuario_sisu');
    }
};