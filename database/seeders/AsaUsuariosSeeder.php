<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AsaUsuarios;
use Illuminate\Support\Facades\Storage;

class AsaUsuariosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Intentar leer desde archivo CSV si existe
        if (Storage::disk('local')->exists('asa_usuarios.csv')) {
            $this->useFile();
        } else {
            // Si no existe el archivo, crear datos de ejemplo
            $this->createSampleData();
        }
    }

    private function useFile()
    {
        $filepath = storage_path('app/asa_usuarios.csv');
        
        if (!file_exists($filepath)) {
            $this->command->info('No se encontró el archivo asa_usuarios.csv, usando datos de ejemplo');
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
                            'rol' => trim($fila[3] ?? 'votante'),
                            'estado' => 'activo',
                        ];
                        
                        AsaUsuarios::create($data);
                    }
                }
                $row++;
            }
        }
        fclose($fdata);
        
        $this->command->info('Proceso de asa_usuarios.csv completado');
    }

    private function createSampleData()
    {
        $usuarios = [
            [
                'cedtra' => '123456789',
                'asamblea_id' => 1,
                'rol' => 'administrador',
                'estado' => 'activo',
            ],
            [
                'cedtra' => '987654321',
                'asamblea_id' => 1,
                'rol' => 'votante',
                'estado' => 'activo',
            ],
            [
                'cedtra' => '456789123',
                'asamblea_id' => 1,
                'rol' => 'interventor',
                'estado' => 'activo',
            ],
            [
                'cedtra' => '789123456',
                'asamblea_id' => 1,
                'rol' => 'votante',
                'estado' => 'activo',
            ],
            [
                'cedtra' => '321654987',
                'asamblea_id' => 1,
                'rol' => 'observador',
                'estado' => 'activo',
            ],
            [
                'cedtra' => '123456789',
                'asamblea_id' => 2,
                'rol' => 'votante',
                'estado' => 'activo',
            ],
            [
                'cedtra' => '987654321',
                'asamblea_id' => 2,
                'rol' => 'votante',
                'estado' => 'activo',
            ],
            [
                'cedtra' => '456789123',
                'asamblea_id' => 3,
                'rol' => 'administrador',
                'estado' => 'activo',
            ],
        ];

        foreach ($usuarios as $usuario) {
            AsaUsuarios::create($usuario);
        }
        
        $this->command->info('Datos de ejemplo para asa_usuarios creados');
    }
}