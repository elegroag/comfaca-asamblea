<?php

namespace App\Services;

use App\Models\AsaRepresentantes;
use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\Poderes;
use App\Models\Carteras;
use App\Models\Rechazos;
use App\Services\Empresas\RegistroEmpresaService;
use Illuminate\Support\Facades\DB;

class BuscadorService
{
    private $cedrep;
    private $representante;
    private $registroEmpresaService;
    private $poderActivo;

    public function __construct($idAsamblea, $cedrep)
    {
        $this->cedrep = $cedrep;
        $this->registroEmpresaService = new RegistroEmpresaService($idAsamblea);
    }

    /**
     * Validación principal por cédula del representante
     */
    public function findByCedtraValidation()
    {
        $poderes = $this->findEmpresaPoderByCedtra();
        $empresas = $this->empresasRepresenta();
        $asistentes = $this->otrasEmpresasRepresenta($empresas);

        $this->representante = AsaRepresentantes::where('cedrep', $this->cedrep)->first();
        if (!$this->representante) {
            throw new \Exception("El representante no está registrado en base de datos, pasar a la mesa de soporte técnico para validar la empresa.", 501);
        }

        foreach ($asistentes as $asistente) {
            /**
             * Valida el nit, es un poder del representante que se registra
             */
            $poder = Poderes::where('nit2', $asistente['nit'])
                ->where('cedrep1', $this->cedrep)
                ->first();

            if (!$poder) {
                $empresaData = $this->empresaByNit($asistente['nit']);
                if ($empresaData) {
                    $empresas[] = [
                        ...$empresaData,
                        'cedrep' => $this->representante->cedrep,
                        'repleg' => $this->representante->nombre
                    ];
                }
            }
        }

        $representante = $this->representante->toArray();
        $representante['repleg'] = $representante['nombre'];

        return [
            "representante" => $representante,
            "empresas" => $empresas,
            "asistente" => $asistentes,
            "poder" => $this->poderActivo,
            "poderes" => $poderes,
            "tipo_ingreso" => 'P'
        ];
    }

