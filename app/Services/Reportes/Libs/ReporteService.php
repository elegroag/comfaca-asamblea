<?php

namespace App\Services\Reportes\Libs;

use Exception;

class ReporteService
{
    private ReportFactoryInterface $factory;

    public function __construct(ReportFactoryInterface $factory)
    {
        $this->factory = $factory;
    }

    /**
     * Crear generador de reportes Excel
     */
    public function crearExcelGenerator(): ReportGeneratorInterface
    {
        return $this->factory->createReportGenerator();
    }

    /**
     * Crear generador de reportes PDF
     */
    public function crearPdfGenerator(): ReportGeneratorInterface
    {
        return $this->factory->createReportGenerator();
    }

    /**
     * Crear conversor de CSV a Excel
     */
    public function crearCsvToExcelGenerator(): CsvToExcelGenerator
    {
        if ($this->factory instanceof ExcelReportFactory) {
            return $this->factory->createCsvToExcelGenerator();
        }

        throw new Exception('La fábrica actual no soporta conversión de CSV a Excel');
    }

    /**
     * Generar reporte Excel básico
     */
    public function generarExcel(string $titulo, string $archivo, array $columnas, array $datos): string
    {
        $generator = $this->crearExcelGenerator();
        $generator->generateReport($titulo, $archivo, $columnas);
        $generator->addDataArray($datos, 0);
        return $generator->outFile();
    }

    /**
     * Generar reporte PDF básico
     */
    public function generarPdf(string $titulo, string $archivo, array $columnas): string
    {
        $generator = $this->crearPdfGenerator();
        $generator->generateReport($titulo, $archivo, $columnas);
        return $generator->outFile();
    }

    /**
     * Convertir datos CSV a Excel
     */
    public function convertirCsvAExcel(string $nombre, array $datos): string
    {
        $tempPath = tempnam(sys_get_temp_dir(), 'csv_');
        $generator = $this->crearCsvToExcelGenerator();
        $resultado = $generator->generateReport($nombre, $tempPath, $datos);
        unlink($tempPath);
        return $resultado;
    }

    /**
     * Crear fábrica Excel
     */
    public static function crearFactoryExcel(): ReportFactoryInterface
    {
        return new ExcelReportFactory();
    }

    /**
     * Crear fábrica PDF
     */
    public static function crearFactoryPdf(): ReportFactoryInterface
    {
        return new PDFReportFactory();
    }

    /**
     * Método helper para crear servicio con fábrica Excel
     */
    public static function excel(): self
    {
        return new self(self::crearFactoryExcel());
    }

    /**
     * Método helper para crear servicio con fábrica PDF
     */
    public static function pdf(): self
    {
        return new self(self::crearFactoryPdf());
    }
}
