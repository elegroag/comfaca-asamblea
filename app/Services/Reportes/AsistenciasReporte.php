<?php

namespace App\Services\Reportes;

use App\Models\Poderes;
use App\Models\RegistroIngresos;
use App\Services\Reportes\Libs\ReportesHelper;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AsistenciasReporte
{
    /**
     * Generar reporte de asistencias de poderes en Excel
     */
    public function generar(): array
    {
        // Obtener datos de poderes con asistencia
        $data = $this->obtenerDatosAsistencias();

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron datos de asistencias para exportar'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_exportar_asistencias_poderes';

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::convertirDatosAExcel($name, $data);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($data)
        ];
    }

    /**
     * Obtener datos de asistencias de poderes
     */
    private function obtenerDatosAsistencias(): array
    {
        return Poderes::select([
            'poderes.nit1 as nit_apoderado',
            'apoderado.razsoc as razon_social_apoderado',
            'apoderado.cedrep as cedrep_apoderado',
            'apoderado.repleg as representante_legal_apoderado',
            'poderes.nit2 as nit_poderdante',
            'poderdante.razsoc as razon_social_poderdante',
            'poderdante.cedrep as cedrep_poderdante',
            'poderdante.repleg as representante_legal_poderdante',
            \DB::raw("CASE WHEN poderes.estado='A' THEN 'APROBADO' WHEN poderes.estado='R' THEN 'RECHAZADO' ELSE 'RECHAZADO' END as estado_poder")
        ])
            ->join('empresas as apoderado', 'apoderado.nit', '=', 'poderes.nit1')
            ->join('empresas as poderdante', 'poderdante.nit', '=', 'poderes.nit2')
            ->where('poderes.estado', 'A')
            ->whereIn('poderes.nit1', function ($query) {
                $query->select('nit')
                    ->from('registro_ingresos')
                    ->where('estado', 'A');
            })
            ->get()
            ->toArray();
    }

    /**
     * Obtener estadísticas de asistencias de poderes
     */
    public function obtenerEstadisticas(): array
    {
        $totalPoderesAprobados = Poderes::where('estado', 'A')->count();

        $poderesConAsistencia = Poderes::whereIn('nit1', function ($query) {
            $query->select('nit')
                ->from('registro_ingresos')
                ->where('estado', 'A');
        })->where('estado', 'A')->count();

        $apoderadosUnicos = Poderes::whereIn('nit1', function ($query) {
            $query->select('nit')
                ->from('registro_ingresos')
                ->where('estado', 'A');
        })->where('estado', 'A')->distinct('nit1')->count();

        $poderdantesUnicos = Poderes::whereIn('nit1', function ($query) {
            $query->select('nit')
                ->from('registro_ingresos')
                ->where('estado', 'A');
        })->where('estado', 'A')->distinct('nit2')->count();

        return [
            'total_poderes_aprobados' => $totalPoderesAprobados,
            'poderes_con_asistencia' => $poderesConAsistencia,
            'apoderados_unicos' => $apoderadosUnicos,
            'poderdantes_unicos' => $poderdantesUnicos,
            'porcentaje_asistencia' => $totalPoderesAprobados > 0
                ? round(($poderesConAsistencia / $totalPoderesAprobados) * 100, 2)
                : 0
        ];
    }

    /**
     * Obtener datos filtrados por asamblea
     */
    public function generarPorAsamblea(int $idAsamblea): array
    {
        // Obtener datos de poderes con asistencia para una asamblea específica
        $data = Poderes::select([
            'poderes.nit1 as nit_apoderado',
            'apoderado.razsoc as razon_social_apoderado',
            'apoderado.cedrep as cedrep_apoderado',
            'apoderado.repleg as representante_legal_apoderado',
            'poderes.nit2 as nit_poderdante',
            'poderdante.razsoc as razon_social_poderdante',
            'poderdante.cedrep as cedrep_poderdante',
            'poderdante.repleg as representante_legal_poderdante',
            \DB::raw("CASE WHEN poderes.estado='A' THEN 'APROBADO' WHEN poderes.estado='R' THEN 'RECHAZADO' ELSE 'RECHAZADO' END as estado_poder")
        ])
            ->join('empresas as apoderado', function ($join) use ($idAsamblea) {
                $join->on('apoderado.nit', '=', 'poderes.nit1')
                    ->where('apoderado.asamblea_id', '=', $idAsamblea);
            })
            ->join('empresas as poderdante', function ($join) use ($idAsamblea) {
                $join->on('poderdante.nit', '=', 'poderes.nit2')
                    ->where('poderdante.asamblea_id', '=', $idAsamblea);
            })
            ->where('poderes.asamblea_id', $idAsamblea)
            ->where('poderes.estado', 'A')
            ->whereIn('poderes.nit1', function ($query) use ($idAsamblea) {
                $query->select('nit')
                    ->from('registro_ingresos')
                    ->where('estado', 'A')
                    ->where('asamblea_id', $idAsamblea);
            })
            ->get()
            ->toArray();

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron datos de asistencias para la asamblea especificada'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_exportar_asistencias_poderes_asamblea_' . $idAsamblea;

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::convertirDatosAExcel($name, $data);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($data),
            'id_asamblea' => $idAsamblea
        ];
    }

    /**
     * Obtener datos para vista previa
     */
    public function obtenerDatosPreview(int $limit = 10): array
    {
        $data = Poderes::select([
            'poderes.nit1 as nit_apoderado',
            'apoderado.razsoc as razon_social_apoderado',
            'apoderado.cedrep as cedrep_apoderado',
            'poderes.nit2 as nit_poderdante',
            'poderdante.razsoc as razon_social_poderdante',
            'poderdante.cedrep as cedrep_poderdante',
            \DB::raw("CASE WHEN poderes.estado='A' THEN 'APROBADO' WHEN poderes.estado='R' THEN 'RECHAZADO' ELSE 'RECHAZADO' END as estado_poder")
        ])
            ->join('empresas as apoderado', 'apoderado.nit', '=', 'poderes.nit1')
            ->join('empresas as poderdante', 'poderdante.nit', '=', 'poderes.nit2')
            ->where('poderes.estado', 'A')
            ->whereIn('poderes.nit1', function ($query) {
                $query->select('nit')
                    ->from('registro_ingresos')
                    ->where('estado', 'A');
            })
            ->limit($limit)
            ->get()
            ->toArray();

        return $data;
    }
}
