<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\InterventoresApiController;

/*
|--------------------------------------------------------------------------
| Interventores Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Interventores
|
*/

Route::middleware(['auth.api'])->prefix('interventores')->name('interventores.')->group(function () {
    Route::get('/', [InterventoresApiController::class, 'index'])->name('index');
    Route::get('/listar', [InterventoresApiController::class, 'listar'])->name('listar');
    Route::post('/cargue-masivo', [InterventoresApiController::class, 'cargueMasivo'])->name('cargue.masivo');
    Route::get('/exportar-lista', [InterventoresApiController::class, 'exportarLista'])->name('exportar.lista');
});
