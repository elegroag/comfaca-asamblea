<?php

namespace App\Services;

use App\Models\AsaRepresentantes;
use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\Poderes;
use App\Services\Empresas\RegistroEmpresaService;
use Illuminate\Support\Facades\DB;

class RepresentanteService
{
    /**
     * Crear representante con registro de ingreso
     */
    public function createConIngreso($data, $representa)
    {
        return DB::transaction(function () use ($data, $representa) {
            $asaRepresentantes = AsaRepresentantes::where('cedrep', $data['cedrep'])->first();
            
            if (!$asaRepresentantes) {
                $asaRepresentantes = AsaRepresentantes::create([
                    'nombre' => $data['nombre'],
                    'cedrep' => $data['cedrep'],
                    'clave_ingreso' => $data['clave'],
                    'asamblea_id' => $data['asamblea_id'],
                    'acepta_politicas' => $data['acepta_politicas'],
                    'create_at' => $data['create_at'],
                    'update_at' => now()
                ]);
            }

            if ($representa['representa_existente'] == 1 && $representa['nit']) {
                $empresa = Empresas::where('nit', $representa['nit'])->first();
                if (!$empresa) {
                    throw new \Exception("Error empresa no está habil para continuar", 1);
                }

                $registroIngresos = RegistroIngresos::where('nit', $representa['nit'])->first();
                if ($registroIngresos) {
                    $registroIngresos->update([
                        'cedula_representa' => $asaRepresentantes->cedrep,
                        'nombre_representa' => $asaRepresentantes->nombre
                    ]);
                } else {
                    $registroEmpresaService = new RegistroEmpresaService($data['asamblea_id']);
                    $registroEmpresaService->registraIngresoDefault([
                        'nit' => $representa['nit'],
                        'cedrep' => $data['cedrep'],
                        'repleg' => $data['nombre']
                    ]);

                    // Valida si no es poderdante la empresa
                    $poderdante = Poderes::where('nit2', $representa['nit'])
                        ->where('estado', 'A')
                        ->first();
                    
                    if ($poderdante) {
                        throw new \Exception("Error la empresa ya es poderdante.", 1);
                    }
                }
            }
            
            return $asaRepresentantes->toArray();
        });
    }

    /**
     * Remover representante con sus registros
     */
    public function removerConRegister($asaRepresentante)
    {
        return DB::transaction(function () use ($asaRepresentante) {
            $registroIngresos = RegistroIngresos::where('cedula_representa', $asaRepresentante->cedrep)->get();
            
            if ($registroIngresos->isNotEmpty()) {
                foreach ($registroIngresos as $registroIngreso) {
                    $nit = $registroIngreso->nit;
                    $empresa = Empresas::where('nit', $nit)->first();

                    if ($empresa) {
                        $registroIngreso->update([
                            'cedula_representa' => $empresa->cedrep,
                            'nombre_representa' => $empresa->repleg,
                            'estado' => 'R',
                            'votos' => '0'
                        ]);
                    }
                }
            }

            AsaRepresentantes::where('cedrep', $asaRepresentante->cedrep)->delete();
            
            return true;
        });
    }

    /**
     * Generar clave aleatoria
     */
    public function claveAleatoria($long = 6)
    {
        $str = "123456789";
        $password = "";
        for ($i = 0; $i < $long; $i++) {
            $password .= substr($str, rand(0, 8), 1);
        }
        return $password;
    }

    /**
     * Obtener representante por cédula
     */
    public function getRepresentantePorCedula($cedrep)
    {
        return AsaRepresentantes::where('cedrep', $cedrep)->first();
    }

    /**
     * Obtener representantes por asamblea
     */
    public function getRepresentantesPorAsamblea($idAsamblea)
    {
        return AsaRepresentantes::where('asamblea_id', $idAsamblea)
            ->orderBy('nombre')
            ->get();
    }

    /**
     * Actualizar representante
     */
    public function actualizarRepresentante($cedrep, $data)
    {
        $representante = AsaRepresentantes::where('cedrep', $cedrep)->first();
        if (!$representante) {
            throw new \Exception("El representante no existe", 404);
        }

        $representante->update([
            'nombre' => $data['nombre'] ?? $representante->nombre,
            'clave_ingreso' => $data['clave_ingreso'] ?? $representante->clave_ingreso,
            'acepta_politicas' => $data['acepta_politicas'] ?? $representante->acepta_politicas,
            'update_at' => now()
        ]);

        return $representante->fresh();
    }

    /**
     * Eliminar representante
     */
    public function eliminarRepresentante($cedrep)
    {
        return DB::transaction(function () use ($cedrep) {
            // Primero remover registros asociados
            $this->removerConRegister((object) ['cedrep' => $cedrep]);
            
            // Luego eliminar el representante
            $eliminado = AsaRepresentantes::where('cedrep', $cedrep)->delete();
            
            return $eliminado > 0;
        });
    }

    /**
     * Validar si representante puede ser eliminado
     */
    public function puedeEliminarRepresentante($cedrep)
    {
        $representante = AsaRepresentantes::where('cedrep', $cedrep)->first();
        if (!$representante) {
            return ['puede' => false, 'motivo' => 'El representante no existe'];
        }

        $registros = RegistroIngresos::where('cedula_representa', $cedrep)->count();
        if ($registros > 0) {
            return ['puede' => false, 'motivo' => 'El representante tiene registros de ingreso asociados'];
        }

        return ['puede' => true, 'motivo' => 'Representante puede ser eliminado'];
    }

