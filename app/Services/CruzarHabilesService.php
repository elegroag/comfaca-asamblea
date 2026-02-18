<?php

namespace App\Services;

use App\Models\Empresas;
use App\Models\AsaRepresentantes;
use App\Models\RegistroIngresos;
use App\Models\Carteras;
use App\Models\Poderes;
use App\Models\Rechazos;
use App\Models\AsaMesas;
use App\Models\AsaConsenso;
use Illuminate\Support\Facades\DB;

class CruzarHabilesService
{
    private $idAsamblea;

    public function __construct($idAsamblea)
    {
        $this->idAsamblea = $idAsamblea;
    }

    /**
     * Proceso principal de cruce de empresas hábiles
     */
    public function main()
    {
        $representantes_nuevos = [];
        $ingresos_nuevos = [];

        $empresas = Empresas::where('asamblea_id', $this->idAsamblea)->get();
        $this->initMesaDefault();

        foreach ($empresas as $empresa) {
            $clave = '';
            $nit = $empresa->nit;
            $cedrep = $empresa->cedrep;
            
            $asaRepresentante = AsaRepresentantes::where('cedrep', $cedrep)
                ->where('asamblea_id', $this->idAsamblea)
                ->first();

            if ($asaRepresentante) {
                $clave = $asaRepresentante->clave_ingreso;
            } else {
                $clave = $this->claveAleatoria();
            }

            /**
             * Registro de votos
             */
            $num_cartera = Carteras::where('nit', $nit)
                ->where('asamblea_id', $this->idAsamblea)
                ->count();
                
            $num_poderdante = Poderes::where('nit2', $nit)
                ->where('estado', 'A')
                ->where('asamblea_id', $this->idAsamblea)
                ->count();
                
            $voto = 1;

            $preRegistro = RegistroIngresos::where('nit', $nit)
                ->where('asamblea_id', $this->idAsamblea)
                ->where('cedula_representa', $cedrep)
                ->first();

            if ($preRegistro) {
                $num_rechazos = Rechazos::where('regingre_id', $preRegistro->documento)->count();

                $votos = ($num_cartera > 0 || $num_poderdante > 0 || $num_rechazos > 0) ? '0' : $voto;
                $estado = ($num_cartera > 0 || $num_poderdante > 0 || $num_rechazos > 0) ? 'R' : 'P';

                $preRegistro->update([
                    'estado' => $estado,
                    'votos' => $votos,
                    'cedula_representa' => $empresa->cedrep,
                    'nombre_representa' => $empresa->repleg
                ]);

                if ($num_cartera > 0) {
                    $cartera = Carteras::where('nit', $nit)
                        ->where('asamblea_id', $this->idAsamblea)
                        ->first();
                        
                    $criterio_id = $this->getCriterioIdPorCodigo($cartera->codigo);

                    $hasRechazo = Rechazos::where('regingre_id', $preRegistro->documento)
                        ->where('criterio_id', $criterio_id)
                        ->count();

                    if ($hasRechazo == 0) {
                        Rechazos::create([
                            'regingre_id' => $preRegistro->documento,
                            'criterio_id' => $criterio_id,
                            'dia' => now()->format('Y-m-d'),
                            'hora' => now()->format('H:i:s')
                        ]);
                    }
                }
            } else {
                $documento = RegistroIngresos::max('documento') ?: 0;
                
                $preRegistro = RegistroIngresos::create([
                    'documento' => $documento + 1,
                    'nit' => $nit,
                    'estado' => ($num_cartera > 0 || $num_poderdante > 0) ? 'R' : 'P',
                    'fecha' => now()->format('Y-m-d'),
                    'hora' => now()->format('H:i:s'),
                    'usuario' => 1,
                    'votos' => ($num_cartera > 0 || $num_poderdante > 0) ? '0' : $voto,
                    'mesa_id' => 0,
                    'asamblea_id' => $this->idAsamblea,
                    'tipo_ingreso' => 'P',
                    'fecha_asistencia' => null,
                    'cedula_representa' => $empresa->cedrep,
                    'nombre_representa' => $empresa->repleg,
                ]);

                $ingresos_nuevos[] = $nit;

                if ($num_cartera > 0) {
                    $cartera = Carteras::where('nit', $nit)
                        ->where('asamblea_id', $this->idAsamblea)
                        ->first();
                        
                    $criterio_id = $this->getCriterioIdPorCodigo($cartera->codigo);

                    $hasRechazo = Rechazos::where('regingre_id', $preRegistro->documento)
                        ->where('criterio_id', $criterio_id)
                        ->count();

                    if ($hasRechazo == 0) {
                        Rechazos::create([
                            'regingre_id' => $preRegistro->documento,
                            'criterio_id' => $criterio_id,
                            'dia' => now()->format('Y-m-d'),
                            'hora' => now()->format('H:i:s')
                        ]);
                    }
                }
            }

            /**
             * Registro de representantes
             */
            if (!$asaRepresentante) {
                $nombres = $empresa->repleg;
                
                $asaRepresentantes = AsaRepresentantes::create([
                    'nombre' => $nombres,
                    'cedrep' => $cedrep,
                    'clave_ingreso' => $clave,
                    'asamblea_id' => $this->idAsamblea,
                    'acepta_politicas' => '1',
                    'create_at' => now(),
                    'update_at' => now(),
                    'nuevo' => '1'
                ]);

                $representantes_nuevos[] = $cedrep;
            } else {
                $nombres = $empresa->repleg;
                AsaRepresentantes::where('cedrep', $cedrep)
                    ->update(['nombre' => $nombres]);
            }
        }

        return [
            "representantes_nuevos" => $representantes_nuevos,
            "ingresos_nuevos" => $ingresos_nuevos,
            "diferentes" => null
        ];
    }

