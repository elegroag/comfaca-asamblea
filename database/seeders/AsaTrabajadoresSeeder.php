<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AsaTrabajadores;
use Illuminate\Support\Facades\Hash;

class AsaTrabajadoresSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $trabajadores = [
            [
                'cedtra' => '123456789',
                'nombre' => 'Juan',
                'apellido' => 'Pérez',
                'email' => 'juan.perez@comfaca.test',
                'telefono' => '3001234567',
                'departamento' => 'Administración',
                'cargo' => 'Gerente',
                'estado' => 'activo',
                'fecha_ingreso' => '2020-01-15',
            ],
            [
                'cedtra' => '987654321',
                'nombre' => 'María',
                'apellido' => 'González',
                'email' => 'maria.gonzalez@comfaca.test',
                'telefono' => '3009876543',
                'departamento' => 'Contabilidad',
                'cargo' => 'Contador',
                'estado' => 'activo',
                'fecha_ingreso' => '2019-03-20',
            ],
            [
                'cedtra' => '456789123',
                'nombre' => 'Carlos',
                'apellido' => 'Rodríguez',
                'email' => 'carlos.rodriguez@comfaca.test',
                'telefono' => '3004567891',
                'departamento' => 'Recursos Humanos',
                'cargo' => 'Coordinador',
                'estado' => 'activo',
                'fecha_ingreso' => '2021-06-10',
            ],
            [
                'cedtra' => '789123456',
                'nombre' => 'Ana',
                'apellido' => 'Martínez',
                'email' => 'ana.martinez@comfaca.test',
                'telefono' => '3007891234',
                'departamento' => 'Operaciones',
                'cargo' => 'Supervisor',
                'estado' => 'activo',
                'fecha_ingreso' => '2018-11-05',
            ],
            [
                'cedtra' => '321654987',
                'nombre' => 'Luis',
                'apellido' => 'López',
                'email' => 'luis.lopez@comfaca.test',
                'telefono' => '3003216549',
                'departamento' => 'Tecnología',
                'cargo' => 'Desarrollador',
                'estado' => 'activo',
                'fecha_ingreso' => '2022-02-28',
            ],
        ];

        foreach ($trabajadores as $trabajador) {
            AsaTrabajadores::firstOrCreate(
                ['cedtra' => $trabajador['cedtra']],
                $trabajador
            );
        }
    }
}