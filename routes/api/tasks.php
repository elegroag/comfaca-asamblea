<?php

use App\Http\Controllers\Api\TaskApiController;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| Tasks Routes
|--------------------------------------------------------------------------
|
| Rutas del módulo de Tasks (tareas)
|
*/

Route::middleware(['auth.api'])->group(function () {
    // Rutas adicionales para Tasks
    Route::post('/tasks/{id}/toggle-complete', [TaskApiController::class, 'toggleComplete']);
    Route::get('/tasks/completed', [TaskApiController::class, 'completed']);
    Route::get('/tasks/pending', [TaskApiController::class, 'pending']);
    Route::get('/tasks/search', [TaskApiController::class, 'search']);
    Route::get('/tasks/stats', [TaskApiController::class, 'stats']);
});
