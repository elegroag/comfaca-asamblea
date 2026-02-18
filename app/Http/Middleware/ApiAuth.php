<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\UsuarioSisu;

class ApiAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Para esta prueba, solo permitir peticiones con token Bearer válido
        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            $accessToken = PersonalAccessToken::findToken($token);

            if (!$accessToken || !$accessToken->tokenable) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token de Sanctum inválido o expirado',
                    'debug' => 'sanctum_auth_failed'
                ], 401);
            }

            // Continuar sin establecer auth para evitar recursión
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Se requiere token Bearer',
                'debug' => 'no_token'
            ], 401);
        }

        return $next($request);
    }
}
