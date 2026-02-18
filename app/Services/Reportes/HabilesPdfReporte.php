<?php

namespace App\Services\Reportes;

use App\Models\Empresas;
use App\Services\Reportes\Libs\Tpdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class HabilesPdfReporte
{
    private Tpdf $pdf;
    private string $filepath;

    /**
     * Generar informe PDF de empresas por asamblea
     */
    public function generar(int $asambleaId): array
    {
        // Inicializar PDF
        $this->inicializarPdf();

        // Obtener datos de empresas
        $data = $this->obtenerDatosEmpresas($asambleaId);

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron empresas para la asamblea especificada'
            ];
        }

        // Generar HTML de la tabla
        $html = $this->generarHtmlTabla($data);

        // Escribir HTML en PDF
        $this->pdf->writeHTML($html, true, false, true, false, '');

        // Guardar PDF
        $this->pdf->Output($this->filepath, 'F');

        return [
            'success' => true,
            'url' => 'download_reporte/' . basename($this->filepath),
            'filename' => basename($this->filepath),
            'total_empresas' => count($data),
            'asamblea_id' => $asambleaId
        ];
    }

    /**
     * Inicializar configuración del PDF
     */
    private function inicializarPdf(): void
    {
        $this->filepath = 'temp/' . time() . '_informe_empresas.pdf';
        
        $this->pdf = new Tpdf(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $this->pdf->SetCreator(PDF_CREATOR);
        $this->pdf->SetAuthor('Comfaca');
        $this->pdf->SetTitle('Informe Empresas');
        $this->pdf->SetSubject('Empresas');
        $this->pdf->SetMargins(10, 10, 10, true);
        $this->pdf->SetDisplayMode('fullpage');
        $this->pdf->SetKeywords('TCPDF, PDF, example, test, guide');
        $this->pdf->AddPage('L', 'A4');
        $this->pdf->SetXY(8, 23);
        $this->pdf->SetFont('helvetica', 'R', 7, null, 'default', true);
    }

    /**
     * Obtener datos de empresas para la asamblea
     */
    private function obtenerDatosEmpresas(int $asambleaId): array
    {
        return Empresas::select([
            'nit',
            'estado',
            'email',
            'razsoc',
            'repleg',
            'cedrep'
        ])
        ->where('asamblea_id', $asambleaId)
        ->orderBy('razsoc')
        ->get()
        ->map(function ($empresa) {
            return [
                'Nit' => $empresa->nit,
                'estado' => $empresa->estado,
                'direccion' => '', // Campo vacío como en el original
                'email' => $empresa->email,
                'Razon social' => $empresa->razsoc,
                'Representante legal' => $empresa->repleg,
                'Iden. Representante' => $empresa->cedrep
            ];
        })
        ->toArray();
    }

    /**
     * Generar HTML de la tabla con datos de empresas
     */
    private function generarHtmlTabla(array $data): string
    {
        $html = '<table cellspacing="0" cellpadding="1" border="0">';
        
        // Generar encabezado
        if (!empty($data)) {
            $keys = array_keys($data[0]);
            $html .= '<thead>';
            $html .= '<tr style="background-color:#2ba9cd;color:#FFFFFF">';
            
            foreach ($keys as $key) {
                $html .= '<td>' . htmlspecialchars($key, ENT_QUOTES, 'UTF-8') . '</td>';
            }
            
            $html .= '</tr>';
            $html .= '</thead>';
            $html .= '<tbody>';
        }

        // Generar filas de datos
        foreach ($data as $index => $row) {
            // Procesar cada valor para limpiar caracteres especiales
            $rowProcesada = $this->procesarFilaDatos($row);
            
            // Alternar colores de filas
            $style = ($index % 2 === 0) ? 'background-color:#EEFAFF' : '';
            
            $html .= '<tr style="' . $style . '">';
            
            foreach ($rowProcesada as $valor) {
                $html .= '<td>' . htmlspecialchars($valor, ENT_QUOTES, 'UTF-8') . '</td>';
            }
            
            $html .= '</tr>';
        }

        $html .= '</tbody></table>';
        
        return $html;
    }

    /**
     * Procesar y limpiar datos de una fila
     */
    private function procesarFilaDatos(array $row): array
    {
        foreach ($row as $key => $valor) {
            // Manejar saltos de línea y tabulaciones
            if (strpos($valor, "\n") !== false) {
                $row[$key] = "'" . $valor . "'";
            }
            if (strpos($valor, "\t") !== false) {
                $row[$key] = "'" . $valor . "'";
            }
            
            // Reemplazar punto y coma
            $row[$key] = str_replace(';', ',', $valor);
            
            // Manejar codificación de caracteres
            $row[$key] = $this->normalizarEncoding($valor);
        }
        
        return $row;
    }

    /**
     * Normalizar codificación de caracteres
     */
    private function normalizarEncoding(string $texto): string
    {
        // Detectar y convertir codificación si es necesario
        $encoding = mb_detect_encoding($texto, ['UTF-8', 'ASCII', 'ISO-8859-1'], true);
        
        if ($encoding === false) {
            // Si no se puede detectar, asumir UTF-8
            return mb_convert_encoding($texto, 'UTF-8', 'UTF-8');
        }
        
        if ($encoding !== 'UTF-8') {
            return mb_convert_encoding($texto, 'UTF-8', $encoding);
        }
        
        return $texto;
    }

    /**
     * Generar informe con filtros adicionales
     */
    public function generarConFiltros(int $asambleaId, array $filtros = []): array
    {
        // Inicializar PDF
        $this->inicializarPdf();

        // Obtener datos con filtros
        $data = $this->obtenerDatosEmpresasConFiltros($asambleaId, $filtros);

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No se encontraron empresas con los filtros especificados'
            ];
        }

        // Generar HTML de la tabla
        $html = $this->generarHtmlTabla($data);

        // Escribir HTML en PDF
        $this->pdf->writeHTML($html, true, false, true, false, '');

        // Guardar PDF con nombre modificado si hay filtros
        $sufijo = !empty($filtros) ? '_filtrado' : '';
        $this->filepath = 'temp/' . time() . '_informe_empresas' . $sufijo . '.pdf';
        $this->pdf->Output($this->filepath, 'F');

        return [
            'success' => true,
            'url' => 'download_reporte/' . basename($this->filepath),
            'filename' => basename($this->filepath),
            'total_empresas' => count($data),
            'asamblea_id' => $asambleaId,
            'filtros_aplicados' => $filtros
        ];
    }

    /**
     * Obtener datos de empresas con filtros aplicados
     */
    private function obtenerDatosEmpresasConFiltros(int $asambleaId, array $filtros): array
    {
        $query = Empresas::select([
            'nit',
            'estado',
            'email',
            'razsoc',
            'repleg',
            'cedrep'
        ])
        ->where('asamblea_id', $asambleaId);

        // Aplicar filtros
        if (!empty($filtros['estado'])) {
            $query->where('estado', $filtros['estado']);
        }

        if (!empty($filtros['nit'])) {
            $query->where('nit', 'like', '%' . $filtros['nit'] . '%');
        }

        if (!empty($filtros['razsoc'])) {
            $query->where('razsoc', 'like', '%' . $filtros['razsoc'] . '%');
        }

        if (!empty($filtros['email'])) {
            $query->where('email', 'like', '%' . $filtros['email'] . '%');
        }

        return $query->orderBy('razsoc')
            ->get()
            ->map(function ($empresa) {
                return [
                    'Nit' => $empresa->nit,
                    'estado' => $empresa->estado,
                    'direccion' => '',
                    'email' => $empresa->email,
                    'Razon social' => $empresa->razsoc,
                    'Representante legal' => $empresa->repleg,
                    'Iden. Representante' => $empresa->cedrep
                ];
            })
            ->toArray();
    }

    /**
     * Obtener estadísticas del informe
     */
    public function obtenerEstadisticas(int $asambleaId): array
    {
        $totalEmpresas = Empresas::where('asamblea_id', $asambleaId)->count();
        
        $porEstado = Empresas::where('asamblea_id', $asambleaId)
            ->selectRaw('estado, COUNT(*) as count')
            ->groupBy('estado')
            ->pluck('count', 'estado')
            ->toArray();

        $conEmail = Empresas::where('asamblea_id', $asambleaId)
            ->whereNotNull('email')
            ->where('email', '<>', '')
            ->count();

        return [
            'total_empresas' => $totalEmpresas,
            'por_estado' => $porEstado,
            'con_email' => $conEmail,
            'sin_email' => $totalEmpresas - $conEmail,
            'asamblea_id' => $asambleaId
        ];
    }

    /**
     * Generar vista previa del informe
     */
    public function generarPreview(int $asambleaId, int $limit = 10): string
    {
        // Inicializar PDF temporal
        $this->inicializarPdf();

        // Obtener datos limitados para preview
        $data = Empresas::select([
            'nit',
            'estado',
            'email',
            'razsoc',
            'repleg',
            'cedrep'
        ])
        ->where('asamblea_id', $asambleaId)
        ->orderBy('razsoc')
        ->limit($limit)
        ->get()
        ->map(function ($empresa) {
            return [
                'Nit' => $empresa->nit,
                'estado' => $empresa->estado,
                'direccion' => '',
                'email' => $empresa->email,
                'Razon social' => $empresa->razsoc,
                'Representante legal' => $empresa->repleg,
                'Iden. Representante' => $empresa->cedrep
            ];
        })
        ->toArray();

        // Generar HTML de la tabla
        $html = $this->generarHtmlTabla($data);

        // Escribir HTML en PDF
        $this->pdf->writeHTML($html, true, false, true, false, '');

        // Retornar como string para preview
        return $this->pdf->Output('', 'S');
    }
}
