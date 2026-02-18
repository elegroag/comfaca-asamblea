<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Poderes;
use Illuminate\Support\Facades\Storage;

class PoderesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Intentar leer desde archivo CSV si existe
        if (Storage::disk('local')->exists('poderes.csv')) {
            $this->useFile();
        } else {
            // Si no existe el archivo, crear datos de ejemplo
            $this->createSampleData();
        }
    }

    private function useFile()
    {
        $filepath = storage_path('app/poderes.csv');

        if (!file_exists($filepath)) {
            $this->command->info('No se encontró el archivo poderes.csv, usando datos de ejemplo');
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
                            'documento' => trim($fila[0] ?? ''),
                            'fecha' => trim($fila[1] ?? date('Y-m-d')),
                            'apoderado_nit' => trim($fila[2] ?? ''),
                            'poderdante_nit' => trim($fila[3] ?? ''),
                            'estado' => trim($fila[4] ?? 'A'),
                            'radicado' => trim($fila[5] ?? ''),
                            'apoderado_cedrep' => trim($fila[6] ?? ''),
                            'apoderado_repleg' => trim($fila[7] ?? ''),
                            'poderdante_cedrep' => trim($fila[8] ?? ''),
                            'poderdante_repleg' => trim($fila[9] ?? ''),
                            'notificacion' => trim($fila[10] ?? ''),
                            'asamblea_id' => (int)(trim($fila[11] ?? 1)),
                        ];

                        // Convertir fecha si es necesario
                        if ($data['fecha']) {
                            $data['fecha'] = date('Y-m-d', strtotime($data['fecha']));
                        }

                        Poderes::create($data);
                    }
                }
                $row++;
            }
        }
        fclose($fdata);

        $this->command->info('Proceso de poderes.csv completado');
    }

    private function createSampleData()
    {
        $poderes = [
            [
                'documento' => 'POW-2024-001',
                'fecha' => '2024-01-15',
                'apoderado_nit' => '800123456',
                'poderdante_nit' => '800987654',
                'estado' => 'A',
                'radicado' => 'RAD-2024-0001',
                'apoderado_cedrep' => '123456789',
                'apoderado_repleg' => 'Juan Pérez',
                'poderdante_cedrep' => '987654321',
                'poderdante_repleg' => 'María González',
                'notificacion' => 'Notificación enviada por correo certificado',
                'asamblea_id' => 1,
            ],
            [
                'documento' => 'POW-2024-002',
                'fecha' => '2024-01-20',
                'apoderado_nit' => '800456789',
                'poderdante_nit' => '800789123',
                'estado' => 'A',
                'radicado' => 'RAD-2024-0002',
                'apoderado_cedrep' => '456789123',
                'apoderado_repleg' => 'Carlos Rodríguez',
                'poderdante_cedrep' => '789123456',
                'poderdante_repleg' => 'Ana Martínez',
                'notificacion' => 'Notificación enviada por mensajería',
                'asamblea_id' => 1,
            ],
            [
                'documento' => 'POW-2024-003',
                'fecha' => '2024-02-01',
                'apoderado_nit' => '800321654',
                'poderdante_nit' => '800123456',
                'estado' => 'I',
                'radicado' => 'RAD-2024-0003',
                'apoderado_cedrep' => '321654987',
                'apoderado_repleg' => 'Luis López',
                'poderdante_cedrep' => '123456789',
                'poderdante_repleg' => 'Juan Pérez',
                'notificacion' => 'Poder rechazado por falta de documentos',
                'asamblea_id' => 1,
            ],
            [
                'documento' => 'POW-2024-004',
                'fecha' => '2024-02-10',
                'apoderado_nit' => '800987654',
                'poderdante_nit' => '800456789',
                'estado' => 'R',
                'radicado' => 'RAD-2024-0004',
                'apoderado_cedrep' => '987654321',
                'apoderado_repleg' => 'María González',
                'poderdante_cedrep' => '456789123',
                'poderdante_repleg' => 'Carlos Rodríguez',
                'notificacion' => 'Poder revocado por mutuo acuerdo',
                'asamblea_id' => 2,
            ],
            [
                'documento' => 'POW-2024-005',
                'fecha' => '2024-02-15',
                'apoderado_nit' => '800789123',
                'poderdante_nit' => '800321654',
                'estado' => 'A',
                'radicado' => 'RAD-2024-0005',
                'apoderado_cedrep' => '789123456',
                'apoderado_repleg' => 'Ana Martínez',
                'poderdante_cedrep' => '321654987',
                'poderdante_repleg' => 'Luis López',
                'notificacion' => 'Notificación enviada electrónicamente',
                'asamblea_id' => 3,
            ],
        ];

        foreach ($poderes as $poder) {
            Poderes::create($poder);
        }

        $this->command->info('Datos de ejemplo para poderes creados');
    }
}
