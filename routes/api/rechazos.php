<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RechazosApiController;

/*
|--------------------------------------------------------------------------
| Rechazos Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Rechazos
|
*/

Route::middleware(['auth.api'])->prefix('rechazos')->name('rechazos.')->group(function () {
    Route::get('/', [RechazosApiController::class, 'index'])->name('index');
    Route::get('/listar', [RechazosApiController::class, 'listar'])->name('listar');
    Route::post('/cargue-masivo', [RechazosApiController::class, 'cargue_masivo'])->name('cargue.masivo');
    Route::post('/remove-rechazo', [RechazosApiController::class, 'removeRechazo'])->name('remove.rechazo');
    Route::get('/buscar-criterios', [RechazosApiController::class, 'buscarCriterios'])->name('buscar.criterios');
    Route::post('/save-rechazo', [RechazosApiController::class, 'saveRechazo'])->name('save.rechazo');
    Route::post('/detail', [RechazosApiController::class, 'detail'])->name('detail');
});
