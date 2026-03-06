<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MesasApiController;

/*
|--------------------------------------------------------------------------
| Mesas Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Mesas de Votación
|
*/

Route::middleware(['auth.api'])->prefix('mesas')->name('mesas.')->group(function () {
    Route::get('/', [MesasApiController::class, 'index'])->name('index');
    Route::get('/listar', [MesasApiController::class, 'listar'])->name('listar');
    Route::post('/', [MesasApiController::class, 'create'])->name('create');
    Route::get('/{id}', [MesasApiController::class, 'show'])->name('show');
    Route::put('/{id}', [MesasApiController::class, 'update'])->name('update');
    Route::delete('/{id}', [MesasApiController::class, 'destroy'])->name('destroy');
    Route::patch('/{id}/estado', [MesasApiController::class, 'cambiarEstado'])->name('cambiar.estado');
});
