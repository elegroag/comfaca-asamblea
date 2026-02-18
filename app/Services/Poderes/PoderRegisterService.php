<?php

namespace App\Services\Poderes;

use App\Models\Poderes;
use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\Rechazos;
use App\Models\Carteras;
use App\Models\AsaTrabajadores;
use App\Services\Empresas\RegistroEmpresaService;
use Illuminate\Support\Facades\DB;

class PoderRegisterService
{
    private $idAsamblea;
    private $otherRechazos;
    private $registroEmpresaService;

    public function __construct($idAsamblea)
    {
        $this->idAsamblea = $idAsamblea;
        $this->registroEmpresaService = new RegistroEmpresaService($idAsamblea);
    }

    /**
     * Método principal para registrar poder
     */
    public function main(
        $apoderado_nit,
        $apoderado_cedrep,
        $poderdante_nit,
        $poderdante_cedrep,
        $radicado
    ) {
        $validaPoderPrevio = Poderes::where('cedrep1', $apoderado_cedrep)
            ->where('estado', 'A')
            ->first();

        if ($validaPoderPrevio) {
            throw new \Exception("El representante con identificación {$apoderado_cedrep}. Ya posee un poder asignado y activo.", 301);
        }

        $validaRadicado = Poderes::where('radicado', $radicado)->first();
        if ($validaRadicado) {
            throw new \Exception("Error el radicado ya se encuentra registrado previamente.", 301);
        }

        // Validación a nivel de empresa
        $apoderado = Empresas::where('nit', $apoderado_nit)
            ->where('cedrep', $apoderado_cedrep)
            ->first();

        if (!$apoderado) {
            throw new \Exception("El representante con identificación {$apoderado_cedrep}, no es valido para la empresa apoderada.", 301);
        }

        $valida_apoderado = $this->validaApoderado($apoderado_nit, $apoderado_cedrep);

        $registroIngresoApo = RegistroIngresos::where('nit', $poderdante_nit)
            ->where('cedula_representa', $apoderado_cedrep)
            ->first();

        if ($registroIngresoApo) {
            // Se habilita el poder
            $this->otherRechazos = Rechazos::where('regingre_id', $registroIngresoApo->documento)
                ->where('criterio_id', '<>', 18)
                ->first();

            if (!$this->otherRechazos) {
                $registroIngresoApo->update([
                    'estado' => 'P',
                    'votos' => 1
                ]);
            }
        } else {
            $this->registroEmpresaService->registraIngresoDefault([
                'nit' => $poderdante_nit,
                'cedrep' => $apoderado_cedrep,
                'repleg' => $valida_apoderado['repleg']
            ]);
        }

        $poderdante = Empresas::where('nit', $poderdante_nit)
            ->where('cedrep', $poderdante_cedrep)
            ->first();

        if (!$poderdante) {
            throw new \Exception("El representante con identificación {$poderdante_cedrep}, no es valido para la empresa poderdante.", 301);
        }

        $valida_poderdante = $this->validaPoderdante($poderdante_nit, $poderdante_cedrep);

        // Ingreso del poderdante
        $registroIngreso = RegistroIngresos::where('nit', $poderdante_nit)
            ->where('cedula_representa', $poderdante_cedrep)
            ->first();

        if ($registroIngreso) {
            $registroIngreso->update([
                'estado' => 'R',
                'votos' => 0
            ]);
            $this->registraRechazo(18, $registroIngreso);
        }

        if (!$this->otherRechazos) {
            $poder = $this->crearPoder(
                $apoderado_nit,
                $poderdante_nit,
                $valida_apoderado,
                $valida_poderdante,
                $radicado
            );
        } else {
            throw new \Exception("El registro de ingreso ya posee otros conceptos de rechazo.", 301);
        }

        return [
            'poder' => $poder,
            'valida_apoderado' => $valida_apoderado,
            'valida_poderdante' => $valida_poderdante,
            "valida_representante" => $validaPoderPrevio ? $validaPoderPrevio->toArray() : false
        ];
    }

