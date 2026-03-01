<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Api\UsuarioApiController;
use App\Http\Controllers\Api\TestApiController;


use App\Models\UsuarioSisu;

/*
|--------------------------------------------------------------------------
| API Routes - Sanctum Authentication
|--------------------------------------------------------------------------
|
| Aquí se definen las rutas de la API que usarán autenticación con Sanctum.
| Estas rutas son ideales para consumir desde aplicaciones móviles,
| SPAs externas, o servicios de terceros.
|
*/

// Rutas públicas (no requieren autenticación)
Route::post('sanctum/token', function (Request $request) {
  $request->validate([
    'email' => 'required|email',
    'password' => 'required',
    'device_name' => 'required',
  ]);

  $user = UsuarioSisu::where('email', $request->email)->first();

  if (! $user || ! Hash::check($request->password, $user->password)) {
    return response()->json([
      'success' => false,
      'message' => 'The provided credentials are incorrect.'
    ], 401);
  }

  return response()->json([
    'success' => true,
    'token' => $user->createToken($request->device_name)->plainTextToken,
    'user' => [
      'id' => $user->id,
      'name' => $user->name,
      'email' => $user->email,
    ]
  ]);
});


Route::middleware(['auth.api'])->group(function () {
  // Información del usuario autenticado
  Route::get('/user', function (Request $request) {
    return response()->json([
      'success' => true,
      'user' => [
        'id' => $request->user()->id,
        'name' => $request->user()->name,
        'email' => $request->user()->email,
        'email_verified_at' => $request->user()->email_verified_at,
        'created_at' => $request->user()->created_at,
      ]
    ]);
  });

  // Logout (revocar token)
  Route::post('/logout', function (Request $request) {
    // Revocar el token actual
    $request->user()->currentAccessToken()->delete();

    return response()->json([
      'success' => true,
      'message' => 'Successfully logged out'
    ]);
  });

  // Revocar todos los tokens del usuario
  Route::post('/logout/all', function (Request $request) {
    // Revocar todos los tokens del usuario
    $request->user()->tokens()->delete();

    return response()->json([
      'success' => true,
      'message' => 'All tokens successfully revoked'
    ]);
  });

  // Listar tokens del usuario
  Route::get('/tokens', function (Request $request) {
    $tokens = $request->user()->tokens->map(function ($token) {
      return [
        'id' => $token->id,
        'name' => $token->name,
        'abilities' => $token->abilities,
        'last_used_at' => $token->last_used_at,
        'created_at' => $token->created_at,
        'expires_at' => $token->expires_at,
      ];
    });

    return response()->json([
      'success' => true,
      'tokens' => $tokens
    ]);
  });

  // Recursos de la API
  Route::apiResource('/users', UsuarioApiController::class);
});


// Importar archivos de rutas individuales
require __DIR__ . '/api/tasks.php';
require __DIR__ . '/api/poderes.php';
require __DIR__ . '/api/interventores.php';
require __DIR__ . '/api/mesas.php';
require __DIR__ . '/api/novedades.php';
require __DIR__ . '/api/habiles.php';
require __DIR__ . '/api/recepcion.php';
require __DIR__ . '/api/rechazos.php';
require __DIR__ . '/api/reportes.php';
require __DIR__ . '/api/representantes.php';
require __DIR__ . '/api/trabajadores.php';
require __DIR__ . '/api/usuarios.php';

// Ruta de prueba
Route::get('/test', [TestApiController::class, 'index']);
require __DIR__ . '/api/inicio.php';
require __DIR__ . '/api/misc.php';

/*
|--------------------------------------------------------------------------
| Ejemplos de uso con curl
|--------------------------------------------------------------------------
|
# Obtener token:
curl -X POST http://localhost:9000/api/sanctum/token \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password", "device_name": "iPhone"}'

# Usar token:
curl -X GET http://localhost:9000/api/user \
  -H "Authorization: Bearer TOKEN_AQUI"

# Logout:
curl -X POST http://localhost:9000/api/logout \
  -H "Authorization: Bearer TOKEN_AQUI"

# Tasks API Examples:
# Obtener todas las tareas:
curl -X GET http://localhost:9000/api/tasks \
  -H "Authorization: Bearer TOKEN_AQUI"

# Crear nueva tarea:
curl -X POST http://localhost:9000/api/tasks \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"title": "Nueva tarea", "description": "Descripción de la tarea"}'

# Marcar tarea como completada:
curl -X POST http://localhost:9000/api/tasks/1/toggle-complete \
  -H "Authorization: Bearer TOKEN_AQUI"

# Obtener estadísticas de tareas:
curl -X GET http://localhost:9000/api/tasks/stats \
  -H "Authorization: Bearer TOKEN_AQUI"

# Poderes API Examples:
# Obtener todos los poderes:
curl -X GET http://localhost:9000/api/poderes/listar \
  -H "Authorization: Bearer TOKEN_AQUI"

# Obtener detalle de poder:
curl -X GET http://localhost:9000/api/poderes/detalle/DOC123 \
  -H "Authorization: Bearer TOKEN_AQUI"

# Buscar poder:
curl -X GET "http://localhost:9000/api/poderes/buscar?apoderado_nit=900123456" \
  -H "Authorization: Bearer TOKEN_AQUI"

# Activar poder:
curl -X POST http://localhost:9000/api/poderes/activar/DOC123 \
  -H "Authorization: Bearer TOKEN_AQUI"

# Cargue masivo:
curl -X POST http://localhost:9000/api/poderes/cargue-masivo \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -F "file=@poderes.csv"

*/
