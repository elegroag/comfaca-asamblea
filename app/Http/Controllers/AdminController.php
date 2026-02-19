<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AsaMesas;
use App\Models\AsaConsenso;
use App\Models\AsaUsuarios;
use App\Models\AsaAsamblea;
use App\Models\UsuarioSisu;
use App\Models\Empresas;
use App\Services\Asamblea\AsambleaService;
use App\Services\MesaService;
use App\Services\UploadFileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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

        return view('admin.index', [
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

        return view('admin.usuarios', [
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

        return view('admin.config', [
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

        return view('admin.mesas', [
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

        return view('admin.consenso', [
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
