<?php

namespace App\Services\Reportes;

use App\Services\Reportes\Libs\Tpdf;
use Carbon\Carbon;

class HabilesPdfPrint
{
    private Tpdf $pdf;
    private string $filepath;
    private int $top = 25;
    private int $x = 68;

    /**
     * Generar PDF de fichas de hábles
     */
    public function generar(string $cedrep, array $data): array
    {
        // Inicializar PDF
        $this->inicializarPdf($cedrep);

        // Extraer datos
        $mesas = $data['mesas'] ?? [];
        $empresas = $data['empresas'] ?? [];
        $representante = $data['representante'] ?? [];
        $poder = $data['poder'] ?? [];
        $clave = $data['clave'] ?? '';

        // Preparar datos de mesas
        $dataMesas = $this->prepararDatosMesas($mesas);

        // Generar páginas para cada empresa activa
        foreach ($empresas as $empresa) {
            if ($empresa['asistente_estado'] !== 'A') {
                continue;
            }

            $this->agregarPaginaEmpresa($empresa, $representante, $poder, $clave, $dataMesas);
        }

        // Guardar PDF
        $this->pdf->Output($this->filepath, 'F');

        return [
            'success' => true,
            'filepath' => $this->filepath,
            'filename' => basename($this->filepath),
            'cedrep' => $cedrep,
            'total_paginas' => $this->pdf->getPage()
        ];
    }

    /**
     * Inicializar configuración del PDF
     */
    private function inicializarPdf(string $cedrep): void
    {
        $this->filepath = time() . "_ficha_{$cedrep}.pdf";

        $this->pdf = new Tpdf(PDF_PAGE_ORIENTATION, PDF_UNIT, 'LETTER', true, 'UTF-8', false);
        $this->pdf->SetCreator(PDF_CREATOR);
        $this->pdf->SetAuthor('Comfaca');
        $this->pdf->SetTitle('Informe Ficha ' . $cedrep);
        $this->pdf->SetSubject('Ficha');
        $this->pdf->SetMargins(10, 5, 10, true);
        $this->pdf->SetDisplayMode('fullpage');
        $this->pdf->SetKeywords('TCPDF, PDF, example, test, guide');
    }

    /**
     * Preparar datos de mesas para acceso rápido
     */
    private function prepararDatosMesas(array $mesas): array
    {
        $dataMesas = ['Indefinida'];

        foreach ($mesas as $mesa) {
            $id = $mesa['id'] ?? null;
            $codigo = $mesa['codigo'] ?? 'Indefinida';

            if ($id) {
                $dataMesas[$id] = $codigo;
            }
        }

        return $dataMesas;
    }

    /**
     * Agregar página para cada empresa
     */
    private function agregarPaginaEmpresa(array $empresa, array $representante, ?array $poder, string $clave, array $dataMesas): void
    {
        $this->pdf->AddPage('P', 'A4');
        $this->pdf->SetXY($this->x, 20);
        $this->pdf->SetFont('helvetica', 'R', 9, null, 'default', true);
        $this->pdf->SetFillColor(254, 254, 254);
        $this->pdf->SetTextColor(10, 10, 10);

        // Preparar datos de la empresa
        $razonSocial = $this->limitarTexto($empresa['razsoc'] ?? '', 100);
        $voto = 1;
        $mesaDetalle = $this->obtenerMesaDetalle($empresa, $dataMesas);

        // Generar HTML para la ficha
        $html = $this->generarHtmlFicha($empresa, $representante, $poder, $clave, $razonSocial, $mesaDetalle, $voto);

        // Escribir contenido en el PDF
        $this->pdf->getY();
        $this->pdf->writeHTMLCell(90, '', $this->x, $this->top, $html, 0, 0, 1, true, 'L', true);

        // Generar segunda copia sin clave
        $htmlSinClave = $this->generarHtmlFicha($empresa, $representante, $poder, '', $razonSocial, $mesaDetalle, $voto);
        $this->pdf->writeHTMLCell(90, '', $this->x, $this->top + 80, $htmlSinClave, 0, 0, 1, true, 'L', true);
    }

    /**
     * Obtener detalle de mesa
     */
    private function obtenerMesaDetalle(array $empresa, array $dataMesas): string
    {
        $mesaId = $empresa['mesa_id'] ?? null;

        if ($mesaId && isset($dataMesas[$mesaId])) {
            return $dataMesas[$mesaId];
        }

        return 'Indefinida';
    }

