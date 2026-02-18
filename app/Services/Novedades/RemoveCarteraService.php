<?php

namespace App\Services\Novedades;

use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\AsaRepresentantes;
use App\Models\Poderes;
use App\Services\Empresas\RegistroEmpresaService;

class RemoveCarteraService
{
    private $empresa;
    private $idAsamblea;
    private $preRegService;

    public function __construct($empresa)
    {
        $this->empresa = $empresa;
        $this->idAsamblea = $empresa->asamblea_id;
        $this->preRegService = new RegistroEmpresaService($this->idAsamblea);
    }

    /**
     * Crear novedad al remover cartera
     */
    public function create()
    {
        $cedrep = $this->empresa->cedrep;
        
        /**
         * Si la empresa es poderdante, con poder rechazado 
         */
        $poder = Poderes::where('nit2', $this->empresa->nit)->first();
        if ($poder) {
            if ($poder->estado == 'I' || $poder->estado == 'R') {
                /**
                 * Asociamos con la cédula del apoderado
                 */
                $cedrep = $poder->apoderado_cedrep;
            }
        }

        $representante = AsaRepresentantes::where('cedrep', $cedrep)->first();

        /**
         * Registro de ingreso con el representante original
         */
        $registroIngreso = $this->preRegService->findRegistroByNitCedrep(
            $this->empresa->nit, 
            $cedrep
        );

        if (!$registroIngreso) {
            /**
             * Si no posee registro de ingreso, se debe crear el mismo
             */
            $orden = intval(RegistroIngresos::max("orden")) + 1;
            $registroIngreso = $this->preRegService->registraIngresoDefault(
                [
                    'nit' => $this->empresa->nit,
                    'cedrep' => $representante->cedrep,
                    'repleg' => $representante->nombre
                ],
                $orden
            );
        }

        /**
         * Crear la novedad para reportar 
         */
        $estado = 'A';
        $novedadQuorumServices = new NovedadQuorumService();
        $novedad = $novedadQuorumServices->createNovedad(
            $registroIngreso,
            $estado,
            false
        );

        $orden = $novedad->linea;
        RegistroIngresos::where('documento', $registroIngreso->documento)
            ->update(['orden' => $orden]);

        return $novedad;
    }
}
