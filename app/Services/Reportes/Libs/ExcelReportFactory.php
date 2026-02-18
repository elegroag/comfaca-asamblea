<?php

namespace App\Services\Reportes\Libs;

class ExcelReportFactory implements ReportFactoryInterface
{
    public function createReportGenerator(): ReportGeneratorInterface
    {
        return new ExcelReportGenerator();
    }

    public function createCsvToExcelGenerator(): CsvToExcelGenerator
    {
        return new CsvToExcelGenerator();
    }
}
