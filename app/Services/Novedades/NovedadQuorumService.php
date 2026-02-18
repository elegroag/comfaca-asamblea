<?php

namespace App\Services\Novedades;

use App\Models\Novedades;
use App\Models\RegistroIngresos;
use App\Models\Poderes;
use App\Models\Empresas;
use App\Models\AsaRepresentantes;
use Illuminate\Support\Facades\DB;

class NovedadQuorumService
{
    /**
     * Crear novedad para quorum
     */
    public function createNovedad($registro, $estado, $poder = false)
    {
        if ($poder) {
            $row = DB::selectOne("
                SELECT
                    poderes.nit2 as 'nit',
                    empresas.razsoc as 'razon_social',
                    poderes.cedrep2 as 'cedula_representante',
                    poderes.repleg2 as 'nombre_representante',
                    poderes.nit1 as 'apoderado_nit',
                    poderes.cedrep1 as 'apoderado_cedula',
                    poderes.repleg1 as 'apoderado_nombre',
                    apoderado.clave_ingreso as 'clave'
                FROM registro_ingresos as rgi
                INNER JOIN poderes ON poderes.nit2 = rgi.nit and poderes.estado='A'
                INNER JOIN empresas ON empresas.nit = poderes.nit2
                INNER JOIN asa_representantes as apoderado ON apoderado.cedrep = poderes.cedrep1
                WHERE rgi.documento='{$registro->documento}' LIMIT 1
            ");
        } else {
            $row = DB::selectOne("
                SELECT
                    rgi.nit as 'nit',
                    empresas.razsoc as 'razon_social',
                    asa_representantes.cedrep as 'cedula_representante',
                    asa_representantes.nombre as 'nombre_representante',
                    '' as 'apoderado_nit',
                    '' as 'apoderado_cedula',
                    '' as 'apoderado_nombre',
                    asa_representantes.clave_ingreso as 'clave'
                FROM registro_ingresos as rgi
                INNER JOIN empresas ON empresas.nit=rgi.nit
                INNER JOIN asa_representantes ON asa_representantes.cedrep = rgi.cedula_representa
                WHERE rgi.documento='{$registro->documento}' LIMIT 1
            ");
        }

        if (!$row) {
            throw new \Exception("Error la estructura no se puede identificar", 301);
        }

        $linea = $registro->orden ?? 0;

        /**
         * Si el orden no existe, nunca se reportó a Plataforma, se debe crear una nueva línea
         */
        if ($linea == 0 || $linea == null) {
            $linea = intval(RegistroIngresos::max("orden")) + 1;
        }

        $id = Novedades::max('id') ?: 0;

        $novedad = Novedades::create([
            'id' => $id + 1,
            'linea' => $linea,
            'syncro' => 0,
            'estado' => $estado,
            'nit' => $row['nit'],
            'razon_social' => $row['razon_social'],
            'cedula_representante' => $row['cedula_representante'],
            'nombre_representante' => $row['nombre_representante'],
            'apoderado_nit' => $row['apoderado_nit'],
            'apoderado_cedula' => $row['apoderado_cedula'],
            'apoderado_nombre' => $row['apoderado_nombre'],
            'clave' => $row['clave'],
        ]);

        return $novedad;
    }

    /**
     * Eliminar novedad
     */
    public function removeNovedad($id)
    {
        $novedad = Novedades::find($id);
        if (!$novedad) {
            throw new \Exception("La novedad no existe", 404);
        }

        $novedad->delete();
        return true;
    }

    /**
     * Sincronizar novedad
     */
    public function syncroNovedad($id, $syncro = 1)
    {
        $novedad = Novedades::find($id);
        if (!$novedad) {
            throw new \Exception("La novedad no existe", 404);
        }

        $novedad->update([
            'syncro' => $syncro,
            'updated_at' => now()
        ]);

        return $novedad->fresh();
    }

    /**
     * Obtener novedades por asamblea
     */
    public function getNovedadesPorAsamblea($idAsamblea = null)
    {
        $query = Novedades::with(['registroIngreso']);

        if ($idAsamblea) {
            $query->where('asamblea_id', $idAsamblea);
        }

        return $query->orderBy('linea')->get();
    }

    /**
     * Obtener novedades por estado
     */
    public function getNovedadesPorEstado($estado, $idAsamblea = null)
    {
        $query = Novedades::with(['registroIngreso'])
            ->where('estado', $estado);

        if ($idAsamblea) {
            $query->where('asamblea_id', $idAsamblea);
        }

        return $query->orderBy('linea')->get();
    }

    /**
     * Obtener novedades por línea
     */
    public function getNovedadesPorLinea($linea, $idAsamblea = null)
    {
        $query = Novedades::with(['registroIngreso'])
            ->where('linea', $linea);

        if ($idAsamblea) {
            $query->where('asamblea_id', $idAsamblea);
        }

        return $query->get();
    }

    /**
     * Obtener novedades por NIT
     */
    public function getNovedadesPorNit($nit, $idAsamblea = null)
    {
        $query = Novedades::with(['registroIngreso'])
            ->where('nit', $nit);

        if ($idAsamblea) {
            $query->where('asamblea_id', $idAsamblea);
        }

        return $query->orderBy('linea')->get();
    }

    /**
     * Actualizar estado de novedad
     */
    public function actualizarEstado($id, $estado)
    {
        $novedad = Novedades::find($id);
        if (!$novedad) {
            throw new \Exception("La novedad no existe", 404);
        }

        $novedad->update([
            'estado' => $estado,
            'updated_at' => now()
        ]);

        return $novedad->fresh();
    }

    /**
     * Actualizar línea de novedad
     */
    public function actualizarLinea($id, $linea)
    {
        $novedad = Novedades::find($id);
        if (!$novedad) {
            throw new \Exception("La novedad no existe", 404);
        }

        $novedad->update([
            'linea' => $linea,
            'updated_at' => now()
        ]);

        return $novedad->fresh();
    }

    /**
     * Obtener resumen de novedades
     */
    public function getResumenNovedades($idAsamblea = null)
    {
        $query = Novedades::query();

        if ($idAsamblea) {
            $query->where('asamblea_id', $idAsamblea);
        }

        $total = $query->count();
        $activas = $query->where('estado', 'A')->count();
        $inactivas = $query->where('estado', 'I')->count();
        $reemplazos = $query->where('estado', 'R')->count();

        return [
            'total_novedades' => $total,
            'novedades_activas' => $activas,
            'novedades_inactivas' => $inactivas,
            'novedades_reemplazos' => $reemplazos,
            'ultima_actualizacion' => Novedades::max('updated_at')
        ];
    }

    /**
     * Validar si existe novedad para registro
     */
    public function existeNovedadParaRegistro($registroId)
    {
        return Novedades::where('regingre_id', $registroId)->exists();
    }

    /**
     * Eliminar novedades por registro
     */
    public function eliminarNovedadesPorRegistro($registroId)
    {
        return Novedades::where('regingre_id', $registroId)->delete();
    }

    /**
     * Obtener siguiente línea disponible
     */
    public function getSiguienteLinea($idAsamblea = null)
    {
        $query = Novedades::query();

        if ($idAsamblea) {
            $query->where('asamblea_id', $idAsamblea);
        }

        $maxLinea = $query->max('linea') ?: 0;
        return $maxLinea + 1;
    }

    /**
     * Reorganizar líneas de novedades
     */
    public function reorganizarLineas($idAsamblea = null)
    {
        $query = Novedades::where('estado', '!=', 'E') // Excluir eliminadas
            ->orderBy('linea');

        if ($idAsamblea) {
            $query->where('asamblea_id', $idAsamblea);
        }

        $novedades = $query->get();
        $lineaActual = 1;

        foreach ($novedades as $novedad) {
            $novedad->update([
                'linea' => $lineaActual,
                'updated_at' => now()
            ]);
            $lineaActual++;
        }

        return [
            'novedades_organizadas' => $lineaActual - 1,
            'ultima_linea' => $lineaActual - 1
        ];
    }

    /**
     * Buscar novedades por término
     */
    public function buscarNovedades($termino, $idAsamblea = null)
    {
        $query = Novedades::with(['registroIngreso'])
            ->where(function ($query) use ($termino) {
                $query->where('nit', 'LIKE', "%{$termino}%")
                    ->orWhere('razon_social', 'LIKE', "%{$termino}%")
                    ->orWhere('nombre_representante', 'LIKE', "%{$termino}%");
            });

        if ($idAsamblea) {
            $query->where('asamblea_id', $idAsamblea);
        }

        return $query->orderBy('linea')->get();
    }

    /**
     * Obtener novedades por rango de fechas
     */
    public function getNovedadesPorRangoFechas($fechaInicio, $fechaFin, $idAsamblea = null)
    {
        $query = Novedades::with(['registroIngreso'])
            ->whereBetween('created_at', [$fechaInicio, $fechaFin]);

        if ($idAsamblea) {
            $query->where('asamblea_id', $idAsamblea);
        }

        return $query->orderBy('linea')->get();
    }

    /**
     * Exportar novedades a array
     */
    public function exportarNovedades($idAsamblea = null)
    {
        $novedades = $this->getNovedadesPorAsamblea($idAsamblea);

        return $novedades->map(function ($novedad) {
            return [
                'id' => $novedad->id,
                'linea' => $novedad->linea,
                'estado' => $novedad->estado,
                'nit' => $novedad->nit,
                'razon_social' => $novedad->razon_social,
                'cedula_representante' => $novedad->cedula_representante,
                'nombre_representante' => $novedad->nombre_representante,
                'apoderado_nit' => $novedad->apoderado_nit,
                'apoderado_cedula' => $novedad->apoderado_cedula,
                'apoderado_nombre' => $novedad->apoderado_nombre,
                'clave' => $novedad->clave,
                'es_poder' => $novedad->es_poder,
                'created_at' => $novedad->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $novedad->updated_at->format('Y-m-d H:i:s')
            ];
        })->toArray();
    }
}
