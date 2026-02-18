<?php

namespace App\Services\Reportes;

use App\Services\Reportes\Libs\Tpdf;
use Carbon\Carbon;

class QuorumReporte
{
    private Tpdf $pdf;
    private string $filepath;

    /**
     * Generar reporte de asistencias para plataforma Quorum
     */
    public function generar(array $data, int $cantidadPoderes, int $cantidadEmpresas, int $cantidadIngresos): array
    {
        try {
            // Generar nombre de archivo
            $name = time() . '_reporte_asistencia';
            $this->filepath = 'temp/' . $name . '.pdf';

            // Inicializar PDF
            $this->inicializarPdf();

            // Generar tabla HTML con datos de asistencias
            $html = $this->generarTablaAsistencias($data);

            // Generar tabla de resumen
            $htmlResumen = $this->generarTablaResumen($cantidadPoderes, $cantidadEmpresas, $cantidadIngresos, $data);

            // Escribir contenido en el PDF
            $this->pdf->writeHTML($html, true, false, true, false, '');
            $this->pdf->writeHTML($htmlResumen, true, false, true, false, '');

            // Guardar PDF
            $this->pdf->Output($this->filepath, 'F');

            return [
                'success' => true,
                'url' => 'download_reporte/' . basename($this->filepath),
                'filename' => basename($this->filepath),
                'total_registros' => count($data),
                'cantidad_poderes' => $cantidadPoderes,
                'cantidad_empresas' => $cantidadEmpresas,
                'cantidad_ingresos' => $cantidadIngresos,
                'fecha_generacion' => Carbon::now()->toDateTimeString()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al generar el reporte de asistencias: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Inicializar configuración del PDF
     */
    private function inicializarPdf(): void
    {
        $this->pdf = new Tpdf(PDF_PAGE_ORIENTATION, PDF_UNIT, 'LETTER', true, 'UTF-8', false);
        $this->pdf->SetCreator(PDF_CREATOR);
        $this->pdf->SetAuthor('Comfaca');
        $this->pdf->SetTitle('Reporte Asistencias');
        $this->pdf->SetSubject('Reporte');
        $this->pdf->SetMargins(10, 8, 10, true);
        $this->pdf->SetDisplayMode('fullpage');
        $this->pdf->SetKeywords('TCPDF, PDF, example, test, guide');

        // Configurar encabezado dinámico
        $fechaActual = Carbon::now();
        $titulo = "Reporte Asamblea Fecha: " . $fechaActual->format('d') . " De " . $fechaActual->format('F') . ", Hora: " . $fechaActual->format('H:i - a');

        /*
        Tpdf::$header_clasic = true;
        Tpdf::$change_header = true;
        Tpdf::$change_footer = true;
        Tpdf::$change_header_title = $titulo;
        */

        $this->pdf->AddPage('P', 'A4');
        $this->pdf->SetXY(8, 20);
        $this->pdf->SetFont('helvetica', 'R', 7, null, 'default', true);
    }

    /**
     * Generar tabla HTML con datos de asistencias
     */
    private function generarTablaAsistencias(array $data): string
    {
        $html = "
        <table width=\"1000pt\" cellspacing=\"0\" cellpadding=\"1\" border=\"0\">
        <thead>
            <tr>
                <td style=\"text-align:left;width:60pt\" bgcolor=\"#cccccc\"><b>Documento</b></td>
                <td style=\"text-align:left;width:60pt\" bgcolor=\"#cccccc\"><b>NIT</b></td>
                <td style=\"text-align:left;width:160pt\" bgcolor=\"#cccccc\"><b>Representante</b></td>
                <td style=\"text-align:left;width:160pt\" bgcolor=\"#cccccc\"><b>Empresa</b></td>
                <td style=\"text-align:center;width:70pt\" bgcolor=\"#cccccc\"><b>Hora Ingreso</b></td>
                <td style=\"text-align:center;width:40pt\" bgcolor=\"#cccccc\"><b>Votos</b></td>
            </tr>
        </thead>
        <tbody>";

        $votos = 0;
        foreach ($data as $ingreso) {
            $fecha = new Carbon($ingreso['fecha_asistencia']);
            $hora = $fecha->format('H:i:s');
            $representante = ucwords(strtolower($ingreso['representante']));
            $razsoc = ucwords(strtolower($ingreso['razsoc']));

            $html .= "
            <tr>
                <td style=\"border-bottom:1px solid #ddd;text-align:left;width:60pt\">{$ingreso['cedula']}</td>
                <td style=\"border-bottom:1px solid #ddd;text-align:left;width:60pt\">{$ingreso['nit']}</td>
                <td style=\"border-bottom:1px solid #ddd;text-align:left;width:160pt\">{$representante}</td>
                <td style=\"border-bottom:1px solid #ddd;text-align:left;width:160pt\">{$razsoc}</td>
                <td style=\"border-bottom:1px solid #ddd;text-align:center;width:70pt\">{$hora}</td>
                <td style=\"border-bottom:1px solid #ddd;text-align:center;width:40pt\">{$ingreso['votos']}</td>
            </tr>";

            $votos += $ingreso['votos'];
        }

        $html .= "</tbody></table>";

        return $html;
    }

    /**
     * Generar tabla de resumen
     */
    private function generarTablaResumen(int $cantidadPoderes, int $cantidadEmpresas, int $cantidadIngresos, array $data): string
    {
        // Calcular votos totales
        $votos = 0;
        foreach ($data as $ingreso) {
            $votos += $ingreso['votos'];
        }

        return "
        <table width=\"200px\" cellspacing=\"0\" cellpadding=\"1\" border=\"0\">
            <tbody>
                <tr>
                    <td><b>Número de Votos: </b></td>
                    <td>{$votos}</td>
                </tr>
                <tr>
                    <td><b>Número De Poderes: </b></td>
                    <td>{$cantidadPoderes}</td>
                </tr>
                <tr>
                    <td><b>Número Empresas:</b></td>
                    <td>{$cantidadEmpresas}</td>
                </tr>
                <tr>
                    <td><b>Número Ingresos:</b></td>
                    <td>{$cantidadIngresos}</td>
                </tr>
            </tbody>
        </table>";
    }

    /**
     * Generar reporte con filtros adicionales
     */
    public function generarConFiltros(array $data, array $filtros = []): array
    {
        try {
            // Generar nombre de archivo con sufijo de filtros
            $sufijo = !empty($filtros) ? '_filtrado' : '';
            $name = time() . '_reporte_asistencia' . $sufijo;
            $this->filepath = 'temp/' . $name . '.pdf';

            // Inicializar PDF
            $this->inicializarPdf();

            // Aplicar filtros a los datos si se proporcionan
            $dataFiltrados = $this->aplicarFiltros($data, $filtros);

            if (empty($dataFiltrados)) {
                return [
                    'success' => false,
                    'message' => 'No se encontraron datos con los filtros especificados'
                ];
            }

            // Generar tabla HTML con datos filtrados
            $html = $this->generarTablaAsistencias($dataFiltrados);

            // Generar tabla de resumen con datos filtrados
            $htmlResumen = $this->generarTablaResumen(
                count($dataFiltrados),
                0,
                0,
                $dataFiltrados
            );

            // Escribir contenido en el PDF
            $this->pdf->writeHTML($html, true, false, true, false, '');
            $this->pdf->writeHTML($htmlResumen, true, false, true, false, '');

            // Guardar PDF
            $this->pdf->Output($this->filepath, 'F');

            return [
                'success' => true,
                'url' => 'download_reporte/' . basename($this->filepath),
                'filename' => basename($this->filepath),
                'total_registros' => count($dataFiltrados),
                'filtros_aplicados' => $filtros,
                'fecha_generacion' => Carbon::now()->toDateTimeString()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al generar el reporte con filtros: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Aplicar filtros a los datos
     */
    private function aplicarFiltros(array $data, array $filtros): array
    {
        if (empty($filtros)) {
            return $data;
        }

        $dataFiltrados = $data;

        // Aplicar filtros
        if (!empty($filtros['razon_social'])) {
            $dataFiltrados = array_filter($dataFiltrados, function ($item) use ($filtros) {
                return stripos(strtolower($item['razsoc']), strtolower($filtros['razon_social'])) !== false;
            });
        }

        if (!empty($filtros['cedrep'])) {
            $dataFiltrados = array_filter($dataFiltrados, function ($item) use ($filtros) {
                return stripos($item['cedrep'], $filtros['cedrep']) !== false;
            });
        }

        if (!empty($filtros['nombre_representante'])) {
            $dataFiltrados = array_filter($dataFiltrados, function ($item) use ($filtros) {
                return stripos(strtolower($item['representante']), strtolower($filtros['nombre_representante'])) !== false;
            });
        }

        if (!empty($filtros['nit'])) {
            $dataFiltrados = array_filter($dataFiltrados, function ($item) use ($filtros) {
                return stripos($item['nit'], $filtros['nit']) !== false;
            });
        }

        if (!empty($filtros['hora_inicio']) && !empty($filtros['hora_fin'])) {
            $dataFiltrados = array_filter($dataFiltrados, function ($item) use ($filtros) {
                $fecha = new Carbon($item['fecha_asistencia']);
                $hora = $fecha->format('H:i:s');
                return $hora >= $filtros['hora_inicio'] && $hora <= $filtros['hora_fin'];
            });
        }

        return $dataFiltrados;
    }

    /**
     * Obtener estadísticas del reporte
     */
    public function obtenerEstadisticas(array $data, array $filtros = []): array
    {
        $dataFiltrados = $this->aplicarFiltros($data, $filtros);

        $totalRegistros = count($dataFiltrados);

        $votos = 0;
        $conPoderes = 0;

        foreach ($dataFiltrados as $ingreso) {
            $votos += $ingreso['votos'] ?? 0;
            if (!empty($ingreso['apoderado_nit']) && $ingreso['apoderado_nit'] !== '') {
                $conPoderes++;
            }
        }

        return [
            'total_registros' => $totalRegistros,
            'con_poderes' => $conPoderes,
            'total_votos' => $votos,
            'promedio_votos' => $totalRegistros > 0 ? round($votos / $totalRegistros, 2) : 0,
            'porcentaje_con_poderes' => $totalRegistros > 0 ? round(($conPoderes / $totalRegistros) * 100, 2) : 0,
            'filtros_aplicados' => $filtros
        ];
    }

    /**
     * Obtener vista previa de datos
     */
    public function obtenerDatosPreview(array $data, int $limit = 10, array $filtros = []): array
    {
        $dataFiltrados = $this->aplicarFiltros($data, $filtros);

        // Limitar resultados
        $dataLimitado = array_slice($dataFiltrados, 0, $limit);

        return [
            'data' => $dataLimitado,
            'total_preview' => count($dataLimitado),
            'limit' => $limit,
            'filtros_aplicados' => $filtros
        ];
    }

    /**
     * Verificar si hay datos disponibles
     */
    public function verificarDatos(array $data, array $filtros = []): array
    {
        $dataFiltrados = $this->aplicarFiltros($data, $filtros);
        $tieneDatos = !empty($dataFiltrados);

        return [
            'success' => true,
            'data' => [
                'tiene_datos' => $tieneDatos,
                'total_registros' => count($dataFiltrados),
                'mensaje' => $tieneDatos
                    ? "Hay " . count($dataFiltrados) . " registros disponibles para exportar"
                    : 'No hay registros disponibles para exportar',
            ],
            'filtros_aplicados' => $filtros
        ];
    }

    /**
     * Exportar a PDF (manteniendo compatibilidad con el original)
     */
    public function exportarPdf(array $data, array $filtros = []): array
    {
        try {
            // Generar nombre de archivo con sufijo de filtros
            $sufijo = !empty($filtros) ? '_filtrado' : '';
            $name = time() . '_reporte_asistencia' . $sufijo;
            $this->filepath = 'temp/' . $name . '.pdf';

            // Inicializar PDF
            $this->inicializarPdf();

            // Aplicar filtros a los datos si se proporcionan
            $dataFiltrados = $this->aplicarFiltros($data, $filtros);

            if (empty($dataFiltrados)) {
                return [
                    'success' => false,
                    'message' => 'No se encontraron datos para exportar'
                ];
            }

            // Generar tabla HTML con datos filtrados
            $html = $this->generarTablaAsistencias($dataFiltrados);

            // Generar tabla de resumen
            $htmlResumen = $this->generarTablaResumen(
                count($dataFiltrados),
                0,
                0,
                $dataFiltrados
            );

            // Escribir contenido en el PDF
            $this->pdf->writeHTML($html, true, false, true, false, '');
            $this->pdf->writeHTML($htmlResumen, true, false, true, false, '');

            // Guardar PDF
            $this->pdf->Output($this->filepath, 'F');

            return [
                'success' => true,
                'url' => 'download_reporte/' . basename($this->filepath),
                'filename' => basename($this->filepath),
                'total_registros' => count($dataFiltrados),
                'filtros_aplicados' => $filtros,
                'formato' => 'pdf',
                'fecha_generacion' => Carbon::now()->toDateTimeString()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al exportar el reporte PDF: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener conteo de registros por tipo
     */
    public function obtenerConteoPorTipo(array $data): array
    {
        $conteoTipos = [
            'con_poderes' => 0,
            'sin_poderes' => 0,
            'total_votos' => 0
        ];

        foreach ($data as $ingreso) {
            $conteoTipos['total_votos'] += $ingreso['votos'] ?? 0;

            if (!empty($ingreso['apoderado_nit']) && $ingreso['apoderado_nit'] !== '') {
                $conteoTipos['con_poderes']++;
            } else {
                $conteoTipos['sin_poderes']++;
            }
        }

        return $conteoTipos;
    }

    /**
     * Generar reporte con formato específico para Quorum
     */
    public function generarParaQuorum(array $data): array
    {
        try {
            // Generar nombre de archivo específico para Quorum
            $name = 'reporte_asamblea_quorum_' . date('Y-m-d');
            $this->filepath = 'temp/' . $name . '.pdf';

            // Inicializar PDF con encabezado específico
            $this->inicializarPdf();

            // Generar tabla HTML optimizada para Quorum
            $html = $this->generarTablaQuorum($data);

            // Generar resumen
            $htmlResumen = $this->generarResumenQuorum($data);

            // Escribir contenido en el PDF
            $this->pdf->writeHTML($html, true, false, true, false, '');
            $this->pdf->writeHTML($htmlResumen, true, false, true, false, '');

            // Guardar PDF
            $this->pdf->Output($this->filepath, 'F');

            return [
                'success' => true,
                'url' => 'download_reporte/' . basename($this->filepath),
                'filename' => basename($this->filepath),
                'total_registros' => count($data),
                'fecha_generacion' => Carbon::now()->toDateTimeString(),
                'tipo_reporte' => 'quorum'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al generar el reporte para Quorum: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Generar tabla HTML optimizada para Quorum
     */
    private function generarTablaQuorum(array $data): string
    {
        $html = "
        <table width=\"1000pt\" cellspacing=\"0\" cellpadding=\"1\" border=\"0\">
        <thead>
            <tr>
                <td style=\"text-align:left;width:60pt;background-color:#f0f0f0\"><b>Documento</b></td>
                <td style=\"text-align:left;width:60pt;background-color:#f0f0f0\"><b>NIT</b></td>
                <td style=\"text-align:left;width:160px;background-color:#f0f0f0\"><b>Representante</b></td>
                <td style=\"text-align:left;width:160px;background-color:#f0f0f0\"><b>Empresa</b></td>
                <td style=\"text-align:center;width:70px;background-color:#f0f0f0\"><b>Hora Ingreso</b></td>
                <td style=\"text-align:center;width:40px;background-color:#f0f0f0\"><b>Votos</b></td>
            </tr>
        </thead>
        <tbody>";

        foreach ($data as $ingreso) {
            $fecha = new Carbon($ingreso['fecha_asistencia'] ?? Carbon::now());
            $hora = $fecha->format('H:i:s');
            $representante = ucwords(strtolower($ingreso['representante'] ?? ''));
            $razsoc = ucwords(strtolower($ingreso['razsoc'] ?? ''));

            $html .= "
            <tr>
                <td style=\"border-bottom:1px solid #ddd;text-align:left;width:60px;\">" . ($ingreso['cedula'] ?? '') . "</td>
                <td style=\"border-bottom:1px solid #ddd;text-align:left;width:60px;\">" . ($ingreso['nit'] ?? '') . "</td>
                <td style=\"border-bottom:1px solid #ddd;text-align:left;width:160px;\">{$representante}</td>
                <td style=\"border-bottom:1px solid #ddd;text-align:left;width:160px;\">{$razsoc}</td>
                <td style=\"border-bottom:1px solid #ddd;text-align:center;width:70px;\">{$hora}</td>
                <td style=\"border-bottom:1px solid #ddd;text-align:center;width:40px;\">" . ($ingreso['votos'] ?? 0) . "</td>
            </tr>";
        }

        $html .= "</tbody></table>";

        return $html;
    }

    /**
     * Generar resumen específico para Quorum
     */
    private function generarResumenQuorum(array $data): string
    {
        $totalRegistros = count($data);
        $conPoderes = 0;
        $totalVotos = 0;

        foreach ($data as $ingreso) {
            $totalVotos += $ingreso['votos'] ?? 0;
            if (!empty($ingreso['apoderado_nit']) && $ingreso['apoderado_nit'] !== '') {
                $conPoderes++;
            }
        }

        return "
        <table width=\"200px\" cellspacing=\"0\" cellpadding=\"1\" border=\"0\">
            <tbody>
                <tr>
                    <td><b>Número de Votos: </b></td>
                    <td>{$totalVotos}</td>
                </tr>
                <tr>
                    <td><b>Número De Poderes: </b></td>
                    <td>{$conPoderes}</td>
                </tr>
                <tr>
                    <td><b>Número Registros:</b></td>
                    <td>{$totalRegistros}</td>
                </tr>
            </tbody>
        </table>";
    }

    /**
     * Generar reporte con formato específico para exportación Quorum
     */
    public function generarParaExportacionQuorum(array $data): array
    {
        try {
            // Generar nombre de archivo específico para exportación Quorum
            $name = 'reporte_asamblea_quorum_' . date('Y-m-d');
            $this->filepath = 'temp/' . $name . '.pdf';

            // Inicializar PDF con encabezado específico
            $this->inicializarPdf();

            // Generar tabla HTML optimizada para Quorum
            $html = $this->generarTablaQuorum($data);

            // Escribir contenido en el PDF
            $this->pdf->writeHTML($html, true, false, true, false, '');

            // Guardar PDF
            $this->pdf->Output($this->filepath, 'F');

            return [
                'success' => true,
                'url' => 'download_reporte/' . basename($this->filepath),
                'filename' => basename($this->filepath),
                'total_registros' => count($data),
                'fecha_generacion' => Carbon::now()->toDateTimeString(),
                'tipo_reporte' => 'quorum'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al generar el reporte para exportación Quorum: ' . $e->getMessage()
            ];
        }
    }
}
