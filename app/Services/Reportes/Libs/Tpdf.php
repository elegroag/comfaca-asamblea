<?php

namespace App\Services\Reportes\Libs;

use TCPDF;

class Tpdf extends TCPDF
{
    public static string $titulo = '';
    public static string $tipoHoja = 'Legal';
    public static string $unidades = 'mm';
    public static int $pX = 15;
    public static string $orientationHoja = 'P';

    public function __construct()
    {
        $this->SetTitle(self::$titulo);
        parent::__construct(self::$orientationHoja, self::$unidades, self::$tipoHoja);
        $this->SetAutoPageBreak(true, 0);
        $this->SetHeaderMargin(5);
        $this->SetFooterMargin(5);
    }

    public static function setInicializa(string $orientationHoja, string $titulo, int $pX): void
    {
        self::$orientationHoja = $orientationHoja;
        self::$titulo = $titulo;
        self::$pX = $pX;
    }

    public function Header(): void
    {
        $this->SetY(0);
        $bMargin = $this->getBreakMargin();
        $auto_page_break = $this->AutoPageBreak;
        $this->SetAutoPageBreak(false, 0);

        if (self::$orientationHoja === 'P') {
            $img_file = public_path('img/membrete_oficios_cobros.jpg');
            $this->Image($img_file, 0, 0, 215, 298, '', '', '', false, 300, '', false, false, 0);
        } else {
            $img_file = public_path('img/membrete.jpg');
            $this->Image($img_file, 0, 0, 298, 215, '', '', '', false, 300, '', false, false, 0);
        }

        $this->SetAutoPageBreak($auto_page_break, $bMargin);
        $this->setPageMark();

        if (strlen(self::$titulo) > 0) {
            $this->SetX(self::$pX);
            $this->SetY(8);
            $this->SetTextColor(0);
            $this->SetFont('helvetica', 'B', 12);
            $this->Cell(self::$pX, 5, mb_convert_encoding(self::$titulo, 'UTF-8', 'UTF-8'), 0, 0, '', 0, '');
        }
    }

    public function Footer(): void
    {
        $this->SetY(-12);
        $this->SetFont('helvetica', 'I', 8);
        $this->Cell(0, 10, 'Page ' . $this->getAliasNumPage() . '/' . $this->getAliasNbPages(), 0, false, 'C', 0, '', 0, false, 'T', 'M');
    }
}
