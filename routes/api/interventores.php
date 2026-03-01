<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InterventoresController;

/*
|--------------------------------------------------------------------------
| Interventores Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Interventores
|
*/

Route::middleware(['auth.api'])->prefix('interventores')->name('interventores.')->group(function () {
    Route::get('/', [InterventoresController::class, 'index'])->name('index');
    Route::get('/listar', [InterventoresController::class, 'listar'])->name('listar');
    Route::post('/cargue-masivo', [InterventoresController::class, 'cargueMasivo'])->name('cargue.masivo');
    Route::get('/exportar-lista', [InterventoresController::class, 'exportarLista'])->name('exportar.lista');
});
