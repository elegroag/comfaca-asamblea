<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AsaMesas;
use Illuminate\Support\Facades\Storage;

class AsaMesasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Intentar leer desde archivo CSV si existe
        if (Storage::disk('local')->exists('asa_mesas.csv')) {
            $this->useFile();
        } else {
            // Si no existe el archivo, crear datos de ejemplo
            $this->createSampleData();
        }
    }

    private function useFile()
    {
        $filepath = storage_path('app/asa_mesas.csv');
        
        if (!file_exists($filepath)) {
            $this->command->info('No se encontró el archivo asa_mesas.csv, usando datos de ejemplo');
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
                            'codigo' => trim($fila[1] ?? ''),
                            'cedtra_responsable' => trim($fila[2] ?? ''),
                            'estado' => trim($fila[3] ?? 'espera'),
                            'consenso_id' => trim($fila[4] ?? ''),
                            'hora_apertura' => !empty($fila[5]) ? trim($fila[5]) : null,
                            'hora_cierre_mesa' => !empty($fila[6]) ? trim($fila[6]) : null,
                            'cantidad_votantes' => (int)(trim($fila[7] ?? 0)),
                            'cantidad_votos' => (int)(trim($fila[8] ?? 0)),
                        ];
                        
                        // Convertir fechas si es necesario
                        if ($data['hora_apertura']) {
                            $data['hora_apertura'] = date('Y-m-d H:i:s', strtotime($data['hora_apertura']));
                        }
                        if ($data['hora_cierre_mesa']) {
                            $data['hora_cierre_mesa'] = date('Y-m-d H:i:s', strtotime($data['hora_cierre_mesa']));
                        }
                        
                        AsaMesas::firstOrCreate(
                            ['codigo' => $data['codigo']],
                            $data
                        );
                    }
                }
                $row++;
            }
        }
        fclose($fdata);
        
        $this->command->info('Proceso de asa_mesas.csv completado');
    }

    private function createSampleData()
    {
        $mesas = [
            [
                'codigo' => 'M001',
                'cedtra_responsable' => '123456789',
                'estado' => 'abierta',
                'consenso_id' => 1,
                'hora_apertura' => '2024-03-24 09:00:00',
                'cantidad_votantes' => 50,
                'cantidad_votos' => 45,
            ],
            [
                'codigo' => 'M002',
                'cedtra_responsable' => '987654321',
                'estado' => 'abierta',
                'consenso_id' => 1,
                'hora_apertura' => '2024-03-24 09:00:00',
                'cantidad_votantes' => 45,
                'cantidad_votos' => 42,
            ],
            [
                'codigo' => 'M003',
                'cedtra_responsable' => '456789123',
                'estado' => 'espera',
                'consenso_id' => 1,
                'cantidad_votantes' => 40,
                'cantidad_votos' => 0,
            ],
            [
                'codigo' => 'M004',
                'cedtra_responsable' => '789123456',
                'estado' => 'cerrada',
                'consenso_id' => 1,
                'hora_apertura' => '2024-03-24 09:00:00',
                'hora_cierre_mesa' => '2024-03-24 17:00:00',
                'cantidad_votantes' => 35,
                'cantidad_votos' => 35,
            ],
            [
                'codigo' => 'M005',
                'cedtra_responsable' => '321654987',
                'estado' => 'abierta',
                'consenso_id' => 1,
                'hora_apertura' => '2024-03-24 09:00:00',
                'cantidad_votantes' => 30,
                'cantidad_votos' => 28,
            ],
        ];

        foreach ($mesas as $mesa) {
            AsaMesas::firstOrCreate(
                ['codigo' => $mesa['codigo']],
                $mesa
            );
        }
        
        $this->command->info('Datos de ejemplo para asa_mesas creados');
    }
}