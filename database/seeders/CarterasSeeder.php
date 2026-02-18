<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Carteras;
use Illuminate\Support\Facades\Storage;

class CarterasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Intentar leer desde archivo CSV si existe
        if (Storage::disk('local')->exists('cartera.csv')) {
            $this->useFile();
        } else {
            // Si no existe el archivo, crear datos de ejemplo
            $this->createSampleData();
        }
    }

    private function useFile()
    {
        $filepath = storage_path('app/cartera.csv');
        
        if (!file_exists($filepath)) {
            $this->command->info('No se encontró el archivo cartera.csv, usando datos de ejemplo');
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
                            'nit' => trim($fila[0] ?? ''),
                            'codigo' => trim($fila[4] ?? 'A'),
                            'concepto' => trim($fila[5] ?? ''),
                            'asamblea_id' => 1,
                        ];
                        
                        Carteras::create($data);
                    }
                }
                $row++;
            }
        }
        fclose($fdata);
        
        $this->command->info('Proceso de cartera.csv completado');
    }

    private function createSampleData()
    {
        $carteras = [
            [
                'nit' => '800123456',
                'codigo' => 'A',
                'concepto' => 'Aportes de capital social',
                'asamblea_id' => 1,
            ],
            [
                'nit' => '800123456',
                'codigo' => 'S',
                'concepto' => 'Servicios de administración',
                'asamblea_id' => 1,
            ],
            [
                'nit' => '800987654',
                'codigo' => 'A',
                'concepto' => 'Aportes extraordinarios',
                'asamblea_id' => 1,
            ],
            [
                'nit' => '800987654',
                'codigo' => 'L',
                'concepto' => 'Libranza financiera',
                'asamblea_id' => 1,
            ],
            [
                'nit' => '800456789',
                'codigo' => 'A',
                'concepto' => 'Aportes de cuotas',
                'asamblea_id' => 1,
            ],
            [
                'nit' => '800456789',
                'codigo' => 'S',
                'concepto' => 'Servicios técnicos',
                'asamblea_id' => 1,
            ],
            [
                'nit' => '800789123',
                'codigo' => 'A',
                'concepto' => 'Aportes de inversión',
                'asamblea_id' => 2,
            ],
            [
                'nit' => '800321654',
                'codigo' => 'A',
                'concepto' => 'Aportes de construcción',
                'asamblea_id' => 3,
            ],
        ];

        foreach ($carteras as $cartera) {
            Carteras::create($cartera);
        }
        
        $this->command->info('Datos de ejemplo para carteras creados');
    }
}