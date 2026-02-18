<?php

namespace App\Services\Reportes\Libs;

use App\Services\Reportes\Libs\ReporteService;

/**
 * Helper class para facilitar el uso del generador de reportes
 * Mantiene compatibilidad con el estilo de Kumbia pero usando la infraestructura de Laravel
 */
class ReportesHelper
{
    /**
     * Crear reporte Excel usando el factory pattern
     */
    public static function crearExcel(string $titulo, string $archivo, array $columnas, array $datos = []): string
    {
        $service = ReporteService::excel();
        return $service->generarExcel($titulo, $archivo, $columnas, $datos);
    }

    /**
     * Crear reporte PDF usando el factory pattern
     */
    public static function crearPdf(string $titulo, string $archivo, array $columnas): string
    {
        $service = ReporteService::pdf();
        return $service->generarPdf($titulo, $archivo, $columnas);
    }

    /**
     * Convertir array de datos a Excel (similar al CsvToExcelGenerator original)
     */
    public static function convertirDatosAExcel(string $nombre, array $datos): string
    {
        $service = ReporteService::excel();
        return $service->convertirCsvAExcel($nombre, $datos);
    }

    /**
     * Obtener instancia del generador Excel para manipulación avanzada
     */
    public static function getExcelGenerator(): ExcelReportGenerator
    {
        $service = ReporteService::excel();
        return $service->crearExcelGenerator();
    }

    /**
     * Obtener instancia del generador PDF para manipulación avanzada
     */
    public static function getPdfGenerator(): PDFReportGenerator
    {
        $service = ReporteService::pdf();
        return $service->crearPdfGenerator();
    }

    /**
     * Obtener instancia del conversor CSV a Excel
     */
    public static function getCsvToExcelGenerator(): CsvToExcelGenerator
    {
        $service = ReporteService::excel();
        return $service->crearCsvToExcelGenerator();
    }

    /**
     * Método helper para compatibilidad con código Kumbia existente
     * Simula el patrón Core::importLibrary('Reportes', 'Factory')
     */
    public static function factory(string $type = 'excel'): ReportFactoryInterface
    {
        return match ($type) {
            'excel' => new ExcelReportFactory(),
            'pdf' => new PDFReportFactory(),
            default => new ExcelReportFactory(),
        };
    }
}
