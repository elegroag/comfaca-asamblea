<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MesasController;

/*
|--------------------------------------------------------------------------
| Mesas Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Mesas de Votación
|
*/

Route::middleware(['auth.api'])->prefix('mesas')->name('mesas.')->group(function () {
    Route::get('/', [MesasController::class, 'index'])->name('index');
    Route::get('/listar', [MesasController::class, 'listar'])->name('listar');
    Route::post('/', [MesasController::class, 'create'])->name('create');
    Route::get('/{id}', [MesasController::class, 'show'])->name('show');
    Route::put('/{id}', [MesasController::class, 'update'])->name('update');
    Route::delete('/{id}', [MesasController::class, 'destroy'])->name('destroy');
    Route::patch('/{id}/estado', [MesasController::class, 'cambiarEstado'])->name('cambiar.estado');
});
