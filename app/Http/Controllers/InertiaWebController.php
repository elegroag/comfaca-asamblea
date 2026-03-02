<?php

namespace App\Http\Controllers;

use App\Models\AsaAsamblea;
use App\Models\Task;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InertiaWebController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function dashboard()
    {
        $this->initialize('primary');

        $user = auth()->user();

        // Obtener estadísticas de tareas del usuario
        $stats = [
            'totalTasks' => Task::where('usuario_sisu_id', $user->id)->count(),
            'completedTasks' => Task::where('usuario_sisu_id', $user->id)->where('completed', true)->count(),
            'pendingTasks' => Task::where('usuario_sisu_id', $user->id)->where('completed', false)->count(),
        ];

        // Dual response: HTML/Inertia o JSON
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Dashboard loaded successfully',
                'data' => $stats
            ]);
        }

        return Inertia::render('Dashboard', [
            'title' => 'Dashboard',
            'stats' => $stats
        ]);
    }

    /**
     * Verificar permisos de usuario
     */
    private function tienePermiso($rol)
    {
        $user = Auth::user();
        if (!$user) return false;

        return in_array($user->usuario, ['admin', 'superadmin']) ||
            str_contains(strtolower($user->usuario), 'admin');
    }

    /**
     * Vista principal de poderes
     */
    public function poderes()
    {
        // Verificar permisos
        if (!Auth::user() || !$this->tienePermiso('admin')) {
            abort(403, 'No tiene permisos para acceder a esta sección');
        }

        return Inertia::render('Poderes', [
            'title' => 'Poderes',
            'itemMenuSidebar' => 2
        ]);
    }

    public function habiles()
    {
        // Verificar permisos
        if (!Auth::user() || !$this->tienePermiso('admin')) {
            abort(403, 'No tiene permisos para acceder a esta sección');
        }

        return Inertia::render('Habiles', [
            'title' => 'Empresas',
            'itemMenuSidebar' => 3,
        ]);
    }

    /**
     * Vista principal de cartera
     */
    public function cartera()
    {
        if (!Auth::user() || !$this->tienePermiso('admin')) {
            abort(403, 'No tiene permisos para acceder a esta sección');
        }

        return Inertia::render('Cartera', [
            'title' => 'Cartera',
            'itemMenuSidebar' => 4
        ]);
    }

    /**
     * Vista principal de trabajadores
     */
    public function trabajadores()
    {
        if (!Auth::user() || !$this->tienePermiso('admin')) {
            abort(403, 'No tiene permisos para acceder a esta sección');
        }

        return Inertia::render('Trabajadores', [
            'title' => 'Trabajadores',
            'itemMenuSidebar' => 6
        ]);
    }

    /**
     * Vista principal de trabajadores
     */
    public function asamblea()
    {
        if (!Auth::user() || !$this->tienePermiso('admin')) {
            abort(403, 'No tiene permisos para acceder a esta sección');
        }

        return Inertia::render('Asamblea', [
            'title' => 'Asamblea',
            'itemMenuSidebar' => 7
        ]);
    }


    /**
     * Vista de consenso
     */
    public function consensos()
    {
        if (!Auth::user() || !$this->tienePermiso('admin')) {
            abort(403, 'No tiene permisos para acceder a esta sección');
        }

        return Inertia::render('Consensos', [
            'titulo' => 'Consensos',
            'itemMenuSidebar' => 9
        ]);
    }

    /**
     * Vista de mesas
     */
    public function mesas()
    {
        if (!Auth::user() || !$this->tienePermiso('admin')) {
            abort(403, 'No tiene permisos para acceder a esta sección');
        }

        return Inertia::render('Mesas', [
            'titulo' => 'Mesas',
            'itemMenuSidebar' => 5
        ]);
    }

    /**
     * Vista de usuarios
     */
    public function usuarios()
    {
        if (!Auth::user() || !$this->tienePermiso('admin')) {
            abort(403, 'No tiene permisos para acceder a esta sección');
        }

        $asamblea = AsaAsamblea::where('estado', 'A')->first();

        return Inertia::render('Usuarios', [
            'asamblea' => $asamblea,
            'titulo' => 'Usuarios',
            'itemMenuSidebar' => 11
        ]);
    }

    /**
     * Vista de novedades
     */
    public function novedades()
    {
        if (!Auth::user() || !$this->tienePermiso('admin')) {
            abort(403, 'No tiene permisos para acceder a esta sección');
        }

        $asamblea = AsaAsamblea::where('estado', 'A')->first();

        return Inertia::render('Novedades', [
            'asamblea' => $asamblea,
            'titulo' => 'Novedades',
            'itemMenuSidebar' => 12
        ]);
    }

    /**
     * Vista de recepcion
     */
    public function recepcion()
    {
        if (!Auth::user() || !$this->tienePermiso('admin')) {
            abort(403, 'No tiene permisos para acceder a esta sección');
        }

        $asamblea = AsaAsamblea::where('estado', 'A')->first();

        return Inertia::render('Recepcion', [
            'asamblea' => $asamblea,
            'titulo' => 'Recepción',
            'itemMenuSidebar' => 1
        ]);
    }

    /**
     * Vista de rechazos
     */
    public function rechazos()
    {
        if (!Auth::user() || !$this->tienePermiso('admin')) {
            abort(403, 'No tiene permisos para acceder a esta sección');
        }

        $asamblea = AsaAsamblea::where('estado', 'A')->first();

        return Inertia::render('Rechazos', [
            'asamblea' => $asamblea,
            'titulo' => 'Rechazos',
            'itemMenuSidebar' => 2
        ]);
    }


    /**
     * Vista de representantes
     */
    public function representantes()
    {
        if (!Auth::user() || !$this->tienePermiso('admin')) {
            abort(403, 'No tiene permisos para acceder a esta sección');
        }

        $asamblea = AsaAsamblea::where('estado', 'A')->first();

        return Inertia::render('Representantes', [
            'asamblea' => $asamblea,
            'titulo' => 'Representantes',
            'itemMenuSidebar' => 3
        ]);
    }

    /**
     * Vista de interventores
     */
    public function interventores()
    {
        if (!Auth::user() || !$this->tienePermiso('admin')) {
            abort(403, 'No tiene permisos para acceder a esta sección');
        }

        $asamblea = AsaAsamblea::where('estado', 'A')->first();

        return Inertia::render('Interventores', [
            'asamblea' => $asamblea,
            'titulo' => 'Interventores',
            'itemMenuSidebar' => 4
        ]);
    }

    public function perfil()
    {
        return Inertia::render('Perfil', [
            'titulo' => 'Perfil',
            'itemMenuSidebar' => 15
        ]);
    }
}
