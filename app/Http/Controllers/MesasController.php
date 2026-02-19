<?php

namespace App\Http\Controllers;

use App\Services\Asamblea\AsambleaService;
use Illuminate\Support\Facades\Auth;

class MesasController extends Controller
{
    protected AsambleaService $asambleaService;
    protected ?int $idAsamblea;
    protected ?string $cedtra;

    public function __construct(AsambleaService $asambleaService)
    {
        $this->idAsamblea = $this->asambleaService->getAsambleaActiva();
    }

    /**
     * Mostrar vista principal de mesas
     */
    public function index()
    {
        return view('mesas.index', [
            'titulo' => 'Mesas de Votación',
            'itemMenuSidebar' => 5
        ]);
    }
}
