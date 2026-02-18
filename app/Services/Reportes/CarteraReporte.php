<?php

namespace App\Services\Reportes;

use App\Models\Carteras;
use App\Models\Empresas;
use App\Services\Reportes\Libs\ReportesHelper;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CarteraReporte
{
    /**
     * Generar reporte de cartera de empresas en Excel
     */
    public function generar(): array
    {
        // Obtener datos de cartera con información de empresas
        $data = $this->obtenerDatosCartera();

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron datos de cartera para exportar'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_exportar_cartera';

        // Definir columnas
        $columns = [
            'Nit',
            'Razón social',
            'Representante legal',
            'Cedula representante',
            'Codigo',
            'Descripcion'
        ];

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::crearExcel('Reporte Cartera Empresas', $name, $columns, $data);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($data)
        ];
    }

    /**
     * Obtener datos de cartera con información de empresas
     */
    private function obtenerDatosCartera(): array
    {
        return Carteras::select([
            'carteras.nit',
            'empresas.razsoc',
            'empresas.repleg',
            'empresas.cedrep',
            'carteras.codigo',
            'carteras.concepto'
        ])
            ->join('empresas', 'empresas.nit', '=', 'carteras.nit')
            ->orderBy('carteras.codigo', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Generar reporte de cartera filtrado por asamblea
     */
    public function generarPorAsamblea(int $idAsamblea): array
    {
        // Obtener datos de cartera para una asamblea específica
        $data = Carteras::select([
            'carteras.nit',
            'empresas.razsoc',
            'empresas.repleg',
            'empresas.cedrep',
            'carteras.codigo',
            'carteras.concepto'
        ])
            ->join('empresas', function ($join) use ($idAsamblea) {
                $join->on('empresas.nit', '=', 'carteras.nit')
                    ->where('empresas.asamblea_id', '=', $idAsamblea);
            })
            ->where('carteras.asamblea_id', $idAsamblea)
            ->orderBy('carteras.codigo', 'desc')
            ->get()
            ->toArray();

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron datos de cartera para la asamblea especificada'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_exportar_cartera_asamblea_' . $idAsamblea;

        // Definir columnas
        $columns = [
            'Nit',
            'Razón social',
            'Representante legal',
            'Cedula representante',
            'Codigo',
            'Descripcion'
        ];

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::crearExcel('Reporte Cartera Empresas', $name, $columns, $data);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($data),
            'id_asamblea' => $idAsamblea
        ];
    }

    /**
     * Obtener estadísticas de cartera
     */
    public function obtenerEstadisticas(?int $idAsamblea = null): array
    {
        $query = Carteras::query();

        if ($idAsamblea) {
            $query->where('carteras.asamblea_id', $idAsamblea);
        }

        $totalRegistros = $query->count();

        $query->join('empresas', 'empresas.nit', '=', 'carteras.nit');

        if ($idAsamblea) {
            $query->where('empresas.asamblea_id', $idAsamblea);
        }

        $empresasUnicas = $query->distinct('carteras.nit')->count('carteras.nit');

        // Obtener conteo por tipo de cartera si existe el campo
        $porTipo = [];
        if (Schema::hasColumn('carteras', 'tipo')) {
            $porTipo = Carteras::selectRaw('tipo, COUNT(*) as count')
                ->when($idAsamblea, function ($q) use ($idAsamblea) {
                    $q->where('asamblea_id', $idAsamblea);
                })
                ->groupBy('tipo')
                ->pluck('count', 'tipo')
                ->toArray();
        }

        return [
            'total_registros' => $totalRegistros,
            'empresas_unicas' => $empresasUnicas,
            'por_tipo' => $porTipo,
            'id_asamblea' => $idAsamblea
        ];
    }

    /**
     * Obtener datos para vista previa
     */
    public function obtenerDatosPreview(int $limit = 10, ?int $idAsamblea = null): array
    {
        $query = Carteras::select([
            'carteras.nit',
            'empresas.razsoc',
            'empresas.repleg',
            'carteras.codigo',
            'carteras.concepto'
        ])
            ->join('empresas', 'empresas.nit', '=', 'carteras.nit')
            ->orderBy('carteras.codigo', 'desc');

        if ($idAsamblea) {
            $query->where('carteras.asamblea_id', $idAsamblea)
                ->where('empresas.asamblea_id', $idAsamblea);
        }

        return $query->limit($limit)->get()->toArray();
    }

    /**
     * Buscar cartera por criterios
     */
    public function buscar(array $criterios): array
    {
        $query = Carteras::select([
            'carteras.nit',
            'empresas.razsoc',
            'empresas.repleg',
            'empresas.cedrep',
            'carteras.codigo',
            'carteras.concepto'
        ])
            ->join('empresas', 'empresas.nit', '=', 'carteras.nit');

        // Aplicar filtros
        if (!empty($criterios['nit'])) {
            $query->where('carteras.nit', 'like', '%' . $criterios['nit'] . '%');
        }

        if (!empty($criterios['razsoc'])) {
            $query->where('empresas.razsoc', 'like', '%' . $criterios['razsoc'] . '%');
        }

        if (!empty($criterios['codigo'])) {
            $query->where('carteras.codigo', 'like', '%' . $criterios['codigo'] . '%');
        }

        if (!empty($criterios['concepto'])) {
            $query->where('carteras.concepto', 'like', '%' . $criterios['concepto'] . '%');
        }

        if (!empty($criterios['id_asamblea'])) {
            $query->where('carteras.asamblea_id', $criterios['id_asamblea'])
                ->where('empresas.asamblea_id', $criterios['id_asamblea']);
        }

        $data = $query->orderBy('carteras.codigo', 'desc')->get()->toArray();

        return [
            'data' => $data,
            'total' => count($data)
        ];
    }

    /**
     * Exportar búsqueda a Excel
     */
    public function exportarBusqueda(array $criterios): array
    {
        $resultado = $this->buscar($criterios);
        $data = $resultado['data'];

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron resultados para los criterios de búsqueda'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_exportar_cartera_busqueda';

        // Definir columnas
        $columns = [
            'Nit',
            'Razón social',
            'Representante legal',
            'Cedula representante',
            'Codigo',
            'Descripcion'
        ];

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::crearExcel('Reporte Cartera Empresas - Búsqueda', $name, $columns, $data);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($data),
            'criterios' => $criterios
        ];
    }
}