    /**
     * Validar apoderado
     */
    private function validaApoderado($apoderado_nit, $apoderado_cedrep)
    {
        $valida_apoderado = DB::selectOne("
            SELECT
            empresas.nit,
            empresas.razsoc,
            empresas.repleg,
            empresas.cedrep,
            (SELECT COUNT(poderes.documento) FROM poderes WHERE nit1='{$apoderado_nit}' AND poderes.estado='A') AS 'tiene_poder',
            (SELECT COUNT(poderes.documento) FROM poderes WHERE nit2='{$apoderado_nit}' AND poderes.estado='A') AS 'es_poderdante',
            (SELECT COUNT(carteras.nit) FROM carteras WHERE carteras.nit='{$apoderado_nit}') AS 'apoderado_cartera',
            (SELECT count(asa_trabajadores.cedula) FROM asa_trabajadores WHERE asa_trabajadores.cedula=empresas.cedrep) AS 'es_trabajador',
            (SELECT count(*)
                FROM registro_ingresos as rs WHERE rs.nit='{$apoderado_nit}' AND cedula_representa='{$apoderado_cedrep}' AND rs.estado = 'A'
            ) AS 'es_inscrito'
            FROM empresas
                WHERE empresas.nit='{$apoderado_nit}' AND
                empresas.asamblea_id='{$this->idAsamblea}'
                LIMIT 1
        ");

        if (!$valida_apoderado) {
            throw new \Exception("El apoderado con nit {$apoderado_nit} no está registrado en la asamblea.", 1);
        }

        if ($valida_apoderado->tiene_poder > 0) {
            throw new \Exception("El apoderado con nit {$apoderado_nit} ya posee un poder asignado.", 1);
        }
        if ($valida_apoderado->es_poderdante > 0) {
            throw new \Exception("El apoderado con nit {$apoderado_nit} es poderdante de otra entidad.", 1);
        }
        if ($valida_apoderado->apoderado_cartera > 0) {
            throw new \Exception("El apoderado con nit {$apoderado_nit} está reportado en cartera.", 1);
        }
        if ($valida_apoderado->es_trabajador > 0) {
            throw new \Exception("El apoderado con nit {$apoderado_nit} es un trabajador de la CAJA.", 1);
        }

        return (array) $valida_apoderado;
    }

    /**
     * Validar poderdante
     */
    private function validaPoderdante($poderdante_nit, $poderdante_cedrep)
    {
        $valida_poderdante = DB::selectOne("
            SELECT
            empresas.nit,
            empresas.razsoc,
            empresas.repleg,
            empresas.cedrep,
            (SELECT COUNT(*) FROM poderes as p1 WHERE p1.nit1='{$poderdante_nit}' AND p1.estado='A') AS 'tiene_poder',
            (SELECT COUNT(*) FROM poderes as p2 WHERE p2.nit2='{$poderdante_nit}' AND p2.estado='A') AS 'es_poderdante',
            (SELECT COUNT(*) FROM carteras WHERE carteras.nit='{$poderdante_nit}') AS 'poderdante_cartera',
            (SELECT count(*)
                FROM registro_ingresos as rs WHERE rs.nit='{$poderdante_nit}' AND cedula_representa='{$poderdante_cedrep}' AND rs.estado = 'A'
            ) AS 'es_inscrito'
            FROM empresas
                WHERE empresas.nit = '{$poderdante_nit}' AND
                empresas.asamblea_id ='{$this->idAsamblea}' AND
                empresas.cedrep = '{$poderdante_cedrep}'
                LIMIT 1
        ");

        if (!$valida_poderdante) {
            throw new \Exception("El poderdante con nit {$poderdante_nit} no está registrado en la asamblea.", 1);
        }

        if ($valida_poderdante->tiene_poder > 0) {
            throw new \Exception("El poderdante con nit {$poderdante_nit} ya posee un poder asignado.", 1);
        }
        if ($valida_poderdante->es_poderdante > 0) {
            throw new \Exception("El poderdante con nit {$poderdante_nit} es poderdante de otra entidad.", 1);
        }
        if ($valida_poderdante->poderdante_cartera > 0) {
            throw new \Exception("El poderdante con nit {$poderdante_nit} está reportado en cartera.", 1);
        }

        return (array) $valida_poderdante;
    }

    /**
     * Registrar rechazo
     */
    private function registraRechazo($criterio, $registroIngreso)
    {
        $criterio_id = $criterio ?? 18;
        $rechazo = Rechazos::where('regingre_id', $registroIngreso->documento)
            ->where('criterio_id', $criterio_id)
            ->first();

        if ($rechazo) {
            return false;
        }

        $rechazo = Rechazos::create([
            'criterio_id' => $criterio_id,
            'regingre_id' => $registroIngreso->documento,
            'dia' => now()->format('Y-m-d'),
            'hora' => now()->format('H:i:s')
        ]);

        return $rechazo;
    }

    /**
     * Crear poder
     */
    private function crearPoder($apoderado_nit, $poderdante_nit, $valida_apoderado, $valida_poderdante, $radicado)
    {
        $documento = Poderes::max('documento') ?: 0;

        $poder = Poderes::create([
            'documento' => $documento + 1,
            'fecha' => now()->format('Y-m-d'),
            'nit1' => $apoderado_nit,
            'nit2' => $poderdante_nit,
            'razsoc1' => $valida_apoderado['razsoc'],
            'razsoc2' => $valida_poderdante['razsoc'],
            'estado' => 'A',
            'radicado' => $radicado,
            'cedrep1' => $valida_apoderado['cedrep'],
            'cedrep2' => $valida_poderdante['cedrep'],
            'repleg1' => $valida_apoderado['repleg'],
            'repleg2' => $valida_poderdante['repleg'],
            'asamblea_id' => $this->idAsamblea
        ]);

        return $poder->toArray();
    }

    /**
     * Crear rechazo para un registro de ingreso
     */
    public function createRechazo($documento, $criterio = 18)
    {
        RegistroIngresos::where('documento', $documento)
            ->update(['estado' => 'R', 'votos' => 0]);

        $rechazo = Rechazos::where('regingre_id', $documento)
            ->where('criterio_id', $criterio)
            ->first();

        if (!$rechazo) {
            $rechazo = Rechazos::create([
                'criterio_id' => $criterio,
                'regingre_id' => $documento,
                'dia' => now()->format('Y-m-d'),
                'hora' => now()->format('H:i:s')
            ]);
        }

        return true;
    }

    /**
     * Eliminar rechazo
     */
    public function removeRechazo($documento)
    {
        $rechazos = Rechazos::where('regingre_id', $documento)
            ->whereIn('criterio_id', [18, 25])
            ->get();

        if ($rechazos->isNotEmpty()) {
            foreach ($rechazos as $rechazo) {
                $rechazo->delete();
            }

            $otherRechazos = Rechazos::where('regingre_id', $documento)
                ->whereNotIn('criterio_id', [18, 25])
                ->first();

            if (!$otherRechazos) {
                RegistroIngresos::where('documento', $documento)
                    ->update(['estado' => 'P', 'votos' => 1]);
            }
        }

        return true;
    }

    /**
     * Validar si empresa puede ser apoderado
     */
    public function puedeSerApoderado($nit, $cedrep)
    {
        try {
            $this->validaApoderado($nit, $cedrep);
            return ['puede' => true, 'motivo' => 'Autorizado para ser apoderado'];
        } catch (\Exception $e) {
            return ['puede' => false, 'motivo' => $e->getMessage()];
        }
    }

    /**
     * Validar si empresa puede ser poderdante
     */
    public function puedeSerPoderdante($nit, $cedrep)
    {
        try {
            $this->validaPoderdante($nit, $cedrep);
            return ['puede' => true, 'motivo' => 'Autorizado para ser poderdante'];
        } catch (\Exception $e) {
            return ['puede' => false, 'motivo' => $e->getMessage()];
        }
    }

    /**
     * Obtener resumen de poderes registrados
     */
    public function getResumenPoderes()
    {
        $total = Poderes::where('asamblea_id', $this->idAsamblea)->count();
        $activos = Poderes::where('asamblea_id', $this->idAsamblea)
            ->where('estado', 'A')
            ->count();
        $inactivos = Poderes::where('asamblea_id', $this->idAsamblea)
            ->where('estado', 'I')
            ->count();
        $rechazados = Poderes::where('asamblea_id', $this->idAsamblea)
            ->where('estado', 'R')
            ->count();

        return [
            'total_poderes' => $total,
            'poderes_activos' => $activos,
            'poderes_inactivos' => $inactivos,
            'poderes_rechazados' => $rechazados,
            'ultima_actualizacion' => Poderes::max('updated_at')
        ];
    }

    /**
     * Buscar poderes por criterio
     */
    public function buscarPoderes($termino)
    {
        return Poderes::where('asamblea_id', $this->idAsamblea)
            ->where(function ($query) use ($termino) {
                $query->where('nit1', 'LIKE', "%{$termino}%")
                    ->orWhere('nit2', 'LIKE', "%{$termino}%")
                    ->orWhere('razsoc1', 'LIKE', "%{$termino}%")
                    ->orWhere('razsoc2', 'LIKE', "%{$termino}%")
                    ->orWhere('radicado', 'LIKE', "%{$termino}%");
            })
            ->orderBy('fecha', 'desc')
            ->get();
    }

    /**
     * Obtener poderes por empresa
     */
    public function getPoderesPorEmpresa($nit)
    {
        return Poderes::where('asamblea_id', $this->idAsamblea)
            ->where(function ($query) use ($nit) {
                $query->where('nit1', $nit)
                    ->orWhere('nit2', $nit);
            })
            ->orderBy('fecha', 'desc')
            ->get();
    }

    /**
     * Validar radicado único
     */
    public function validarRadicadoUnico($radicado, $excluirId = null)
    {
        $query = Poderes::where('radicado', $radicado)
            ->where('asamblea_id', $this->idAsamblea);

        if ($excluirId) {
            $query->where('documento', '<>', $excluirId);
        }

        $existe = $query->first();

        return [
            'disponible' => !$existe,
            'mensaje' => $existe ? 'El radicado ya está registrado' : 'Radicado disponible'
        ];
    }

    /**
     * Obtener estadísticas de poderes
     */
    public function getEstadisticasPoderes()
    {
        $poderes = Poderes::where('asamblea_id', $this->idAsamblea)->get();

        return [
            'total_registrados' => $poderes->count(),
            'activos_hoy' => $poderes->where('estado', 'A')
                ->where('fecha', now()->format('Y-m-d'))
                ->count(),
            'empresas_apoderadas' => $poderes->pluck('nit1')->unique()->count(),
            'empresas_poderdantes' => $poderes->pluck('nit2')->unique()->count(),
            'promedio_diario' => $poderes->count() / max(1, now()->diffInDays($poderes->min('fecha')) + 1),
            'ultimo_registro' => $poderes->max('created_at')
        ];
    }
}
