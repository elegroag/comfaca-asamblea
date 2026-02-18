<?php

namespace App\Services\Reportes;

use App\Models\Empresas;
use App\Services\Reportes\Libs\ReportesHelper;
use Carbon\Carbon;

class HabilesReporte
{
    /**
     * Generar reporte de empresas hábiles en Excel
     */
    public function generar(int $asambleaId): array
    {
        // Obtener datos de empresas para la asamblea
        $data = $this->obtenerDatosEmpresas($asambleaId);

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron empresas para la asamblea especificada'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_exportar_empresas_habiles';

        // Definir columnas
        $columns = [
            'Nit',
            'Dirección',
            'Email',
            'Teléfono',
            'Razon Social',
            'Representante Legal',
            'Identificación Representante'
        ];

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::crearExcel('Reporte Empresas Hábiles', $name, $columns, $data);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($data),
            'asamblea_id' => $asambleaId
        ];
    }

    /**
     * Obtener datos de empresas para la asamblea
     */
    private function obtenerDatosEmpresas(int $asambleaId): array
    {
        return Empresas::select([
            'nit',
            'email',
            'telefono',
            'razsoc',
            'repleg',
            'cedrep'
        ])
        ->where('asamblea_id', $asambleaId)
        ->orderBy('razsoc')
        ->get()
        ->map(function ($empresa) {
            return [
                'Nit' => $empresa->nit,
                'Dirección' => 'NA', // Valor fijo como en el original
                'Email' => $empresa->email,
                'Teléfono' => $empresa->telefono,
                'Razon Social' => $empresa->razsoc,
                'Representante Legal' => $empresa->repleg,
                'Identificación Representante' => $empresa->cedrep
            ];
        })
        ->toArray();
    }

    /**
     * Generar reporte de empresas hábiles con filtros
     */
    public function generarConFiltros(int $asambleaId, array $filtros = []): array
    {
        // Obtener datos con filtros aplicados
        $data = $this->obtenerDatosEmpresasConFiltros($asambleaId, $filtros);

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron empresas con los filtros especificados'
            ];
        }

        // Generar nombre de archivo con sufijo de filtros
        $sufijo = !empty($filtros) ? '_filtrado' : '';
        $name = time() . '_exportar_empresas_habiles' . $sufijo;

        // Definir columnas
        $columns = [
            'Nit',
            'Dirección',
            'Email',
            'Teléfono',
            'Razon Social',
            'Representante Legal',
            'Identificación Representante'
        ];

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::crearExcel('Reporte Empresas Hábiles', $name, $columns, $data);

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
     * Obtener datos de empresas con filtros aplicados
     */
    private function obtenerDatosEmpresasConFiltros(int $asambleaId, array $filtros): array
    {
        $query = Empresas::select([
            'nit',
            'email',
            'telefono',
            'razsoc',
            'repleg',
            'cedrep'
        ])
        ->where('asamblea_id', $asambleaId);

        // Aplicar filtros
        if (!empty($filtros['nit'])) {
            $query->where('nit', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razsoc'])) {
            $query->where('razsoc', 'like', '%' . $filtros['razsoc'] . '%');
        }

        if (!empty($filtros['email'])) {
            $query->where('email', 'like', '%' . $filtros['email'] . '%');
        }

        if (!empty($filtros['telefono'])) {
            $query->where('telefono', 'like', '%' . $filtros['telefono'] . '%');
        }

        if (!empty($filtros['repleg'])) {
            $query->where('repleg', 'like', '%' . $filtros['repleg'] . '%');
        }

        if (!empty($filtros['cedrep'])) {
            $query->where('cedrep', 'like', '%' . $filtros['cedrep'] . '%');
        }

        return $query->orderBy('razsoc')
            ->get()
            ->map(function ($empresa) {
                return [
                    'Nit' => $empresa->nit,
                    'Dirección' => 'NA',
                    'Email' => $empresa->email,
                    'Teléfono' => $empresa->telefono,
                    'Razon Social' => $empresa->razsoc,
                    'Representante Legal' => $empresa->repleg,
                    'Identificación Representante' => $empresa->cedrep
                ];
            })
            ->toArray();
    }

    /**
     * Obtener estadísticas de empresas hábiles
     */
    public function obtenerEstadisticas(int $asambleaId): array
    {
        $totalEmpresas = Empresas::where('asamblea_id', $asambleaId)->count();
        
        $conEmail = Empresas::where('asamblea_id', $asambleaId)
            ->whereNotNull('email')
            ->where('email', '<>', '')
            ->count();

        $conTelefono = Empresas::where('asamblea_id', $asambleaId)
            ->whereNotNull('telefono')
            ->where('telefono', '<>', '')
            ->count();

        $conEmailYTelefono = Empresas::where('asamblea_id', $asambleaId)
            ->whereNotNull('email')
            ->where('email', '<>', '')
            ->whereNotNull('telefono')
            ->where('telefono', '<>', '')
            ->count();

        return [
            'total_empresas' => $totalEmpresas,
            'con_email' => $conEmail,
            'con_telefono' => $conTelefono,
            'con_email_y_telefono' => $conEmailYTelefono,
            'sin_email' => $totalEmpresas - $conEmail,
            'sin_telefono' => $totalEmpresas - $conTelefono,
            'asamblea_id' => $asambleaId
        ];
    }

    /**
     * Obtener vista previa de datos
     */
    public function obtenerDatosPreview(int $asambleaId, int $limit = 10, array $filtros = []): array
    {
        $query = Empresas::select([
            'nit',
            'email',
            'telefono',
            'razsoc',
            'repleg',
            'cedrep'
        ])
        ->where('asamblea_id', $asambleaId);

        // Aplicar filtros si se proporcionan
        if (!empty($filtros['nit'])) {
            $query->where('nit', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razsoc'])) {
            $query->where('razsoc', 'like', '%' . $filtros['razsoc'] . '%');
        }

        return $query->orderBy('razsoc')
            ->limit($limit)
            ->get()
            ->map(function ($empresa) {
                return [
                    'Nit' => $empresa->nit,
                    'Dirección' => 'NA',
                    'Email' => $empresa->email,
                    'Teléfono' => $empresa->telefono,
                    'Razon Social' => $empresa->razsoc,
                    'Representante Legal' => $empresa->repleg,
                    'Identificación Representante' => $empresa->cedrep
                ];
            })
            ->toArray();
    }

    /**
     * Exportar a CSV (manteniendo compatibilidad con el original)
     */
    public function exportarCsv(int $asambleaId): array
    {
        // Obtener datos
        $data = $this->obtenerDatosEmpresas($asambleaId);

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron empresas para exportar'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_exportar_empresas_habiles';

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

    /**
     * Verificar si hay datos disponibles para exportar
     */
    public function verificarDatos(int $asambleaId): array
    {
        $totalEmpresas = Empresas::where('asamblea_id', $asambleaId)->count();
        $tieneDatos = $totalEmpresas > 0;

        return [
            'success' => true,
            'data' => [
                'tiene_datos' => $tieneDatos,
                'total_empresas' => $totalEmpresas,
                'mensaje' => $tieneDatos 
                    ? "Hay {$totalEmpresas} empresas disponibles para exportar" 
                    : 'No hay empresas disponibles para exportar'
            ],
            'asamblea_id' => $asambleaId
        ];
    }

    /**
     * Buscar empresas por criterios múltiples
     */
    public function buscar(int $asambleaId, array $criterios): array
    {
        $query = Empresas::select([
            'nit',
            'email',
            'telefono',
            'razsoc',
            'repleg',
            'cedrep'
        ])
        ->where('asamblea_id', $asambleaId);

        // Aplicar filtros de búsqueda
        if (!empty($criterios['nit'])) {
            $query->where('nit', 'like', '%' . $criterios['nit'] . '%');
        }

        if (!empty($criterios['razsoc'])) {
            $query->where('razsoc', 'like', '%' . $criterios['razsoc'] . '%');
        }

        if (!empty($criterios['email'])) {
            $query->where('email', 'like', '%' . $criterios['email'] . '%');
        }

        if (!empty($criterios['telefono'])) {
            $query->where('telefono', 'like', '%' . $criterios['telefono'] . '%');
        }

        if (!empty($criterios['repleg'])) {
            $query->where('repleg', 'like', '%' . $criterios['repleg'] . '%');
        }

        if (!empty($criterios['cedrep'])) {
            $query->where('cedrep', 'like', '%' . $criterios['cedrep'] . '%');
        }

        $empresas = $query->orderBy('razsoc')->get()->toArray();

        return [
            'data' => $empresas,
            'total' => count($empresas),
            'criterios' => $criterios,
            'asamblea_id' => $asambleaId
        ];
    }
}
