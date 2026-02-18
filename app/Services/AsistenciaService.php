<?php

namespace App\Services;

use App\Models\AsaAsamblea;
use App\Models\AsaRepresentantes;
use App\Models\AsaAntorami;
use App\Models\AsaMesas;
use App\Models\AsaConsenso;
use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\Poderes;
use App\Models\Carteras;
use Illuminate\Support\Facades\DB;

class AsistenciaService
{
    private $idAsamblea;
    private $cedrep;

    public function __construct($idAsamblea, $cedrep)
    {
        $this->idAsamblea = $idAsamblea;
        $this->cedrep = $cedrep;
    }

    /**
     * Obtener ficha de datos completa del representante
     */
    public function fichaData()
    {
        $votos = 0;
        $mesas = $this->findMesasDisponibles();

        $empresas = $this->buscarEmpresasIngreso() ?? [];

        $asistentes = $this->buscarRegistrosIngreso();

        foreach ($asistentes as $asistente) {
            $flag = 0;
            foreach ($empresas as $empresa) {
                if ($empresa['nit'] == $asistente['nit']) {
                    $flag++;
                    break;
                }
            }

            if ($flag == 0) {
                $_empresa = $this->empresaByNit($asistente['nit']);
                if ($_empresa) {
                    if ($_empresa['esta_poderdante'] == -1) $empresas[] = $_empresa;
                }
            }
        }

        foreach ($empresas as $empresa) if ($empresa['votos'] != 0) $votos++;

        $representante = AsaRepresentantes::where('cedrep', $this->cedrep)->first();
        if (!$representante) {
            throw new \Exception("Error el representante no está registrado en base de datos", 501);
        }

        // Buscar en poderes, si el poder está registrado para asistir en la asamblea con un representante diferente a él
        $poder = $this->findEmpresaPoderByCedtra();
        if ($poder) {
            $votos++;
        }

        $asamblea = AsaAsamblea::find($this->idAsamblea);
        
        if ($asamblea->modo == 'P') {
            $asaRepresentante = AsaRepresentantes::where('cedrep', $this->cedrep)->first();
            $access_usuario = $this->cedrep;
            $access_clave = $asaRepresentante->clave_ingreso;
        } else {
            $antorami = AsaAntorami::where('cedrep', $this->cedrep)->first();
            $access_usuario = $antorami->usuario;
            $access_clave = $antorami->clave;
        }

        return [
            "representante" => $representante->toArray(),
            "empresas" => $empresas,
            "poder" => $poder,
            "votos" => $votos,
            "mesas" => $mesas,
            "usuario" => $access_usuario,
            "clave" => $access_clave,
        ];
    }

    /**
     * Buscar mesas disponibles para la asamblea
     */
    public function findMesasDisponibles()
    {
        return DB::table('asa_mesas')
            ->select('asa_mesas.*', 'asa_consenso.asamblea_id')
            ->leftJoin('asa_consenso', 'asa_consenso.id', '=', 'asa_mesas.consenso_id')
            ->where('asa_consenso.asamblea_id', $this->idAsamblea)
            ->get()
            ->toArray();
    }

