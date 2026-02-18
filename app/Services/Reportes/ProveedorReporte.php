<?php

namespace App\Services\Reportes;

use App\Models\RegistroIngresos;
use App\Models\Empresas;
use App\Models\AsaRepresentantes;
use App\Models\Poderes;
use App\Models\Rechazos;
use App\Services\Reportes\Libs\ReportesHelper;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProveedorReporte
{
    /**
     * Generar reporte de proveedores para plataforma Quorum
     */
    public function generar(): array
    {
        try {
            // Resetear campo orden a 0 para todos los registros
            RegistroIngresos::query()->update(['orden' => 0]);

            // Obtener datos para el reporte Quorum
            $dataQuorum = $this->obtenerDatosQuorum();

            if (empty($dataQuorum)) {
                return [
                    'success' => false,
                    'message' => 'No se encontraron datos para generar el reporte Quorum'
                ];
            }

            // Actualizar campo orden secuencialmente
            $this->actualizarOrdenRegistros($dataQuorum);

            // Generar nombre de archivo
            $name = time() . '_exportar_quorum';

            // Definir columnas según el original
            $columns = [
                'ID',
                'Nit',
                'Razón social',
                'Cedula representante',
                'Nombre representante',
                'Apoderado Nit',
                'Apoderado Cedula',
                'Apoderado Nombre',
                'Clave'
            ];

            // Usar el servicio de reportes para generar Excel
            $filepath = ReportesHelper::crearExcel('Reporte asamblea a plataforma Quorum', $name, $columns, $dataQuorum);

            return [
                'success' => true,
                'url' => 'download_reporte/' . $filepath,
                'filename' => $filepath,
                'total_registros' => count($dataQuorum),
                'fecha_generacion' => Carbon::now()->toDateTimeString()
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al generar el reporte Quorum: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener datos para el reporte Quorum con dos consultas UNION
     */
    private function obtenerDatosQuorum(): array
    {
        // Primera consulta: Representantes sin poderes activos
        $query1 = DB::select([
            'rgi.documento as ID',
            'rgi.nit as NIT',
            'empresas.razsoc as Razón social',
            'asa_representantes.cedrep as Cedula representante',
            'asa_representantes.nombre as Nombre representante',
            DB::raw("'' as 'Apoderado Nit'"),
            DB::raw("'' as 'Apoderado Cedula'"),
            DB::raw("'' as 'Apoderado Nombre'"),
            'asa_representantes.clave_ingreso as Clave'
        ])
        ->from('registro_ingresos as rgi')
        ->join('empresas', 'empresas.nit', '=', 'rgi.nit')
        ->join('asa_representantes', 'asa_representantes.cedrep', '=', 'rgi.cedula_representa')
        ->whereIn('rgi.estado', ['P', 'A'])
        ->whereRaw("(SELECT COUNT(*) FROM poderes WHERE poderes.nit2 = rgi.nit AND poderes.estado = 'A') = 0");

        // Segunda consulta: Poderdantes con apoderados activos
        $query2 = DB::select([
            'rgi.documento as ID',
            'poderes.nit2 as NIT',
            'empresas.razsoc as Razón social',
            'poderes.cedrep2 as Cedula representante',
            'poderes.repleg2 as Nombre representante',
            'poderes.nit1 as Apoderado Nit',
            'poderes.cedrep1 as Apoderado Cedula',
            'poderes.repleg1 as Apoderado Nombre',
            'apoderado.clave_ingreso as Clave'
        ])
        ->from('registro_ingresos as rgi')
        ->join('poderes', 'poderes.nit2', '=', 'rgi.nit')
        ->where('poderes.estado', '=', 'A')
        ->join('empresas', 'empresas.nit', '=', 'poderes.nit2')
        ->join('asa_representantes as apoderado', 'apoderado.cedrep', '=', 'poderes.cedrep1')
        ->where('rgi.estado', '=', 'R')
        ->whereRaw("(SELECT COUNT(*) FROM rechazos WHERE rechazos.regingre_id = rgi.documento AND criterio_id <> 18) = 0");

        // Combinar resultados
        $resultados1 = $query1->get()->toArray();
        $resultados2 = $query2->get()->toArray();

        return array_merge($resultados1, $resultados2);
    }

    /**
     * Actualizar campo orden de los registros de ingreso
     */
    private function actualizarOrdenRegistros(array $dataQuorum): void
    {
        foreach ($dataQuorum as $index => $registro) {
            $orden = $index + 1;
            RegistroIngresos::where('documento', $registro['ID'])
                ->update(['orden' => $orden]);
        }
    }

    /**
     * Generar reporte con filtros adicionales
     */
    public function generarConFiltros(array $filtros = []): array
    {
        try {
            // Resetear campo orden a 0 para todos los registros
            RegistroIngresos::query()->update(['orden' => 0]);

            // Obtener datos con filtros aplicados
            $dataQuorum = $this->obtenerDatosQuorumConFiltros($filtros);

            if (empty($dataQuorum)) {
                return [
                    'success' => false,
                    'message' => 'No se encontraron datos con los filtros especificados'
                ];
            }

            // Actualizar campo orden secuencialmente
            $this->actualizarOrdenRegistros($dataQuorum);

            // Generar nombre de archivo con sufijo de filtros
            $sufijo = !empty($filtros) ? '_filtrado' : '';
            $name = time() . '_exportar_quorum' . $sufijo;

            // Definir columnas
            $columns = [
                'ID',
                'Nit',
                'Razón social',
                'Cedula representante',
                'Nombre representante',
                'Apoderado Nit',
                'Apoderado Cedula',
                'Apoderado Nombre',
                'Clave'
            ];

            // Usar el servicio de reportes para generar Excel
            $filepath = ReportesHelper::crearExcel('Reporte asamblea a plataforma Quorum', $name, $columns, $dataQuorum);

            return [
                'success' => true,
                'url' => 'download_reporte/' . $filepath,
                'filename' => $filepath,
                'total_registros' => count($dataQuorum),
                'filtros_aplicados' => $filtros,
                'fecha_generacion' => Carbon::now()->toDateTimeString()
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al generar el reporte Quorum con filtros: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener datos con filtros aplicados
     */
    private function obtenerDatosQuorumConFiltros(array $filtros): array
    {
        // Primera consulta con filtros
        $query1 = DB::select([
            'rgi.documento as ID',
            'rgi.nit as NIT',
            'empresas.razsoc as Razón social',
            'asa_representantes.cedrep as Cedula representante',
            'asa_representantes.nombre as Nombre representante',
            DB::raw("'' as 'Apoderado Nit'"),
            DB::raw("'' as 'Apoderado Cedula'"),
            DB::raw("'' as 'Apoderado Nombre'"),
            'asa_representantes.clave_ingreso as Clave'
        ])
        ->from('registro_ingresos as rgi')
        ->join('empresas', 'empresas.nit', '=', 'rgi.nit')
        ->join('asa_representantes', 'asa_representantes.cedrep', '=', 'rgi.cedula_representa')
        ->whereIn('rgi.estado', ['P', 'A'])
        ->whereRaw("(SELECT COUNT(*) FROM poderes WHERE poderes.nit2 = rgi.nit AND poderes.estado = 'A') = 0");

        // Aplicar filtros a la primera consulta
        if (!empty($filtros['nit'])) {
            $query1->where('rgi.nit', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razon_social'])) {
            $query1->where('empresas.razsoc', 'like', '%' . $filtros['razon_social'] . '%');
        }

        if (!empty($filtros['cedrep'])) {
            $query1->where('asa_representantes.cedrep', 'like', '%' . $filtros['cedrep'] . '%');
        }

        if (!empty($filtros['nombre_representante'])) {
            $query1->where('asa_representantes.nombre', 'like', '%' . $filtros['nombre_representante'] . '%');
        }

        // Segunda consulta con filtros
        $query2 = DB::select([
            'rgi.documento as ID',
            'poderes.nit2 as NIT',
            'empresas.razsoc as Razón social',
            'poderes.cedrep2 as Cedula representante',
            'poderes.repleg2 as Nombre representante',
            'poderes.nit1 as Apoderado Nit',
            'poderes.cedrep1 as Apoderado Cedula',
            'poderes.repleg1 as Apoderado Nombre',
            'apoderado.clave_ingreso as Clave'
        ])
        ->from('registro_ingresos as rgi')
        ->join('poderes', 'poderes.nit2', '=', 'rgi.nit')
        ->where('poderes.estado', '=', 'A')
        ->join('empresas', 'empresas.nit', '=', 'poderes.nit2')
        ->join('asa_representantes as apoderado', 'apoderado.cedrep', '=', 'poderes.cedrep1')
        ->where('rgi.estado', '=', 'R')
        ->whereRaw("(SELECT COUNT(*) FROM rechazos WHERE rechazos.regingre_id = rgi.documento AND criterio_id <> 18) = 0");

        // Aplicar filtros a la segunda consulta
        if (!empty($filtros['nit'])) {
            $query2->where('poderes.nit2', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razon_social'])) {
            $query2->where('empresas.razsoc', 'like', '%' . $filtros['razon_social'] . '%');
        }

        if (!empty($filtros['cedrep'])) {
            $query2->where('poderes.cedrep2', 'like', '%' . $filtros['cedrep'] . '%');
        }

        if (!empty($filtros['nombre_representante'])) {
            $query2->where('poderes.repleg2', 'like', '%' . $filtros['nombre_representante'] . '%');
        }

        // Combinar resultados
        $resultados1 = $query1->get()->toArray();
        $resultados2 = $query2->get()->toArray();

        return array_merge($resultados1, $resultados2);
    }

    /**
     * Obtener estadísticas del reporte
     */
    public function obtenerEstadisticas(array $filtros = []): array
    {
        // Estadísticas de representantes sin poderes
        $query1 = DB::table('registro_ingresos as rgi')
            ->join('empresas', 'empresas.nit', '=', 'rgi.nit')
            ->join('asa_representantes', 'asa_representantes.cedrep', '=', 'rgi.cedula_representa')
            ->whereIn('rgi.estado', ['P', 'A'])
            ->whereRaw("(SELECT COUNT(*) FROM poderes WHERE poderes.nit2 = rgi.nit AND poderes.estado = 'A') = 0");

        // Estadísticas de poderdantes con apoderados
        $query2 = DB::table('registro_ingresos as rgi')
            ->join('poderes', 'poderes.nit2', '=', 'rgi.nit')
            ->where('poderes.estado', '=', 'A')
            ->join('empresas', 'empresas.nit', '=', 'poderes.nit2')
            ->join('asa_representantes as apoderado', 'apoderado.cedrep', '=', 'poderes.cedrep1')
            ->where('rgi.estado', '=', 'R')
            ->whereRaw("(SELECT COUNT(*) FROM rechazos WHERE rechazos.regingre_id = rgi.documento AND criterio_id <> 18) = 0");

        // Aplicar filtros si se proporcionan
        if (!empty($filtros['nit'])) {
            $query1->where('rgi.nit', 'like', '%' . $filtros['nit'] . '%');
            $query2->where('poderes.nit2', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razon_social'])) {
            $query1->where('empresas.razsoc', 'like', '%' . $filtros['razon_social'] . '%');
            $query2->where('empresas.razsoc', 'like', '%' . $filtros['razon_social'] . '%');
        }

        $representantesSinPoderes = $query1->count();
        $poderdantesConApoderados = $query2->count();

        // Estadísticas generales
        $totalRegistros = $representantesSinPoderes + $poderdantesConApoderados;

        return [
            'total_registros' => $totalRegistros,
            'representantes_sin_poderes' => $representantesSinPoderes,
            'poderdantes_con_apoderados' => $poderdantesConApoderados,
            'porcentaje_representantes' => $totalRegistros > 0 ? round(($representantesSinPoderes / $totalRegistros) * 100, 2) : 0,
            'porcentaje_poderdantes' => $totalRegistros > 0 ? round(($poderdantesConApoderados / $totalRegistros) * 100, 2) : 0,
            'filtros_aplicados' => $filtros
        ];
    }

    /**
     * Obtener vista previa de datos
     */
    public function obtenerDatosPreview(int $limit = 10, array $filtros = []): array
    {
        // Primera consulta con límite
        $query1 = DB::select([
            'rgi.documento as ID',
            'rgi.nit as NIT',
            'empresas.razsoc as Razón social',
            'asa_representantes.cedrep as Cedula representante',
            'asa_representantes.nombre as Nombre representante',
            DB::raw("'' as 'Apoderado Nit'"),
            DB::raw("'' as 'Apoderado Cedula'"),
            DB::raw("'' as 'Apoderado Nombre'"),
            'asa_representantes.clave_ingreso as Clave'
        ])
        ->from('registro_ingresos as rgi')
        ->join('empresas', 'empresas.nit', '=', 'rgi.nit')
        ->join('asa_representantes', 'asa_representantes.cedrep', '=', 'rgi.cedula_representa')
        ->whereIn('rgi.estado', ['P', 'A'])
        ->whereRaw("(SELECT COUNT(*) FROM poderes WHERE poderes.nit2 = rgi.nit AND poderes.estado = 'A') = 0")
        ->limit($limit);

        // Segunda consulta con límite
        $query2 = DB::select([
            'rgi.documento as ID',
            'poderes.nit2 as NIT',
            'empresas.razsoc as Razón social',
            'poderes.cedrep2 as Cedula representante',
            'poderes.repleg2 as Nombre representante',
            'poderes.nit1 as Apoderado Nit',
            'poderes.cedrep1 as Apoderado Cedula',
            'poderes.repleg1 as Apoderado Nombre',
            'apoderado.clave_ingreso as Clave'
        ])
        ->from('registro_ingresos as rgi')
        ->join('poderes', 'poderes.nit2', '=', 'rgi.nit')
        ->where('poderes.estado', '=', 'A')
        ->join('empresas', 'empresas.nit', '=', 'poderes.nit2')
        ->join('asa_representantes as apoderado', 'apoderado.cedrep', '=', 'poderes.cedrep1')
        ->where('rgi.estado', '=', 'R')
        ->whereRaw("(SELECT COUNT(*) FROM rechazos WHERE rechazos.regingre_id = rgi.documento AND criterio_id <> 18) = 0")
        ->limit($limit);

        // Aplicar filtros si se proporcionan
        if (!empty($filtros['nit'])) {
            $query1->where('rgi.nit', 'like', '%' . $filtros['nit'] . '%');
            $query2->where('poderes.nit2', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razon_social'])) {
            $query1->where('empresas.razsoc', 'like', '%' . $filtros['razon_social'] . '%');
            $query2->where('empresas.razsoc', 'like', '%' . $filtros['razon_social'] . '%');
        }

        // Combinar resultados
        $resultados1 = $query1->get()->toArray();
        $resultados2 = $query2->get()->toArray();

        return [
            'data' => array_merge($resultados1, $resultados2),
            'total_preview' => count($resultados1) + count($resultados2),
            'limit' => $limit,
            'filtros_aplicados' => $filtros
        ];
    }

    /**
     * Verificar si hay datos disponibles
     */
    public function verificarDatos(array $filtros = []): array
    {
        // Primera consulta
        $query1 = DB::table('registro_ingresos as rgi')
            ->join('empresas', 'empresas.nit', '=', 'rgi.nit')
            ->join('asa_representantes', 'asa_representantes.cedrep', '=', 'rgi.cedula_representa')
            ->whereIn('rgi.estado', ['P', 'A'])
            ->whereRaw("(SELECT COUNT(*) FROM poderes WHERE poderes.nit2 = rgi.nit AND poderes.estado = 'A') = 0");

        // Segunda consulta
        $query2 = DB::table('registro_ingresos as rgi')
            ->join('poderes', 'poderes.nit2', '=', 'rgi.nit')
            ->where('poderes.estado', '=', 'A')
            ->join('empresas', 'empresas.nit', '=', 'poderes.nit2')
            ->join('asa_representantes as apoderado', 'apoderado.cedrep', '=', 'poderes.cedrep1')
            ->where('rgi.estado', '=', 'R')
            ->whereRaw("(SELECT COUNT(*) FROM rechazos WHERE rechazos.regingre_id = rgi.documento AND criterio_id <> 18) = 0");

        // Aplicar filtros si se proporcionan
        if (!empty($filtros['nit'])) {
            $query1->where('rgi.nit', 'like', '%' . $filtros['nit'] . '%');
            $query2->where('poderes.nit2', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razon_social'])) {
            $query1->where('empresas.razsoc', 'like', '%' . $filtros['razon_social'] . '%');
            $query2->where('empresas.razsoc', 'like', '%' . $filtros['razon_social'] . '%');
        }

        $representantesSinPoderes = $query1->count();
        $poderdantesConApoderados = $query2->count();
        $totalRegistros = $representantesSinPoderes + $poderdantesConApoderados;
        $tieneDatos = $totalRegistros > 0;

        return [
            'success' => true,
            'data' => [
                'tiene_datos' => $tieneDatos,
                'total_registros' => $totalRegistros,
                'representantes_sin_poderes' => $representantesSinPoderes,
                'poderdantes_con_apoderados' => $poderdantesConApoderados,
                'mensaje' => $tieneDatos 
                    ? "Hay {$totalRegistros} registros disponibles para exportar" 
                    : 'No hay registros disponibles para exportar'
            ],
            'filtros_aplicados' => $filtros
        ];
    }

    /**
     * Buscar registros por criterios múltiples
     */
    public function buscar(array $criterios): array
    {
        // Primera consulta con filtros
        $query1 = DB::select([
            'rgi.documento as ID',
            'rgi.nit as NIT',
            'empresas.razsoc as Razón social',
            'asa_representantes.cedrep as Cedula representante',
            'asa_representantes.nombre as Nombre representante',
            DB::raw("'' as 'Apoderado Nit'"),
            DB::raw("'' as 'Apoderado Cedula'"),
            DB::raw("'' as 'Apoderado Nombre'"),
            'asa_representantes.clave_ingreso as Clave'
        ])
        ->from('registro_ingresos as rgi')
        ->join('empresas', 'empresas.nit', '=', 'rgi.nit')
        ->join('asa_representantes', 'asa_representantes.cedrep', '=', 'rgi.cedula_representa')
        ->whereIn('rgi.estado', ['P', 'A'])
        ->whereRaw("(SELECT COUNT(*) FROM poderes WHERE poderes.nit2 = rgi.nit AND poderes.estado = 'A') = 0");

        // Segunda consulta con filtros
        $query2 = DB::select([
            'rgi.documento as ID',
            'poderes.nit2 as NIT',
            'empresas.razsoc as Razón social',
            'poderes.cedrep2 as Cedula representante',
            'poderes.repleg2 as Nombre representante',
            'poderes.nit1 as Apoderado Nit',
            'poderes.cedrep1 as Apoderado Cedula',
            'poderes.repleg1 as Apoderado Nombre',
            'apoderado.clave_ingreso as Clave'
        ])
        ->from('registro_ingresos as rgi')
        ->join('poderes', 'poderes.nit2', '=', 'rgi.nit')
        ->where('poderes.estado', '=', 'A')
        ->join('empresas', 'empresas.nit', '=', 'poderes.nit2')
        ->join('asa_representantes as apoderado', 'apoderado.cedrep', '=', 'poderes.cedrep1')
        ->where('rgi.estado', '=', 'R')
        ->whereRaw("(SELECT COUNT(*) FROM rechazos WHERE rechazos.regingre_id = rgi.documento AND criterio_id <> 18) = 0");

        // Aplicar filtros de búsqueda
        if (!empty($criterios['nit'])) {
            $query1->where('rgi.nit', 'like', '%' . $criterios['nit'] . '%');
            $query2->where('poderes.nit2', 'like', '%' . $criterios['nit'] . '%');
        }

        if (!empty($criterios['razon_social'])) {
            $query1->where('empresas.razsoc', 'like', '%' . $criterios['razon_social'] . '%');
            $query2->where('empresas.razsoc', 'like', '%' . $criterios['razon_social'] . '%');
        }

        if (!empty($criterios['cedrep'])) {
            $query1->where('asa_representantes.cedrep', 'like', '%' . $criterios['cedrep'] . '%');
            $query2->where('poderes.cedrep2', 'like', '%' . $criterios['cedrep'] . '%');
        }

        if (!empty($criterios['nombre_representante'])) {
            $query1->where('asa_representantes.nombre', 'like', '%' . $criterios['nombre_representante'] . '%');
            $query2->where('poderes.repleg2', 'like', '%' . $criterios['nombre_representante'] . '%');
        }

        if (!empty($criterios['con_apoderado'])) {
            if ($criterios['con_apoderado'] === 'si') {
                $query2->whereNotNull('poderes.nit1');
            } else {
                $query2->whereNull('poderes.nit1');
            }
        }

        $resultados1 = $query1->get()->toArray();
        $resultados2 = $query2->get()->toArray();

        return [
            'data' => array_merge($resultados1, $resultados2),
            'total' => count($resultados1) + count($resultados2),
            'criterios' => $criterios
        ];
    }

    /**
     * Exportar a CSV (manteniendo compatibilidad con el original)
     */
    public function exportarCsv(array $filtros = []): array
    {
        try {
            // Resetear campo orden a 0 para todos los registros
            RegistroIngresos::query()->update(['orden' => 0]);

            // Obtener datos con filtros aplicados
            $dataQuorum = $this->obtenerDatosQuorumConFiltros($filtros);

            if (empty($dataQuorum)) {
                return [
                    'success' => false,
                    'message' => 'No se encontraron datos para exportar'
                ];
            }

            // Actualizar campo orden secuencialmente
            $this->actualizarOrdenRegistros($dataQuorum);

            // Generar nombre de archivo
            $name = time() . '_exportar_quorum';

            // Usar el servicio de reportes para generar CSV/Excel
            $filepath = ReportesHelper::convertirDatosAExcel($name, $dataQuorum);

            return [
                'success' => true,
                'url' => 'download_reporte/' . $filepath,
                'filename' => $filepath,
                'total_registros' => count($dataQuorum),
                'formato' => 'excel',
                'filtros_aplicados' => $filtros
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al exportar el reporte: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Resetear campo orden a su estado original
     */
    public function resetearOrden(): array
    {
        try {
            RegistroIngresos::query()->update(['orden' => 0]);

            return [
                'success' => true,
                'message' => 'Campo orden reseteado exitosamente'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al resetear el campo orden: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener conteo de registros por estado
     */
    public function obtenerConteoPorEstado(): array
    {
        $conteoEstados = DB::table('registro_ingresos')
            ->selectRaw('estado, COUNT(*) as count')
            ->groupBy('estado')
            ->pluck('count', 'estado')
            ->toArray();

        return [
            'conteo_estados' => $conteoEstados,
            'total_registros' => array_sum($conteoEstados)
        ];
    }
}
