<?php

namespace App\Services\Poderes;

use App\Models\Poderes;
use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\Rechazos;
use Illuminate\Support\Facades\DB;

class ActivarPoderService
{
    private $idAsamblea;
    private $poderRegisterService;

    public function __construct($idAsamblea)
    {
        $this->idAsamblea = $idAsamblea;
        $this->poderRegisterService = new PoderRegisterService($this->idAsamblea);
    }

    /**
     * Activar un poder existente
     */
    public function main($documento)
    {
        $poder = Poderes::where('documento', $documento)
            ->where('asamblea_id', $this->idAsamblea)
            ->first();

        if (!$poder) {
            throw new \Exception("El poder no está registrado", 301);
        }

        $poderdante_nit = $poder->poderdante_nit;
        $poderdante_cedula = $poder->poderdante_cedrep;
        $apoderado_cedula = $poder->apoderado_cedrep;

        // Activar el poder
        $poder->estado = 'A';
        $poder->notificacion = '';
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
            $this->poderRegisterService->createRechazo($ingresoDante->documento);
        }

        /**
         * Se debe inhabilitar el registro de ingreso para el apoderado al ser rechazado el poder
         */
        $ingresoApo = RegistroIngresos::where('nit', $poderdante_nit)
            ->where('asamblea_id', $this->idAsamblea)
            ->where('cedula_representa', $apoderado_cedula)
            ->first();

        if ($ingresoApo) {
            $this->poderRegisterService->removeRechazo($ingresoApo->documento);
        }

        // Retornar poder con relaciones
        return Poderes::with(['apoderado', 'poderdante'])
            ->where('documento', $poder->documento)
            ->first()
            ->toArray();
    }
}
