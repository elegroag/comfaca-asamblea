<?php

namespace App\Services\Reportes\Libs;

use Illuminate\Support\Facades\Storage;

class PDFReportGenerator implements ReportGeneratorInterface
{
    private static $pdf;
    private static int $x_with = 10;
    private static int $y_max = 170;
    private static string $orientation = 'L';
    private string $filepath;
    private string $file;
    private string $title;

    private function initialize(): void
    {
        $this->filepath = "temp/{$this->file}.pdf";
        Tpdf::setInicializa(self::$orientation, $this->title, (self::$orientation === 'L') ? 15 : 10);
        self::$pdf = new Tpdf();
        self::$pdf->SetMargins((self::$orientation === 'L') ? 8 : self::$x_with, (self::$orientation === 'L') ? 20 : 30, 8);
        self::$pdf->AddPage();
        self::$y_max = (self::$orientation === 'L') ? 170 : 250;
    }

    public function generateReport(string $title, string $file, array $columns): void
    {
        $this->title = $title;
        $this->file = $file;
        $this->initialize();
    }

    public function addLine(array $data, int $fsize = 8): void
    {
        self::$pdf->SetFont('helvetica', '', $fsize);
        self::$pdf->Ln();
        self::$pdf->SetX(self::$x_with);
        $a = 0;
        while ($a < count($data)) {
            self::$pdf->Cell($data[$a][1], $data[$a][2], $data[$a][0], 1, 0, $data[$a][3], 0);
            $a++;
        }
        if (self::$pdf->GetY() >= self::$y_max) {
            self::$pdf->AddPage();
            self::$pdf->SetAutoPageBreak(true, 0);
            self::$pdf->setPageMark();
        }
    }

    public function addHeader(array $headers, string $subtitle = '', int $fsize = 9): void
    {
        self::$pdf->SetFont('helvetica', '', $fsize);
        self::$pdf->Ln();

        if ($subtitle !== '') {
            self::$pdf->Ln();
            self::$pdf->SetX(self::$x_with);
            self::$pdf->Cell(150, 5, $subtitle, 0, 1, 'L', 0);
            self::$pdf->Ln();
        }
        self::$pdf->SetX(self::$x_with);
        $a = 0;

        self::$pdf->SetFillColor(192, 233, 178);
        while ($a < count($headers)) {
            self::$pdf->MultiCell($headers[$a][1], $headers[$a][2], $headers[$a][0], 1, 'L', 1, 0, '', '', true, 0, false, true, 4, 'M');
            $a++;
        }

        if (self::$pdf->GetY() >= self::$y_max) {
            self::$pdf->AddPage();
            self::$pdf->SetAutoPageBreak(true, 0);
            self::$pdf->setPageMark();
        }
    }

    public function addParrafo(array $_fields, int $fsize = 10): void
    {
        foreach ($_fields as $field) {
            self::$pdf->SetTextColor(1);
            self::$pdf->SetFont('helvetica', '', $fsize);
            self::$pdf->SetX(self::$x_with);
            if (
                strlen($field) > 120 ||
                str_contains($field, 'style') ||
                str_contains($field, '<b>') ||
                str_contains($field, '<p')
            ) {
                self::$pdf->writeHTML($field, true, false, true, true, 'left');
            } else {
                self::$pdf->Cell(self::$x_with, 5, $field, 0, 0, '', 0, '');
                self::$pdf->Ln();
            }
        }
    }

    public function addHtml(string $html): void
    {
        self::$pdf->SetX(self::$x_with);
        self::$pdf->writeHTML($html, true, false, true, true, 'left');
    }

    public function outFile(): string
    {
        $fullPath = Storage::path($this->filepath);
        self::$pdf->Output($fullPath, 'F');
        return $this->filepath;
    }

    public static function setOrientation(string $orientation): void
    {
        self::$orientation = $orientation;
    }

    public static function setXWidth(int $x_with): void
    {
        self::$x_with = $x_with;
    }

    public static function setYMax(int $y_max): void
    {
        self::$y_max = $y_max;
    }
}
