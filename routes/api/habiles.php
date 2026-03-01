<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HabilesApiController;

/*
|--------------------------------------------------------------------------
| Hábiles Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Hábiles
|
*/

Route::middleware(['auth.api'])->prefix('habiles')->name('habiles.')->group(function () {

    Route::get('/listar', [HabilesApiController::class, 'listar'])->name('listar');
    Route::post('/save-empresa-habil', [HabilesApiController::class, 'saveEmpresaHabil'])->name('save.empresa.habil');
    Route::delete('/remove-empresa/{nit}', [HabilesApiController::class, 'removeEmpresa'])->name('remove.empresa');
    Route::get('/validar/{cedrep}', [HabilesApiController::class, 'validar'])->name('validar');
    Route::post('/crear-ingreso', [HabilesApiController::class, 'crear_ingreso'])->name('crear.ingreso');
    Route::get('/empresas-apoderadas/{cedrep}', [HabilesApiController::class, 'empresas_apoderadas'])->name('empresas.apoderadas');
    Route::post('/ficha', [HabilesApiController::class, 'ficha'])->name('ficha');
    Route::get('/buscar-empresa/{nit}', [HabilesApiController::class, 'buscar_empresa'])->name('buscar.empresa');
    Route::get('/imprimir2-ficha/{cedrep}', [HabilesApiController::class, 'imprimir2_ficha'])->name('imprimir2.ficha');
    Route::post('/cargue-masivo', [HabilesApiController::class, 'cargue_masivo'])->name('cargue.masivo');
    Route::get('/exportar-lista', [HabilesApiController::class, 'exportar_lista'])->name('exportar.lista');
    Route::get('/exportar-pdf', [HabilesApiController::class, 'exportar_pdf'])->name('exportar.pdf');
    Route::get('/lista-habiles', [HabilesApiController::class, 'lista_habiles'])->name('lista.habiles');
    Route::post('/remove-habil', [HabilesApiController::class, 'remove_habil'])->name('remove.habil');
    Route::get('/exportar-habiles', [HabilesApiController::class, 'exportar_habiles'])->name('exportar.habiles');
});
