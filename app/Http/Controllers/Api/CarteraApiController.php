<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carteras;
use App\Models\Empresas;
use App\Models\Rechazos;
use App\Models\RegistroIngresos;
use App\Services\Asamblea\AsambleaService;
use App\Services\Carteras\CarteraReportarService;
use App\Services\Empresas\BuscarEmpresaService;
use App\Services\Empresas\HabilEmpresaService;
use App\Services\Empresas\RegistroEmpresaService;
use App\Services\UploadFileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CarteraApiController extends Controller
{
    protected $idAsamblea;

    public function __construct()
    {
        $this->idAsamblea = AsambleaService::getAsambleaActiva();
        if (!(auth()->user()) || !$this->tienePermiso(['SuperAdmin', 'Poderes'])) {
            return response()->json([
                'success' => false,
                'msj' => 'Error no dispone de permisos'
            ], 401);
        }
    }

    /**
     * Listar carteras (AJAX)
     */
    public function listar(): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $carteras = DB::table('carteras')
                ->select(
                    'carteras.id',
                    'carteras.nit',
                    'carteras.concepto',
                    'carteras.asamblea_id',
                    'carteras.codigo',
                    'empresas.email',
                    'empresas.telefono',
                    'empresas.razsoc',
                    'empresas.repleg',
                    'empresas.cedrep',
                    DB::raw("
                        CASE
                            WHEN codigo = 'A' THEN 'APORTES'
                            WHEN codigo = 'S' THEN 'SERVICIOS'
                            WHEN codigo = 'L' THEN 'LIBRANZAS'
                        END as codigo_detalle
                    ")
                )
                ->join('empresas', function ($join) {
                    $join->on('empresas.nit', '=', 'carteras.nit')
                        ->where('empresas.asamblea_id', '=', $this->idAsamblea);
                })
                ->where('carteras.asamblea_id', $this->idAsamblea)
                ->orderBy('carteras.created_at', 'desc')
                ->get();

            return response()->json([
                'carteras' => $carteras,
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Error al listar carteras: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cargue masivo de carteras (AJAX)
     */
    public function cargue_masivo(Request $request): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $file = $request->file('file');
            if (!$file) {
                return response()->json([
                    'success' => false,
                    'msj' => 'No se ha proporcionado ningún archivo.'
                ], 400);
            }

            $uploadService = new UploadFileService('temp');
            $resultado = $uploadService->main($file);

            $filepath = storage_path('app/' . $resultado['filepath']);

            $headers = [];
            $cruzados = [];
            $filas = 0;
            $creados = 0;
            $duplicados = 0;
            $fallidos = [];
            $empresasNuevas = 0;

            $fdata = fopen($filepath, 'r');
            if ($fdata) {
                $ai = 0;
                while (!feof($fdata)) {
                    $line = fgets($fdata);
                    $line = str_replace(["\n", "\t"], ["", " "], $line);

                    if ($ai == 0) {
                        $line = str_replace(['"', "\r"], ['', ''], $line);
                        $headers = explode(";", $line);
                    } else {
                        $fila = explode(";", $line);
                        $nit = trim($fila[0]);

                        if (empty($nit)) continue;

                        $filas++;
                        $razsoc = trim($fila[1]);
                        $cedrep = trim($fila[2]);
                        $repleg = trim($fila[3]);
                        $codigo = trim($fila[4]);
                        $concepto = trim($fila[5]);

                        // Verificar si ya existe la cartera
                        $carteraExistente = Carteras::where('nit', $nit)
                            ->where('codigo', $codigo)
                            ->first();

                        if ($carteraExistente) {
                            $duplicados++;
                            continue;
                        }

                        // Buscar o crear empresa
                        $habilEmpresaService = new HabilEmpresaService();
                        $empresa = $habilEmpresaService->findEmpresaByNit($nit);

                        if (!$empresa) {
                            $empresasNuevas++;
                            $empresa = $habilEmpresaService->create([
                                'nit' => $nit,
                                'razsoc' => $razsoc,
                                'cedrep' => $cedrep,
                                'repleg' => $repleg,
                                'asamblea_id' => $this->idAsamblea,
                                'email' => '',
                                'telefono' => ''
                            ]);
                        }

                        // Crear o actualizar preregistro
                        $registroEmpresaService = new RegistroEmpresaService($this->idAsamblea);
                        $preRegistro = $registroEmpresaService->findPreRegistroByEmpresa($empresa);

                        if (!$preRegistro) {
                            $preRegistro = $registroEmpresaService->registraIngresoDefault($empresa->toArray());
                            $preRegistro->update([
                                'estado' => 'R',
                                'votos' => 0
                            ]);
                        }

                        // Crear cartera con rechazo
                        $carteraReportarService = new CarteraReportarService($this->idAsamblea);
                        $resultado = $carteraReportarService->createCarteraRechazo(
                            $empresa,
                            $codigo,
                            $concepto
                        );

                        if (!$resultado) {
                            $fallidos[] = $nit;
                        } else {
                            $cruzados[] = $nit;
                            $creados++;
                        }
                    }
                    $ai++;
                }
            }

            fclose($fdata);

            // Eliminar archivo temporal
            unlink($filepath);

            $salida = [
                'success' => true,
                'msj' => 'Proceso completado con éxito',
                'cruzados' => count($cruzados) > 0 ? implode(",", $cruzados) : '0',
                'headers' => $headers,
                'creados' => $creados,
                'filas' => $filas,
                'fallidos' => count($fallidos) > 0 ? implode(",", $fallidos) : '0',
                'duplicados' => $duplicados,
                'empresas_nuevas' => $empresasNuevas
            ];

            // Crear log
            $logPath = storage_path('app/temp/log_cartera_' . time() . '.txt');
            file_put_contents($logPath, var_export($salida, true));

            return response()->json($salida);
        } catch (\Exception $e) {
            Log::error('Error en cargue masivo de carteras: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exportar lista de carteras (AJAX)
     */
    public function exportar_lista(): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            // Nota: Aquí se debería implementar la clase CarteraReporte
            // Por ahora, retornamos un placeholder
            $carteraReporte = new \stdClass();
            $out = [
                'file_path' => 'temp/cartera_export_' . date('Y-m-d_H-i-s') . '.csv',
                'total_records' => Carteras::where('asamblea_id', $this->idAsamblea)->count()
            ];

            $salida = [
                'success' => true,
                'msj' => 'Proceso completado con éxito',
                'data' => $out
            ];
        } catch (\Exception $e) {
            Log::error('Error al exportar lista de carteras: ' . $e->getMessage());
            $salida = [
                'success' => false,
                'msj' => $e->getMessage()
            ];
        }

        return response()->json($salida);
    }

    /**
     * Obtener detalle de cartera (AJAX)
     */
    public function detalle($id = ""): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $cartera = DB::table('carteras')
                ->select(
                    'carteras.*',
                    DB::raw("
                        CASE
                            WHEN codigo = 'A' THEN 'APORTES'
                            WHEN codigo = 'S' THEN 'SERVICIOS'
                            WHEN codigo = 'L' THEN 'LIBRANZAS'
                        END as codigo_detalle
                    "),
                    'empresas.telefono',
                    'empresas.email',
                    'empresas.razsoc',
                    'empresas.repleg',
                    'empresas.cedrep'
                )
                ->leftJoin('empresas', function ($join) {
                    $join->on('empresas.nit', '=', 'carteras.nit')
                        ->where('empresas.asamblea_id', '=', $this->idAsamblea);
                })
                ->where('carteras.id', $id)
                ->where('carteras.asamblea_id', $this->idAsamblea)
                ->first();

            $salida = [
                'cartera' => $cartera,
                'msj' => 'La consulta se ha completado con éxito.',
                'success' => true
            ];
        } catch (\Exception $e) {
            Log::error('Error al obtener detalle de cartera: ' . $e->getMessage());
            $salida = [
                'msj' => $e->getMessage(),
                'success' => false
            ];
        }

        return response()->json($salida);
    }

    /**
     * Eliminar cartera (AJAX)
     */
    public function removeCartera($id, Request $request): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $nit = $request->input('nit');
            $cedrep = $request->input('cedrep');

            if (empty($cedrep) || $cedrep == 'undefined') {
                $empresa = Empresas::where('nit', $nit)->first();
                $cedrep = $empresa->cedrep;
            }

            $cartera = Carteras::where('nit', $nit)
                ->where('id', $id)
                ->first();

            if ($cartera && $cartera->codigo) {
                $preIngreso = RegistroIngresos::where('nit', $nit)
                    ->where('cedula_representa', $cedrep)
                    ->first();

                if ($preIngreso) {
                    $criterio = $this->getCriterioIdPorCodigo($cartera->codigo);
                    $rechazo = Rechazos::where('regingre_id', $preIngreso->documento)
                        ->where('criterio_id', $criterio)
                        ->first();

                    if ($rechazo) {
                        $rechazo->delete();
                    }

                    // Verificar si hay otros rechazos
                    $otherRechazos = Rechazos::where('regingre_id', $preIngreso->documento)
                        ->where('criterio_id', '<>', $criterio)
                        ->first();

                    if (!$otherRechazos) {
                        $preIngreso->update([
                            'estado' => 'P',
                            'votos' => 1
                        ]);
                    }
                }

                // Eliminar cartera
                $eliminado = Carteras::where('id', $id)
                    ->where('nit', $nit)
                    ->where('asamblea_id', $this->idAsamblea)
                    ->delete();

                if (!$eliminado) {
                    throw new \Exception('No se puede borrar la cartera', 1);
                }
            }

            $verificarEliminado = Carteras::where('id', $id)->first();
            $salida = [
                'success' => !$verificarEliminado,
                'msj' => $verificarEliminado ? 'El registro no permite la acción de borrado' : 'Registro borrado con éxito',
                'data' => $verificarEliminado ? $verificarEliminado->toArray() : false
            ];
        } catch (\Exception $e) {
            Log::error('Error al eliminar cartera: ' . $e->getMessage());
            $salida = [
                'success' => false,
                'msj' => $e->getMessage()
            ];
        }

        return response()->json($salida);
    }

    /**
     * Crear cartera (AJAX)
     */
    public function crearCartera(Request $request): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $nit = $request->input('nit');
            $codigo = $request->input('codigo');
            $concepto = $request->input('concepto');
            $razsoc = $request->input('razsoc');
            $repleg = $request->input('repleg');
            $cedrep = $request->input('cedrep');

            // Verificar si ya existe la cartera
            $carteraExistente = Carteras::where('nit', $nit)
                ->where('codigo', $codigo)
                ->first();

            if ($carteraExistente) {
                throw new \Exception("Error el registro en cartera ya está creado previamente", 501);
            }

            // Buscar o crear empresa
            $habilEmpresaService = new HabilEmpresaService();
            $empresa = $habilEmpresaService->findEmpresaByNit($nit);

            if (!$empresa) {
                $empresa = $habilEmpresaService->create([
                    'nit' => $nit,
                    'razsoc' => $razsoc,
                    'repleg' => $repleg,
                    'cedrep' => $cedrep,
                ]);
            }

            // Crear cartera con rechazo
            $carteraReportarService = new CarteraReportarService($this->idAsamblea);
            $carteraCreada = $carteraReportarService->createCarteraRechazo(
                $empresa,
                $codigo,
                $concepto
            );

            if ($carteraCreada) {
                $cartera = $carteraCreada->toArray();
                $cartera['codigo_detalle'] = $this->getCodigoDetalle($carteraCreada->codigo);

                $salida = [
                    'cartera' => $cartera,
                    'success' => true,
                    'isValid' => true,
                    'msj' => 'El registro se realizó con éxito'
                ];
            } else {
                throw new \Exception("Error no se puede crear el registro de cartera", 301);
            }
        } catch (\Exception $e) {
            Log::error('Error al crear cartera: ' . $e->getMessage());
            $salida = [
                'success' => false,
                'msj' => $e->getMessage()
            ];
        }

        return response()->json($salida);
    }

    /**
     * Actualizar cartera (AJAX)
     */
    public function actualizaCartera($id, Request $request): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $cartera = Carteras::find($id);
            if (!$cartera) {
                throw new \Exception("Error el registro de cartera no está disponible", 501);
            }

            $concepto = $request->input('concepto');
            $cartera->update(['concepto' => $concepto]);

            $_cartera = $cartera->toArray();
            $_cartera['codigo_detalle'] = $this->getCodigoDetalle($cartera->codigo);

            $salida = [
                'success' => true,
                'msj' => 'Proceso completado con éxito',
                'cartera' => $_cartera,
                'isValid' => true
            ];
        } catch (\Exception $e) {
            Log::error('Error al actualizar cartera: ' . $e->getMessage());
            $salida = [
                'success' => false,
                'msj' => $e->getMessage()
            ];
        }

        return response()->json($salida);
    }

    /**
     * Buscar empresa (AJAX)
     */
    public function buscar_empresa($nit): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $buscarEmpresaService = new BuscarEmpresaService($this->idAsamblea, $nit);
            $data = $buscarEmpresaService->findByNit();

            $salida = array_merge($data, [
                'success' => true,
                'msj' => 'Consulta de empresa Ok',
                'isValid' => is_array($data['empresa']) ? true : false
            ]);
        } catch (\Exception $e) {
            Log::error('Error al buscar empresa: ' . $e->getMessage());
            $salida = [
                'msj' => $e->getMessage(),
                'success' => false
            ];
        }

        return response()->json($salida);
    }

    /**
     * Obtener descripción del código
     */
    private function getCodigoDetalle($codigo)
    {
        $codigos = [
            'A' => 'APORTES',
            'S' => 'SERVICIOS',
            'L' => 'LIBRANZAS'
        ];

        return $codigos[$codigo] ?? 'DESCONOCIDO';
    }

    /**
     * Obtener ID de criterio por código
     */
    private function getCriterioIdPorCodigo($codigo)
    {
        $criterios = [
            'A' => 18,  // Aportes
            'S' => 25,  // Servicios
            'L' => 26   // Libranzas
        ];

        return $criterios[$codigo] ?? 18;
    }

    /**
     * Obtener resumen de carteras
     */
    public function resumen(): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $total = Carteras::where('asamblea_id', $this->idAsamblea)->count();
            $aportes = Carteras::where('asamblea_id', $this->idAsamblea)
                ->where('codigo', 'A')
                ->count();
            $servicios = Carteras::where('asamblea_id', $this->idAsamblea)
                ->where('codigo', 'S')
                ->count();
            $libranzas = Carteras::where('asamblea_id', $this->idAsamblea)
                ->where('codigo', 'L')
                ->count();

            return response()->json([
                'total' => $total,
                'aportes' => $aportes,
                'servicios' => $servicios,
                'libranzas' => $libranzas,
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener resumen de carteras: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar carteras por término
     */
    public function buscar($termino): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $carteras = DB::table('carteras')
                ->select(
                    'carteras.*',
                    'empresas.razsoc',
                    'empresas.cedrep',
                    DB::raw("
                        CASE
                            WHEN codigo = 'A' THEN 'APORTES'
                            WHEN codigo = 'S' THEN 'SERVICIOS'
                            WHEN codigo = 'L' THEN 'LIBRANZAS'
                        END as codigo_detalle
                    ")
                )
                ->join('empresas', 'empresas.nit', '=', 'carteras.nit')
                ->where('carteras.asamblea_id', $this->idAsamblea)
                ->where(function ($query) use ($termino) {
                    $query->where('carteras.nit', 'LIKE', "%{$termino}%")
                        ->orWhere('carteras.concepto', 'LIKE', "%{$termino}%")
                        ->orWhere('empresas.razsoc', 'LIKE', "%{$termino}%");
                })
                ->orderBy('carteras.created_at', 'desc')
                ->limit(50)
                ->get();

            return response()->json([
                'carteras' => $carteras,
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Error al buscar carteras: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Estadísticas de carteras
     */
    public function estadisticas(): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $carteras = Carteras::where('asamblea_id', $this->idAsamblea)->get();

            $por_codigo = $carteras->groupBy('codigo')->map(function ($grupo) use ($carteras) {
                return [
                    'codigo' => $this->getCodigoDetalle($grupo->first()->codigo),
                    'cantidad' => $grupo->count(),
                    'porcentaje' => round(($grupo->count() / $carteras->count()) * 100, 2)
                ];
            })->sortBy('cantidad')
                ->values()
                ->toArray();

            $estadisticas = [
                'total' => $carteras->count(),
                'por_codigo' => $por_codigo,
                'ultima_actualizacion' => $carteras->max('updated_at'),
                'fecha_creacion' => $carteras->min('created_at')
            ];

            return response()->json([
                'estadisticas' => $estadisticas,
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas de carteras: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validar datos de cartera
     */
    public function validar(Request $request): JsonResponse
    {
        try {
            $nit = $request->input('nit');
            $codigo = $request->input('codigo');
            $concepto = $request->input('concepto');

            $errores = [];

            // Validar NIT
            if (empty($nit)) {
                $errores[] = 'El NIT es requerido';
            } elseif (!is_numeric($nit)) {
                $errores[] = 'El NIT debe ser numérico';
            }

            // Validar código
            if (empty($codigo)) {
                $errores[] = 'El código es requerido';
            } elseif (!in_array($codigo, ['A', 'S', 'L'])) {
                $errores[] = 'El código debe ser A, S o L';
            }

            // Validar concepto
            if (empty($concepto)) {
                $errores[] = 'El concepto es requerido';
            }

            // Verificar si ya existe
            if (empty($errores) && !empty($nit) && !empty($codigo)) {
                $existente = Carteras::where('nit', $nit)
                    ->where('codigo', $codigo)
                    ->exists();

                if ($existente) {
                    $errores[] = 'Ya existe una cartera con este NIT y código';
                }
            }

            return response()->json([
                'valido' => empty($errores),
                'errores' => $errores,
                'success' => empty($errores)
            ]);
        } catch (\Exception $e) {
            Log::error('Error al validar cartera: ' . $e->getMessage());
            return response()->json([
                'valido' => false,
                'errores' => ['Error en la validación'],
                'success' => false
            ]);
        }
    }
}
