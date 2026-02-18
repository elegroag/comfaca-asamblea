<?php

namespace App\Services\Poderes;

use App\Models\Poderes;
use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\Rechazos;
use Illuminate\Support\Facades\DB;

class RemovePoderService
{
    /**
     * Eliminar un poder y ajustar registros relacionados
     */
    public function main($documento)
    {
        $poderEntity = Poderes::where('documento', $documento)->first();
        if (!$poderEntity) {
            throw new \Exception("No se encuentra el poder con los criterios dados.", 501);
        }

        $poderdante_cedrep = $poderEntity->poderdante_cedrep;
        $poderdante_nit = $poderEntity->poderdante_nit;
        $apoderado_cedrep = $poderEntity->apoderado_cedrep;

        // Procesar registro del poderdante
        $registroDante = RegistroIngresos::where('nit', $poderdante_nit)
            ->where('cedula_representa', $poderdante_cedrep)
            ->first();

        if ($registroDante) {
            // Eliminar rechazos específicos del poderdante
            $rechazos = Rechazos::where('regingre_id', $registroDante->documento)
                ->whereIn('criterio_id', [18, 25])
                ->get();

            foreach ($rechazos as $rechazo) {
                $rechazo->delete();
            }

            // Verificar si hay otros rechazos
            $otherRechazos = Rechazos::where('regingre_id', $registroDante->documento)
                ->whereNotIn('criterio_id', [18, 25])
                ->first();

            if (!$otherRechazos) {
                $registroDante->estado = 'P';
                $registroDante->votos = 1;
                $registroDante->save();
            }
        }

        // Procesar registro del apoderado
        $registroApo = RegistroIngresos::where('nit', $poderdante_nit)
            ->where('cedula_representa', $apoderado_cedrep)
            ->first();

        if ($registroApo) {
            $registroApo->delete();
        }

        // Eliminar el poder
        $poderEntity->delete();

        return true;
    }
}
