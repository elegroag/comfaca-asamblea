<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\UsuarioSisu;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class AuthController extends Controller
{

    /** Vista de login */
    public function login()
    {
        // Si ya está autenticado, redirigir al dashboard
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Login');
    }

    /** Vista de registro */
    public function register()
    {
        // Si ya está autenticado, redirigir al dashboard
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }
        return Inertia::render('Auth/Register');
    }

    /** Procesar login */
    public function authenticate(LoginRequest $request)
    {
        // Usar el método getCredentials() del LoginRequest
        $credentials = $request->getCredentials();
        // Intentar autenticación
        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            $user = Auth::user();

            // Verificar si el usuario está activo usando el campo is_active
            if ($user->is_active !== 'S') {
                Auth::logout();
                Session::invalidate();
                Session::regenerateToken();

                // Si es una petición AJAX, devolver error JSON
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Su cuenta está inactiva. Contacte al administrador.',
                        'errors' => [
                            'usuario' => 'Su cuenta está inactiva. Contacte al administrador.'
                        ]
                    ], 403);
                }

                return back()
                    ->with('error', 'Su cuenta está inactiva. Contacte al administrador.')
                    ->withInput($request->except('password'));
            }

            // Si es una petición AJAX, devolver JSON
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Login exitoso',
                    'user' => [
                        'id' => $user->id,
                        'usuario' => $user->usuario,
                        'nombre' => $user->nombre_completo,
                        'email' => $user->email,
                        'is_active' => $user->is_active,
                    ],
                    'redirect' => route('dashboard')
                ]);
            }

            return redirect()->intended(route('dashboard'));
        }

        // Si la autenticación falla
        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Las credenciales no coinciden con nuestros registros.',
                'errors' => [
                    'usuario' => 'Las credenciales no coinciden con nuestros registros.'
                ]
            ], 401);
        }

        return back()
            ->with('error', 'Las credenciales no coinciden con nuestros registros.')
            ->withInput($request->except('password'));
    }

    /** Procesar registro */
    public function store(RegisterRequest $request)
    {
        try {
            // Usar el método getUserData() del RegisterRequest
            $userData = $request->getUserData();

            // Crear usuario
            $user = UsuarioSisu::create($userData);

            // Autenticar automáticamente
            Auth::login($user);

            // Si es una petición AJAX, devolver JSON
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Registro exitoso',
                    'user' => [
                        'id' => $user->id,
                        'usuario' => $user->usuario,
                        'nombre' => $user->nombre_completo,
                        'email' => $user->email,
                        'is_active' => $user->is_active,
                    ],
                    'redirect' => route('dashboard')
                ]);
            }

            return redirect()->route('dashboard');
        } catch (\Exception $e) {
            // Si hay un error (ej: duplicado)
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al registrar el usuario: ' . $e->getMessage(),
                    'errors' => [
                        'usuario' => 'El usuario ya existe o hay un error en los datos.'
                    ]
                ], 422);
            }

            return back()
                ->with('error', 'Error al registrar el usuario: ' . $e->getMessage())
                ->withInput($request->except('password'));
        }
    }

    /** Cerrar sesión */
    public function logout()
    {
        Auth::logout();
        Session::invalidate();
        Session::regenerateToken();
        return redirect()->route('login');
    }

    /** Obtener usuario autenticado (API) */
    public function me(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado'
            ], 401);
        }

        $user = Auth::user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'usuario' => $user->usuario,
                'nombre' => $user->nombre_completo,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'cedtra' => $user->cedtra,
            ]
        ]);
    }

    /** Verificar estado de autenticación */
    public function check(Request $request)
    {
        return response()->json([
            'authenticated' => Auth::check(),
            'user' => Auth::check() ? [
                'id' => Auth::user()->id,
                'usuario' => Auth::user()->usuario,
                'nombre' => Auth::user()->nombre_completo,
            ] : null
        ]);
    }
}
