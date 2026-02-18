<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Empresas;

class EmpresasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $empresas = [
            [
                'nit' => '800123456',
                'razsoc' => 'COMFACA FONDO DE EMPLEADOS',
                'cedrep' => '123456789',
                'repleg' => 'Juan Pérez',
                'email' => 'contacto@comfaca.com',
                'telefono' => '3001234567',
                'asamblea_id' => 1,
            ],
            [
                'nit' => '800987654',
                'razsoc' => 'COOPERATIVA DE TRANSPORTE',
                'cedrep' => '987654321',
                'repleg' => 'María González',
                'email' => 'info@cootrans.com',
                'telefono' => '3009876543',
                'asamblea_id' => 1,
            ],
            [
                'nit' => '800456789',
                'razsoc' => 'SERVICIOS TECNOLÓGICOS S.A.',
                'cedrep' => '456789123',
                'repleg' => 'Carlos Rodríguez',
                'email' => 'servicios@tecnologia.com',
                'telefono' => '3004567891',
                'asamblea_id' => 1,
            ],
            [
                'nit' => '800789123',
                'razsoc' => 'INDUSTRIAS ALIMENTICIAS LTDA',
                'cedrep' => '789123456',
                'repleg' => 'Ana Martínez',
                'email' => 'contacto@alimentos.com',
                'telefono' => '3007891234',
                'asamblea_id' => 2,
            ],
            [
                'nit' => '800321654',
                'razsoc' => 'CONSTRUCTORA DEL NORTE S.A.',
                'cedrep' => '321654987',
                'repleg' => 'Luis López',
                'email' => 'info@constructora.com',
                'telefono' => '3003216549',
                'asamblea_id' => 3,
            ],
        ];

        foreach ($empresas as $empresa) {
            Empresas::firstOrCreate(
                ['nit' => $empresa['nit']],
                $empresa
            );
        }
    }
}