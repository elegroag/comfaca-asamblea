<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RechazosController;

/*
|--------------------------------------------------------------------------
| Rechazos Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Rechazos
|
*/

Route::middleware(['auth.api'])->prefix('rechazos')->name('rechazos.')->group(function () {
    Route::get('/', [RechazosController::class, 'index'])->name('index');
    Route::get('/listar', [RechazosController::class, 'listar'])->name('listar');
    Route::post('/cargue-masivo', [RechazosController::class, 'cargue_masivo'])->name('cargue.masivo');
    Route::post('/remove-rechazo', [RechazosController::class, 'removeRechazo'])->name('remove.rechazo');
    Route::get('/buscar-criterios', [RechazosController::class, 'buscarCriterios'])->name('buscar.criterios');
    Route::post('/save-rechazo', [RechazosController::class, 'saveRechazo'])->name('save.rechazo');
    Route::post('/detail', [RechazosController::class, 'detail'])->name('detail');
});
