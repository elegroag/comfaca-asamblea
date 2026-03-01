<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InicioController;

/*
|--------------------------------------------------------------------------
| Inicio/Dashboard Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Inicio y Dashboard
|
*/

Route::middleware(['auth.api'])->prefix('inicio')->name('inicio.')->group(function () {
    Route::get('/', [InicioController::class, 'index'])->name('index');
    Route::get('/dashboard-data', [InicioController::class, 'dashboardData'])->name('dashboard.data');
    Route::get('/grafico-quorum', [InicioController::class, 'graficoQuorum'])->name('grafico.quorum');
    Route::get('/grafico-poderes', [InicioController::class, 'graficoPoderes'])->name('grafico.poderes');
    Route::get('/actividades-recientes', [InicioController::class, 'actividadesRecientes'])->name('actividades.recientes');
    Route::get('/resumen-estados', [InicioController::class, 'resumenEstados'])->name('resumen.estados');
});
