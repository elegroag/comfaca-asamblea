<?php

namespace App\Services\Reportes\Libs;

interface ReportFactoryInterface
{
    public function createReportGenerator(): ReportGeneratorInterface;
}
