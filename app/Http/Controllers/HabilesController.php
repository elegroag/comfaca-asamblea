<?php

namespace App\Http\Controllers;

use App\Models\AsaAsamblea;
use App\Services\Asamblea\AsambleaService;
use App\Services\AsistenciaService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class HabilesController extends Controller
{
    private int $idAsamblea = 0;
    private int $itemMenuSidebar = 3;

    public function __construct(private readonly AsambleaService $asambleaService)
    {
        $this->middleware('auth');
        $this->middleware(function ($request, $next) {
            $this->idAsamblea = (int) $this->asambleaService->getAsambleaActiva();
            return $next($request);
        });
    }

    public function index()
    {
        return view('habiles.index', [
            'titulo' => 'Empresas',
            'itemMenuSidebar' => $this->itemMenuSidebar,
        ]);
    }


    public function imprimir2_ficha(string $cedrep)
    {
        try {
            $asistenciaService = new AsistenciaService($this->idAsamblea, $cedrep);
            $salida = $asistenciaService->fichaData();
            return view('recepcion.imprimir', $salida);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage(),
            ], 500);
        }
    }


    public function exportar_lista(): JsonResponse
    {
        return response()->json([
            'status' => 200,
            'success' => true,
            'file_path' => 'temp/habiles_export_' . now()->format('Y-m-d_H-i-s') . '.csv',
            'msj' => 'Exportación pendiente de integración con librería de reportes.',
        ]);
    }

    public function exportar_pdf(): JsonResponse
    {
        return response()->json([
            'status' => 200,
            'success' => true,
            'file_path' => 'temp/habiles_export_' . now()->format('Y-m-d_H-i-s') . '.pdf',
            'msj' => 'Exportación PDF pendiente de integración con librería de reportes.',
        ]);
    }

    private function mesaDisponible(int $asambleaId = 0): array
    {
        if ($asambleaId === 0) {
            $asambleaId = (int) (AsaAsamblea::where('estado', 'A')->value('id') ?? 0);
        }

        $mesa = DB::selectOne(
            "SELECT asa_mesas.id as mesa_id, asa_mesas.codigo as codigo
            FROM asa_mesas
            LEFT JOIN asa_consenso ON asa_consenso.id = asa_mesas.consenso_id
            WHERE asa_consenso.asamblea_id = ?
            AND asa_mesas.estado IN ('A','P')
            AND asa_consenso.estado = 'A'
            ORDER BY cantidad_votantes ASC
            LIMIT 1",
            [$asambleaId]
        );

        if (!$mesa) {
            return [0, 'N/A'];
        }

        return [(int) $mesa->mesa_id, (string) $mesa->codigo];
    }
}
