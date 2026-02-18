<?php

namespace App\Services\Novedades;

use App\Models\Poderes;
use App\Models\RegistroIngresos;
use App\Models\AsaRepresentantes;
use App\Services\Empresas\RegistroEmpresaService;
use App\Services\Empresas\HabilEmpresaService;

class RevocarPoderService
{
    private $poder;
    private $novedadQuorumServices;
    private $preRegService;

    public function __construct($poder)
    {
        $this->poder = $poder;
        $this->preRegService = new RegistroEmpresaService($this->poder->asamblea_id);
        $this->novedadQuorumServices = new NovedadQuorumService();
    }

    /**
     * Crear novedades al revocar poder
     */
    public function create()
    {
        $habilEmpresaServices = new HabilEmpresaService();
        $apoderado = $habilEmpresaServices->findEmpresaByNit($this->poder->apoderado_nit);
        if (!$apoderado) {
            throw new \Exception("Error el apoderado no está registrada en el sistema como empresa habil", 301);
        }

        $poderdante = $habilEmpresaServices->findEmpresaByNit($this->poder->poderdante_nit);
        if (!$poderdante) {
            throw new \Exception("Error el poderdante no está registrada en el sistema como empresa habil", 301);
        }

        $apoderado_representante = AsaRepresentantes::where('cedrep', $apoderado->cedrep)->first();
        if (!$apoderado_representante) {
            throw new \Exception("Error no está apoderado para registro", 301);
        }

        $poderdante_representante = AsaRepresentantes::where('cedrep', $poderdante->cedrep)->first();
        if (!$poderdante_representante) {
            throw new \Exception("Error no está poderdante para registro", 301);
        }

        /**
         * Registro de ingreso con el representante original
         */
        $registroIngresoPoder = $this->preRegService->findRegistroByNitCedrep(
            $poderdante->nit,
            $apoderado->cedrep
        );

        if (!$registroIngresoPoder) {
            throw new \Exception("Error el registro de ingreso del poder no existe, necesario para identificar la estructura de la novedad", 1);
        }

        /**
         * Crear la novedad para reportar, inactiva poder, apoderado
         */
        $estado = 'I';
        $novedad_apoderado = $this->novedadQuorumServices->createNovedad(
            $registroIngresoPoder,
            $estado,
            true
        );

        /**
         * Registro de ingreso con el representante original
         */
        $registroIngresoDante = $this->preRegService->findRegistroByNitCedrep(
            $poderdante->nit,
            $poderdante->cedrep
        );

        if (!$registroIngresoDante) {
            /**
             * Si no posee registro de ingreso, se debe crear el mismo
             */
            $orden = intval(RegistroIngresos::max("orden")) + 1;
            $registroIngresoDante = $this->preRegService->registraIngresoDefault(
                [
                    'nit' => $poderdante->nit,
                    'cedrep' => $poderdante->cedrep,
                    'repleg' => $poderdante_representante->nombre
                ],
                $orden
            );
        }

        /**
         * Crear la novedad para reportar poderdante se activa como empresa
         */
        $estado = 'A';
        $novedad_poderdante = $this->novedadQuorumServices->createNovedad(
            $registroIngresoDante,
            $estado,
            false
        );

        $orden = $novedad_poderdante->linea;
        RegistroIngresos::where('documento', $registroIngresoDante->documento)
            ->update(['orden' => $orden]);

        return [
            $novedad_apoderado,
            $novedad_poderdante
        ];
    }
}
