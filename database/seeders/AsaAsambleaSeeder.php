<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AsaAsamblea;

class AsaAsambleaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $asambleas = [
            [
                'detalle' => 'Asamblea General Ordinaria 2024',
                'modo' => 'P', // Presencial
                'estado' => 'A',
                'fecha_programada' => '2024-03-24 09:00:00',
            ],
            [
                'detalle' => 'Asamblea Extraordinaria 2024',
                'modo' => 'V', // Virtual
                'estado' => 'F',
                'fecha_programada' => '2024-01-15 14:00:00',
            ],
            [
                'detalle' => 'Asamblea de Renovación de Directiva',
                'modo' => 'H', // Híbrido
                'estado' => 'C',
                'fecha_programada' => '2024-02-10 10:00:00',
            ],
        ];

        foreach ($asambleas as $asamblea) {
            AsaAsamblea::create($asamblea);
        }
    }
}
