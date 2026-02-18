<?php

namespace App\Http\Controllers;

use App\Models\Poderes;
use App\Models\Empresas;
use App\Models\AsaAsamblea;
use App\Models\AsaTrabajadores;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PoderesController extends Controller
{
    function initialize() {}

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
     * Obtener asamblea activa
     */
    private function getIdAsambleaActiva()
    {
        // Por ahora usamos la primera asamblea activa
        $asamblea = AsaAsamblea::where('estado', 'A')->first();
        return $asamblea ? $asamblea->id : 1;
    }

    /**
     * Vista principal de poderes
     */
    public function index()
    {
        $this->initialize('primary');

        // Verificar permisos
        if (!Auth::user() || !$this->tienePermiso('admin')) {
            abort(403, 'No tiene permisos para acceder a esta sección');
        }

        return Inertia::render('Poderes', [
            'title' => 'Poderes',
            'itemMenuSidebar' => 2
        ]);
    }
}
