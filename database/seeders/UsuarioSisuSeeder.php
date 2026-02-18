<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UsuarioSisu;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

class UsuarioSisuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Intentar leer desde archivo CSV si existe
        if (Storage::disk('local')->exists('usuario_sisu.csv')) {
            $this->useFile();
        } else {
            // Si no existe el archivo, crear datos de ejemplo
            $this->createSampleData();
        }
    }

    private function useFile()
    {
        $filepath = storage_path('app/usuario_sisu.csv');

        if (!file_exists($filepath)) {
            $this->command->info('No se encontró el archivo usuario_sisu.csv, usando datos de ejemplo');
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
                            'usuario' => trim($fila[0] ?? ''),
                            'cedtra' => trim($fila[1] ?? ''),
                            'nombre' => trim($fila[2] ?? ''),
                            'password' => Hash::make(trim($fila[3] ?? 'password123')),
                            'email' => trim($fila[4] ?? ''),
                            'is_active' => 'S'
                        ];

                        UsuarioSisu::firstOrCreate(
                            ['usuario' => $data['usuario']],
                            $data
                        );
                    }
                }
                $row++;
            }
        }
        fclose($fdata);

        $this->command->info('Proceso de usuario_sisu.csv completado');
    }

    private function createSampleData()
    {
        $usuarios = [
            [
                'usuario' => 'admin',
                'cedtra' => '123456789',
                'nombre' => 'Administrador del Sistema',
                'password' => Hash::make('admin123'),
                'email' => 'admin@comfaca.test',
                'is_active' => 'S'
            ],
            [
                'usuario' => 'jperez',
                'cedtra' => '987654321',
                'nombre' => 'Juan Pérez',
                'password' => Hash::make('jperez123'),
                'email' => 'juan.perez@comfaca.test',
                'is_active' => 'S'
            ],
            [
                'usuario' => 'mgonzalez',
                'cedtra' => '456789123',
                'nombre' => 'María González',
                'password' => Hash::make('mgonzalez123'),
                'email' => 'maria.gonzalez@comfaca.test',
                'is_active' => 'S'
            ],
            [
                'usuario' => 'crodriguez',
                'cedtra' => '789123456',
                'nombre' => 'Carlos Rodríguez',
                'password' => Hash::make('crodriguez123'),
                'email' => 'carlos.rodriguez@comfaca.test',
                'is_active' => 'S'
            ],
        ];

        foreach ($usuarios as $usuario) {
            UsuarioSisu::firstOrCreate(
                ['usuario' => $usuario['usuario']],
                $usuario
            );
        }

        $this->command->info('Datos de ejemplo para usuarios SISU creados');
    }
}