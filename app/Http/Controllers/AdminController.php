<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AsaAsamblea;
use App\Services\Asamblea\AsambleaService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminController extends Controller
{
    protected $itemMenuSidebar = 5;
    protected $idAsamblea;

    public function __construct()
    {
        $this->middleware('auth');
        $this->idAsamblea = AsambleaService::getAsambleaActiva();
    }

    /**
     * Verificar permisos de administrador
     */
    protected function verificarPermisos($controller = '')
    {
        $user = Auth::user();
        if (!$user || !AsambleaService::isAdmin($user->role, $controller)) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        return null;
    }

    /**
     * Vista principal de administración
     */
    public function index()
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        return Inertia::render('Asamblea', [
            'titulo' => 'Administración',
            'itemMenuSidebar' => $this->itemMenuSidebar
        ]);
    }



    /**
     * Vista de usuarios
     */
    public function usuarios()
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        $asamblea = AsaAsamblea::where('estado', 'A')->first();

        return Inertia::render('Usuarios', [
            'asamblea' => $asamblea,
            'titulo' => 'Usuarios',
            'itemMenuSidebar' => $this->itemMenuSidebar
        ]);
    }


    /**
     * Vista de configuración
     */
    public function config()
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        return Inertia::render('Config', [
            'titulo' => 'Configuración',
            'itemMenuSidebar' => $this->itemMenuSidebar
        ]);
    }


    /**
     * Vista de mesas
     */
    public function mesas()
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        return Inertia::render('Mesas', [
            'titulo' => 'Mesas',
            'itemMenuSidebar' => $this->itemMenuSidebar
        ]);
    }

    /**
     * Vista de consenso
     */
    public function consenso()
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        return Inertia::render('Consenso', [
            'titulo' => 'Consenso',
            'itemMenuSidebar' => $this->itemMenuSidebar
        ]);
    }

    /**
     * Obtener array de roles
     */
    private function getRolesArray(): array
    {
        return [
            'SuperAdmin' => 'Super Administrador',
            'Poderes' => 'Poderes',
            'Recepción' => 'Recepción',
            'Apoyo' => 'Apoyo'
        ];
    }
}
