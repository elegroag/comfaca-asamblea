<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UsuarioApiController;

/*
|--------------------------------------------------------------------------
| Usuarios Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Usuarios
|
*/

Route::middleware(['auth.api'])->prefix('usuarios')->name('usuarios.')->group(function () {
    Route::get('/', [UsuarioApiController::class, 'index'])->name('index');
    Route::get('/listar', [UsuarioApiController::class, 'index'])->name('listar');
    Route::post('/', [UsuarioApiController::class, 'store'])->name('store');
    Route::get('/{id}', [UsuarioApiController::class, 'show'])->name('show');
    Route::put('/{id}', [UsuarioApiController::class, 'update'])->name('update');
    Route::delete('/{id}', [UsuarioApiController::class, 'destroy'])->name('destroy');
    Route::get('/profile', [UsuarioApiController::class, 'profile'])->name('profile');
    Route::put('/profile', [UsuarioApiController::class, 'updateProfile'])->name('update.profile');
});
