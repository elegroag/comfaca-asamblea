<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NovedadesController;

/*
|--------------------------------------------------------------------------
| Novedades Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Novedades
|
*/

Route::middleware(['auth.api'])->prefix('novedades')->name('novedades.')->group(function () {
    Route::get('/', [NovedadesController::class, 'index'])->name('index');
    Route::get('/listar', [NovedadesController::class, 'listar'])->name('listar');
    Route::post('/remove-cartera', [NovedadesController::class, 'notyRemoveCartera'])->name('remove.cartera');
    Route::post('/nuevo-habil', [NovedadesController::class, 'notyNuevoHabil'])->name('nuevo.habil');
    Route::post('/change-habil', [NovedadesController::class, 'notyChangeHabil'])->name('change.habil');
    Route::post('/poder-revocar', [NovedadesController::class, 'notyPoderRevocar'])->name('poder.revocar');
    Route::post('/procesa-activar', [NovedadesController::class, 'procesaActivar'])->name('procesa.activar');
    Route::delete('/{id}', [NovedadesController::class, 'remove'])->name('remove');
    Route::post('/{id}/procesar', [NovedadesController::class, 'procesar'])->name('procesar');
    Route::post('/update-habiles', [NovedadesController::class, 'updateHabiles'])->name('update.habiles');
});
