<?php

namespace App\Services\Reportes;

use App\Models\AsaInterventores;
use Illuminate\Support\Facades\DB;

class InterventoresReporte
{
    /**
     * Generar reporte principal de interventores
     */
    public function main(?int $asambleaId = null): array
    {
        try {
            $query = DB::table('asa_interventores')
                ->select([
                    'nit',
                    'cedrep',
                    'razsoc',
                    'repleg',
                    DB::raw("IF(puede_votar > 0, 'SI', 'NO') as puedevotar"),
                    DB::raw("(CASE 
                        WHEN tipo_representacion='I' THEN 'Interventor' 
                        WHEN tipo_representacion='S' THEN 'Suplente' 
                        WHEN tipo_representacion='A' THEN 'Asambleista' 
                        WHEN tipo_representacion='C' THEN 'Concejero' 
                        ELSE 'Ninguno' END) as tipo"),
                    'create_at',
                    DB::raw("IF(email <> '', email, (SELECT empresas.email FROM empresas WHERE empresas.cedrep = asa_interventores.cedrep LIMIT 1)) as correo")
                ]);

            if ($asambleaId) {
                $query->where('asamblea_id', $asambleaId);
            }

            $interventores = $query->get()->toArray();

            return [
                'success' => true,
                'data' => $this->encodeUtf8($interventores),
                'total' => count($interventores),
                'message' => 'Reporte generado exitosamente'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Error generando el reporte: ' . $e->getMessage(),
                'data' => [],
                'total' => 0
            ];
        }
    }

    /**
     * Generar reporte en formato CSV
     */
    public function exportarCsv(?int $asambleaId = null): array
    {
        try {
            $result = $this->main($asambleaId);
            
            if (!$result['success']) {
                return $result;
            }

            $filename = 'interventores_' . date('Y-m-d_H-i-s') . '.csv';
            $filepath = storage_path('app/public/exports/' . $filename);

            // Asegurar que el directorio existe
            if (!is_dir(dirname($filepath))) {
                mkdir(dirname($filepath), 0755, true);
            }

            $file = fopen($filepath, 'w');
            
            // Cabeceras
            fputcsv($file, [
                'NIT',
                'Cédula Representante',
                'Razón Social',
                'Representante Legal',
                'Puede Votar',
                'Tipo Representación',
                'Fecha Creación',
                'Correo'
            ]);

            // Datos
            foreach ($result['data'] as $interventor) {
                fputcsv($file, [
                    $interventor->nit ?? '',
                    $interventor->cedrep ?? '',
                    $interventor->razsoc ?? '',
                    $interventor->repleg ?? '',
                    $interventor->puedevotar ?? '',
                    $interventor->tipo ?? '',
                    $interventor->create_at ?? '',
                    $interventor->correo ?? ''
                ]);
            }

            fclose($file);

            return [
                'success' => true,
                'filename' => $filename,
                'filepath' => $filepath,
                'download_url' => url('storage/exports/' . $filename),
                'total_records' => $result['total'],
                'message' => 'Archivo CSV generado exitosamente'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Error generando CSV: ' . $e->getMessage(),
                'filename' => null
            ];
        }
    }

    /**
     * Generar reporte en formato Excel (requiere Laravel Excel)
     */
    public function exportarExcel(?int $asambleaId = null): array
    {
        try {
            $result = $this->main($asambleaId);
            
            if (!$result['success']) {
                return $result;
            }

            $filename = 'interventores_' . date('Y-m-d_H-i-s') . '.xlsx';
            
            // Aquí se podría integrar con Laravel Excel
            // Por ahora retornamos el mismo formato CSV con extensión xlsx
            return $this->exportarCsv($asambleaId);

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Error generando Excel: ' . $e->getMessage(),
                'filename' => null
            ];
        }
    }

    /**
     * Codificar a UTF-8 array de objetos
     */
    private function encodeUtf8(array $data): array
    {
        return array_map(function($item) {
            return array_map(function($value) {
                return is_string($value) ? utf8_encode($value) : $value;
            }, (array) $item);
        }, $data);
    }

    /**
     * Obtener estadísticas de interventores
     */
    public function estadisticas(?int $asambleaId = null): array
    {
        try {
            $query = AsaInterventores::query();

            if ($asambleaId) {
                $query->where('asamblea_id', $asambleaId);
            }

            $total = $query->count();
            $activos = $query->where('estado', 'A')->count();
            $puedenVotar = $query->where('puede_votar', '>', 0)->count();

            // Por tipo de representación
            $porTipo = $query->selectRaw('tipo_representacion, COUNT(*) as count')
                ->groupBy('tipo_representacion')
                ->pluck('count', 'tipo_representacion')
                ->toArray();

            return [
                'success' => true,
                'total' => $total,
                'activos' => $activos,
                'pueden_votar' => $puedenVotar,
                'por_tipo' => $porTipo,
                'tipos_descripcion' => [
                    'I' => 'Interventor',
                    'S' => 'Suplente',
                    'A' => 'Asambleista',
                    'C' => 'Concejero'
                ]
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Error obteniendo estadísticas: ' . $e->getMessage()
            ];
        }
    }
}
