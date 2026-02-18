<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CriteriosRechazos;
use Illuminate\Support\Facades\Storage;

class CriterioRechazosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Intentar leer desde archivo CSV si existe
        if (Storage::disk('local')->exists('criterio_rechazos.csv')) {
            $this->useFile();
        } else {
            // Si no existe el archivo, crear datos de ejemplo
            $this->createSampleData();
        }
    }

    private function useFile()
    {
        $filepath = storage_path('app/criterio_rechazos.csv');
        
        if (!file_exists($filepath)) {
            $this->command->info('No se encontró el archivo criterio_rechazos.csv, usando datos de ejemplo');
            $this->createSampleData();
            return;
        }

        $headers = [];
        $fdata = fopen($filepath, "r");
        
        if ($fdata) {
            $row = 0;
            while (($line = fgets($fdata)) !== false) {
                $line = str_replace(["\n", "\t", "\r"], ' ', $line);
                
                if (strlen(trim($line)) == 0) continue;
                
                if ($row == 0) {
                    $headers = explode(";", $line);
                } else {
                    $fila = explode(";", $line);
                    if (count($fila) > 0) {
                        $data = [
                            'detalle' => trim($fila[0] ?? ''),
                            'estatutos' => trim($fila[1] ?? ''),
                            'tipo' => trim($fila[2] ?? 'POD'),
                        ];
                        
                        CriteriosRechazos::create($data);
                    }
                }
                $row++;
            }
        }
        fclose($fdata);
        
        $this->command->info('Proceso de criterio_rechazos.csv completado');
    }

    private function createSampleData()
    {
        $criterios = [
            [
                'detalle' => 'Poder sin firma del representante legal',
                'estatutos' => 'Artículo 50 del Estatuto Social',
                'tipo' => 'POD',
            ],
            [
                'detalle' => 'Poderdante con suspensión de derechos',
                'estatutos' => 'Artículo 35 del Código de Comercio',
                'tipo' => 'POA',
            ],
            [
                'detalle' => 'Empresa con morosidad mayor a 90 días',
                'estatutos' => 'Política de Cartera Interno',
                'tipo' => 'CAR',
            ],
            [
                'detalle' => 'Funcionario sin autorización de firma',
                'estatutos' => 'Reglamento Interno de Firma',
                'tipo' => 'TRA',
            ],
            [
                'detalle' => 'Documento sin reconocimiento de firma',
                'estatutos' => 'Ley 590 de 2000',
                'tipo' => 'HAB',
            ],
            [
                'detalle' => 'Poder con fecha vencida',
                'estatutos' => 'Artículo 45 del Código Civil',
                'tipo' => 'POD',
            ],
            [
                'detalle' => 'Poderdante con incapacidad legal',
                'estatutos' => 'Artículo 214 del Código Civil',
                'tipo' => 'POA',
            ],
            [
                'detalle' => 'Empresa en proceso de liquidación',
                'estatutos' => 'Ley 1116 de 2006',
                'tipo' => 'CAR',
            ],
        ];

        foreach ($criterios as $criterio) {
            CriteriosRechazos::create($criterio);
        }
        
        $this->command->info('Datos de ejemplo para criterios de rechazos creados');
    }
}