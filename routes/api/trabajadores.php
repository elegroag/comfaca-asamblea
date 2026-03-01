<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TrabajadoresController;

/*
|--------------------------------------------------------------------------
| Trabajadores Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Trabajadores
|
*/

Route::middleware(['auth.api'])->prefix('trabajadores')->name('trabajadores.')->group(function () {
    Route::get('/', [TrabajadoresController::class, 'index'])->name('index');
    Route::get('/listar', [TrabajadoresController::class, 'listar'])->name('listar');
    Route::post('/cargue-masivo', [TrabajadoresController::class, 'cargue_masivo'])->name('cargue.masivo');
    Route::post('/crear', [TrabajadoresController::class, 'crear'])->name('crear');
    Route::post('/save-trabajador', [TrabajadoresController::class, 'saveTrabajador'])->name('save');
    Route::delete('/eliminar', [TrabajadoresController::class, 'eliminar'])->name('eliminar');
    Route::get('/exportar-lista', [TrabajadoresController::class, 'exportar_lista'])->name('exportar.lista');
    Route::get('/buscar/{cedula}', [TrabajadoresController::class, 'buscar'])->name('buscar');
    Route::get('/detalle/{id}', [TrabajadoresController::class, 'detalle'])->name('detalle');
    Route::put('/{id}', [TrabajadoresController::class, 'actualizar'])->name('actualizar');
    Route::get('/validar/{cedula}', [TrabajadoresController::class, 'validar'])->name('validar');
    Route::get('/validar/{cedula}/{nittra}', [TrabajadoresController::class, 'validar'])->name('validar.completo');
});
