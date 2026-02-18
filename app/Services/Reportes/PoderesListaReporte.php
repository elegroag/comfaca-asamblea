<?php

namespace App\Services\Reportes;

use App\Models\Poderes;
use App\Models\Empresas;
use App\Services\Reportes\Libs\ReportesHelper;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PoderesListaReporte
{
    /**
     * Generar reporte de poderes en Excel
     */
    public function generar(int $asambleaId): array
    {
        // Obtener datos de poderes con información de empresas
        $data = $this->obtenerDatosPoderes($asambleaId);

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron poderes para la asamblea especificada'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_exportar_poderes';

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::convertirDatosAExcel($name, $data);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($data),
            'asamblea_id' => $asambleaId
        ];
    }

    /**
     * Obtener datos de poderes con información de empresas
     */
    private function obtenerDatosPoderes(int $asambleaId): array
    {
        return Poderes::select([
            'poderes.nit1',
            'apoderado.razsoc as razsoc1',
            'apoderado.cedrep as cedrep1',
            'apoderado.repleg as repleg1',
            'poderes.nit2',
            'poderdante.razsoc as razsoc2',
            'poderdante.cedrep as cedrep2',
            'poderdante.repleg as repleg2',
            'poderes.estado',
            'poderes.fecha',
            'poderes.radicado'
        ])
        ->leftJoin('empresas as apoderado', function($join) use ($asambleaId) {
            $join->on('apoderado.nit', '=', 'poderes.nit1')
                 ->where('apoderado.asamblea_id', '=', $asambleaId);
        })
        ->leftJoin('empresas as poderdante', function($join) use ($asambleaId) {
            $join->on('poderdante.nit', '=', 'poderes.nit2')
                 ->where('poderdante.asamblea_id', '=', $asambleaId);
        })
        ->where('poderes.asamblea_id', $asambleaId)
        ->orderBy('poderes.fecha', 'desc')
        ->get()
        ->map(function ($poder) {
            return [
                'Nit apoderado' => $poder->nit1,
                'Razon social apoderado' => $poder->razsoc1,
                'Ide. Apoderado' => $poder->cedrep1,
                'Representante legal apoderado' => $poder->repleg1,
                'Nit poderdante' => $poder->nit2,
                'Razon social poderdante' => $poder->razsoc2,
                'Ide. Poderdante' => $poder->cedrep2,
                'Representante legal poderdante' => $poder->repleg2,
                'Estado_poder' => $poder->estado,
                'Fecha' => $poder->fecha,
                'radicado' => $poder->radicado
            ];
        })
        ->toArray();
    }

    /**
     * Generar reporte de poderes con filtros
     */
    public function generarConFiltros(int $asambleaId, array $filtros = []): array
    {
        // Obtener datos con filtros aplicados
        $data = $this->obtenerDatosPoderesConFiltros($asambleaId, $filtros);

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron poderes con los filtros especificados'
            ];
        }

        // Generar nombre de archivo con sufijo de filtros
        $sufijo = !empty($filtros) ? '_filtrado' : '';
        $name = time() . '_exportar_poderes' . $sufijo;

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::convertirDatosAExcel($name, $data);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($data),
            'asamblea_id' => $asambleaId,
            'filtros_aplicados' => $filtros
        ];
    }

    /**
     * Obtener datos de poderes con filtros aplicados
     */
    private function obtenerDatosPoderesConFiltros(int $asambleaId, array $filtros): array
    {
        $query = Poderes::select([
            'poderes.nit1',
            'apoderado.razsoc as razsoc1',
            'apoderado.cedrep as cedrep1',
            'apoderado.repleg as repleg1',
            'poderes.nit2',
            'poderdante.razsoc as razsoc2',
            'poderdante.cedrep as cedrep2',
            'poderdante.repleg as repleg2',
            'poderes.estado',
            'poderes.fecha',
            'poderes.radicado'
        ])
        ->leftJoin('empresas as apoderado', function($join) use ($asambleaId) {
            $join->on('apoderado.nit', '=', 'poderes.nit1')
                 ->where('apoderado.asamblea_id', '=', $asambleaId);
        })
        ->leftJoin('empresas as poderdante', function($join) use ($asambleaId) {
            $join->on('poderdante.nit', '=', 'poderes.nit2')
                 ->where('poderdante.asamblea_id', '=', $asambleaId);
        })
        ->where('poderes.asamblea_id', $asambleaId);

        // Aplicar filtros
        if (!empty($filtros['estado'])) {
            $query->where('poderes.estado', $filtros['estado']);
        }

        if (!empty($filtros['nit1'])) {
            $query->where('poderes.nit1', 'like', '%' . $filtros['nit1'] . '%');
        }

        if (!empty($filtros['nit2'])) {
            $query->where('poderes.nit2', 'like', '%' . $filtros['nit2'] . '%');
        }

        if (!empty($filtros['razsoc1'])) {
            $query->where('apoderado.razsoc', 'like', '%' . $filtros['razsoc1'] . '%');
        }

        if (!empty($filtros['razsoc2'])) {
            $query->where('poderdante.razsoc', 'like', '%' . $filtros['razsoc2'] . '%');
        }

        if (!empty($filtros['fecha_inicio'])) {
            $query->where('poderes.fecha', '>=', $filtros['fecha_inicio']);
        }

        if (!empty($filtros['fecha_fin'])) {
            $query->where('poderes.fecha', '<=', $filtros['fecha_fin']);
        }

        if (!empty($filtros['radicado'])) {
            $query->where('poderes.radicado', 'like', '%' . $filtros['radicado'] . '%');
        }

        return $query->orderBy('poderes.fecha', 'desc')
            ->get()
            ->map(function ($poder) {
                return [
                    'Nit apoderado' => $poder->nit1,
                    'Razon social apoderado' => $poder->razsoc1,
                    'Ide. Apoderado' => $poder->cedrep1,
                    'Representante legal apoderado' => $poder->repleg1,
                    'Nit poderdante' => $poder->nit2,
                    'Razon social poderdante' => $poder->razsoc2,
                    'Ide. Poderdante' => $poder->cedrep2,
                    'Representante legal poderdante' => $poder->repleg2,
                    'Estado_poder' => $poder->estado,
                    'Fecha' => $poder->fecha,
                    'radicado' => $poder->radicado
                ];
            })
            ->toArray();
    }

    /**
     * Obtener estadísticas de poderes
     */
    public function obtenerEstadisticas(int $asambleaId): array
    {
        $totalPoderes = Poderes::where('asamblea_id', $asambleaId)->count();
        
        $aprobados = Poderes::where('asamblea_id', $asambleaId)
                          ->where('estado', 'A')
                          ->count();

        $rechazados = Poderes::where('asamblea_id', $asambleaId)
                            ->where('estado', 'R')
                            ->count();

        $conRadicado = Poderes::where('asamblea_id', $asambleaId)
                            ->whereNotNull('radicado')
                            ->where('radicado', '<>', '')
                            ->count();

        // Estadísticas por mes
        $porMes = Poderes::selectRaw('DATE_FORMAT(fecha, "%Y-%m") as mes, COUNT(*) as count')
            ->where('asamblea_id', $asambleaId)
            ->groupBy('mes')
            ->orderBy('mes')
            ->pluck('count', 'mes')
            ->toArray();

        return [
            'total_poderes' => $totalPoderes,
            'aprobados' => $aprobados,
            'rechazados' => $rechazados,
            'con_radicado' => $conRadicado,
            'sin_radicado' => $totalPoderes - $conRadicado,
            'porcentaje_aprobados' => $totalPoderes > 0 ? round(($aprobados / $totalPoderes) * 100, 2) : 0,
            'porcentaje_rechazados' => $totalPoderes > 0 ? round(($rechazados / $totalPoderes) * 100, 2) : 0,
            'por_mes' => $porMes,
            'asamblea_id' => $asambleaId
        ];
    }

    /**
     * Obtener vista previa de datos
     */
    public function obtenerDatosPreview(int $asambleaId, int $limit = 10, array $filtros = []): array
    {
        $query = Poderes::select([
            'poderes.nit1',
            'apoderado.razsoc as razsoc1',
            'apoderado.cedrep as cedrep1',
            'poderes.nit2',
            'poderdante.razsoc as razsoc2',
            'poderdante.cedrep as cedrep2',
            'poderes.estado',
            'poderes.fecha',
            'poderes.radicado'
        ])
        ->leftJoin('empresas as apoderado', function($join) use ($asambleaId) {
            $join->on('apoderado.nit', '=', 'poderes.nit1')
                 ->where('apoderado.asamblea_id', '=', $asambleaId);
        })
        ->leftJoin('empresas as poderdante', function($join) use ($asambleaId) {
            $join->on('poderdante.nit', '=', 'poderes.nit2')
                 ->where('poderdante.asamblea_id', '=', $asambleaId);
        })
        ->where('poderes.asamblea_id', $asambleaId);

        // Aplicar filtros si se proporcionan
        if (!empty($filtros['estado'])) {
            $query->where('poderes.estado', $filtros['estado']);
        }

        if (!empty($filtros['nit1'])) {
            $query->where('poderes.nit1', 'like', '%' . $filtros['nit1'] . '%');
        }

        if (!empty($filtros['nit2'])) {
            $query->where('poderes.nit2', 'like', '%' . $filtros['nit2'] . '%');
        }

        return $query->orderBy('poderes.fecha', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($poder) {
                return [
                    'Nit apoderado' => $poder->nit1,
                    'Razon social apoderado' => $poder->razsoc1,
                    'Ide. Apoderado' => $poder->cedrep1,
                    'Nit poderdante' => $poder->nit2,
                    'Razon social poderdante' => $poder->razsoc2,
                    'Ide. Poderdante' => $poder->cedrep2,
                    'Estado_poder' => $poder->estado,
                    'Fecha' => $poder->fecha,
                    'radicado' => $poder->radicado
                ];
            })
            ->toArray();
    }

    /**
     * Buscar poderes por criterios múltiples
     */
    public function buscar(int $asambleaId, array $criterios): array
    {
        $query = Poderes::select([
            'poderes.nit1',
            'apoderado.razsoc as razsoc1',
            'apoderado.cedrep as cedrep1',
            'apoderado.repleg as repleg1',
            'poderes.nit2',
            'poderdante.razsoc as razsoc2',
            'poderdante.cedrep as cedrep2',
            'poderdante.repleg as repleg2',
            'poderes.estado',
            'poderes.fecha',
            'poderes.radicado'
        ])
        ->leftJoin('empresas as apoderado', function($join) use ($asambleaId) {
            $join->on('apoderado.nit', '=', 'poderes.nit1')
                 ->where('apoderado.asamblea_id', '=', $asambleaId);
        })
        ->leftJoin('empresas as poderdante', function($join) use ($asambleaId) {
            $join->on('poderdante.nit', '=', 'poderes.nit2')
                 ->where('poderdante.asamblea_id', '=', $asambleaId);
        })
        ->where('poderes.asamblea_id', $asambleaId);

        // Aplicar filtros de búsqueda
        if (!empty($criterios['nit1'])) {
            $query->where('poderes.nit1', 'like', '%' . $criterios['nit1'] . '%');
        }

        if (!empty($criterios['nit2'])) {
            $query->where('poderes.nit2', 'like', '%' . $criterios['nit2'] . '%');
        }

        if (!empty($criterios['razsoc1'])) {
            $query->where('apoderado.razsoc', 'like', '%' . $criterios['razsoc1'] . '%');
        }

        if (!empty($criterios['razsoc2'])) {
            $query->where('poderdante.razsoc', 'like', '%' . $criterios['razsoc2'] . '%');
        }

        if (!empty($criterios['estado'])) {
            $query->where('poderes.estado', $criterios['estado']);
        }

        if (!empty($criterios['radicado'])) {
            $query->where('poderes.radicado', 'like', '%' . $criterios['radicado'] . '%');
        }

        if (!empty($criterios['fecha_inicio'])) {
            $query->where('poderes.fecha', '>=', $criterios['fecha_inicio']);
        }

        if (!empty($criterios['fecha_fin'])) {
            $query->where('poderes.fecha', '<=', $criterios['fecha_fin']);
        }

        $poderes = $query->orderBy('poderes.fecha', 'desc')->get()->toArray();

        return [
            'data' => $poderes,
            'total' => count($poderes),
            'criterios' => $criterios,
            'asamblea_id' => $asambleaId
        ];
    }

    /**
     * Verificar si hay datos disponibles para exportar
     */
    public function verificarDatos(int $asambleaId): array
    {
        $totalPoderes = Poderes::where('asamblea_id', $asambleaId)->count();
        $tieneDatos = $totalPoderes > 0;

        return [
            'success' => true,
            'data' => [
                'tiene_datos' => $tieneDatos,
                'total_poderes' => $totalPoderes,
                'mensaje' => $tieneDatos 
                    ? "Hay {$totalPoderes} poderes disponibles para exportar" 
                    : 'No hay poderes disponibles para exportar'
            ],
            'asamblea_id' => $asambleaId
        ];
    }

    /**
     * Exportar a CSV (manteniendo compatibilidad con el original)
     */
    public function exportarCsv(int $asambleaId): array
    {
        // Obtener datos
        $data = $this->obtenerDatosPoderes($asambleaId);

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron poderes para exportar'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_exportar_poderes';

        // Usar el servicio de reportes para generar CSV/Excel
        $filepath = ReportesHelper::convertirDatosAExcel($name, $data);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($data),
            'formato' => 'excel',
            'asamblea_id' => $asambleaId
        ];
    }
}
