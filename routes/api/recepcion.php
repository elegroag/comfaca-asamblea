<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RecepcionController;

/*
|--------------------------------------------------------------------------
| Recepción Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Recepción
|
*/

Route::middleware(['auth.api'])->prefix('recepcion')->name('recepcion.')->group(function () {
    Route::get('/', [RecepcionController::class, 'index'])->name('index');
    Route::get('/buscando', [RecepcionController::class, 'buscando'])->name('buscando');
    Route::get('/listar', [RecepcionController::class, 'listar'])->name('listar');
    Route::get('/buscar-rechazados', [RecepcionController::class, 'buscar_rechazados'])->name('buscar.rechazados');
    Route::post('/buscar', [RecepcionController::class, 'buscar'])->name('buscar');
    Route::get('/buscar-empresas/{cedrep}', [RecepcionController::class, 'buscar_empresas'])->name('buscar.empresas');
    Route::post('/scanner', [RecepcionController::class, 'scanner'])->name('scanner');
    Route::get('/exportar-lista', [RecepcionController::class, 'exportar_lista'])->name('exportar.lista');
    Route::get('/activo/{documento}', [RecepcionController::class, 'activo'])->name('activo');
    Route::post('/remover-inscripcion/{documento}', [RecepcionController::class, 'remover_inscripcion'])->name('remover.inscripcion');
    Route::post('/salvar-inscripcion', [RecepcionController::class, 'salvar_inscripcion'])->name('salvar.inscripcion');
    Route::get('/buscar-inscritos', [RecepcionController::class, 'buscar_inscritos'])->name('buscar.inscritos');
    Route::get('/reporte-quorum', [RecepcionController::class, 'reporte_quorum'])->name('reporte.quorum');
    Route::get('/buscar-registros-pendientes', [RecepcionController::class, 'buscar_registros_pendientes'])->name('buscar.registros.pendientes');
    Route::get('/all-criterios-rechazos', [RecepcionController::class, 'all_criterios_rechazos'])->name('all.criterios.rechazos');
    Route::post('/cruzar-habil-preregistro', [RecepcionController::class, 'cruzarHabilPreregistroPresencial'])->name('cruzar.habil.preregistro');
});
