<?php

use App\Http\Controllers\Api\PoderesApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Poderes Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Poderes
|
*/

Route::middleware(['auth.api'])->group(function () {
    // Información del usuario autenticado

    Route::get('poderes/listar', [PoderesApiController::class, 'listar']);
    Route::get('poderes/detalle/{id}', [PoderesApiController::class, 'detalle']);
    Route::get('poderes/buscar', [PoderesApiController::class, 'buscar']);
    Route::get('poderes/buscar-empresa/{nit}', [PoderesApiController::class, 'buscar_empresa']);
    Route::post('poderes/activar/{documento}', [PoderesApiController::class, 'activar']);
    Route::post('poderes/validacion-previa', [PoderesApiController::class, 'validacion_previa']);
    Route::post('poderes/inactivar/{documento}', [PoderesApiController::class, 'inactivar']);
    Route::delete('poderes/remover/{documento}', [PoderesApiController::class, 'remover']);
    Route::get('poderes/criterios-rechazo', [PoderesApiController::class, 'criterios_rechazo']);
    Route::post('poderes/cargue-masivo', [PoderesApiController::class, 'cargue_masivo']);

    // Nuevas rutas migradas desde Kumbia
    Route::post('poderes/ingresar-poder', [PoderesApiController::class, 'ingresar_poder']);
    Route::get('poderes/buscar-apoderado/{apoderado_nit?}', [PoderesApiController::class, 'buscar_apoderado']);
    Route::get('poderes/buscar-poderdante/{poderdante_nit?}', [PoderesApiController::class, 'buscar_poderdante']);
    Route::get('poderes/exportar-lista-csv', [PoderesApiController::class, 'exportar_lista_csv']);
    Route::get('poderes/exportar-pdf', [PoderesApiController::class, 'exportar_pdf']);
    Route::get('poderes/exportar-lista', [PoderesApiController::class, 'exportar_lista']);
    Route::get('poderes/acta-revision-verificacion', [PoderesApiController::class, 'acta_revision_verificacion']);
    Route::get('poderes/exportar-asistencias', [PoderesApiController::class, 'exportar_asistencias']);
    Route::post('poderes/registrar-rechazo-poder', [PoderesApiController::class, 'registrar_rechazo_poder']);
});
