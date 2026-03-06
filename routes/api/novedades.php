<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NovedadesApiController;

/*
|--------------------------------------------------------------------------
| Novedades Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Novedades
|
*/

Route::middleware(['auth.api'])->prefix('novedades')->name('novedades.')->group(function () {
    Route::get('/', [NovedadesApiController::class, 'index'])->name('index');
    Route::get('/listar', [NovedadesApiController::class, 'listar'])->name('listar');
    Route::post('/remove-cartera', [NovedadesApiController::class, 'notyRemoveCartera'])->name('remove.cartera');
    Route::post('/nuevo-habil', [NovedadesApiController::class, 'notyNuevoHabil'])->name('nuevo.habil');
    Route::post('/change-habil', [NovedadesApiController::class, 'notyChangeHabil'])->name('change.habil');
    Route::post('/poder-revocar', [NovedadesApiController::class, 'notyPoderRevocar'])->name('poder.revocar');
    Route::post('/procesa-activar', [NovedadesApiController::class, 'procesaActivar'])->name('procesa.activar');
    Route::delete('/{id}', [NovedadesApiController::class, 'remove'])->name('remove');
    Route::post('/{id}/procesar', [NovedadesApiController::class, 'procesar'])->name('procesar');
    Route::post('/update-habiles', [NovedadesApiController::class, 'updateHabiles'])->name('update.habiles');
});
