<?php

namespace App\Services\Reportes\Libs;

class PDFReportFactory implements ReportFactoryInterface
{
    public function createReportGenerator(): ReportGeneratorInterface
    {
        return new PDFReportGenerator();
    }
}
