<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Carteras;
use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\Rechazos;
use App\Services\Asamblea\AsambleaService;
use App\Services\Empresas\HabilEmpresaService;
use App\Services\Empresas\RegistroEmpresaService;
use App\Services\Carteras\CarteraReportarService;
use App\Services\Empresas\BuscarEmpresaService;
use App\Services\UploadFileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CarteraController extends Controller
{
    protected $itemMenuSidebar = 4;
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
     * Vista principal de cartera
     */
    public function index()
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        return Inertia::render('Cartera', [
            'title' => 'Cartera',
            'itemMenuSidebar' => $this->itemMenuSidebar
        ]);
    }
}
