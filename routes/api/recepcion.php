<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RecepcionApiController;

/*
|--------------------------------------------------------------------------
| Recepción Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Recepción
|
*/

Route::middleware(['auth.api'])->prefix('recepcion')->name('recepcion.')->group(function () {
    Route::get('/', [RecepcionApiController::class, 'index'])->name('index');
    Route::get('/buscando', [RecepcionApiController::class, 'buscando'])->name('buscando');
    Route::get('/listar', [RecepcionApiController::class, 'listar'])->name('listar');
    Route::get('/buscar-rechazados', [RecepcionApiController::class, 'buscar_rechazados'])->name('buscar.rechazados');
    Route::post('/buscar', [RecepcionApiController::class, 'buscar'])->name('buscar');
    Route::get('/buscar-empresas/{cedrep}', [RecepcionApiController::class, 'buscar_empresas'])->name('buscar.empresas');
    Route::post('/scanner', [RecepcionApiController::class, 'scanner'])->name('scanner');
    Route::get('/exportar-lista', [RecepcionApiController::class, 'exportar_lista'])->name('exportar.lista');
    Route::get('/activo/{documento}', [RecepcionApiController::class, 'activo'])->name('activo');
    Route::post('/remover-inscripcion/{documento}', [RecepcionApiController::class, 'remover_inscripcion'])->name('remover.inscripcion');
    Route::post('/salvar-inscripcion', [RecepcionApiController::class, 'salvar_inscripcion'])->name('salvar.inscripcion');
    Route::get('/buscar-inscritos', [RecepcionApiController::class, 'buscar_inscritos'])->name('buscar.inscritos');
    Route::get('/reporte-quorum', [RecepcionApiController::class, 'reporte_quorum'])->name('reporte.quorum');
    Route::get('/buscar-registros-pendientes', [RecepcionApiController::class, 'buscar_registros_pendientes'])->name('buscar.registros.pendientes');
    Route::get('/all-criterios-rechazos', [RecepcionApiController::class, 'all_criterios_rechazos'])->name('all.criterios.rechazos');
    Route::post('/cruzar-habil-preregistro', [RecepcionApiController::class, 'cruzarHabilPreregistroPresencial'])->name('cruzar.habil.preregistro');
});
