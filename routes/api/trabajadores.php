<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TrabajadoresApiController;

/*
|--------------------------------------------------------------------------
| Trabajadores Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Trabajadores
|
*/

Route::middleware(['auth.api'])->prefix('trabajadores')->name('trabajadores.')->group(function () {
    Route::get('/', [TrabajadoresApiController::class, 'index'])->name('index');
    Route::get('/listar', [TrabajadoresApiController::class, 'listar'])->name('listar');
    Route::post('/cargue-masivo', [TrabajadoresApiController::class, 'cargue_masivo'])->name('cargue.masivo');
    Route::post('/crear', [TrabajadoresApiController::class, 'crear'])->name('crear');
    Route::post('/save-trabajador', [TrabajadoresApiController::class, 'saveTrabajador'])->name('save');
    Route::delete('/eliminar', [TrabajadoresApiController::class, 'eliminar'])->name('eliminar');
    Route::get('/exportar-lista', [TrabajadoresApiController::class, 'exportar_lista'])->name('exportar.lista');
    Route::get('/buscar/{cedula}', [TrabajadoresApiController::class, 'buscar'])->name('buscar');
    Route::get('/detalle/{id}', [TrabajadoresApiController::class, 'detalle'])->name('detalle');
    Route::put('/{id}', [TrabajadoresApiController::class, 'actualizar'])->name('actualizar');
    Route::get('/validar/{cedula}', [TrabajadoresApiController::class, 'validar'])->name('validar');
    Route::get('/validar/{cedula}/{nittra}', [TrabajadoresApiController::class, 'validar'])->name('validar.completo');
});
