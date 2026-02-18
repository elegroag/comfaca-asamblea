<?php

namespace App\Services\Carteras;

use App\Models\RegistroIngresos;
use App\Models\Rechazos;
use App\Models\Carteras;
use App\Models\Empresas;
use Illuminate\Support\Facades\DB;

class CarteraReportarService
{
    private $idAsamblea;

    public function __construct($idAsamblea)
    {
        $this->idAsamblea = $idAsamblea;
    }

    /**
     * Crear rechazo basado en registro de cartera
     */
    public function creaRechazoByRegister($registroIngreso, $criterio)
    {
        $rechazo = Rechazos::where('regingre_id', $registroIngreso->documento)
            ->where('criterio_id', $criterio)
            ->first();

        // Si no hay se crea el rechazo
        if (!$rechazo) {
            $rechazo = new Rechazos();
            $rechazo->criterio_id = $criterio;
            $rechazo->regingre_id = $registroIngreso->documento;
            $rechazo->dia = now()->format('Y-m-d');
            $rechazo->hora = now()->format('H:i:s');
            $rechazo->save();
        }

        return $rechazo;
    }

    /**
     * Crear cartera de rechazo
     */
    public function createCarteraRechazo($empresa, string $codigo, string $concepto)
    {
        if (!$empresa || !$codigo) {
            throw new \Exception("Error en los parametros de empresa y criterio id", 501);
        }

        // Buscar registros de ingreso de la empresa
        $registroIngresos = RegistroIngresos::where('nit', $empresa->nit)->get();

        if ($registroIngresos->isNotEmpty()) {
            foreach ($registroIngresos as $registroIngreso) {
                $criterio = $this->getCriterioId($codigo);

                // Actualizar estado a rechazado
                $registroIngreso->update([
                    'estado' => 'R',
                    'votos' => '0'
                ]);

                $this->creaRechazoByRegister($registroIngreso, $criterio);
            }
        } else {
            throw new \Exception("Error la empresa no posee pre-registro de asamblea", 1);
        }

        // Crear registro de cartera
        $id = Carteras::max('id') ?: 0;
        $cartera = Carteras::create([
            'id' => $id + 1,
            'nit' => $empresa->nit,
            'concepto' => $concepto,
            'codigo' => $codigo,
            'asamblea_id' => $this->idAsamblea
        ]);

        return $cartera;
    }

    /**
     * Obtener criterio ID basado en código
     * Método auxiliar que debe existir en el modelo Carteras
     */
    private function getCriterioId($codigo)
    {
        // Este método debe implementarse según la lógica del sistema
        // Por ahora se retorna el código como criterio
        return $codigo;
    }

    /**
     * Eliminar cartera y reactivar registros
     */
    public function removeCartera($nit)
    {
        $cartera = Carteras::where('nit', $nit)
            ->where('asamblea_id', $this->idAsamblea)
            ->first();

        if (!$cartera) {
            throw new \Exception("La cartera no existe para esta empresa", 404);
        }

        // Reactivar registros de ingreso
        $registroIngresos = RegistroIngresos::where('nit', $nit)->get();

        foreach ($registroIngresos as $registroIngreso) {
            // Eliminar rechazos relacionados con cartera
            Rechazos::where('regingre_id', $registroIngreso->documento)
                ->whereIn('criterio_id', [18, 25]) // Criterios de cartera
                ->delete();

            // Reactivar registro si no tiene otros rechazos
            $otrosRechazos = Rechazos::where('regingre_id', $registroIngreso->documento)
                ->whereNotIn('criterio_id', [18, 25])
                ->first();

            if (!$otrosRechazos) {
                $registroIngreso->update([
                    'estado' => 'P',
                    'votos' => 1
                ]);
            }
        }

        // Eliminar cartera
        $cartera->delete();

        return true;
    }

    /**
     * Obtener carteras por asamblea
     */
    public function getCarterasPorAsamblea()
    {
        return Carteras::with(['empresa'])
            ->where('asamblea_id', $this->idAsamblea)
            ->orderBy('codigo')
            ->get();
    }

    /**
     * Obtener cartera por NIT
     */
    public function getCarteraPorNit($nit)
    {
        return Carteras::with(['empresa'])
            ->where('nit', $nit)
            ->where('asamblea_id', $this->idAsamblea)
            ->first();
    }

    /**
     * Verificar si empresa tiene cartera
     */
    public function tieneCartera($nit)
    {
        return Carteras::where('nit', $nit)
            ->where('asamblea_id', $this->idAsamblea)
            ->exists();
    }

    /**
     * Obtener resumen de carteras
     */
    public function getResumenCarteras()
    {
        $carteras = Carteras::where('asamblea_id', $this->idAsamblea)->get();

        return [
            'total_carteras' => $carteras->count(),
            'empresas_afectadas' => $carteras->pluck('nit')->unique()->count(),
            'ultima_actualizacion' => $carteras->max('updated_at'),
            'carteras_por_codigo' => $carteras->groupBy('codigo')->map->count()
        ];
    }

    /**
     * Procesar cartera masiva
     */
    public function procesarCarteraMasiva($empresasData)
    {
        $resultados = [
            'procesadas' => 0,
            'fallidas' => 0,
            'errores' => []
        ];

        foreach ($empresasData as $data) {
            try {
                $empresa = Empresas::where('nit', $data['nit'])
                    ->where('asamblea_id', $this->idAsamblea)
                    ->first();

                if (!$empresa) {
                    throw new \Exception("Empresa no encontrada: {$data['nit']}");
                }

                $this->createCarteraRechazo($empresa, $data['codigo'], $data['concepto']);
                $resultados['procesadas']++;
            } catch (\Exception $e) {
                $resultados['fallidas']++;
                $resultados['errores'][] = [
                    'nit' => $data['nit'] ?? 'desconocido',
                    'error' => $e->getMessage()
                ];
            }
        }

        return $resultados;
    }
}
