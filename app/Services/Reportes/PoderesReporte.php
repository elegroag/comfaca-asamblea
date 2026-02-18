<?php

namespace App\Services\Reportes;

use App\Models\Poderes;
use App\Models\Empresas;
use App\Services\Reportes\Libs\ReportesHelper;
use Carbon\Carbon;

class PoderesReporte
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

        // Definir columnas según el original
        $columns = [
            'Nit apoderado',
            'Razón social apoderado',
            'Cedrep apoderado',
            'Representante apoderado',
            'Nit poderdante',
            'Razón social poderdante',
            'Cedrep poderdante',
            'Representante poderdante',
            'Estado',
            'Fecha',
            'Radicado',
            'Notificación'
        ];

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::crearExcel('Reporte Poderes', $name, $columns, $data);

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
        $poderes = Poderes::select([
            'poderes.nit1',
            'apoderado.razsoc as razsoc_apoderado',
            'apoderado.cedrep as cedrep_apoderado',
            'apoderado.repleg as repleg_apoderado',
            'poderes.nit2',
            'poderdante.razsoc as razsoc_poderdante',
            'poderdante.cedrep as cedrep_poderdante',
            'poderdante.repleg as repleg_poderdante',
            'poderes.estado',
            'poderes.fecha',
            'poderes.radicado',
            'poderes.notificacion'
        ])
        ->join('empresas as poderdante', function($join) use ($asambleaId) {
            $join->on('poderdante.nit', '=', 'poderes.nit2')
                 ->where('poderdante.asamblea_id', '=', $asambleaId);
        })
        ->join('empresas as apoderado', function($join) use ($asambleaId) {
            $join->on('apoderado.nit', '=', 'poderes.nit1')
                 ->where('apoderado.asamblea_id', '=', $asambleaId);
        })
        ->where('poderes.asamblea_id', $asambleaId)
        ->orderBy('poderes.fecha', 'desc')
        ->get();

        // Procesar datos
        $data = [];
        foreach ($poderes as $poder) {
            $data[] = [
                'nit_apoderado' => $poder->nit1,
                'razon_social_apoderado' => $poder->razsoc_apoderado,
                'cedrep_apoderado' => $poder->cedrep_apoderado,
                'representante_legal_apoderado' => $poder->repleg_apoderado,
                'nit_poderdante' => $poder->nit2,
                'razon_social_poderdante' => $poder->razsoc_poderdante,
                'cedrep_poderdante' => $poder->cedrep_poderdante,
                'representante_legal_poderdante' => $poder->repleg_poderdante,
                'estado_poder' => $this->formatearEstado($poder->estado),
                'fecha' => $poder->fecha,
                'radicado' => $poder->radicado,
                'notificacion' => $this->limpiarNotificacion($poder->notificacion)
            ];
        }

        return $data;
    }

    /**
     * Formatear estado del poder
     */
    private function formatearEstado(?string $estado): string
    {
        return match ($estado) {
            'A' => 'APROBADO',
            'R' => 'RECHAZADO',
            default => 'RECHAZADO'
        };
    }

    /**
     * Limpiar y formatear campo de notificación
     */
    private function limpiarNotificacion(?string $notificacion): string
    {
        if (empty($notificacion)) {
            return '';
        }

        // Reemplazar caracteres problemáticos como en el original
        return str_replace([",", ";", "\n", "'"], " ", $notificacion);
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

        // Definir columnas
        $columns = [
            'Nit apoderado',
            'Razón social apoderado',
            'Cedrep apoderado',
            'Representante apoderado',
            'Nit poderdante',
            'Razón social poderdante',
            'Cedrep poderdante',
            'Representante poderdante',
            'Estado',
            'Fecha',
            'Radicado',
            'Notificación'
        ];

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::crearExcel('Reporte Poderes', $name, $columns, $data);

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
            'apoderado.razsoc as razsoc_apoderado',
            'apoderado.cedrep as cedrep_apoderado',
            'apoderado.repleg as repleg_apoderado',
            'poderes.nit2',
            'poderdante.razsoc as razsoc_poderdante',
            'poderdante.cedrep as cedrep_poderdante',
            'poderdante.repleg as repleg_poderdante',
            'poderes.estado',
            'poderes.fecha',
            'poderes.radicado',
            'poderes.notificacion'
        ])
        ->join('empresas as poderdante', function($join) use ($asambleaId) {
            $join->on('poderdante.nit', '=', 'poderes.nit2')
                 ->where('poderdante.asamblea_id', '=', $asambleaId);
        })
        ->join('empresas as apoderado', function($join) use ($asambleaId) {
            $join->on('apoderado.nit', '=', 'poderes.nit1')
                 ->where('apoderado.asamblea_id', '=', $asambleaId);
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

        if (!empty($filtros['razsoc_apoderado'])) {
            $query->where('apoderado.razsoc', 'like', '%' . $filtros['razsoc_apoderado'] . '%');
        }

        if (!empty($filtros['razsoc_poderdante'])) {
            $query->where('poderdante.razsoc', 'like', '%' . $filtros['razsoc_poderdante'] . '%');
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

        if (!empty($filtros['con_notificacion'])) {
            if ($filtros['con_notificacion'] === 'si') {
                $query->whereNotNull('poderes.notificacion')
                      ->where('poderes.notificacion', '<>', '');
            } else {
                $query->where(function($q) {
                    $q->whereNull('poderes.notificacion')
                      ->orWhere('poderes.notificacion', '=', '');
                });
            }
        }

        $poderes = $query->orderBy('poderes.fecha', 'desc')->get();

        // Procesar datos
        $data = [];
        foreach ($poderes as $poder) {
            $data[] = [
                'nit_apoderado' => $poder->nit1,
                'razon_social_apoderado' => $poder->razsoc_apoderado,
                'cedrep_apoderado' => $poder->cedrep_apoderado,
                'representante_legal_apoderado' => $poder->repleg_apoderado,
                'nit_poderdante' => $poder->nit2,
                'razon_social_poderdante' => $poder->razsoc_poderdante,
                'cedrep_poderdante' => $poder->cedrep_poderdante,
                'representante_legal_poderdante' => $poder->repleg_poderdante,
                'estado_poder' => $this->formatearEstado($poder->estado),
                'fecha' => $poder->fecha,
                'radicado' => $poder->radicado,
                'notificacion' => $this->limpiarNotificacion($poder->notificacion)
            ];
        }

        return $data;
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

        $conNotificacion = Poderes::where('asamblea_id', $asambleaId)
                                ->whereNotNull('notificacion')
                                ->where('notificacion', '<>', '')
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
            'con_notificacion' => $conNotificacion,
            'sin_notificacion' => $totalPoderes - $conNotificacion,
            'porcentaje_aprobados' => $totalPoderes > 0 ? round(($aprobados / $totalPoderes) * 100, 2) : 0,
            'porcentaje_rechazados' => $totalPoderes > 0 ? round(($rechazados / $totalPoderes) * 100, 2) : 0,
            'porcentaje_con_radicado' => $totalPoderes > 0 ? round(($conRadicado / $totalPoderes) * 100, 2) : 0,
            'porcentaje_con_notificacion' => $totalPoderes > 0 ? round(($conNotificacion / $totalPoderes) * 100, 2) : 0,
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
            'apoderado.razsoc as razsoc_apoderado',
            'apoderado.cedrep as cedrep_apoderado',
            'poderes.nit2',
            'poderdante.razsoc as razsoc_poderdante',
            'poderdante.cedrep as cedrep_poderdante',
            'poderes.estado',
            'poderes.fecha',
            'poderes.radicado',
            'poderes.notificacion'
        ])
        ->join('empresas as poderdante', function($join) use ($asambleaId) {
            $join->on('poderdante.nit', '=', 'poderes.nit2')
                 ->where('poderdante.asamblea_id', '=', $asambleaId);
        })
        ->join('empresas as apoderado', function($join) use ($asambleaId) {
            $join->on('apoderado.nit', '=', 'poderes.nit1')
                 ->where('apoderado.asamblea_id', '=', $asambleaId);
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
                    'nit_apoderado' => $poder->nit1,
                    'razon_social_apoderado' => $poder->razsoc_apoderado,
                    'cedrep_apoderado' => $poder->cedrep_apoderado,
                    'nit_poderdante' => $poder->nit2,
                    'razon_social_poderdante' => $poder->razsoc_poderdante,
                    'cedrep_poderdante' => $poder->cedrep_poderdante,
                    'estado_poder' => $this->formatearEstado($poder->estado),
                    'fecha' => $poder->fecha,
                    'radicado' => $poder->radicado,
                    'notificacion' => $this->limpiarNotificacion($poder->notificacion)
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
            'apoderado.razsoc as razsoc_apoderado',
            'apoderado.cedrep as cedrep_apoderado',
            'apoderado.repleg as repleg_apoderado',
            'poderes.nit2',
            'poderdante.razsoc as razsoc_poderdante',
            'poderdante.cedrep as cedrep_poderdante',
            'poderdante.repleg as repleg_poderdante',
            'poderes.estado',
            'poderes.fecha',
            'poderes.radicado',
            'poderes.notificacion'
        ])
        ->join('empresas as poderdante', function($join) use ($asambleaId) {
            $join->on('poderdante.nit', '=', 'poderes.nit2')
                 ->where('poderdante.asamblea_id', '=', $asambleaId);
        })
        ->join('empresas as apoderado', function($join) use ($asambleaId) {
            $join->on('apoderado.nit', '=', 'poderes.nit1')
                 ->where('apoderado.asamblea_id', '=', $asambleaId);
        })
        ->where('poderes.asamblea_id', $asambleaId);

        // Aplicar filtros de búsqueda
        if (!empty($criterios['nit1'])) {
            $query->where('poderes.nit1', 'like', '%' . $criterios['nit1'] . '%');
        }

        if (!empty($criterios['nit2'])) {
            $query->where('poderes.nit2', 'like', '%' . $criterios['nit2'] . '%');
        }

        if (!empty($criterios['razsoc_apoderado'])) {
            $query->where('apoderado.razsoc', 'like', '%' . $criterios['razsoc_apoderado'] . '%');
        }

        if (!empty($criterios['razsoc_poderdante'])) {
            $query->where('poderdante.razsoc', 'like', '%' . $criterios['razsoc_poderdante'] . '%');
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
