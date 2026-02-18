<?php

namespace App\Services\Reportes\Libs;

interface ReportGeneratorInterface
{
    public function generateReport(string $title, string $file, array $columns): void;
    public function outFile(): string;
}
