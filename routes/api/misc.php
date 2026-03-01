<?php

/*
|--------------------------------------------------------------------------
| Miscellaneous Routes
|--------------------------------------------------------------------------
|
| Rutas misceláneas y utilitarias
|
*/

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