    /**
     * Buscar empresas en las que el representante está encargado
     */
    public function buscarEmpresasIngreso($valid_estado_ingreso = false)
    {
        $whereClause = ($valid_estado_ingreso) ? "AND rgi.estado IN('P','A')" : '';

        $empresas = DB::select("
            SELECT 
                empresas.*,
                IF((SELECT COUNT(*) FROM carteras WHERE carteras.nit=empresas.nit) >= 1, 1, -1) as tiene_cartera, 
                IF((SELECT COUNT(*) FROM poderes WHERE poderes.nit2=empresas.nit and poderes.estado='A') >= 1, 1, -1) as esta_poderdante,
                IF((SELECT COUNT(*) FROM poderes WHERE poderes.nit1=empresas.nit and poderes.estado='A') >= 1, 1, -1) as esta_apoderado,
                emvoto.votos, 
                emvoto.mesa_id, 
                emvoto.asistente_estado, 
                emvoto.tiene_ingreso,
                emvoto.cedula_representa,
                emvoto.documento 
            FROM empresas 
                INNER JOIN (
                    SELECT rgi.votos, 
                    rgi.nit, 
                    rgi.mesa_id, 
                    rgi.estado as 'asistente_estado', 
                    1 as 'tiene_ingreso',
                    rgi.documento as documento,
                    rgi.cedula_representa 
                    FROM registro_ingresos as rgi
                        WHERE rgi.asamblea_id='{$this->idAsamblea}' AND rgi.cedula_representa='{$this->cedrep}' {$whereClause} 
                ) as emvoto  on emvoto.nit = empresas.nit 
            WHERE empresas.cedrep='{$this->cedrep}' and 
            empresas.asamblea_id='{$this->idAsamblea}'
        ");

        return collect($empresas)->map(function($item) {
            return (array) $item;
        })->toArray();
    }

    /**
     * Buscar empresa por NIT con datos de registro de ingreso
     */
    public function empresaByNit($nit, $valid_estado_ingreso = false)
    {
        $whereClause = ($valid_estado_ingreso) ? "AND rgi.estado IN('P','A')" : '';

        $empresa = DB::selectOne("
            SELECT 
            empresas.*,
            IF((SELECT COUNT(*) FROM carteras WHERE carteras.nit=empresas.nit) >= 1, 1, -1) as tiene_cartera, 
            IF((SELECT COUNT(*) FROM poderes WHERE poderes.nit2=empresas.nit and poderes.estado='A') >= 1, 1, -1) as esta_poderdante,
            IF((SELECT COUNT(*) FROM poderes WHERE poderes.nit1=empresas.nit and poderes.estado='A') >= 1, 1, -1) as esta_apoderado,
            emvoto.votos, 
            emvoto.mesa_id, 
            emvoto.asistente_estado, 
            emvoto.tiene_ingreso,
            emvoto.cedula_representa,
            emvoto.documento 
            FROM empresas 
                INNER JOIN ( 
                    SELECT rgi.votos, 
                    rgi.nit, 
                    rgi.mesa_id, 
                    rgi.estado as 'asistente_estado',
                    1 as 'tiene_ingreso',
                    rgi.documento as documento,
                    rgi.cedula_representa 
                    FROM registro_ingresos as rgi 
                    WHERE rgi.asamblea_id='{$this->idAsamblea}' AND rgi.cedula_representa='{$this->cedrep}' {$whereClause} 
                ) as emvoto on emvoto.nit = empresas.nit 
            WHERE empresas.nit='{$nit}' and empresas.asamblea_id='{$this->idAsamblea}'
        ");

        return $empresa ? (array) $empresa : null;
    }

    /**
     * Buscar registros de ingreso del representante
     */
    public function buscarRegistrosIngreso()
    {
        return DB::table('registro_ingresos as rgi')
            ->select(
                'rgi.*',
                'rgi.estado as habil_ingreso',
                DB::raw("(CASE 
                    WHEN rgi.estado = 'A' THEN 'Ya Ingreso' 
                    WHEN rgi.estado = 'I' THEN 'Inactivo' 
                    WHEN rgi.estado = 'U' THEN 'Actualizando' 
                    WHEN rgi.estado = 'F' THEN 'Finalizado' 
                    WHEN rgi.estado = 'P' THEN 'Pendiente'
                    WHEN rgi.estado = 'C' THEN 'Cancelado'
                    WHEN rgi.estado = 'R' THEN 'Rechazada' 
                    ELSE 'Rechazada' 
                END) as 'detalle_estado'")
            )
            ->where('rgi.asamblea_id', $this->idAsamblea)
            ->where('rgi.cedula_representa', $this->cedrep)
            ->get()
            ->toArray();
    }

    /**
     * Buscar empresa poder por cédula del representante
     */
    public function findEmpresaPoderByCedtra()
    {
        return DB::selectOne("
            SELECT poderes.*, 
            (SELECT count(*) 
                FROM registro_ingresos 
                WHERE registro_ingresos.nit = poderes.nit1 AND 
                    registro_ingresos.cedula_representa='{$this->cedrep}' AND 
                    registro_ingresos.asamblea_id='{$this->idAsamblea}' 
            ) as 'esta_ingresado' 
            FROM poderes 
            WHERE poderes.cedrep1='{$this->cedrep}' AND 
                poderes.asamblea_id='{$this->idAsamblea}' AND 
                poderes.estado='A' 
            LIMIT 1
        ");
    }

    /**
     * Obtener resumen de asistencia del representante
     */
    public function getResumenAsistencia()
    {
        $empresas = $this->buscarEmpresasIngreso(true);
        $poder = $this->findEmpresaPoderByCedtra();
        
        $votos = 0;
        foreach ($empresas as $empresa) {
            if ($empresa['votos'] != 0) $votos++;
        }
        
        if ($poder) $votos++;

        return [
            'total_empresas' => count($empresas),
            'votos_disponibles' => $votos,
            'tiene_poder' => $poder ? true : false,
            'empresas_con_cartera' => collect($empresas)->where('tiene_cartera', 1)->count(),
            'empresas_poderdantes' => collect($empresas)->where('esta_poderdante', 1)->count(),
            'empresas_apoderadas' => collect($empresas)->where('esta_apoderado', 1)->count(),
        ];
    }

    /**
     * Validar acceso del representante según modo de asamblea
     */
    public function validarAcceso()
    {
        $asamblea = AsaAsamblea::find($this->idAsamblea);
        $representante = AsaRepresentantes::where('cedrep', $this->cedrep)->first();
        
        if (!$representante) {
            throw new \Exception("Error el representante no está registrado", 501);
        }

        if ($asamblea->modo == 'P') {
            return [
                'usuario' => $this->cedrep,
                'clave' => $representante->clave_ingreso,
                'modo' => 'Presencial'
            ];
        } else {
            $antorami = AsaAntorami::where('cedrep', $this->cedrep)->first();
            if (!$antorami) {
                throw new \Exception("Error no está registrado para modo antorami", 501);
            }
            
            return [
                'usuario' => $antorami->usuario,
                'clave' => $antorami->clave,
                'modo' => 'Antorami'
            ];
        }
    }
}