    /**
     * Inicializa la mesa default
     */
    private function initMesaDefault()
    {
        $num_mesas = AsaMesas::where('id', '0')->count();
        if ($num_mesas == 0) {
            $asaConsenso = AsaConsenso::where('estado', 'A')
                ->where('asamblea_id', $this->idAsamblea)
                ->first();

            AsaMesas::create([
                'id' => '0',
                'codigo' => 'DEFAULT',
                'cedtra_responsable' => '0',
                'estado' => 'A',
                'consenso_id' => $asaConsenso->id,
                'hora_apertura' => null,
                'hora_cierre_mesa' => null,
                'cantidad_votantes' => 0,
                'cantidad_votos' => 0,
                'create_at' => now()->format('Y-m-d'),
                'update_at' => now()->format('Y-m-d'),
            ]);
        }
    }

    /**
     * Obtener criterio ID basado en código de cartera
     */
    private function getCriterioIdPorCodigo($codigo)
    {
        switch ($codigo) {
            case 'S':
                return 16;
            case 'L':
                return 17;
            default:
                return 15;
        }
    }

    /**
     * Generar clave aleatoria
     */
    private function claveAleatoria($long = 6)
    {
        $str = "123456789";
        $password = "";
        for ($i = 0; $i < $long; $i++) {
            $password .= substr($str, rand(0, 8), 1);
        }
        return $password;
    }

    /**
     * Obtener resumen del proceso de cruce
     */
    public function getResumenProceso()
    {
        $empresas = Empresas::where('asamblea_id', $this->idAsamblea)->count();
        $representantes = AsaRepresentantes::where('asamblea_id', $this->idAsamblea)->count();
        $ingresos = RegistroIngresos::where('asamblea_id', $this->idAsamblea)->count();
        $carteras = Carteras::where('asamblea_id', $this->idAsamblea)->count();
        $poderes = Poderes::where('asamblea_id', $this->idAsamblea)->count();

        return [
            'total_empresas' => $empresas,
            'total_representantes' => $representantes,
            'total_ingresos' => $ingresos,
            'total_carteras' => $carteras,
            'total_poderes' => $poderes,
            'empresas_con_cartera' => $carteras,
            'empresas_poderdantes' => $poderes,
            'empresas_habiles' => $empresas - $carteras
        ];
    }

