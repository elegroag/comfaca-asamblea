<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AsaRepresentantes;
use Illuminate\Support\Facades\Storage;

class AsaRepresentantesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Intentar leer desde archivo CSV si existe
        if (Storage::disk('local')->exists('asa_representantes.csv')) {
            $this->useFile();
        } else {
            // Si no existe el archivo, crear datos de ejemplo
            $this->createSampleData();
        }
    }

    private function useFile()
    {
        $filepath = storage_path('app/asa_representantes.csv');
        
        if (!file_exists($filepath)) {
            $this->command->info('No se encontró el archivo asa_representantes.csv, usando datos de ejemplo');
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
                            'cedtra' => trim($fila[1] ?? ''),
                            'asamblea_id' => (int)(trim($fila[2] ?? 1)),
                            'nombre_representado' => trim($fila[3] ?? ''),
                            'cedrep' => trim($fila[1] ?? ''),
                            'tipo_representacion' => 'legal',
                            'estado' => 'activo',
                            'observaciones' => trim($fila[4] ?? ''),
                        ];
                        
                        AsaRepresentantes::create($data);
                    }
                }
                $row++;
            }
        }
        fclose($fdata);
        
        $this->command->info('Proceso de asa_representantes.csv completado');
    }

    private function createSampleData()
    {
        $representantes = [
            [
                'cedtra' => '123456789',
                'asamblea_id' => 1,
                'nombre_representado' => 'Juan Pérez Representado',
                'cedrep' => '123456789',
                'tipo_representacion' => 'legal',
                'estado' => 'activo',
                'observaciones' => 'Representación legal principal',
            ],
            [
                'cedtra' => '987654321',
                'asamblea_id' => 1,
                'nombre_representado' => 'María González Representada',
                'cedrep' => '987654321',
                'tipo_representacion' => 'legal',
                'estado' => 'activo',
                'observaciones' => 'Representación legal con poder',
            ],
            [
                'cedtra' => '456789123',
                'asamblea_id' => 1,
                'nombre_representado' => 'Carlos Rodríguez Representado',
                'cedrep' => '456789123',
                'tipo_representacion' => 'voluntario',
                'estado' => 'activo',
                'observaciones' => 'Representación voluntaria',
            ],
            [
                'cedtra' => '789123456',
                'asamblea_id' => 2,
                'nombre_representado' => 'Ana Martínez Representada',
                'cedrep' => '789123456',
                'tipo_representacion' => 'judicial',
                'estado' => 'activo',
                'observaciones' => 'Representación judicial',
            ],
            [
                'cedtra' => '321654987',
                'asamblea_id' => 3,
                'nombre_representado' => 'Luis López Representado',
                'cedrep' => '321654987',
                'tipo_representacion' => 'legal',
                'estado' => 'activo',
                'observaciones' => 'Representación legal',
            ],
        ];

        foreach ($representantes as $representante) {
            AsaRepresentantes::create($representante);
        }
        
        $this->command->info('Datos de ejemplo para asa_representantes creados');
    }
}