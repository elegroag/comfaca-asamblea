<?php

namespace App\Services\Reportes;

use App\Models\Poderes;
use App\Models\Empresas;
use App\Services\Reportes\Libs\ReportesHelper;
use Carbon\Carbon;

class ActaPoderesReporte
{
    private string $horaRecepcion = '8:00 am';
    private string $diaCierre = '25 de agosto de 2025';
    private string $diaRecepcion = '25 de agosto de 2025';
    private string $profesional2 = 'María Camila Vargas Ramirez';
    private string $revisoraFiscal = 'Deyanira Rivera Salgado';
    private string $auditoriaInterna1 = 'Robinson Almario Penagos';
    private string $auditoriaInterna2 = 'Nidia Cirleny Villamil Rodriguez';
    private string $fechaAsamblea = '27 DE AGOSTO DE 2025';

    public function generar(int $idAsamblea): array
    {
        // Obtener datos de poderes con relaciones
        $poderes = Poderes::select([
            'poderes.nit1 as nit_apoderado',
            'apoderado.razsoc as razon_social_apoderado',
            'apoderado.cedrep as ide_apoderado',
            'apoderado.repleg as representante_legal_apoderado',
            'poderes.nit2 as nit_poderdante',
            'poderdante.razsoc as razon_social_poderdante',
            'poderdante.cedrep as ide_poderdante',
            'poderdante.repleg as representante_legal_poderdante',
            'poderes.estado as estado_poder',
            'poderes.fecha as fecha',
            'poderes.radicado as radicado'
        ])
        ->leftJoin('empresas as poderdante', function($join) use ($idAsamblea) {
            $join->on('poderdante.nit', '=', 'poderes.nit2')
                 ->where('poderdante.asamblea_id', '=', $idAsamblea);
        })
        ->leftJoin('empresas as apoderado', function($join) use ($idAsamblea) {
            $join->on('apoderado.nit', '=', 'poderes.nit1')
                 ->where('apoderado.asamblea_id', '=', $idAsamblea);
        })
        ->where('poderes.asamblea_id', $idAsamblea)
        ->get()
        ->toArray();

        $cantidadPoderes = count($poderes);

        // Obtener resumen de poderes aprobados y rechazados
        $aprobadas = Poderes::where('asamblea_id', $idAsamblea)
                          ->where('estado', 'A')
                          ->count();

        $rechazadas = Poderes::where('asamblea_id', $idAsamblea)
                            ->where('estado', '<>', 'A')
                            ->count();

        // Datos de fecha y hora actuales
        $dia = Carbon::now()->day;
        $mes = ucfirst(Carbon::now()->locale('es')->monthName);
        $year = Carbon::now()->year;
        $hora = Carbon::now()->format('H:i:s');

        // Generar contenido del reporte
        $parrafos = $this->generarParrafos(
            $cantidadPoderes,
            $aprobadas,
            $rechazadas,
            $dia,
            $mes,
            $year,
            $hora
        );

        // Generar tabla de firmas
        $tablaFirmas = $this->generarTablaFirmas();

        // Crear PDF usando el servicio de reportes
        $filename = time() . '_acta_revision_poderes';
        $filepath = $this->crearPdf($filename, $parrafos, $tablaFirmas);

        return [
            'url' => 'download_reporte/' . basename($filepath),
            'filename' => basename($filepath)
        ];
    }

    private function generarParrafos(
        int $cantidadPoderes,
        int $aprobadas,
        int $rechazadas,
        int $dia,
        string $mes,
        int $year,
        string $hora
    ): array {
        return [
            '',
            '<h4 style="text-align:center">ACTA DE REVISIÓN Y VERIFICACIÓN DE PODERES</h4>',
            '<h4 style="text-align:center">ASAMBLEA GENERAL EXTRAORDINARIA ' . $this->fechaAsamblea . '</h4>',
            '',
            '',
            '<p style="text-align:justify">Dando cumplimiento a la Circular Única Básica Jurídica Título III artículo 3.1.1.3.2 Poderes de fecha 02 de marzo de 2022 ' .
                'emitida por la Superintendencia del Subsidio Familiar, hoy 25 de agosto de 2025, se reunieron en la oficina de Revisoría ' .
                'Fiscal de COMFACA, la Revisora Fiscal ' . $this->revisoraFiscal . ', con el apoyo para la revisión y verificación de poderes ' .
                'del Jefe del Departamento Jurídico y Contratación Harold Alberto Pacheco Herrera, la oficina de Auditoría Interna ' . $this->auditoriaInterna2 . ' y de la oficina de Subsidio y Aportes Maria Camila Triana Sapuy.</p>',
            '',
            '<p style="text-align:justify">Cerrado el proceso de recepción de poderes a las ' . $this->horaRecepcion . ' del día ' . $this->diaCierre . ', en Gestión Documental, ' .
                'fueron entregados a la Revisora Fiscal de manera física la cantidad de ' . $cantidadPoderes . ', se inició el proceso de verificación' .
                ' de la información de acuerdo con los lineamientos de la convocatoria y a los Estatutos de la Corporación.</p>',
            '',
            '<p style="text-align:justify">Una vez concluido el proceso de revisión y verificación, se ingresan hábiles ' . $aprobadas . ' poderes y se inhabilitan ' . $rechazadas . ' poderes.</p>',
            '',
            '<p>El listado de los hábiles e inhábiles se anexa a la presente acta.</p>',
            '<p>Para constancia se firma por quienes en ella intervinieron siendo las ' . $hora . ' el día ' . $dia . ' de ' . $mes . ' de ' . $year . '.</p>',
            '',
            '',
            ''
        ];
    }

