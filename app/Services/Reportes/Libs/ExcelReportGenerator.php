<?php

namespace App\Services\Reportes\Libs;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Facades\Storage;

class ExcelReportGenerator implements ReportGeneratorInterface
{
    private Spreadsheet $spreadSheet;
    private string $filepath;
    private array $columns;
    private string $file;
    private array $worksheets = [];

    private function initialize(): void
    {
        $this->filepath = "temp/{$this->file}.xlsx";
        $this->spreadSheet = new Spreadsheet();
        $this->spreadSheet->removeSheetByIndex(0);
    }

    public function generateReport(string $title, string $file, array $columns): void
    {
        $this->file = $file;
        $this->columns = $columns;
        $this->initialize();
        $this->addPage(0, "Hoja", $title);
    }

    public function addDataArray(array $arrayKeyValue, ?int $page = null): void
    {
        $page = $page ?? 0;
        $data = [0 => $this->columns];
        foreach ($arrayKeyValue as $registros) {
            $data[] = array_values($registros);
        }
        $this->worksheets[$page]->fromArray($data);
    }

    public function addPage(?int $page = null, string $name = 'Hoja'): void
    {
        $page = $page ?? count($this->worksheets);
        $worksheet = new Worksheet($this->spreadSheet, $name);
        $this->spreadSheet->addSheet($worksheet, $page);
        $this->worksheets[$page] = $worksheet;
    }

    public function outFile(): string
    {
        foreach ($this->worksheets as $worksheet) {
            foreach ($worksheet->getColumnIterator() as $column) {
                $worksheet->getColumnDimension($column->getColumnIndex())->setAutoSize(true);
            }
        }

        $writer = new Xlsx($this->spreadSheet);
        $fullPath = Storage::path($this->filepath);
        $writer->save($fullPath);

        return $this->filepath;
    }

    public function addPageWithTitle(?int $page = null, string $name = 'Hoja', string $title = ''): void
    {
        $this->addPage($page, $name);
        if ($title) {
            $this->addTitleToPage($page ?? 0, $title);
        }
    }

    private function addTitleToPage(int $page, string $title): void
    {
        $worksheet = $this->worksheets[$page];
        $worksheet->setCellValue('A1', $title);
        $worksheet->getStyle('A1')->getFont()->setBold(true);
        $worksheet->getStyle('A1')->getFont()->setSize(14);
    }
}
