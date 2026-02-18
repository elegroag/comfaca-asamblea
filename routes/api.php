<?php

use App\Http\Controllers\API\PoderesApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\API\UsuarioApiController;
use App\Http\Controllers\API\TaskApiController;

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


  // Rutas adicionales para Tasks
  Route::post('/tasks/{id}/toggle-complete', [TaskApiController::class, 'toggleComplete']);
  Route::get('/tasks/completed', [TaskApiController::class, 'completed']);
  Route::get('/tasks/pending', [TaskApiController::class, 'pending']);
  Route::get('/tasks/search', [TaskApiController::class, 'search']);
  Route::get('/tasks/stats', [TaskApiController::class, 'stats']);

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
