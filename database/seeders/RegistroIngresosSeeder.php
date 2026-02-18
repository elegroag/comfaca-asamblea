<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RegistroIngresos;
use Illuminate\Support\Facades\Storage;

class RegistroIngresosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Intentar leer desde archivo CSV si existe
        if (Storage::disk('local')->exists('ingresos.csv')) {
            $this->useFile();
        } else {
            // Si no existe el archivo, crear datos de ejemplo
            $this->createSampleData();
        }
    }

    private function useFile()
    {
        $filepath = storage_path('app/ingresos.csv');
        
        if (!file_exists($filepath)) {
            $this->command->info('No se encontró el archivo ingresos.csv, usando datos de ejemplo');
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
                            'hora' => trim($fila[2] ?? date('H:i:s')),
                            'nit' => trim($fila[3] ?? ''),
                            'usuario' => trim($fila[4] ?? ''),
                            'estado' => trim($fila[5] ?? 'pendiente'),
                            'votos' => (int)(trim($fila[6] ?? 0)),
                            'mesa_id' => !empty($fila[7]) ? (int)(trim($fila[7])) : null,
                            'asamblea_id' => !empty($fila[8]) ? (int)(trim($fila[8])) : 1,
                            'tipo_ingreso' => trim($fila[9] ?? 'participante'),
                            'fecha_asistencia' => !empty($fila[10]) ? trim($fila[10]) : null,
                            'cedula_representa' => trim($fila[11] ?? ''),
                            'nombre_representa' => trim($fila[12] ?? ''),
                            'orden' => (int)(trim($fila[13] ?? 0)),
                        ];
                        
                        // Convertir fechas si es necesario
                        if ($data['fecha']) {
                            $data['fecha'] = date('Y-m-d', strtotime($data['fecha']));
                        }
                        if ($data['hora']) {
                            $data['hora'] = date('H:i:s', strtotime($data['hora']));
                        }
                        if ($data['fecha_asistencia']) {
                            $data['fecha_asistencia'] = date('Y-m-d H:i:s', strtotime($data['fecha_asistencia']));
                        }
                        
                        RegistroIngresos::create($data);
                    }
                }
                $row++;
            }
        }
        fclose($fdata);
        
        $this->command->info('Proceso de ingresos.csv completado');
    }

    private function createSampleData()
    {
        $ingresos = [
            [
                'documento' => 'CC-123456789',
                'fecha' => '2024-03-24',
                'hora' => '08:30:00',
                'nit' => '800123456',
                'usuario' => 'Juan Pérez',
                'estado' => 'asistio',
                'votos' => 5,
                'mesa_id' => 1,
                'asamblea_id' => 1,
                'tipo_ingreso' => 'participante',
                'fecha_asistencia' => '2024-03-24 09:15:00',
                'cedula_representa' => '',
                'nombre_representa' => '',
                'orden' => 1,
            ],
            [
                'documento' => 'CC-987654321',
                'fecha' => '2024-03-24',
                'hora' => '08:45:00',
                'nit' => '800987654',
                'usuario' => 'María González',
                'estado' => 'asistio',
                'votos' => 3,
                'mesa_id' => 2,
                'asamblea_id' => 1,
                'tipo_ingreso' => 'participante',
                'fecha_asistencia' => '2024-03-24 09:20:00',
                'cedula_representa' => '',
                'nombre_representa' => '',
                'orden' => 2,
            ],
            [
                'documento' => 'CC-456789123',
                'fecha' => '2024-03-24',
                'hora' => '09:00:00',
                'nit' => '800456789',
                'usuario' => 'Carlos Rodríguez',
                'estado' => 'aprobado',
                'votos' => 4,
                'mesa_id' => 3,
                'asamblea_id' => 1,
                'tipo_ingreso' => 'interventor',
                'fecha_asistencia' => null,
                'cedula_representa' => '',
                'nombre_representa' => '',
                'orden' => 3,
            ],
            [
                'documento' => 'CC-789123456',
                'fecha' => '2024-03-24',
                'hora' => '09:15:00',
                'nit' => '800789123',
                'usuario' => 'Ana Martínez',
                'estado' => 'rechazado',
                'votos' => 0,
                'mesa_id' => null,
                'asamblea_id' => 1,
                'tipo_ingreso' => 'participante',
                'fecha_asistencia' => null,
                'cedula_representa' => '',
                'nombre_representa' => '',
                'orden' => 4,
            ],
            [
                'documento' => 'CC-321654987',
                'fecha' => '2024-03-24',
                'hora' => '09:30:00',
                'nit' => '800321654',
                'usuario' => 'Luis López',
                'estado' => 'pendiente',
                'votos' => 2,
                'mesa_id' => 5,
                'asamblea_id' => 1,
                'tipo_ingreso' => 'observador',
                'fecha_asistencia' => null,
                'cedula_representa' => '',
                'nombre_representa' => '',
                'orden' => 5,
            ],
            [
                'documento' => 'CC-111111111',
                'fecha' => '2024-03-24',
                'hora' => '09:45:00',
                'nit' => '800123456',
                'usuario' => 'Pedro García',
                'estado' => 'asistio',
                'votos' => 5,
                'mesa_id' => 1,
                'asamblea_id' => 1,
                'tipo_ingreso' => 'participante',
                'fecha_asistencia' => '2024-03-24 10:00:00',
                'cedula_representa' => 'CC-999999999',
                'nombre_representa' => 'Representado Especial',
                'orden' => 6,
            ],
        ];

        foreach ($ingresos as $ingreso) {
            RegistroIngresos::create($ingreso);
        }
        
        $this->command->info('Datos de ejemplo para registro de ingresos creados');
    }
}