    /**
     * Empresas con registro de ingreso del mismo representante
     */
    public function empresasRepresenta()
    {
        $empresas = DB::select("
            SELECT 
                empresas.nit, 
                empresas.cedrep, 
                empresas.repleg, 
                empresas.razsoc, 
                emvoto.tiene_incripcion,
                emvoto.estado,
                (CASE 
                    WHEN emvoto.estado = 'A' THEN 'Ya Ingreso' 
                    WHEN emvoto.estado = 'I' THEN 'Inactivo' 
                    WHEN emvoto.estado = 'U' THEN 'Actualizando' 
                    WHEN emvoto.estado = 'F' THEN 'Finalizado' 
                    WHEN emvoto.estado = 'P' THEN 'Pendiente Ingreso' 
                    WHEN emvoto.estado = 'C' THEN 'Cancelado' 
                    WHEN emvoto.estado = 'R' THEN 'Rechazada' 
                ELSE 'Rechazada' END
            ) as inscripcion_estado  
            FROM empresas 
            INNER JOIN (
                SELECT  1 as 'tiene_incripcion', 
                rgi.votos, 
                rgi.estado, 
                rgi.nit, 
                rgi.documento,
                rgi.cedula_representa 
                FROM registro_ingresos as rgi 
                    WHERE rgi.cedula_representa='{$this->cedrep}' 
            ) as emvoto on emvoto.nit = empresas.nit 
            WHERE empresas.cedrep = '{$this->cedrep}'
        ");

        return collect($empresas)->map(function($item) {
            return (array) $item;
        })->toArray();
    }

    /**
     * Buscar empresa por NIT con datos de registro
     */
    public function empresaByNit($nit)
    {
        $empresa = DB::selectOne("
            SELECT 
                empresas.nit,
                empresas.cedrep,
                empresas.repleg,
                empresas.razsoc,
                emvoto.tiene_incripcion,
                emvoto.estado,
                (CASE 
                    WHEN emvoto.estado = 'A' THEN 'Ya Ingreso' 
                    WHEN emvoto.estado = 'I' THEN 'Inactivo' 
                    WHEN emvoto.estado = 'U' THEN 'Actualizando' 
                    WHEN emvoto.estado = 'F' THEN 'Finalizado' 
                    WHEN emvoto.estado = 'P' THEN 'Pendiente Ingreso' 
                    WHEN emvoto.estado = 'C' THEN 'Cancelado' 
                    WHEN emvoto.estado = 'R' THEN 'Rechazada' 
                ELSE 'Rechazada' END
            ) as inscripcion_estado  
            FROM empresas 
                INNER JOIN (
                    SELECT 1 as 'tiene_incripcion', 
                    rgi.votos, 
                    rgi.estado, 
                    rgi.nit,  
                    rgi.documento, 
                    rgi.cedula_representa  
                    FROM registro_ingresos as rgi 
                        WHERE rgi.cedula_representa='{$this->cedrep}' 
                ) as emvoto on emvoto.nit = empresas.nit 
            WHERE empresas.nit='{$nit}'
        ");

        return $empresa ? (array) $empresa : null;
    }

    /**
     * Obtener otras empresas que representa (no poderdantes)
     */
    public function otrasEmpresasRepresenta($empresas)
    {
        $where = '';
        if ($empresas) {
            $nits = [];
            foreach ($empresas as $empresa) {
                $nits[] = $empresa['nit'];
            }
            if (!empty($nits)) {
                $where = " AND rgi.nit NOT IN(" . implode(',', $nits) . ")";
            }
        }

        $data = DB::select("
            SELECT 
            rgi.nit, 
            rgi.documento,
            rgi.cedula_representa,
            rgi.nombre_representa,
            rgi.estado as 'estado_ingreso',
            (CASE 
                WHEN rgi.estado = 'A' THEN 'Ya Ingreso' 
                WHEN rgi.estado = 'I' THEN 'Inactivo' 
                WHEN rgi.estado = 'U' THEN 'Actualizando' 
                WHEN rgi.estado = 'F' THEN 'Finalizado' 
                WHEN rgi.estado = 'P' THEN 'Pendiente'
                WHEN rgi.estado = 'C' THEN 'Cancelado'
                WHEN rgi.estado = 'R' THEN 'Rechazada' 
                ELSE 'Rechazada' END 
            ) as 'detalle_estado' 
            FROM registro_ingresos as rgi 
            WHERE rgi.cedula_representa='{$this->cedrep}' {$where}"
        );

        return collect($data)->map(function($item) {
            return (array) $item;
        })->toArray();
    }

    /**
     * Buscar empresas poder por cédula del representante
     */
    public function findEmpresaPoderByCedtra()
    {
        $empresas_poder = [];
        
        /**
         * El poder es un apoderado activo
         */
        $poderes = Poderes::where('cedrep1', $this->cedrep)->get();
        
        if ($poderes->isNotEmpty()) {
            foreach ($poderes as $poder) {
                $poderdante_nit = $poder->poderdante_nit;
                $cartera = Carteras::where('nit', $poderdante_nit)->first();

                $registroIngreso = RegistroIngresos::where('nit', $poderdante_nit)
                    ->where('cedula_representa', $this->cedrep)
                    ->first();

                if (!$registroIngreso) {
                    $ingresoApo = $this->registroEmpresaService->registraIngresoDefault([
                        'nit' => $poderdante_nit,
                        'cedrep' => $this->representante->cedrep,
                        'repleg' => $this->representante->nombre
                    ]);

                    $ingresoApo = RegistroIngresos::where('documento', $ingresoApo->documento)->first();
                    
                    if ($poder->estado == 'A') {
                        $ingresoApo->estado = ($cartera == false) ? 'P' : 'R';
                        $ingresoApo->votos = ($cartera == false) ? 1 : 0;
                    } else {
                        $ingresoApo->estado = 'R';
                        $ingresoApo->votos = 0;
                    }
                    $ingresoApo->save();

                    if ($cartera) {
                        $criterio = $cartera->getCriterioId(); // Método que debe existir en el modelo Carteras
                        $rechazo = new Rechazos();
                        $rechazo->criterio_id = $criterio;
                        $rechazo->regingre_id = $ingresoApo->documento;
                        $rechazo->dia = now()->format('Y-m-d');
                        $rechazo->hora = now()->format('H:i:s');
                        $rechazo->save();
                    }
                }

                $empresa = $this->empresaByNit($poderdante_nit);
                if ($empresa) {
                    $empresa['esta_poderdante'] = 0;
                    $empresas_poder[] = $empresa;
                    if ($poder->estado == 'A') $this->poderActivo = $empresa;
                }
            }
        } else {
            return false;
        }
        
        return $empresas_poder;
    }

    /**
     * Obtener resumen completo del representante
     */
    public function getResumenCompleto()
    {
        $data = $this->findByCedtraValidation();
        
        return [
            'representante' => $data['representante'],
            'total_empresas' => count($data['empresas']),
            'total_asistentes' => count($data['asistente']),
            'tiene_poder_activo' => $data['poder'] ? true : false,
            'poderes_count' => count($data['poderes']),
            'empresas_con_ingreso' => collect($data['empresas'])->where('tiene_incripcion', 1)->count(),
            'empresas_pendientes' => collect($data['empresas'])->where('estado', 'P')->count(),
            'empresas_ya_ingresaron' => collect($data['empresas'])->where('estado', 'A')->count(),
        ];
    }

    /**
     * Validar si el representante puede registrar asistencia
     */
    public function puedeRegistrarAsistencia()
    {
        $data = $this->findByCedtraValidation();
        
        // Validaciones básicas
        if (!$data['representante']) {
            return ['puede' => false, 'motivo' => 'Representante no registrado'];
        }

        if (empty($data['empresas']) && empty($data['poder'])) {
            return ['puede' => false, 'motivo' => 'No tiene empresas asignadas ni poderes activos'];
        }

        return ['puede' => true, 'motivo' => 'Autorizado para registrar asistencia'];
    }

    /**
     * Buscar empresas por término de búsqueda
     */
    public function buscarEmpresasPorTermino($termino)
    {
        $data = $this->findByCedtraValidation();
        
        $empresas_filtradas = collect($data['empresas'])->filter(function($empresa) use ($termino) {
            return (
                stripos($empresa['nit'], $termino) !== false ||
                stripos($empresa['razsoc'], $termino) !== false ||
                stripos($empresa['repleg'], $termino) !== false
            );
        })->values()->toArray();

        return [
            'representante' => $data['representante'],
            'empresas' => $empresas_filtradas,
            'total_encontradas' => count($empresas_filtradas),
            'termino_busqueda' => $termino
        ];
    }
}
