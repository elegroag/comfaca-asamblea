<?php

namespace App\Services\Reportes;

use App\Models\AsaTrabajadores;
use App\Models\Empresas;
use App\Services\Reportes\Libs\ReportesHelper;
use Carbon\Carbon;

class TrabajadorReporte
{
    /**
     * Generar reporte de trabajadores en Excel
     */
    public function generar(): array
    {
        // Obtener datos de trabajadores con información de empresas
        $data = $this->obtenerDatosTrabajadores();

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron trabajadores para exportar'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_exportar_trabajadores';

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::convertirDatosAExcel($name, $data);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($data),
            'fecha_generacion' => Carbon::now()->toDateTimeString()
        ];
    }

    /**
     * Obtener datos de trabajadores con información de empresas
     */
    private function obtenerDatosTrabajadores(): array
    {
        return AsaTrabajadores::select([
            'asa_trabajadores.nit',
            'asa_trabajadores.estado',
            'empresas.razsoc',
            'empresas.repleg',
            'asa_trabajadores.cedtra'
        ])
        ->join('empresas', 'empresas.nit', '=', 'asa_trabajadores.nit')
        ->orderBy('empresas.razsoc')
        ->get()
        ->map(function ($trabajador) {
            return [
                'Nit' => $trabajador->nit,
                'estado' => $this->formatearEstado($trabajador->estado),
                'Razon social' => $trabajador->razsoc,
                'Representante legal' => $trabajador->repleg,
                'Cedula trabajador' => $trabajador->cedtra
            ];
        })
        ->toArray();
    }

    /**
     * Formatear estado del trabajador
     */
    private function formatearEstado(?string $estado): string
    {
        return match ($estado) {
            'A' => 'Activo',
            'I' => 'Inactivo',
            default => 'Inactivo'
        };
    }

    /**
     * Generar reporte de trabajadores con filtros
     */
    public function generarConFiltros(array $filtros = []): array
    {
        // Obtener datos con filtros aplicados
        $data = $this->obtenerDatosTrabajadoresConFiltros($filtros);

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron trabajadores con los filtros especificados'
            ];
        }

        // Generar nombre de archivo con sufijo de filtros
        $sufijo = !empty($filtros) ? '_filtrado' : '';
        $name = time() . '_exportar_trabajadores' . $sufijo;

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::convertirDatosAExcel($name, $data);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($data),
            'filtros_aplicados' => $filtros,
            'fecha_generacion' => Carbon::now()->toDateTimeString()
        ];
    }

    /**
     * Obtener datos de trabajadores con filtros aplicados
     */
    private function obtenerDatosTrabajadoresConFiltros(array $filtros): array
    {
        $query = AsaTrabajadores::select([
            'asa_trabajadores.nit',
            'asa_trabajadores.estado',
            'empresas.razsoc',
            'empresas.repleg',
            'asa_trabajadores.cedtra'
        ])
        ->join('empresas', 'empresas.nit', '=', 'asa_trabajadores.nit');

        // Aplicar filtros
        if (!empty($filtros['estado'])) {
            $query->where('asa_trabajadores.estado', $filtros['estado']);
        }

        if (!empty($filtros['nit'])) {
            $query->where('asa_trabajadores.nit', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razsoc'])) {
            $query->where('empresas.razsoc', 'like', '%' . $filtros['razsoc'] . '%');
        }

        if (!empty($filtros['cedtra'])) {
            $query->where('asa_trabajadores.cedtra', 'like', '%' . $filtros['cedtra'] . '%');
        }

        if (!empty($filtros['repleg'])) {
            $query->where('empresas.repleg', 'like', '%' . $filtros['repleg'] . '%');
        }

        return $query->orderBy('empresas.razsoc')
            ->get()
            ->map(function ($trabajador) {
                return [
                    'Nit' => $trabajador->nit,
                    'estado' => $this->formatearEstado($trabajador->estado),
                    'Razon social' => $trabajador->razsoc,
                    'Representante legal' => $trabajador->repleg,
                    'Cedula trabajador' => $trabajador->cedtra
                ];
            })
            ->toArray();
    }

    /**
     * Obtener estadísticas de trabajadores
     */
    public function obtenerEstadisticas(array $filtros = []): array
    {
        $query = AsaTrabajadores::join('empresas', 'empresas.nit', '=', 'asa_trabajadores.nit');

        // Aplicar filtros si se proporcionan
        if (!empty($filtros['estado'])) {
            $query->where('asa_trabajadores.estado', $filtros['estado']);
        }

        if (!empty($filtros['nit'])) {
            $query->where('asa_trabajadores.nit', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razsoc'])) {
            $query->where('empresas.razsoc', 'like', '%' . $filtros['razsoc'] . '%');
        }

        $totalTrabajadores = $query->count();
        
        $activos = clone $query;
        $activos = $activos->where('asa_trabajadores.estado', 'A')->count();

        $inactivos = clone $query;
        $inactivos = $inactivos->where('asa_trabajadores.estado', 'I')->count();

        // Estadísticas por empresa
        $porEmpresa = clone $query;
        $porEmpresa = $porEmpresa->selectRaw('empresas.nit, empresas.razsoc, COUNT(*) as count')
            ->groupBy('empresas.nit', 'empresas.razsoc')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->toArray();

        return [
            'total_trabajadores' => $totalTrabajadores,
            'activos' => $activos,
            'inactivos' => $inactivos,
            'porcentaje_activos' => $totalTrabajadores > 0 ? round(($activos / $totalTrabajadores) * 100, 2) : 0,
            'porcentaje_inactivos' => $totalTrabajadores > 0 ? round(($inactivos / $totalTrabajadores) * 100, 2) : 0,
            'top_empresas' => $porEmpresa,
            'filtros_aplicados' => $filtros
        ];
    }

    /**
     * Obtener vista previa de datos
     */
    public function obtenerDatosPreview(int $limit = 10, array $filtros = []): array
    {
        $query = AsaTrabajadores::select([
            'asa_trabajadores.nit',
            'asa_trabajadores.estado',
            'empresas.razsoc',
            'empresas.repleg',
            'asa_trabajadores.cedtra'
        ])
        ->join('empresas', 'empresas.nit', '=', 'asa_trabajadores.nit');

        // Aplicar filtros si se proporcionan
        if (!empty($filtros['estado'])) {
            $query->where('asa_trabajadores.estado', $filtros['estado']);
        }

        if (!empty($filtros['nit'])) {
            $query->where('asa_trabajadores.nit', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razsoc'])) {
            $query->where('empresas.razsoc', 'like', '%' . $filtros['razsoc'] . '%');
        }

        return $query->orderBy('empresas.razsoc')
            ->limit($limit)
            ->get()
            ->map(function ($trabajador) {
                return [
                    'Nit' => $trabajador->nit,
                    'estado' => $this->formatearEstado($trabajador->estado),
                    'Razon social' => $trabajador->razsoc,
                    'Representante legal' => $trabajador->repleg,
                    'Cedula trabajador' => $trabajador->cedtra
                ];
            })
            ->toArray();
    }

    /**
     * Verificar si hay datos disponibles para exportar
     */
    public function verificarDatos(array $filtros = []): array
    {
        $query = AsaTrabajadores::join('empresas', 'empresas.nit', '=', 'asa_trabajadores.nit');

        // Aplicar filtros si se proporcionan
        if (!empty($filtros['estado'])) {
            $query->where('asa_trabajadores.estado', $filtros['estado']);
        }

        if (!empty($filtros['nit'])) {
            $query->where('asa_trabajadores.nit', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razsoc'])) {
            $query->where('empresas.razsoc', 'like', '%' . $filtros['razsoc'] . '%');
        }

        $totalTrabajadores = $query->count();
        $tieneDatos = $totalTrabajadores > 0;

        return [
            'success' => true,
            'data' => [
                'tiene_datos' => $tieneDatos,
                'total_trabajadores' => $totalTrabajadores,
                'mensaje' => $tieneDatos 
                    ? "Hay {$totalTrabajadores} trabajadores disponibles para exportar" 
                    : 'No hay trabajadores disponibles para exportar'
            ],
            'filtros_aplicados' => $filtros
        ];
    }

    /**
     * Buscar trabajadores por criterios múltiples
     */
    public function buscar(array $criterios): array
    {
        $query = AsaTrabajadores::select([
            'asa_trabajadores.nit',
            'asa_trabajadores.estado',
            'empresas.razsoc',
            'empresas.repleg',
            'asa_trabajadores.cedtra'
        ])
        ->join('empresas', 'empresas.nit', '=', 'asa_trabajadores.nit');

        // Aplicar filtros de búsqueda
        if (!empty($criterios['nit'])) {
            $query->where('asa_trabajadores.nit', 'like', '%' . $criterios['nit'] . '%');
        }

        if (!empty($criterios['razsoc'])) {
            $query->where('empresas.razsoc', 'like', '%' . $criterios['razsoc'] . '%');
        }

        if (!empty($criterios['cedtra'])) {
            $query->where('asa_trabajadores.cedtra', 'like', '%' . $criterios['cedtra'] . '%');
        }

        if (!empty($criterios['repleg'])) {
            $query->where('empresas.repleg', 'like', '%' . $criterios['repleg'] . '%');
        }

        if (!empty($criterios['estado'])) {
            $query->where('asa_trabajadores.estado', $criterios['estado']);
        }

        $trabajadores = $query->orderBy('empresas.razsoc')->get()->toArray();

        return [
            'data' => $trabajadores,
            'total' => count($trabajadores),
            'criterios' => $criterios
        ];
    }

    /**
     * Exportar a CSV (manteniendo compatibilidad con el original)
     */
    public function exportarCsv(array $filtros = []): array
    {
        // Obtener datos
        $data = $this->obtenerDatosTrabajadoresConFiltros($filtros);

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron trabajadores para exportar'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_exportar_trabajadores';

        // Usar el servicio de reportes para generar CSV/Excel
        $filepath = ReportesHelper::convertirDatosAExcel($name, $data);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($data),
            'formato' => 'excel',
            'filtros_aplicados' => $filtros
        ];
    }

    /**
     * Obtener trabajadores por empresa
     */
    public function obtenerTrabajadoresPorEmpresa(string $nit): array
    {
        $trabajadores = AsaTrabajadores::select([
            'asa_trabajadores.nit',
            'asa_trabajadores.estado',
            'asa_trabajadores.cedtra',
            'empresas.razsoc',
            'empresas.repleg'
        ])
        ->join('empresas', 'empresas.nit', '=', 'asa_trabajadores.nit')
        ->where('asa_trabajadores.nit', $nit)
        ->orderBy('asa_trabajadores.cedtra')
        ->get()
        ->map(function ($trabajador) {
            return [
                'Nit' => $trabajador->nit,
                'estado' => $this->formatearEstado($trabajador->estado),
                'Razon social' => $trabajador->razsoc,
                'Representante legal' => $trabajador->repleg,
                'Cedula trabajador' => $trabajador->cedtra
            ];
        })
        ->toArray();

        return [
            'data' => $trabajadores,
            'total' => count($trabajadores),
            'nit_empresa' => $nit
        ];
    }

    /**
     * Obtener conteo de trabajadores por estado
     */
    public function obtenerConteoPorEstado(): array
    {
        $conteoEstados = AsaTrabajadores::selectRaw('estado, COUNT(*) as count')
            ->groupBy('estado')
            ->pluck('count', 'estado')
            ->toArray();

        return [
            'conteo_estados' => $conteoEstados,
            'total_trabajadores' => array_sum($conteoEstados)
        ];
    }

    /**
     * Generar reporte de trabajadores por empresa específica
     */
    public function generarPorEmpresa(string $nit): array
    {
        // Obtener datos de trabajadores para la empresa específica
        $data = $this->obtenerTrabajadoresPorEmpresa($nit);

        if (empty($data['data'])) {
            return [
                'success' => false,
                'message' => 'No se encontraron trabajadores para la empresa especificada'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_exportar_trabajadores_empresa_' . $nit;

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::convertirDatosAExcel($name, $data['data']);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => $data['total'],
            'nit_empresa' => $nit,
            'fecha_generacion' => Carbon::now()->toDateTimeString()
        ];
    }
}
