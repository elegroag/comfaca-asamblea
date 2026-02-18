<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AsaConsenso;

class AsaConsensoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $consensos = [
            [
                'estado' => 'activo',
                'fecha_inicio' => null,
                'fecha_fin' => null,
                'asamblea_id' => 1,
                'titulo' => 'Asamblea Principal De Votaciones',
                'descripcion' => 'Consenso principal para la asamblea general',
                'tipo_votacion' => 'simple',
                'votos_favor' => 0,
                'votos_contra' => 0,
                'votos_abstencion' => 0,
                'votos_blancos' => 0,
                'votos_nulos' => 0,
                'total_votantes' => 0,
            ],
        ];

        foreach ($consensos as $consenso) {
            AsaConsenso::firstOrCreate(
                ['asamblea_id' => $consenso['asamblea_id'], 'titulo' => $consenso['titulo']],
                $consenso
            );
        }
    }
}