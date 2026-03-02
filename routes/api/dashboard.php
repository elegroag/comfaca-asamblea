<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\InicioApiController;

/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
|
| Rutas del dashboard principal
|
*/

Route::middleware(['auth.api'])->prefix('dashboard')->name('dashboard.')->group(function () {

    Route::get('/', [InicioApiController::class, 'index'])->name('index');
    Route::get('/stats', [InicioApiController::class, 'getEstadisticasPrincipales'])->name('stats');
    Route::get('/stats-detalles', [InicioApiController::class, 'getEstadisticasDetalladas'])->name('stats-detalles');
    Route::get('/datos-adicionales', [InicioApiController::class, 'getDatosAdicionales'])->name('datos-adicionales');
    Route::get('/grafico-quorum', [InicioApiController::class, 'getGraficoQuorum'])->name('grafico-quorum');
    Route::get('/grafico-poderes', [InicioApiController::class, 'getGraficoPoderes'])->name('grafico-poderes');
    Route::get('/actividades-recientes', [InicioApiController::class, 'getActividadesRecientes'])->name('actividades-recientes');
    Route::get('/resumen-estados', [InicioApiController::class, 'getResumenEstados'])->name('resumen-estados');
});
