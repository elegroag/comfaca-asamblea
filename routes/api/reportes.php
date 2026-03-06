<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ReportesApiController;

/*
|--------------------------------------------------------------------------
| Reportes Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Reportes
|
*/

Route::middleware(['auth.api'])->prefix('reportes')->name('reportes.')->group(function () {
    Route::get('/', [ReportesApiController::class, 'index'])->name('index');
    Route::get('/listar', [ReportesApiController::class, 'listar'])->name('listar');
    Route::get('/reporte-nuevo', [ReportesApiController::class, 'reporte_nuevo'])->name('nuevo');
    Route::get('/reporte-aplicativo', [ReportesApiController::class, 'reporte_aplicativo'])->name('aplicativo');
    Route::get('/reporte-empresa/{nit}', [ReportesApiController::class, 'reporte_empresa'])->name('empresa');
    Route::get('/reporte-quorum-completo', [ReportesApiController::class, 'reporte_quorum_completo'])->name('quorum.completo');
    Route::get('/reporte-asistencias', [ReportesApiController::class, 'reporte_asistencias'])->name('asistencias');
    Route::get('/reporte-poderes', [ReportesApiController::class, 'reporte_poderes'])->name('poderes');
    Route::get('/reporte-rechazos', [ReportesApiController::class, 'reporte_rechazos'])->name('rechazos');
    Route::get('/descargar/{filename}', [ReportesApiController::class, 'descargar'])->name('descargar');

    // Rutas para Acta de Poderes
    Route::post('/acta-poderes/generar', [\App\Services\Reportes\ActaPoderesReporte::class, 'generar'])->name('acta.poderes.generar');
    Route::post('/acta-poderes/datos', [\App\Services\Reportes\ActaPoderesReporte::class, 'datos'])->name('acta.poderes.datos');
    Route::post('/acta-poderes/estadisticas', [\App\Services\Reportes\ActaPoderesReporte::class, 'estadisticas'])->name('acta.poderes.estadisticas');
    Route::post('/acta-poderes/exportar-excel', [\App\Services\Reportes\ActaPoderesReporte::class, 'exportarExcel'])->name('acta.poderes.exportar.excel');

    // Rutas para Asistencias
    Route::post('/asistencias/generar', [\App\Services\Reportes\AsistenciasReporte::class, 'generar'])->name('asistencias.generar');
    Route::post('/asistencias/generar-por-asamblea', [\App\Services\Reportes\AsistenciasReporte::class, 'generarPorAsamblea'])->name('asistencias.generar.asamblea');
    Route::post('/asistencias/estadisticas', [\App\Services\Reportes\AsistenciasReporte::class, 'estadisticas'])->name('asistencias.estadisticas');
    Route::post('/asistencias/preview', [\App\Services\Reportes\AsistenciasReporte::class, 'preview'])->name('asistencias.preview');
    Route::post('/asistencias/verificar-datos', [\App\Services\Reportes\AsistenciasReporte::class, 'verificarDatos'])->name('asistencias.verificar.datos');

    // Rutas para Cartera
    Route::post('/cartera/generar', [\App\Services\Reportes\CarteraReporte::class, 'generar'])->name('cartera.generar');
    Route::post('/cartera/generar-por-asamblea', [\App\Services\Reportes\CarteraReporte::class, 'generarPorAsamblea'])->name('cartera.generar.asamblea');
    Route::post('/cartera/estadisticas', [\App\Services\Reportes\CarteraReporte::class, 'estadisticas'])->name('cartera.estadisticas');
    Route::post('/cartera/preview', [\App\Services\Reportes\CarteraReporte::class, 'preview'])->name('cartera.preview');
    Route::post('/cartera/buscar', [\App\Services\Reportes\CarteraReporte::class, 'buscar'])->name('cartera.buscar');
    Route::post('/cartera/exportar-busqueda', [\App\Services\Reportes\CarteraReporte::class, 'exportarBusqueda'])->name('cartera.exportar.busqueda');
    Route::post('/cartera/verificar-datos', [\App\Services\Reportes\CarteraReporte::class, 'verificarDatos'])->name('cartera.verificar.datos');
});
