<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RepresentantesApiController;

/*
|--------------------------------------------------------------------------
| Representantes Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Representantes
|
*/

Route::middleware(['auth.api'])->prefix('representantes')->name('representantes.')->group(function () {
    Route::get('/', [RepresentantesApiController::class, 'index'])->name('index');
    Route::get('/listar', [RepresentantesApiController::class, 'listar'])->name('listar');
    Route::post('/crear', [RepresentantesApiController::class, 'crear'])->name('crear');
    Route::delete('/{id}', [RepresentantesApiController::class, 'removeRepresentante'])->name('eliminar');
    Route::get('/valid/{cedrep}', [RepresentantesApiController::class, 'validRepresentante'])->name('validar');
    Route::get('/empresa-disponible/{nit}', [RepresentantesApiController::class, 'empresaDisponible'])->name('empresa.disponible');
    Route::get('/buscar/{cedrep}', [RepresentantesApiController::class, 'buscar'])->name('buscar');
    Route::put('/editar/{cedrep}', [RepresentantesApiController::class, 'editar'])->name('editar');
    Route::get('/detalle/{cedrep}', [RepresentantesApiController::class, 'detalle'])->name('detalle');
    Route::put('/cambiar-clave/{cedrep}', [RepresentantesApiController::class, 'cambiarClave'])->name('cambiar.clave');
    Route::put('/cambiar-estado/{cedrep}', [RepresentantesApiController::class, 'cambiarEstado'])->name('cambiar.estado');
});
