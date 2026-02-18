<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AsaTrabajadores;
use Illuminate\Support\Facades\Storage;

class TrabajadoresSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Intentar leer desde archivo CSV si existe
        if (Storage::disk('local')->exists('trabajadores.csv')) {
            $this->useFile();
        } else {
            // Si no existe el archivo, crear datos de ejemplo
            $this->createSampleData();
        }
    }

    private function useFile()
    {
        $filepath = storage_path('app/trabajadores.csv');
        
        if (!file_exists($filepath)) {
            $this->command->info('No se encontró el archivo trabajadores.csv, usando datos de ejemplo');
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
                            'cedtra' => trim($fila[0] ?? ''),
                            'nombre' => trim($fila[1] ?? ''),
                            'apellido' => trim($fila[2] ?? ''),
                            'email' => trim($fila[3] ?? ''),
                            'telefono' => trim($fila[4] ?? ''),
                            'departamento' => trim($fila[5] ?? ''),
                            'cargo' => trim($fila[6] ?? ''),
                            'estado' => 'activo',
                            'fecha_ingreso' => !empty($fila[7]) ? trim($fila[7]) : null,
                        ];
                        
                        // Convertir fecha si es necesario
                        if ($data['fecha_ingreso']) {
                            $data['fecha_ingreso'] = date('Y-m-d', strtotime($data['fecha_ingreso']));
                        }
                        
                        AsaTrabajadores::firstOrCreate(
                            ['cedtra' => $data['cedtra']],
                            $data
                        );
                    }
                }
                $row++;
            }
        }
        fclose($fdata);
        
        $this->command->info('Proceso de trabajadores.csv completado');
    }

    private function createSampleData()
    {
        $trabajadores = [
            [
                'cedtra' => '111111111',
                'nombre' => 'Pedro',
                'apellido' => 'García',
                'email' => 'pedro.garcia@comfaca.test',
                'telefono' => '3001111111',
                'departamento' => 'Finanzas',
                'cargo' => 'Tesorería',
                'estado' => 'activo',
                'fecha_ingreso' => '2017-05-10',
            ],
            [
                'cedtra' => '222222222',
                'nombre' => 'Laura',
                'apellido' => 'Sánchez',
                'email' => 'laura.sanchez@comfaca.test',
                'telefono' => '3002222222',
                'departamento' => 'Legal',
                'cargo' => 'Asesor Legal',
                'estado' => 'activo',
                'fecha_ingreso' => '2019-08-15',
            ],
            [
                'cedtra' => '333333333',
                'nombre' => 'Roberto',
                'apellido' => 'Díaz',
                'email' => 'roberto.diaz@comfaca.test',
                'telefono' => '3003333333',
                'departamento' => 'Operaciones',
                'cargo' => 'Operador',
                'estado' => 'inactivo',
                'fecha_ingreso' => '2018-11-30',
            ],
            [
                'cedtra' => '444444444',
                'nombre' => 'Carmen',
                'apellido' => 'Torres',
                'email' => 'carmen.torres@comfaca.test',
                'telefono' => '3004444444',
                'departamento' => 'Atención al Cliente',
                'cargo' => 'Agente',
                'estado' => 'inactivo',
                'fecha_ingreso' => '2018-11-30',
            ],
            [
                'cedtra' => '555555555',
                'nombre' => 'Miguel',
                'apellido' => 'Vargas',
                'email' => 'miguel.vargas@comfaca.test',
                'telefono' => '3005555555',
                'departamento' => 'Tecnología',
                'cargo' => 'Soporte Técnico',
                'estado' => 'activo',
                'fecha_ingreso' => '2021-09-12',
            ],
        ];

        foreach ($trabajadores as $trabajador) {
            AsaTrabajadores::firstOrCreate(
                ['cedtra' => $trabajador['cedtra']],
                $trabajador
            );
        }
        
        $this->command->info('Datos de ejemplo para trabajadores creados');
    }
}