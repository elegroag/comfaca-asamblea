<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\InicioApiController;

/*
|--------------------------------------------------------------------------
| Inicio/Dashboard Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Inicio y Dashboard
|
*/

Route::middleware(['auth.api'])->prefix('inicio')->name('inicio.')->group(function () {
    Route::get('/', [InicioApiController::class, 'index'])->name('index');
    Route::get('/dashboard-data', [InicioApiController::class, 'dashboardData'])->name('dashboard.data');
    Route::get('/grafico-quorum', [InicioApiController::class, 'graficoQuorum'])->name('grafico.quorum');
    Route::get('/grafico-poderes', [InicioApiController::class, 'graficoPoderes'])->name('grafico.poderes');
    Route::get('/actividades-recientes', [InicioApiController::class, 'actividadesRecientes'])->name('actividades.recientes');
    Route::get('/resumen-estados', [InicioApiController::class, 'resumenEstados'])->name('resumen.estados');
});
