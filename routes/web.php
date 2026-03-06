<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\InertiaWebController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

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

Route::get('/login', [AuthController::class, 'login'])->name('login');
Route::post('/login', [AuthController::class, 'authenticate'])->name('login.authenticate');
Route::get('/register', [AuthController::class, 'register'])->name('register');
Route::post('/register', [AuthController::class, 'store'])->name('register.store');
Route::get('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

Route::get('/dashboard', [InertiaWebController::class, 'dashboard'])->middleware('auth')->name('dashboard');
Route::get('/recepcion', [InertiaWebController::class, 'recepcion'])->middleware('auth')->name('recepcion.index');

Route::get('/poderes', [InertiaWebController::class, 'poderes'])->middleware('auth')->name('poderes.index');
Route::get('/habiles', [InertiaWebController::class, 'habiles'])->middleware('auth')->name('habiles.index');
Route::get('/cartera', [InertiaWebController::class, 'cartera'])->middleware('auth')->name('cartera.index');
Route::get('/trabajadores', [InertiaWebController::class, 'trabajadores'])->middleware('auth')->name('trabajadores.index');
Route::get('/asamblea', [InertiaWebController::class, 'asamblea'])->middleware('auth')->name('asamblea.index');
Route::get('/consensos', [InertiaWebController::class, 'consensos'])->middleware('auth')->name('consensos.index');
Route::get('/mesas', [InertiaWebController::class, 'mesas'])->middleware('auth')->name('mesas.index');
Route::get('/usuarios', [InertiaWebController::class, 'usuarios'])->middleware('auth')->name('usuarios.index');
Route::get('/interventores', [InertiaWebController::class, 'interventores'])->middleware('auth')->name('interventores.index');
Route::get('/representantes', [InertiaWebController::class, 'representantes'])->middleware('auth')->name('representantes.index');
Route::get('/rechazos', [InertiaWebController::class, 'rechazos'])->middleware('auth')->name('rechazos.index');
Route::get('/novedades', [InertiaWebController::class, 'novedades'])->middleware('auth')->name('novedades.index');
Route::get('/perfil', [InertiaWebController::class, 'perfil'])->middleware('auth')->name('perfil.index');
