<?php

namespace App\Services\Reportes;

use App\Models\Empresas;
use App\Models\AsaRepresentantes;
use App\Services\Reportes\Libs\ReportesHelper;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProveedorPreviusReporte
{
    /**
     * Generar reporte de proveedores Antorami
     */
    public function generar(): array
    {
        // Obtener datos del reporte Antorami
        $data = $this->obtenerDatosAntorami();

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron datos para el reporte Antorami'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_exportar_antorami';

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
     * Obtener datos del reporte Antorami con procesamiento de nombres
     */
    private function obtenerDatosAntorami(): array
    {
        // Obtener datos de la vista reporte_antorami
        $query = DB::select("SELECT * FROM comfaca.reporte_antorami");
        
        $data = [];
        foreach ($query as $empresa) {
            $empresaArray = (array) $empresa;
            
            // Procesar representante legal si está vacío
            if (empty($empresaArray['REPRESENTANTE_LEGAL']) || trim($empresaArray['REPRESENTANTE_LEGAL']) === '') {
                $empresaArray['REPRESENTANTE_LEGAL'] = $this->procesarNombreRepresentante($empresaArray['NIT']);
            }

            // Procesar nombre apoderado si está vacío
            if (!empty($empresaArray['NIT_APO']) && (empty($empresaArray['NOMBRE_APODERADO']) || trim($empresaArray['NOMBRE_APODERADO']) === '')) {
                $empresaArray['NOMBRE_APODERADO'] = $this->procesarNombreRepresentante($empresaArray['NIT_APO']);
            }

            // Obtener clave de acceso del representante
            $cedulaRepleg = trim($empresaArray['CEDULA_REPLEG'] ?? '');
            if (!empty($cedulaRepleg)) {
                $representante = AsaRepresentantes::where('cedrep', $cedulaRepleg)
                    ->select('clave_ingreso')
                    ->first();
                
                $empresaArray['CLAVE_APP'] = $representante ? trim($representante->clave_ingreso) : '';
            } else {
                $empresaArray['CLAVE_APP'] = '';
            }

            $data[] = $empresaArray;
        }

        return $data;
    }

    /**
     * Procesar nombre completo del representante usando diferentes campos
     */
    private function procesarNombreRepresentante(string $nit): string
    {
        // Obtener datos completos de la empresa
        $empresa = Empresas::select([
            'repleg',
            'prinom',
            'segnom',
            'priape',
            'segape',
            'prinomrepleg',
            'segnomrepleg',
            'priaperepleg',
            'segaperepleg'
        ])
        ->where('nit', $nit)
        ->first();

        if (!$empresa) {
            return '';
        }

        // Intentar construir nombre con campos principales
        $nombres = '';
        if (!empty($empresa->prinom)) {
            $nombres = trim($empresa->prinom . ' ' . $empresa->segnom . ' ' . $empresa->priape . ' ' . $empresa->segape);
        }

        // Si no hay nombres principales, intentar con campos de representante
        if (empty(trim($nombres))) {
            $nombres = trim($empresa->prinomrepleg . ' ' . $empresa->segnomrepleg . ' ' . $empresa->priaperepleg . ' ' . $empresa->segaperepleg);
        }

        // Si aún no hay nombres, usar repleg
        if (empty(trim($nombres))) {
            $nombres = $empresa->repleg;
        }

        return $nombres;
    }

    /**
     * Generar reporte con filtros adicionales
     */
    public function generarConFiltros(array $filtros = []): array
    {
        // Obtener datos con filtros aplicados
        $data = $this->obtenerDatosAntoramiConFiltros($filtros);

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron datos con los filtros especificados'
            ];
        }

        // Generar nombre de archivo con sufijo de filtros
        $sufijo = !empty($filtros) ? '_filtrado' : '';
        $name = time() . '_exportar_antorami' . $sufijo;

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
     * Obtener datos con filtros aplicados
     */
    private function obtenerDatosAntoramiConFiltros(array $filtros): array
    {
        $query = DB::table('comfaca.reporte_antorami');

        // Aplicar filtros
        if (!empty($filtros['nit'])) {
            $query->where('NIT', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razon_social'])) {
            $query->where('RAZON_SOCIAL', 'like', '%' . $filtros['razon_social'] . '%');
        }

        if (!empty($filtros['cedrep'])) {
            $query->where('CEDULA_REPLEG', 'like', '%' . $filtros['cedrep'] . '%');
        }

        if (!empty($filtros['nit_apo'])) {
            $query->where('NIT_APO', 'like', '%' . $filtros['nit_apo'] . '%');
        }

        if (!empty($filtros['con_apoderado'])) {
            if ($filtros['con_apoderado'] === 'si') {
                $query->whereNotNull('NIT_APO')
                      ->where('NIT_APO', '<>', '');
            } else {
                $query->where(function($q) {
                    $q->whereNull('NIT_APO')
                      ->orWhere('NIT_APO', '=', '');
                });
            }
        }

        $resultados = $query->get();

        $data = [];
        foreach ($resultados as $empresa) {
            $empresaArray = (array) $empresa;
            
            // Procesar representante legal si está vacío
            if (empty($empresaArray['REPRESENTANTE_LEGAL']) || trim($empresaArray['REPRESENTANTE_LEGAL']) === '') {
                $empresaArray['REPRESENTANTE_LEGAL'] = $this->procesarNombreRepresentante($empresaArray['NIT']);
            }

            // Procesar nombre apoderado si está vacío
            if (!empty($empresaArray['NIT_APO']) && (empty($empresaArray['NOMBRE_APODERADO']) || trim($empresaArray['NOMBRE_APODERADO']) === '')) {
                $empresaArray['NOMBRE_APODERADO'] = $this->procesarNombreRepresentante($empresaArray['NIT_APO']);
            }

            // Obtener clave de acceso del representante
            $cedulaRepleg = trim($empresaArray['CEDULA_REPLEG'] ?? '');
            if (!empty($cedulaRepleg)) {
                $representante = AsaRepresentantes::where('cedrep', $cedulaRepleg)
                    ->select('clave_ingreso')
                    ->first();
                
                $empresaArray['CLAVE_APP'] = $representante ? trim($representante->clave_ingreso) : '';
            } else {
                $empresaArray['CLAVE_APP'] = '';
            }

            $data[] = $empresaArray;
        }

        return $data;
    }

    /**
     * Obtener estadísticas del reporte
     */
    public function obtenerEstadisticas(array $filtros = []): array
    {
        $query = DB::table('comfaca.reporte_antorami');

        // Aplicar filtros si se proporcionan
        if (!empty($filtros['nit'])) {
            $query->where('NIT', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razon_social'])) {
            $query->where('RAZON_SOCIAL', 'like', '%' . $filtros['razon_social'] . '%');
        }

        $totalRegistros = $query->count();

        $conApoderado = DB::table('comfaca.reporte_antorami')
            ->whereNotNull('NIT_APO')
            ->where('NIT_APO', '<>', '')
            ->when(!empty($filtros['nit']), function($q) use ($filtros) {
                $q->where('NIT', 'like', '%' . $filtros['nit'] . '%');
            })
            ->when(!empty($filtros['razon_social']), function($q) use ($filtros) {
                $q->where('RAZON_SOCIAL', 'like', '%' . $filtros['razon_social'] . '%');
            })
            ->count();

        $conClave = DB::table('comfaca.reporte_antorami')
            ->whereNotNull('CLAVE_APP')
            ->where('CLAVE_APP', '<>', '')
            ->when(!empty($filtros['nit']), function($q) use ($filtros) {
                $q->where('NIT', 'like', '%' . $filtros['nit'] . '%');
            })
            ->when(!empty($filtros['razon_social']), function($q) use ($filtros) {
                $q->where('RAZON_SOCIAL', 'like', '%' . $filtros['razon_social'] . '%');
            })
            ->count();

        return [
            'total_registros' => $totalRegistros,
            'con_apoderado' => $conApoderado,
            'sin_apoderado' => $totalRegistros - $conApoderado,
            'con_clave' => $conClave,
            'sin_clave' => $totalRegistros - $conClave,
            'porcentaje_con_apoderado' => $totalRegistros > 0 ? round(($conApoderado / $totalRegistros) * 100, 2) : 0,
            'porcentaje_con_clave' => $totalRegistros > 0 ? round(($conClave / $totalRegistros) * 100, 2) : 0,
            'filtros_aplicados' => $filtros
        ];
    }

    /**
     * Obtener vista previa de datos
     */
    public function obtenerDatosPreview(int $limit = 10, array $filtros = []): array
    {
        $query = DB::table('comfaca.reporte_antorami');

        // Aplicar filtros si se proporcionan
        if (!empty($filtros['nit'])) {
            $query->where('NIT', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razon_social'])) {
            $query->where('RAZON_SOCIAL', 'like', '%' . $filtros['razon_social'] . '%');
        }

        $resultados = $query->limit($limit)->get();

        $data = [];
        foreach ($resultados as $empresa) {
            $empresaArray = (array) $empresa;
            
            // Procesar representante legal si está vacío
            if (empty($empresaArray['REPRESENTANTE_LEGAL']) || trim($empresaArray['REPRESENTANTE_LEGAL']) === '') {
                $empresaArray['REPRESENTANTE_LEGAL'] = $this->procesarNombreRepresentante($empresaArray['NIT']);
            }

            // Procesar nombre apoderado si está vacío
            if (!empty($empresaArray['NIT_APO']) && (empty($empresaArray['NOMBRE_APODERADO']) || trim($empresaArray['NOMBRE_APODERADO']) === '')) {
                $empresaArray['NOMBRE_APODERADO'] = $this->procesarNombreRepresentante($empresaArray['NIT_APO']);
            }

            // Obtener clave de acceso del representante
            $cedulaRepleg = trim($empresaArray['CEDULA_REPLEG'] ?? '');
            if (!empty($cedulaRepleg)) {
                $representante = AsaRepresentantes::where('cedrep', $cedulaRepleg)
                    ->select('clave_ingreso')
                    ->first();
                
                $empresaArray['CLAVE_APP'] = $representante ? trim($representante->clave_ingreso) : '';
            } else {
                $empresaArray['CLAVE_APP'] = '';
            }

            $data[] = $empresaArray;
        }

        return [
            'data' => $data,
            'total_preview' => count($data),
            'limit' => $limit,
            'filtros_aplicados' => $filtros
        ];
    }

    /**
     * Verificar si hay datos disponibles
     */
    public function verificarDatos(array $filtros = []): array
    {
        $query = DB::table('comfaca.reporte_antorami');

        // Aplicar filtros si se proporcionan
        if (!empty($filtros['nit'])) {
            $query->where('NIT', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razon_social'])) {
            $query->where('RAZON_SOCIAL', 'like', '%' . $filtros['razon_social'] . '%');
        }

        $totalRegistros = $query->count();
        $tieneDatos = $totalRegistros > 0;

        return [
            'success' => true,
            'data' => [
                'tiene_datos' => $tieneDatos,
                'total_registros' => $totalRegistros,
                'mensaje' => $tieneDatos 
                    ? "Hay {$totalRegistros} registros disponibles para exportar" 
                    : 'No hay registros disponibles para exportar'
            ],
            'filtros_aplicados' => $filtros
        ];
    }

    /**
     * Buscar proveedores por criterios múltiples
     */
    public function buscar(array $criterios): array
    {
        $query = DB::table('comfaca.reporte_antorami');

        // Aplicar filtros de búsqueda
        if (!empty($criterios['nit'])) {
            $query->where('NIT', 'like', '%' . $criterios['nit'] . '%');
        }

        if (!empty($criterios['razon_social'])) {
            $query->where('RAZON_SOCIAL', 'like', '%' . $criterios['razon_social'] . '%');
        }

        if (!empty($criterios['cedrep'])) {
            $query->where('CEDULA_REPLEG', 'like', '%' . $criterios['cedrep'] . '%');
        }

        if (!empty($criterios['nit_apo'])) {
            $query->where('NIT_APO', 'like', '%' . $criterios['nit_apo'] . '%');
        }

        if (!empty($criterios['con_apoderado'])) {
            if ($criterios['con_apoderado'] === 'si') {
                $query->whereNotNull('NIT_APO')
                      ->where('NIT_APO', '<>', '');
            } else {
                $query->where(function($q) {
                    $q->whereNull('NIT_APO')
                      ->orWhere('NIT_APO', '=', '');
                });
            }
        }

        $resultados = $query->get()->toArray();

        return [
            'data' => $resultados,
            'total' => count($resultados),
            'criterios' => $criterios
        ];
    }

    /**
     * Exportar a CSV (manteniendo compatibilidad con el original)
     */
    public function exportarCsv(array $filtros = []): array
    {
        // Obtener datos
        $data = $this->obtenerDatosAntoramiConFiltros($filtros);

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron datos para exportar'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_exportar_antorami';

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
     * Procesar nombres representante de manera mejorada
     */
    private function procesarNombreRepresentanteMejorado(string $nit): string
    {
        // Obtener datos completos de la empresa
        $empresa = Empresas::select([
            'repleg',
            'prinom',
            'segnom',
            'priape',
            'segape',
            'tipper'
        ])
        ->where('nit', $nit)
        ->first();

        if (!$empresa) {
            return '';
        }

        // Para personas naturales (tipper = 'N')
        if ($empresa->tipper === 'N') {
            $nombres = '';
            if (!empty($empresa->prinom)) {
                $nombres = trim($empresa->prinom . ' ' . $empresa->segnom);
            }
            
            $apellidos = '';
            if (!empty($empresa->priape)) {
                $apellidos = trim($empresa->priape . ' ' . $empresa->segape);
            }

            if (!empty($nombres) && !empty($apellidos)) {
                return $nombres . ' ' . $apellidos;
            } elseif (!empty($nombres)) {
                return $nombres;
            } elseif (!empty($apellidos)) {
                return $apellidos;
            }
        }

        // Para personas jurídicas o si no hay nombres separados
        return $empresa->repleg;
    }
}