    /**
     * Validar estado del proceso
     */
    public function validarEstadoProceso()
    {
        $empresas = Empresas::where('asamblea_id', $this->idAsamblea)->get();
        $problemas = [];

        foreach ($empresas as $empresa) {
            $ingreso = RegistroIngresos::where('nit', $empresa->nit)
                ->where('cedula_representa', $empresa->cedrep)
                ->first();

            if (!$ingreso) {
                $problemas[] = [
                    'tipo' => 'sin_ingreso',
                    'nit' => $empresa->nit,
                    'razsoc' => $empresa->razsoc,
                    'mensaje' => 'Empresa sin registro de ingreso'
                ];
            } else {
                $representante = AsaRepresentantes::where('cedrep', $empresa->cedrep)
                    ->where('asamblea_id', $this->idAsamblea)
                    ->first();

                if (!$representante) {
                    $problemas[] = [
                        'tipo' => 'sin_representante',
                        'nit' => $empresa->nit,
                        'razsoc' => $empresa->razsoc,
                        'mensaje' => 'Empresa sin representante registrado'
                    ];
                }
            }
        }

        return [
            'total_problemas' => count($problemas),
            'problemas' => $problemas,
            'estado' => empty($problemas) ? 'completo' : 'incompleto'
        ];
    }

    /**
     * Reparar problemas del proceso
     */
    public function repararProblemas()
    {
        $validacion = $this->validarEstadoProceso();
        $reparados = 0;

        foreach ($validacion['problemas'] as $problema) {
            try {
                if ($problema['tipo'] === 'sin_ingreso') {
                    // Crear registro de ingreso faltante
                    $empresa = Empresas::where('nit', $problema['nit'])->first();
                    $this->crearRegistroIngresoFaltante($empresa);
                    $reparados++;
                } elseif ($problema['tipo'] === 'sin_representante') {
                    // Crear representante faltante
                    $empresa = Empresas::where('nit', $problema['nit'])->first();
                    $this->crearRepresentanteFaltante($empresa);
                    $reparados++;
                }
            } catch (\Exception $e) {
                // Continuar con el siguiente problema
                continue;
            }
        }

        return [
            'problemas_encontrados' => $validacion['total_problemas'],
            'problemas_reparados' => $reparados,
            'estado_final' => $this->validarEstadoProceso()['estado']
        ];
    }

    /**
     * Crear registro de ingreso faltante
     */
    private function crearRegistroIngresoFaltante($empresa)
    {
        $documento = RegistroIngresos::max('documento') ?: 0;
        
        RegistroIngresos::create([
            'documento' => $documento + 1,
            'nit' => $empresa->nit,
            'estado' => 'P',
            'fecha' => now()->format('Y-m-d'),
            'hora' => now()->format('H:i:s'),
            'usuario' => 1,
            'votos' => 1,
            'mesa_id' => 0,
            'asamblea_id' => $this->idAsamblea,
            'tipo_ingreso' => 'P',
            'fecha_asistencia' => null,
            'cedula_representa' => $empresa->cedrep,
            'nombre_representa' => $empresa->repleg,
        ]);
    }

    /**
     * Crear representante faltante
     */
    private function crearRepresentanteFaltante($empresa)
    {
        AsaRepresentantes::create([
            'nombre' => $empresa->repleg,
            'cedrep' => $empresa->cedrep,
            'clave_ingreso' => $this->claveAleatoria(),
            'asamblea_id' => $this->idAsamblea,
            'acepta_politicas' => '1',
            'create_at' => now(),
            'update_at' => now(),
            'nuevo' => '1'
        ]);
    }
}