    /**
     * Buscar representantes por término
     */
    public function buscarRepresentantes($termino, $idAsamblea = null)
    {
        $query = AsaRepresentantes::where(function ($query) use ($termino) {
            $query->where('nombre', 'LIKE', "%{$termino}%")
                ->orWhere('cedrep', 'LIKE', "%{$termino}%");
        });

        if ($idAsamblea) {
            $query->where('asamblea_id', $idAsamblea);
        }

        return $query->orderBy('nombre')->get();
    }

    /**
     * Obtener resumen de representantes
     */
    public function getResumenRepresentantes($idAsamblea = null)
    {
        $query = AsaRepresentantes::query();
        
        if ($idAsamblea) {
            $query->where('asamblea_id', $idAsamblea);
        }
        
        $total = $query->count();
        $conPoliticas = $query->where('acepta_politicas', '1')->count();
        $sinPoliticas = $query->where('acepta_politicas', '0')->count();
        $nuevos = $query->where('nuevo', '1')->count();

        return [
            'total_representantes' => $total,
            'con_politicas_aceptadas' => $conPoliticas,
            'sin_politicas_aceptadas' => $sinPoliticas,
            'representantes_nuevos' => $nuevos,
            'ultima_actualizacion' => AsaRepresentantes::max('updated_at')
        ];
    }

    /**
     * Actualizar políticas de representante
     */
    public function actualizarPoliticas($cedrep, $acepta)
    {
        $representante = AsaRepresentantes::where('cedrep', $cedrep)->first();
        if (!$representante) {
            throw new \Exception("El representante no existe", 404);
        }

        $representante->update([
            'acepta_politicas' => $acepta,
            'update_at' => now()
        ]);

        return $representante->fresh();
    }

    /**
     * Generar clave para representante
     */
    public function generarClaveParaRepresentante($cedrep)
    {
        $representante = AsaRepresentantes::where('cedrep', $cedrep)->first();
        if (!$representante) {
            throw new \Exception("El representante no existe", 404);
        }

        $nuevaClave = $this->claveAleatoria();
        
        $representante->update([
            'clave_ingreso' => $nuevaClave,
            'update_at' => now()
        ]);

        return [
            'cedrep' => $cedrep,
            'clave_generada' => $nuevaClave,
            'representante' => $representante->fresh()
        ];
    }

    /**
     * Validar acceso de representante
     */
    public function validarAcceso($cedrep, $clave)
    {
        $representante = AsaRepresentantes::where('cedrep', $cedrep)
            ->where('clave_ingreso', $clave)
            ->first();

        if (!$representante) {
            return [
                'autenticado' => false,
                'motivo' => 'Cédula o clave incorrecta',
                'representante' => null
            ];
        }

        return [
            'autenticado' => true,
            'motivo' => 'Acceso autorizado',
            'representante' => $representante->toArray()
        ];
    }

    /**
     * Obtener representantes con registros de ingreso
     */
    public function getRepresentantesConRegistros($idAsamblea = null)
    {
        $query = AsaRepresentantes::with(['registrosIngreso']);
        
        if ($idAsamblea) {
            $query->where('asamblea_id', $idAsamblea);
        }

        return $query->get()->filter(function ($representante) {
            return $representante->registrosIngreso->isNotEmpty();
        });
    }

    /**
     * Exportar representantes a array
     */
    public function exportarRepresentantes($idAsamblea = null)
    {
        $representantes = $this->getRepresentantesPorAsamblea($idAsamblea);
        
        return $representantes->map(function ($representante) {
            return [
                'cedrep' => $representante->cedrep,
                'nombre' => $representante->nombre,
                'clave_ingreso' => $representante->clave_ingreso,
                'asamblea_id' => $representante->asamblea_id,
                'acepta_politicas' => $representante->acepta_politicas,
                'nuevo' => $representante->nuevo,
                'create_at' => $representante->create_at->format('Y-m-d H:i:s'),
                'update_at' => $representante->update_at->format('Y-m-d H:i:s')
            ];
        })->toArray();
    }

    /**
     * Verificar si representante existe
     */
    public function existeRepresentante($cedrep, $idAsamblea = null)
    {
        $query = AsaRepresentantes::where('cedrep', $cedrep);
        
        if ($idAsamblea) {
            $query->where('asamblea_id', $idAsamblea);
        }
        
        return $query->exists();
    }

    /**
     * Obtener estadísticas de uso
     */
    public function getEstadisticasUso($idAsamblea = null)
    {
        $query = AsaRepresentantes::query();
        
        if ($idAsamblea) {
            $query->where('asamblea_id', $idAsamblea);
        }
        
        $representantes = $query->get();
        
        return [
            'total_registrados' => $representantes->count(),
            'activos_ultimos_30_dias' => $representantes->where('updated_at', '>=', now()->subDays(30))->count(),
            'con_claves_numericas' => $representantes->filter(function ($r) {
                return is_numeric($r->clave_ingreso);
            })->count(),
            'promedio_creacion_diaria' => $representantes->count() / max(1, now()->diffInDays($representantes->min('create_at')) + 1),
            'ultimo_registro' => $representantes->max('created_at')
        ];
    }
}