    /**
     * Generar HTML para la ficha
     */
    private function generarHtmlFicha(
        array $empresa,
        array $representante,
        ?array $poder,
        string $clave,
        string $razonSocial,
        string $mesaDetalle,
        int &$voto
    ): string {
        $cedrep = $representante['cedrep'] ?? '';
        $nombre = $representante['nombre'] ?? '';

        $html = "
            <h4 style=\"text-align:justify;\">ASAMBLEA EXTRAORDINARIA 2025-08-27</h4><p></p>
            <table width=\"205pt\" cellspacing=\"0\" cellpadding=\"1\" border=\"0\">
            <tbody>
                <tr>
                    <td>NIT: {$empresa['nit']}</td>
                </tr>
                <tr>
                    <td>Razón Social: {$razonSocial}</td>
                </tr>
                <tr>
                    <td>Identificación: {$cedrep}</td>
                </tr>
                <tr>
                    <td>Nombre: {$nombre}</td>
                </tr>
                <tr>
                    <td>Mesa: {$mesaDetalle}</td>
                </tr>";

        // Agregar información de poder si aplica
        if ($poder && $poder['nit1'] === $empresa['nit'] && (($poder['esta_ingresado'] ?? 0) > 0)) {
            $voto = $voto + 1;
            $html .= '<tr><td>Poder: ' . $poder['nit2'] . '</td></tr>';
        }

        // Agregar información de votos
        $tvotos = "<tr><td>N° Votos: {$voto}</td></tr>";
        $html .= "VOTOS
                    ACCESS_USUARIO
                </tbody>
            </table>";

        // Agregar clave si se proporciona
        $user = "";
        if (!empty($clave)) {
            $user = "<tr><td align=\"center\">Clave: {$clave}</td></tr>";
        }

        $html = str_replace('ACCESS_USUARIO', $user, $html);
        $html = str_replace('VOTOS', $tvotos, $html);

        return $html;
    }

    /**
     * Limitar texto a una longitud máxima
     */
    private function limitarTexto(string $texto, int $longitud): string
    {
        return substr($texto, 0, $longitud);
    }

    /**
     * Generar fichas individuales para múltiples representantes
     */
    public function generarMultiples(array $representantes): array
    {
        $resultados = [];

        foreach ($representantes as $cedrep => $data) {
            try {
                $resultado = $this->generar($cedrep, $data);
                $resultados[] = $resultado;
            } catch (\Exception $e) {
                $resultados[] = [
                    'success' => false,
                    'cedrep' => $cedrep,
                    'error' => $e->getMessage()
                ];
            }
        }

        return $resultados;
    }

    /**
     * Generar vista previa sin guardar archivo
     */
    public function generarPreview(string $cedrep, array $data): string
    {
        // Inicializar PDF temporal
        $this->inicializarPdf($cedrep);

        // Extraer datos
        $mesas = $data['mesas'] ?? [];
        $empresas = $data['empresas'] ?? [];
        $representante = $data['representante'] ?? [];
        $poder = $data['poder'] ?? [];
        $clave = $data['clave'] ?? '';

        // Preparar datos de mesas
        $dataMesas = $this->prepararDatosMesas($mesas);

        // Generar solo la primera página como preview
        foreach ($empresas as $empresa) {
            if ($empresa['asistente_estado'] === 'A') {
                $this->agregarPaginaEmpresa($empresa, $representante, $poder, $clave, $dataMesas);
                break; // Solo primera página para preview
            }
        }

        // Retornar como string para preview
        return $this->pdf->Output('', 'S');
    }

    /**
     * Obtener estadísticas del reporte
     */
    public function obtenerEstadisticas(array $data): array
    {
        $empresas = $data['empresas'] ?? [];
        $totalEmpresas = count($empresas);
        $empresasActivas = 0;
        $totalVotos = 0;

        foreach ($empresas as $empresa) {
            if ($empresa['asistente_estado'] === 'A') {
                $empresasActivas++;
                $totalVotos++; // Voto base

                // Verificar si tiene poderes adicionales
                if (isset($data['poder']) && $data['poder']['nit1'] === $empresa['nit'] && ($data['poder']['esta_ingresado'] ?? 0) > 0) {
                    $totalVotos++;
                }
            }
        }

        return [
            'total_empresas' => $totalEmpresas,
            'empresas_activas' => $empresasActivas,
            'total_votos' => $totalVotos,
            'paginas_generadas' => $empresasActivas * 2, // Dos copias por empresa activa
            'fecha_generacion' => Carbon::now()->toDateTimeString()
        ];
    }
}
