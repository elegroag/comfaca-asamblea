<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PoderesController;
use App\Http\Controllers\InterventoresController;
use App\Http\Controllers\MesasController;
use App\Http\Controllers\NovedadesController;
use App\Http\Controllers\HabilesController;
use App\Http\Controllers\RecepcionController;
use App\Http\Controllers\RechazosController;
use App\Http\Controllers\ReportesController;
use App\Http\Controllers\RepresentantesController;
use App\Http\Controllers\TrabajadoresController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\InicioController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Rutas principales
Route::get('/', function () {
    return redirect()->route('login');
});

// Authentication Routes - Usando AuthController existente
Route::get('/login', [AuthController::class, 'login'])->name('login');
Route::post('/login', [AuthController::class, 'authenticate'])->name('login.authenticate');
Route::get('/register', [AuthController::class, 'register'])->name('register');
Route::post('/register', [AuthController::class, 'store'])->name('register.store');
Route::get('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// Dashboard (protected route)
Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('auth')->name('dashboard');

// Tasks Routes (protected)
Route::resource('tasks', TaskController::class)->middleware('auth');

// Rutas del sistema de asambleas (protegidas)
Route::middleware(['auth'])->prefix('asamblea')->name('asamblea.')->group(function () {
    // Dashboard de asambleas
    Route::get('/', function () {
        return view('asamblea.dashboard');
    })->name('dashboard');

    // Rutas de Poderes
});

Route::get('/poderes', [PoderesController::class, 'index'])->middleware('auth')->name('poderes.index');

// Rutas de Interventores
Route::middleware(['auth'])->prefix('interventores')->name('interventores.')->group(function () {
    Route::get('/', [InterventoresController::class, 'index'])->name('index');
    Route::get('/listar', [InterventoresController::class, 'listar'])->name('listar');
    Route::post('/cargue-masivo', [InterventoresController::class, 'cargueMasivo'])->name('cargue.masivo');
    Route::get('/exportar-lista', [InterventoresController::class, 'exportarLista'])->name('exportar.lista');
});

// Rutas de Mesas
Route::middleware(['auth'])->prefix('mesas')->name('mesas.')->group(function () {
    Route::get('/', [MesasController::class, 'index'])->name('index');
    Route::get('/listar', [MesasController::class, 'listar'])->name('listar');
    Route::post('/', [MesasController::class, 'create'])->name('create');
    Route::get('/{id}', [MesasController::class, 'show'])->name('show');
    Route::put('/{id}', [MesasController::class, 'update'])->name('update');
    Route::delete('/{id}', [MesasController::class, 'destroy'])->name('destroy');
    Route::patch('/{id}/estado', [MesasController::class, 'cambiarEstado'])->name('cambiar.estado');
});

// Rutas de Novedades
Route::middleware(['auth'])->prefix('novedades')->name('novedades.')->group(function () {
    Route::get('/', [NovedadesController::class, 'index'])->name('index');
    Route::get('/listar', [NovedadesController::class, 'listar'])->name('listar');
    Route::post('/remove-cartera', [NovedadesController::class, 'notyRemoveCartera'])->name('remove.cartera');
    Route::post('/nuevo-habil', [NovedadesController::class, 'notyNuevoHabil'])->name('nuevo.habil');
    Route::post('/change-habil', [NovedadesController::class, 'notyChangeHabil'])->name('change.habil');
    Route::post('/poder-revocar', [NovedadesController::class, 'notyPoderRevocar'])->name('poder.revocar');
    Route::post('/procesa-activar', [NovedadesController::class, 'procesaActivar'])->name('procesa.activar');
    Route::delete('/{id}', [NovedadesController::class, 'remove'])->name('remove');
    Route::post('/{id}/procesar', [NovedadesController::class, 'procesar'])->name('procesar');
    Route::post('/update-habiles', [NovedadesController::class, 'updateHabiles'])->name('update.habiles');
});

// Rutas de Hábiles
Route::middleware(['auth'])->prefix('habiles')->name('habiles.')->group(function () {
    Route::get('/', [HabilesController::class, 'index'])->name('index');
    Route::get('/listar', [HabilesController::class, 'listar'])->name('listar');
    Route::post('/save-empresa-habil', [HabilesController::class, 'saveEmpresaHabil'])->name('save.empresa.habil');
    Route::delete('/remove-empresa/{nit}', [HabilesController::class, 'removeEmpresa'])->name('remove.empresa');
    Route::get('/validar/{cedrep}', [HabilesController::class, 'validar'])->name('validar');
    Route::post('/crear-ingreso', [HabilesController::class, 'crear_ingreso'])->name('crear.ingreso');
    Route::get('/empresas-apoderadas/{cedrep}', [HabilesController::class, 'empresas_apoderadas'])->name('empresas.apoderadas');
    Route::post('/ficha', [HabilesController::class, 'ficha'])->name('ficha');
    Route::get('/buscar-empresa/{nit}', [HabilesController::class, 'buscar_empresa'])->name('buscar.empresa');
    Route::get('/imprimir2-ficha/{cedrep}', [HabilesController::class, 'imprimir2_ficha'])->name('imprimir2.ficha');
    Route::post('/cargue-masivo', [HabilesController::class, 'cargue_masivo'])->name('cargue.masivo');
    Route::get('/exportar-lista', [HabilesController::class, 'exportar_lista'])->name('exportar.lista');
    Route::get('/exportar-pdf', [HabilesController::class, 'exportar_pdf'])->name('exportar.pdf');
    Route::get('/lista-habiles', [HabilesController::class, 'lista_habiles'])->name('lista.habiles');
    Route::post('/remove-habil', [HabilesController::class, 'remove_habil'])->name('remove.habil');
    Route::get('/exportar-habiles', [HabilesController::class, 'exportar_habiles'])->name('exportar.habiles');
});

// Rutas de Recepción
Route::middleware(['auth'])->prefix('recepcion')->name('recepcion.')->group(function () {
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
    Route::post('/crear-asistencia', [RecepcionController::class, 'crearAsistencia'])->name('crear.asistencia');
    Route::post('/rechazo', [RecepcionController::class, 'rechazo'])->name('rechazo');
    Route::post('/revocar-poder', [RecepcionController::class, 'revocarPoder'])->name('revocar.poder');
    Route::get('/imprimir-ficha/{cedrep}', [RecepcionController::class, 'imprimir_ficha'])->name('imprimir.ficha');
    Route::post('/ficha', [RecepcionController::class, 'ficha'])->name('ficha');
    Route::get('/identify-asistentes', [RecepcionController::class, 'identifyAsistentes'])->name('identify.asistentes');
});

// Rutas de Rechazos
Route::middleware(['auth'])->prefix('rechazos')->name('rechazos.')->group(function () {
    Route::get('/', [RechazosController::class, 'index'])->name('index');
    Route::get('/listar', [RechazosController::class, 'listar'])->name('listar');
    Route::post('/cargue-masivo', [RechazosController::class, 'cargue_masivo'])->name('cargue.masivo');
    Route::post('/remove-rechazo', [RechazosController::class, 'removeRechazo'])->name('remove.rechazo');
    Route::get('/buscar-criterios', [RechazosController::class, 'buscarCriterios'])->name('buscar.criterios');
    Route::post('/save-rechazo', [RechazosController::class, 'saveRechazo'])->name('save.rechazo');
    Route::post('/detail', [RechazosController::class, 'detail'])->name('detail');
});

// Rutas de Reportes
Route::middleware(['auth'])->prefix('reportes')->name('reportes.')->group(function () {
    Route::get('/', [ReportesController::class, 'index'])->name('index');
    Route::get('/listar', [ReportesController::class, 'listar'])->name('listar');
    Route::get('/reporte-nuevo', [ReportesController::class, 'reporte_nuevo'])->name('nuevo');
    Route::get('/reporte-aplicativo', [ReportesController::class, 'reporte_aplicativo'])->name('aplicativo');
    Route::get('/reporte-empresa/{nit}', [ReportesController::class, 'reporte_empresa'])->name('empresa');
    Route::get('/reporte-quorum-completo', [ReportesController::class, 'reporte_quorum_completo'])->name('quorum.completo');
    Route::get('/reporte-asistencias', [ReportesController::class, 'reporte_asistencias'])->name('asistencias');
    Route::get('/reporte-poderes', [ReportesController::class, 'reporte_poderes'])->name('poderes');
    Route::get('/reporte-rechazos', [ReportesController::class, 'reporte_rechazos'])->name('rechazos');
    Route::get('/descargar/{filename}', [ReportesController::class, 'descargar'])->name('descargar');

    // Rutas para Acta de Poderes
    Route::post('/acta-poderes/generar', [\App\Services\Reportes\ActaPoderesController::class, 'generar'])->name('acta.poderes.generar');
    Route::post('/acta-poderes/datos', [\App\Services\Reportes\ActaPoderesController::class, 'datos'])->name('acta.poderes.datos');
    Route::post('/acta-poderes/estadisticas', [\App\Services\Reportes\ActaPoderesController::class, 'estadisticas'])->name('acta.poderes.estadisticas');
    Route::post('/acta-poderes/exportar-excel', [\App\Services\Reportes\ActaPoderesController::class, 'exportarExcel'])->name('acta.poderes.exportar.excel');

    // Rutas para Asistencias
    Route::post('/asistencias/generar', [\App\Services\Reportes\AsistenciasController::class, 'generar'])->name('asistencias.generar');
    Route::post('/asistencias/generar-por-asamblea', [\App\Services\Reportes\AsistenciasController::class, 'generarPorAsamblea'])->name('asistencias.generar.asamblea');
    Route::post('/asistencias/estadisticas', [\App\Services\Reportes\AsistenciasController::class, 'estadisticas'])->name('asistencias.estadisticas');
    Route::post('/asistencias/preview', [\App\Services\Reportes\AsistenciasController::class, 'preview'])->name('asistencias.preview');
    Route::post('/asistencias/verificar-datos', [\App\Services\Reportes\AsistenciasController::class, 'verificarDatos'])->name('asistencias.verificar.datos');

    // Rutas para Cartera
    Route::post('/cartera/generar', [\App\Services\Reportes\CarteraController::class, 'generar'])->name('cartera.generar');
    Route::post('/cartera/generar-por-asamblea', [\App\Services\Reportes\CarteraController::class, 'generarPorAsamblea'])->name('cartera.generar.asamblea');
    Route::post('/cartera/estadisticas', [\App\Services\Reportes\CarteraController::class, 'estadisticas'])->name('cartera.estadisticas');
    Route::post('/cartera/preview', [\App\Services\Reportes\CarteraController::class, 'preview'])->name('cartera.preview');
    Route::post('/cartera/buscar', [\App\Services\Reportes\CarteraController::class, 'buscar'])->name('cartera.buscar');
    Route::post('/cartera/exportar-busqueda', [\App\Services\Reportes\CarteraController::class, 'exportarBusqueda'])->name('cartera.exportar.busqueda');
    Route::post('/cartera/verificar-datos', [\App\Services\Reportes\CarteraController::class, 'verificarDatos'])->name('cartera.verificar.datos');
});

// Rutas de Representantes
Route::middleware(['auth'])->prefix('representantes')->name('representantes.')->group(function () {
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

// Rutas de Trabajadores
Route::middleware(['auth'])->prefix('trabajadores')->name('trabajadores.')->group(function () {
    Route::get('/', [TrabajadoresController::class, 'index'])->name('index');
    Route::get('/listar', [TrabajadoresController::class, 'listar'])->name('listar');
    Route::post('/cargue-masivo', [TrabajadoresController::class, 'cargue_masivo'])->name('cargue.masivo');
    Route::post('/crear', [TrabajadoresController::class, 'crear'])->name('crear');
    Route::post('/save-trabajador', [TrabajadoresController::class, 'saveTrabajador'])->name('save');
    Route::delete('/eliminar', [TrabajadoresController::class, 'eliminar'])->name('eliminar');
    Route::get('/exportar-lista', [TrabajadoresController::class, 'exportar_lista'])->name('exportar.lista');
    Route::get('/buscar/{cedula}', [TrabajadoresController::class, 'buscar'])->name('buscar');
    Route::get('/detalle/{id}', [TrabajadoresController::class, 'detalle'])->name('detalle');
    Route::put('/{id}', [TrabajadoresController::class, 'actualizar'])->name('actualizar');
    Route::get('/validar/{cedula}', [TrabajadoresController::class, 'validar'])->name('validar');
    Route::get('/validar/{cedula}/{nittra}', [TrabajadoresController::class, 'validar'])->name('validar.completo');
});

// Rutas de Usuarios
Route::middleware(['auth'])->prefix('usuarios')->name('usuarios.')->group(function () {
    Route::get('/', [UsuariosController::class, 'listar'])->name('index');
    Route::get('/listar', [UsuariosController::class, 'listar'])->name('listar');
    Route::post('/cargue-masivo', [UsuariosController::class, 'cargueMasivo'])->name('cargue.masivo');
    Route::post('/create-usuario-sisu', [UsuariosController::class, 'createUsuarioSisu'])->name('create.sisu');
    Route::get('/buscar/{cedtra}', [UsuariosController::class, 'buscar'])->name('buscar');
    Route::put('/{cedtra}', [UsuariosController::class, 'actualizar'])->name('actualizar');
    Route::delete('/{cedtra}', [UsuariosController::class, 'eliminar'])->name('eliminar');
    Route::put('/{cedtra}/estado', [UsuariosController::class, 'cambiarEstado'])->name('cambiar.estado');
    Route::put('/{cedtra}/resetear-clave', [UsuariosController::class, 'resetearClave'])->name('resetear.clave');
    Route::post('/validar-credenciales', [UsuariosController::class, 'validarCredenciales'])->name('validar.credenciales');
    Route::get('/estadisticas', [UsuariosController::class, 'estadisticas'])->name('estadisticas');
    Route::get('/exportar-lista', [UsuariosController::class, 'exportarLista'])->name('exportar.lista');
});

// Rutas de Inicio/Dashboard
Route::middleware(['auth'])->prefix('inicio')->name('inicio.')->group(function () {
    Route::get('/', [InicioController::class, 'index'])->name('index');
    Route::get('/dashboard-data', [InicioController::class, 'dashboardData'])->name('dashboard.data');
    Route::get('/grafico-quorum', [InicioController::class, 'graficoQuorum'])->name('grafico.quorum');
    Route::get('/grafico-poderes', [InicioController::class, 'graficoPoderes'])->name('grafico.poderes');
    Route::get('/actividades-recientes', [InicioController::class, 'actividadesRecientes'])->name('actividades.recientes');
    Route::get('/resumen-estados', [InicioController::class, 'resumenEstados'])->name('resumen.estados');
});

// Ruta principal (redirige a inicio)
Route::get('/', function () {
    return redirect()->route('inicio.index');
});

// Ruta para descarga de reportes generados
Route::middleware(['auth'])->get('/download_reporte/{filename}', function ($filename) {
    $path = storage_path("app/temp/{$filename}");

    if (!file_exists($path)) {
        abort(404, 'Archivo no encontrado');
    }

    return response()->download($path);
})->name('download.reporte');

// Rutas de prueba
Route::get('/test-auth', function () {
    if (auth()->check()) {
        return 'Usuario autenticado: ' . auth()->user()->nombre_completo;
    }
    return 'No autenticado';
})->middleware('auth');

//require __DIR__ . '/web/mercurio.php';
