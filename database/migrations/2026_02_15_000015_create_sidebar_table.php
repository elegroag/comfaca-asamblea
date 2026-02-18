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
        Schema::create('sidebar', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            $table->string('resource_router')->nullable();
            $table->integer('orden')->default(0);
            $table->foreignId('sidebar_id')->nullable()->constrained('sidebar')->onDelete('cascade');
            $table->enum('ambiente', ['desarrollo', 'pruebas', 'produccion', 'todos'])->default('todos');
            $table->string('icon')->nullable();
            $table->timestamps();
            
            $table->index('estado');
            $table->index('orden');
            $table->index('sidebar_id');
            $table->index('ambiente');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sidebar');
    }
};