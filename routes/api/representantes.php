<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RepresentantesController;

/*
|--------------------------------------------------------------------------
| Representantes Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Representantes
|
*/

Route::middleware(['auth.api'])->prefix('representantes')->name('representantes.')->group(function () {
    Route::get('/', [RepresentantesController::class, 'index'])->name('index');
    Route::get('/listar', [RepresentantesController::class, 'listar'])->name('listar');
    Route::post('/crear', [RepresentantesController::class, 'crear'])->name('crear');
    Route::delete('/{id}', [RepresentantesController::class, 'removeRepresentante'])->name('eliminar');
    Route::get('/valid/{cedrep}', [RepresentantesController::class, 'validRepresentante'])->name('validar');
    Route::get('/empresa-disponible/{nit}', [RepresentantesController::class, 'empresaDisponible'])->name('empresa.disponible');
    Route::get('/buscar/{cedrep}', [RepresentantesController::class, 'buscar'])->name('buscar');
    Route::put('/editar/{cedrep}', [RepresentantesController::class, 'editar'])->name('editar');
    Route::get('/detalle/{cedrep}', [RepresentantesController::class, 'detalle'])->name('detalle');
    Route::put('/cambiar-clave/{cedrep}', [RepresentantesController::class, 'cambiarClave'])->name('cambiar.clave');
    Route::put('/cambiar-estado/{cedrep}', [RepresentantesController::class, 'cambiarEstado'])->name('cambiar.estado');
});