    private function generarTablaFirmas(): string
    {
        return '<table>
            <tbody>
                <tr>
                    <td width="210">____________________________<br/>
                    ' . $this->revisoraFiscal . '</td>
                    <td width="50"></td>
                    <td width="210"></td>
                </tr>
                <tr>
                    <td width="210">Cargo: Revisora Fiscal</td>
                    <td width="50"></td>
                    <td width="210"></td>
                </tr>
                <tr><td colspan="3"></td></tr>
                <tr><td colspan="3"></td></tr>
                <tr><td colspan="3"></td></tr>
                <tr>
                    <td width="210"><br/></td>
                    <td width="50"></td>
                    <td width="210"></td>
                </tr>
                <tr>
                    <td width="210"></td>
                    <td width="50"></td>
                    <td width="210"></td>
                </tr>
                <tr><td colspan="3"></td></tr>
                <tr><td colspan="3"></td></tr>
                <tr><td colspan="3"></td></tr>
                <tr>
                    <td width="210"></td>
                    <td width="50"></td>
                    <td width="210"></td>
                </tr>
                <tr>
                    <td width="210"></td>
                    <td width="50"></td>
                    <td width="210"></td>
                </tr>
            </tbody>
        </table>';
    }

    private function crearPdf(string $filename, array $parrafos, string $tablaFirmas): string
    {
        // Usar el servicio de reportes para generar el PDF
        $generator = ReportesHelper::getPdfGenerator();
        $generator->generateReport('Acta de Revisión y Verificación de Poderes', $filename, []);
        
        // Agregar párrafos
        $generator->addParrafo($parrafos, 11);
        
        // Agregar tabla de firmas
        $generator->addHtml($tablaFirmas);
        
        return $generator->outFile();
    }

    /**
     * Obtener datos completos de poderes para exportación
     */
    public function obtenerDatosPoderes(int $idAsamblea): array
    {
        return Poderes::select([
            'poderes.nit1 as nit_apoderado',
            'apoderado.razsoc as razon_social_apoderado',
            'apoderado.cedrep as ide_apoderado',
            'apoderado.repleg as representante_legal_apoderado',
            'poderes.nit2 as nit_poderdante',
            'poderdante.razsoc as razon_social_poderdante',
            'poderdante.cedrep as ide_poderdante',
            'poderdante.repleg as representante_legal_poderdante',
            'poderes.estado as estado_poder',
            'poderes.fecha as fecha',
            'poderes.radicado as radicado'
        ])
        ->leftJoin('empresas as poderdante', function($join) use ($idAsamblea) {
            $join->on('poderdante.nit', '=', 'poderes.nit2')
                 ->where('poderdante.asamblea_id', '=', $idAsamblea);
        })
        ->leftJoin('empresas as apoderado', function($join) use ($idAsamblea) {
            $join->on('apoderado.nit', '=', 'poderes.nit1')
                 ->where('apoderado.asamblea_id', '=', $idAsamblea);
        })
        ->where('poderes.asamblea_id', $idAsamblea)
        ->get()
        ->toArray();
    }

    /**
     * Obtener estadísticas de poderes
     */
    public function obtenerEstadisticas(int $idAsamblea): array
    {
        $aprobadas = Poderes::where('asamblea_id', $idAsamblea)
                          ->where('estado', 'A')
                          ->count();

        $rechazadas = Poderes::where('asamblea_id', $idAsamblea)
                            ->where('estado', '<>', 'A')
                            ->count();

        $total = $aprobadas + $rechazadas;

        return [
            'aprobadas' => $aprobadas,
            'rechazadas' => $rechazadas,
            'total' => $total,
            'porcentaje_aprobadas' => $total > 0 ? round(($aprobadas / $total) * 100, 2) : 0,
            'porcentaje_rechazadas' => $total > 0 ? round(($rechazadas / $total) * 100, 2) : 0
        ];
    }
}
