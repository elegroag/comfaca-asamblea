<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CriteriosRechazos;

class CriteriosRechazosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $criterios = [
            [
                'detalle' => 'Poder revocado por falta de vigencia',
                'estatutos' => 'Artículo 45 del Estatuto Social',
                'tipo' => 'POD',
            ],
            [
                'detalle' => 'Poderdante no tiene capacidad legal',
                'estatutos' => 'Artículo 32 del Código de Comercio',
                'tipo' => 'POA',
            ],
            [
                'detalle' => 'Empresa con cartera morosa',
                'estatutos' => 'Política de Crédito Interno',
                'tipo' => 'CAR',
            ],
            [
                'detalle' => 'Funcionario no autorizado para firma',
                'estatutos' => 'Reglamento Interno',
                'tipo' => 'TRA',
            ],
            [
                'detalle' => 'Concepto jurídico desfavorable',
                'estatutos' => 'Dictamen Legal 2024-001',
                'tipo' => 'HAB',
            ],
        ];

        foreach ($criterios as $criterio) {
            CriteriosRechazos::create($criterio);
        }
    }
}