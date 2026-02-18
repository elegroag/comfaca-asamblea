<?php

namespace App\Services\Reportes\Libs;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\Storage;

class CsvToExcelGenerator
{
    private string $fileExcel;

    public function generateReport(string $name, string $filepath, array $data): string
    {
        $file = fopen($filepath, 'w+');
        $i = 0;
        foreach ($data as $ai => $row) {
            if ($i === 0) {
                $keys = array_keys($row);
                $texto_write = implode(';', $keys);
                fwrite($file, $texto_write . "\t\n");
            }
            foreach ($row as $item => $valor) {
                if (str_contains($row[$item] ?? '', "\n")) {
                    $row[$item] = "'" . $row[$item] . "'";
                }
                if (str_contains($row[$item] ?? '', "\t")) {
                    $row[$item] = "'" . $row[$item] . "'";
                }
                $row[$item] = mb_convert_encoding(str_replace(';', ',', $row[$item] ?? ''), 'UTF-8', 'UTF-8');
            }
            $values = array_values($row);
            $texto_write = implode(';', $values);
            fwrite($file, $texto_write . "\t\n");
            $i++;
        }
        fclose($file);

        $this->fileExcel = $name . '.xlsx';
        $objReader = IOFactory::createReader('Csv');
        $spreadsheet = $objReader->load($filepath);

        $objWriter = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $fullPath = Storage::path('temp/' . $this->fileExcel);
        $objWriter->save($fullPath);

        return $this->fileExcel;
    }

    public function outFile(): string
    {
        return $this->fileExcel;
    }
}
