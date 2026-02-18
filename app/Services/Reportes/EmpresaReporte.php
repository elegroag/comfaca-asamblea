<?php

namespace App\Services\Reportes;

use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\Poderes;
use App\Services\Reportes\Libs\ReportesHelper;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EmpresaReporte
{
    /**
     * Generar reporte detallado de empresa con apoderados y poderdantes
     */
    public function generar(string $nit): array
    {
        // Validar que el NIT exista
        $empresa = Empresas::where('nit', $nit)->first();
        if (!$empresa) {
            return [
                'success' => false,
                'message' => 'Empresa no encontrada con el NIT especificado'
            ];
        }

        // Obtener datos combinados de la empresa y sus relaciones
        $data = $this->obtenerDatosEmpresa($nit);

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron datos para la empresa especificada'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_reporte_empresa_' . $nit;

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::convertirDatosAExcel($name, $data);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($data),
            'nit_empresa' => $nit,
            'razon_social' => $empresa->razsoc
        ];
    }

    /**
     * Obtener datos combinados de empresa con apoderados y poderdantes
     */
    private function obtenerDatosEmpresa(string $nit): array
    {
        // Primera parte: Datos del registro de ingresos de la empresa
        $query1 = DB::select("
            SELECT 
                empresas.nit AS cedula_o_nit,
                'USUARIO' AS perfil,
                CASE WHEN empresas.tipper = 'N' 
                     THEN CONCAT(COALESCE(empresas.prinom, ''), ' ', COALESCE(empresas.segnom, ''))
                     ELSE NULL END AS nombres,
                CASE WHEN empresas.tipper = 'N' 
                     THEN CONCAT(COALESCE(empresas.priape, ''), ' ', COALESCE(empresas.segape, ''))
                     ELSE NULL END AS apellidos,
                '' AS genero,
                empresas.razsoc AS empresa,
                'Asambleísta' AS cargo,
                empresas.email AS email,
                CASE WHEN registro_ingresos.estado = 'A' THEN 'ACTIVO' ELSE 'INACTIVO' END AS estado,
                CASE WHEN registro_ingresos.estado = 'A' THEN 'SI' ELSE 'NO' END AS puede_votar,
                'NULL' AS razon_no_votar,
                '1' AS factor_votacion,
                '' AS cedula_o_nit_apo,
                '' AS nombre_representado_por,
                '' AS correo_representado_por
            FROM registro_ingresos 
            INNER JOIN empresas ON empresas.nit = registro_ingresos.nit
            WHERE registro_ingresos.nit = ?
        ", [$nit]);

        // Segunda parte: Datos de los poderdantes donde esta empresa es apoderada
        $query2 = DB::select("
            SELECT 
                poderes.nit2 AS cedula_o_nit,
                'USUARIO' AS perfil,
                CASE WHEN empresas.tipper = 'N' 
                     THEN CONCAT(COALESCE(empresas.prinom, ''), ' ', COALESCE(empresas.segnom, ''))
                     ELSE NULL END AS nombres,
                CASE WHEN empresas.tipper = 'N' 
                     THEN CONCAT(COALESCE(empresas.priape, ''), ' ', COALESCE(empresas.segape, ''))
                     ELSE NULL END AS apellidos,
                '' AS genero,
                empresas.razsoc AS empresa,
                'Asambleísta' AS cargo,
                empresas.email AS email,
                CASE WHEN poderes.estado = 'A' THEN 'ACTIVO' ELSE 'INACTIVO' END AS estado,
                'SI' AS puede_votar,
                'NULL' AS razon_no_votar,
                '1' AS factor_votacion,
                poderes.nit1 AS cedula_o_nit_apo,
                (SELECT CASE WHEN s2.tipper = 'N' 
                           THEN CONCAT(COALESCE(s2.prinom, ''), ' ', COALESCE(s2.segnom, ''))
                           ELSE NULL END 
                 FROM empresas s2 WHERE s2.nit = poderes.nit1) AS nombre_representado_por,
                (SELECT s2.email FROM empresas s2 WHERE s2.nit = poderes.nit1) AS correo_representado_por
            FROM poderes 
                INNER JOIN empresas ON empresas.nit = poderes.nit2
                INNER JOIN registro_ingresos ON registro_ingresos.nit = poderes.nit1
            WHERE poderes.nit2 = ? 
              AND poderes.estado = 'A' 
              AND registro_ingresos.estado = 'A'
        ", [$nit]);

        // Combinar resultados
        $resultados = array_merge($query1, $query2);

        // Procesar datos para formatear nombres y apellidos
        $dataProcesada = [];
        foreach ($resultados as $empresa) {
            $empresaArray = (array) $empresa;

            // Procesar nombres y apellidos si son nulos
            if (empty($empresaArray['nombres']) || trim($empresaArray['nombres']) === '') {
                $empresaArray = $this->procesarNombresDesdeRepleg($empresaArray);
            }

            // Procesar nombre del representado si es nulo
            if (!empty($empresaArray['cedula_o_nit_apo']) && 
                (empty($empresaArray['nombre_representado_por']) || trim($empresaArray['nombre_representado_por']) === '')) {
                $empresaArray = $this->procesarNombreRepresentado($empresaArray);
            }

            $dataProcesada[] = $empresaArray;
        }

        return $dataProcesada;
    }

    /**
     * Procesar nombres y apellidos desde el campo repleg
     */
    private function procesarNombresDesdeRepleg(array $empresa): array
    {
        $nit = $empresa['cedula_o_nit'];
        
        $resultado = DB::selectOne("SELECT repleg FROM empresas WHERE nit = ?", [$nit]);
        
        if ($resultado && !empty($resultado->repleg)) {
            $repleg = trim($resultado->repleg);
            $exp = explode(' ', $repleg);
            
            switch (count($exp)) {
                case 8:
                case 7:
                case 6:
                    $empresa['nombres'] = $exp[0] . ' ' . $exp[1];
                    $empresa['apellidos'] = $exp[2] . ' ' . $exp[3] . ' ' . $exp[4] . ' ' . $exp[5];
                    break;
                case 5:
                    $empresa['nombres'] = $exp[0] . ' ' . $exp[1];
                    $empresa['apellidos'] = $exp[2] . ' ' . $exp[3] . ' ' . $exp[4];
                    break;
                case 4:
                    $empresa['nombres'] = $exp[0] . ' ' . $exp[1];
                    $empresa['apellidos'] = $exp[2] . ' ' . $exp[3];
                    break;
                case 3:
                    $empresa['nombres'] = $exp[0];
                    $empresa['apellidos'] = $exp[1] . ' ' . $exp[2];
                    break;
                case 2:
                    $empresa['nombres'] = $exp[0];
                    $empresa['apellidos'] = $exp[1];
                    break;
                case 1:
                    $empresa['nombres'] = $exp[0];
                    $empresa['apellidos'] = $exp[0];
                    break;
                default:
                    break;
            }
        }

        return $empresa;
    }

    /**
     * Procesar nombre del representado desde el campo repleg
     */
    private function procesarNombreRepresentado(array $empresa): array
    {
        $nit1 = $empresa['cedula_o_nit_apo'];
        
        $resultado = DB::selectOne("SELECT repleg FROM empresas WHERE nit = ?", [$nit1]);
        
        if ($resultado && !empty($resultado->repleg)) {
            $empresa['nombre_representado_por'] = $resultado->repleg;
        }

        return $empresa;
    }

    /**
     * Generar reporte de empresa por asamblea
     */
    public function generarPorAsamblea(string $nit, int $idAsamblea): array
    {
        // Validar que la empresa exista en la asamblea
        $empresa = Empresas::where('nit', $nit)
                           ->where('asamblea_id', $idAsamblea)
                           ->first();
        
        if (!$empresa) {
            return [
                'success' => false,
                'message' => 'Empresa no encontrada en la asamblea especificada'
            ];
        }

        // Obtener datos filtrados por asamblea
        $data = $this->obtenerDatosEmpresaPorAsamblea($nit, $idAsamblea);

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron datos para la empresa en la asamblea especificada'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_reporte_empresa_' . $nit . '_asamblea_' . $idAsamblea;

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::convertirDatosAExcel($name, $data);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($data),
            'nit_empresa' => $nit,
            'razon_social' => $empresa->razsoc,
            'id_asamblea' => $idAsamblea
        ];
    }

    /**
     * Obtener datos de empresa filtrados por asamblea
     */
    private function obtenerDatosEmpresaPorAsamblea(string $nit, int $idAsamblea): array
    {
        // Primera parte: Datos del registro de ingresos de la empresa
        $query1 = DB::select("
            SELECT 
                empresas.nit AS cedula_o_nit,
                'USUARIO' AS perfil,
                CASE WHEN empresas.tipper = 'N' 
                     THEN CONCAT(COALESCE(empresas.prinom, ''), ' ', COALESCE(empresas.segnom, ''))
                     ELSE NULL END AS nombres,
                CASE WHEN empresas.tipper = 'N' 
                     THEN CONCAT(COALESCE(empresas.priape, ''), ' ', COALESCE(empresas.segape, ''))
                     ELSE NULL END AS apellidos,
                '' AS genero,
                empresas.razsoc AS empresa,
                'Asambleísta' AS cargo,
                empresas.email AS email,
                CASE WHEN registro_ingresos.estado = 'A' THEN 'ACTIVO' ELSE 'INACTIVO' END AS estado,
                CASE WHEN registro_ingresos.estado = 'A' THEN 'SI' ELSE 'NO' END AS puede_votar,
                'NULL' AS razon_no_votar,
                '1' AS factor_votacion,
                '' AS cedula_o_nit_apo,
                '' AS nombre_representado_por,
                '' AS correo_representado_por
            FROM registro_ingresos 
            INNER JOIN empresas ON empresas.nit = registro_ingresos.nit
            WHERE registro_ingresos.nit = ? 
              AND empresas.asamblea_id = ?
              AND registro_ingresos.asamblea_id = ?
        ", [$nit, $idAsamblea, $idAsamblea]);

        // Segunda parte: Datos de los poderdantes donde esta empresa es apoderada
        $query2 = DB::select("
            SELECT 
                poderes.nit2 AS cedula_o_nit,
                'USUARIO' AS perfil,
                CASE WHEN empresas.tipper = 'N' 
                     THEN CONCAT(COALESCE(empresas.prinom, ''), ' ', COALESCE(empresas.segnom, ''))
                     ELSE NULL END AS nombres,
                CASE WHEN empresas.tipper = 'N' 
                     THEN CONCAT(COALESCE(empresas.priape, ''), ' ', COALESCE(empresas.segape, ''))
                     ELSE NULL END AS apellidos,
                '' AS genero,
                empresas.razsoc AS empresa,
                'Asambleísta' AS cargo,
                empresas.email AS email,
                CASE WHEN poderes.estado = 'A' THEN 'ACTIVO' ELSE 'INACTIVO' END AS estado,
                'SI' AS puede_votar,
                'NULL' AS razon_no_votar,
                '1' AS factor_votacion,
                poderes.nit1 AS cedula_o_nit_apo,
                (SELECT CASE WHEN s2.tipper = 'N' 
                           THEN CONCAT(COALESCE(s2.prinom, ''), ' ', COALESCE(s2.segnom, ''))
                           ELSE NULL END 
                 FROM empresas s2 WHERE s2.nit = poderes.nit1 AND s2.asamblea_id = ?) AS nombre_representado_por,
                (SELECT s2.email FROM empresas s2 WHERE s2.nit = poderes.nit1 AND s2.asamblea_id = ?) AS correo_representado_por
            FROM poderes 
                INNER JOIN empresas ON empresas.nit = poderes.nit2
                INNER JOIN registro_ingresos ON registro_ingresos.nit = poderes.nit1
            WHERE poderes.nit2 = ? 
              AND poderes.estado = 'A' 
              AND registro_ingresos.estado = 'A'
              AND empresas.asamblea_id = ?
              AND registro_ingresos.asamblea_id = ?
              AND poderes.asamblea_id = ?
        ", [$idAsamblea, $idAsamblea, $nit, $idAsamblea, $idAsamblea, $idAsamblea]);

        // Combinar resultados
        $resultados = array_merge($query1, $query2);

        // Procesar datos
        $dataProcesada = [];
        foreach ($resultados as $empresa) {
            $empresaArray = (array) $empresa;

            // Procesar nombres y apellidos si son nulos
            if (empty($empresaArray['nombres']) || trim($empresaArray['nombres']) === '') {
                $empresaArray = $this->procesarNombresDesdeRepleg($empresaArray);
            }

            // Procesar nombre del representado si es nulo
            if (!empty($empresaArray['cedula_o_nit_apo']) && 
                (empty($empresaArray['nombre_representado_por']) || trim($empresaArray['nombre_representado_por']) === '')) {
                $empresaArray = $this->procesarNombreRepresentado($empresaArray);
            }

            $dataProcesada[] = $empresaArray;
        }

        return $dataProcesada;
    }

    /**
     * Obtener estadísticas de la empresa
     */
    public function obtenerEstadisticas(string $nit, ?int $idAsamblea = null): array
    {
        $baseQuery = Empresas::where('nit', $nit);
        
        if ($idAsamblea) {
            $baseQuery->where('asamblea_id', $idAsamblea);
        }
        
        $empresa = $baseQuery->first();
        
        if (!$empresa) {
            return [
                'success' => false,
                'message' => 'Empresa no encontrada'
            ];
        }

        // Estadísticas de registro de ingresos
        $registroQuery = RegistroIngresos::where('nit', $nit);
        if ($idAsamblea) {
            $registroQuery->where('asamblea_id', $idAsamblea);
        }
        
        $totalRegistros = $registroQuery->count();
        $registrosActivos = $registroQuery->where('estado', 'A')->count();

        // Estadísticas de poderes como apoderado
        $poderesApoderadoQuery = Poderes::where('nit1', $nit)->where('estado', 'A');
        if ($idAsamblea) {
            $poderesApoderadoQuery->where('asamblea_id', $idAsamblea);
        }
        
        $poderesComoApoderado = $poderesApoderadoQuery->count();

        // Estadísticas de poderes como poderdante
        $poderesPoderdanteQuery = Poderes::where('nit2', $nit)->where('estado', 'A');
        if ($idAsamblea) {
            $poderesPoderdanteQuery->where('asamblea_id', $idAsamblea);
        }
        
        $poderesComoPoderdante = $poderesPoderdanteQuery->count();

        return [
            'success' => true,
            'data' => [
                'nit' => $nit,
                'razon_social' => $empresa->razsoc,
                'tipo_persona' => $empresa->tipper,
                'total_registros' => $totalRegistros,
                'registros_activos' => $registrosActivos,
                'poderes_como_apoderado' => $poderesComoApoderado,
                'poderes_como_poderdante' => $poderesComoPoderdante,
                'puede_votar' => $registrosActivos > 0,
                'id_asamblea' => $idAsamblea
            ]
        ];
    }

    /**
     * Buscar empresas por criterios
     */
    public function buscar(array $criterios): array
    {
        $query = Empresas::select(['nit', 'razsoc', 'tipper', 'email', 'repleg']);

        // Aplicar filtros
        if (!empty($criterios['nit'])) {
            $query->where('nit', 'like', '%' . $criterios['nit'] . '%');
        }

        if (!empty($criterios['razsoc'])) {
            $query->where('razsoc', 'like', '%' . $criterios['razsoc'] . '%');
        }

        if (!empty($criterios['email'])) {
            $query->where('email', 'like', '%' . $criterios['email'] . '%');
        }

        if (!empty($criterios['id_asamblea'])) {
            $query->where('asamblea_id', $criterios['id_asamblea']);
        }

        $empresas = $query->limit(50)->get()->toArray();

        return [
            'data' => $empresas,
            'total' => count($empresas)
        ];
    }
}
