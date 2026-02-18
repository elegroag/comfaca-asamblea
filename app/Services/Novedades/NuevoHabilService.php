<?php

namespace App\Services\Novedades;

use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\AsaRepresentantes;
use App\Models\Carteras;
use App\Services\Empresas\RegistroEmpresaService;
use App\Services\Empresas\HabilEmpresaService;

class NuevoHabilService
{
    private $empresa;
    private $registroIngreso;
    private $representante;
    private $cedula_representa;
    private $novedadQuorumServices;
    private $preRegService;

    public function __construct($empresa)
    {
        $this->empresa = $empresa;
        $idAsamblea = $empresa->asamblea_id;
        $this->preRegService = new RegistroEmpresaService($idAsamblea);
        $this->novedadQuorumServices = new NovedadQuorumService();
        $this->cedula_representa = $this->empresa->cedrep;
    }

    /**
     * Crear novedad para empresa hábil
     */
    public function create()
    {
        $this->previus();
        
        /**
         * Registro de ingreso con el representante original
         */
        if (!$this->registroIngreso) {
            /**
             * Si no posee registro de ingreso, se debe crear el mismo
             */
            $orden = intval(RegistroIngresos::max("orden")) + 1;
            $this->registroIngreso = $this->preRegService->registraIngresoDefault(
                [
                    'nit' => $this->empresa->nit,
                    'cedrep' => $this->representante->cedrep,
                    'repleg' => $this->representante->nombre
                ],
                $orden
            );
        }

        $estado = 'A';
        $novedad = $this->novedadQuorumServices->createNovedad(
            $this->registroIngreso,
            $estado,
            false
        );

        $orden = $novedad->linea;
        RegistroIngresos::where('documento', $this->registroIngreso->documento)
            ->update(['orden' => $orden]);

        return $novedad;
    }

    /**
     * Cambiar representante de novedad
     */
    public function change($registroIngresoChange)
    {
        $this->previus();

        if ($this->registroIngreso->cedula_representa == $registroIngresoChange->cedula_representa) {
            /**
             * Crear la novedad para Reemplazar datos de una línea
             */
            $estado = 'R';
            $novedad = $this->novedadQuorumServices->createNovedad(
                $registroIngresoChange,
                $estado,
                false
            );
        } else {
            /**
             * Se inactiva la línea ya que se cambia el representante 
             */
            $estado = 'I';
            $novedad = $this->novedadQuorumServices->createNovedad(
                $this->registroIngreso,
                $estado,
                false
            );

            /**
             * Diferente representante
             */
            $estado = 'A';
            $novedad = $this->novedadQuorumServices->createNovedad(
                $registroIngresoChange,
                $estado,
                false
            );
        }
        return $novedad;
    }

    /**
     * Validaciones previas
     */
    private function previus()
    {
        $cartera = Carteras::where('nit', $this->empresa->nit)->first();
        if ($cartera) {
            throw new \Exception("Error aun posee cartera, no se puede habilitar la empresa", 301);
        }

        $representante = AsaRepresentantes::where('cedrep', $this->cedula_representa)->first();
        if (!$representante) {
            throw new \Exception("Error no está habil para registro", 301);
        }

        $this->representante = $representante;

        $this->registroIngreso = $this->preRegService->findRegistroByNitCedrep(
            $this->empresa->nit,
            $this->cedula_representa
        );
    }
}
