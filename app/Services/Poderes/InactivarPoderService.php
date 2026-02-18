<?php

namespace App\Services\Poderes;

use App\Models\Poderes;
use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\Rechazos;
use Illuminate\Support\Facades\DB;

class InactivarPoderService
{
    private $idAsamblea;
    private $poderRegisterService;

    public function __construct($idAsamblea)
    {
        $this->idAsamblea = $idAsamblea;
        $this->poderRegisterService = new PoderRegisterService($idAsamblea);
    }

    /**
     * Inactivar un poder existente
     */
    public function main($data)
    {
        $motivo = $data['motivo'];
        $poder = $data['poder'];

        $poderdante_nit = $poder->poderdante_nit;
        $poderdante_cedula = $poder->poderdante_cedrep;
        $apoderado_cedula = $poder->apoderado_cedrep;

        // Inactivar el poder
        $poder->estado = 'I';
        $poder->notificacion = $motivo;
        $poder->save();

        /**
         * Si es rechazado el poder se debe validar si tenía inscripción previamente el poderdante 
         * la inscripción se reactiva
         */
        $ingresoDante = RegistroIngresos::where('nit', $poderdante_nit)
            ->where('asamblea_id', $this->idAsamblea)
            ->where('cedula_representa', $poderdante_cedula)
            ->first();

        if ($ingresoDante) {
            $this->poderRegisterService->removeRechazo($ingresoDante->documento);
        }

        /**
         * Se debe inhabilitar el registro de ingreso para el apoderado al ser rechazado el poder
         */
        $ingresoApo = RegistroIngresos::where('nit', $poderdante_nit)
            ->where('asamblea_id', $this->idAsamblea)
            ->where('cedula_representa', $apoderado_cedula)
            ->first();

        if ($ingresoApo) {
            // Rechazo por los estatutos
            $criterio = 25;
            $this->poderRegisterService->createRechazo($ingresoApo->documento, $criterio);
        }

        // Retornar poder con relaciones
        return Poderes::with(['apoderado', 'poderdante'])
            ->where('documento', $poder->documento)
            ->first()
            ->toArray();
    }
}
