<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AsaAsamblea;
use App\Models\AsaTrabajadores;
use App\Models\Empresas;
use App\Models\Poderes;
use App\Services\Poderes\ActivarPoderService;
use App\Services\Poderes\InactivarPoderService;
use App\Services\Poderes\RemovePoderService;
use App\Services\Poderes\RegistraRechazoPoderService;
use App\Services\Poderes\PoderRegisterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class PoderesApiController extends Controller
{
    /**
     * Obtener asamblea activa
     */
    private function getIdAsambleaActiva()
    {
        $asamblea = AsaAsamblea::where('estado', 'A')->first();
        return $asamblea ? $asamblea->id : 1;
    }

    /**
     * API: Listar todos los poderes
     */
    public function listar(): JsonResponse
    {
        try {
            $idAsamblea = $this->getIdAsambleaActiva();

            $poderes = Poderes::with(['apoderado', 'poderdante'])
                ->where('asamblea_id', $idAsamblea)
                ->get()
                ->map(function ($poder) {
                    return [
                        'id' => $poder->id,
                        'documento' => $poder->documento,
                        'fecha' => $poder->fecha->format('Y-m-d'),
                        'estado' => $poder->estado,
                        'radicado' => $poder->radicado,
                        'poderdante_nit' => $poder->poderdante_nit,
                        'apoderado_nit' => $poder->apoderado_nit,
                        'poderdante_repleg' => $poder->poderdante_repleg,
                        'apoderado_repleg' => $poder->apoderado_repleg,
                        'notificacion' => $poder->notificacion,
                        'poderdante_razsoc' => $poder->poderdante ? $poder->poderdante->razsoc : null,
                        'apoderado_razsoc' => $poder->apoderado ? $poder->apoderado->razsoc : null,
                        'estado_detalle' => $poder->estado_detalle,
                    ];
                });

            return response()->json([
                'poderes' => $poderes,
                'success' => true
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'poderes' => false,
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Obtener detalle de un poder específico
     */
    public function detalle($documento)
    {
        try {
            $idAsamblea = $this->getIdAsambleaActiva();

            $poder = Poderes::with(['apoderado', 'poderdante', 'representanteApoderado', 'representantePoderdante'])
                ->where('documento', $documento)
                ->where('asamblea_id', $idAsamblea)
                ->first();

            if (!$poder) {
                return response()->json([
                    'poder' => false,
                    'msj' => 'El poder no se encuentra registrado.',
                    'success' => false
                ]);
            }

            // Verificar si las empresas están hábiles
            $habil_apoderado = Empresas::where('nit', $poder->apoderado_nit)
                ->where('asamblea_id', $idAsamblea)
                ->first();

            $habil_poderdante = Empresas::where('nit', $poder->poderdante_nit)
                ->where('asamblea_id', $idAsamblea)
                ->first();

            // Obtener criterios de rechazo
            $criterio_rechazos = DB::table('criterios_rechazos')
                ->where('tipo', 'POD')
                ->get();

            return response()->json([
                'habil_apoderado' => $habil_apoderado ? $habil_apoderado->toArray() : false,
                'habil_poderdante' => $habil_poderdante ? $habil_poderdante->toArray() : false,
                'criterio_rechazos' => $criterio_rechazos,
                'poder' => [
                    'id' => $poder->id,
                    'documento' => $poder->documento,
                    'fecha' => $poder->fecha->format('Y-m-d'),
                    'estado' => $poder->estado,
                    'radicado' => $poder->radicado,
                    'poderdante_nit' => $poder->poderdante_nit,
                    'apoderado_nit' => $poder->apoderado_nit,
                    'poderdante_cedrep' => $poder->poderdante_cedrep,
                    'apoderado_cedrep' => $poder->apoderado_cedrep,
                    'poderdante_repleg' => $poder->poderdante_repleg,
                    'apoderado_repleg' => $poder->apoderado_repleg,
                    'notificacion' => $poder->notificacion,
                    'poderdante_razsoc' => $poder->poderdante ? $poder->poderdante->razsoc : null,
                    'apoderado_razsoc' => $poder->apoderado ? $poder->apoderado->razsoc : null,
                    'estado_detalle' => $poder->estado_detalle,
                ],
                'msj' => 'El poder se encuentra registrado.',
                'success' => true
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'msj' => $err->getMessage(),
                'success' => false,
                'poder' => false,
            ], 500);
        }
    }

    /**
     * API: Buscar poderes por filtros
     */
    public function buscar(Request $request)
    {
        try {
            $idAsamblea = $this->getIdAsambleaActiva();

            $query = Poderes::with(['apoderado', 'poderdante'])
                ->where('asamblea_id', $idAsamblea);

            // Aplicar filtros
            if ($request->apoderado_nit) {
                $query->where('apoderado_nit', $request->apoderado_nit);
            }
            if ($request->apoderado_id) {
                $query->where('apoderado_cedrep', $request->apoderado_id);
            }
            if ($request->poderdante_nit) {
                $query->where('poderdante_nit', $request->poderdante_nit);
            }
            if ($request->poderdante_id) {
                $query->where('poderdante_cedrep', $request->poderdante_id);
            }

            $poder = $query->first();

            if (!$poder) {
                return response()->json([
                    'poder' => false,
                    'msj' => 'El poder no se encuentra registrado.',
                    'success' => true,
                    'habil_apoderado' => false,
                    'habil_poderdante' => false,
                ]);
            }

            // Verificar empresas hábiles
            $habil_apoderado = Empresas::where('nit', $poder->apoderado_nit)
                ->where('asamblea_id', $idAsamblea)
                ->first();

            $habil_poderdante = Empresas::where('nit', $poder->poderdante_nit)
                ->where('asamblea_id', $idAsamblea)
                ->first();

            return response()->json([
                'habil_apoderado' => $habil_apoderado ? $habil_apoderado->toArray() : false,
                'habil_poderdante' => $habil_poderdante ? $habil_poderdante->toArray() : false,
                'poder' => [
                    'id' => $poder->id,
                    'documento' => $poder->documento,
                    'fecha' => $poder->fecha->format('Y-m-d'),
                    'estado' => $poder->estado,
                    'radicado' => $poder->radicado,
                    'poderdante_nit' => $poder->poderdante_nit,
                    'apoderado_nit' => $poder->apoderado_nit,
                    'poderdante_repleg' => $poder->poderdante_repleg,
                    'apoderado_repleg' => $poder->apoderado_repleg,
                    'poderdante_razsoc' => $poder->poderdante ? $poder->poderdante->razsoc : null,
                    'apoderado_razsoc' => $poder->apoderado ? $poder->apoderado->razsoc : null,
                ],
                'msj' => 'El poder se encuentra registrado.',
                'success' => true,
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Buscar empresa por NIT
     */
    public function buscar_empresa($nit)
    {
        try {
            $idAsamblea = $this->getIdAsambleaActiva();

            $empresa = Empresas::where('nit', $nit)
                ->where('asamblea_id', $idAsamblea)
                ->first();

            if (!$empresa) {
                return response()->json([
                    'empresa' => false,
                    'success' => false,
                    'msj' => 'La empresa no está disponible para Asamblea.',
                ]);
            }

            // Contar poderes como apoderado y poderdante
            $es_apoderado = Poderes::where('apoderado_nit', $nit)
                ->where('estado', 'A')
                ->where('asamblea_id', $idAsamblea)
                ->count();

            $es_poderdante = Poderes::where('poderdante_nit', $nit)
                ->where('estado', 'A')
                ->where('asamblea_id', $idAsamblea)
                ->count();

            // Otros contadores (simulados)
            $reportado_en_cartera = DB::table('carteras')
                ->where('nit', $nit)
                ->where('asamblea_id', $idAsamblea)
                ->count();

            $es_trabajador = AsaTrabajadores::where('cedula', $empresa->cedrep)
                ->count();

            $empresa_data = $empresa->toArray();
            $empresa_data['es_apoderado'] = $es_apoderado;
            $empresa_data['es_poderdante'] = $es_poderdante;
            $empresa_data['es_habil'] = 1;
            $empresa_data['reportado_en_cartera'] = $reportado_en_cartera;
            $empresa_data['es_trabajador'] = $es_trabajador;
            $empresa_data['es_inscrito'] = 0; // Simulado
            $empresa_data['es_rechazado'] = 0; // Simulado

            return response()->json([
                'empresa' => $empresa_data,
                'success' => true,
                'msj' => 'Ok la busqueda de la empresa',
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Activar poder
     */
    public function activar($documento)
    {
        try {
            // Verificar permisos
            if (!(auth()->user()) || !$this->tienePermiso(['SuperAdmin', 'Poderes'])) {
                return response()->json([
                    'success' => false,
                    'msj' => 'Error no dispone de permisos'
                ], 401);
            }

            $idAsamblea = $this->getIdAsambleaActiva();
            $activarPoderService = new ActivarPoderService($idAsamblea);

            $poder = $activarPoderService->main($documento);

            return response()->json([
                'update_poder' => true,
                'poder' => $poder,
                'success' => true,
                'msj' => 'Proceso completado con éxito'
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Validación previa para registro de poder
     */
    public function validacion_previa(Request $request)
    {
        try {
            $idAsamblea = $this->getIdAsambleaActiva();

            $apoderado_nit = $request->input('nit1');
            $apoderado_cedrep = $request->input('cedrep1');
            $poderdante_nit = $request->input('nit2');
            $poderdante_cedrep = $request->input('cedrep2');
            $radicado = $request->input('radicado');

            $poderRegisterService = new PoderRegisterService($idAsamblea);
            $out = $poderRegisterService->main(
                $apoderado_nit,
                $apoderado_cedrep,
                $poderdante_nit,
                $poderdante_cedrep,
                $radicado
            );

            return response()->json([
                ...$out,
                'msj' => 'El registro se completo con éxito.',
                'success' => true
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'msj' => $err->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * API: Inactivar/rechazar poder
     */
    public function inactivar(Request $request, $documento)
    {
        try {
            // Verificar permisos
            if (!(auth()->user()) || !$this->tienePermiso(['SuperAdmin', 'Poderes'])) {
                return response()->json([
                    'success' => false,
                    'msj' => 'Error no dispone de permisos'
                ], 401);
            }

            $idAsamblea = $this->getIdAsambleaActiva();

            $poder = Poderes::where('documento', $documento)
                ->where('asamblea_id', $idAsamblea)
                ->first();

            if (!$poder) {
                return response()->json([
                    'success' => false,
                    'msj' => 'El poder no está registrado'
                ], 404);
            }

            $motivo = $request->input('motivo', 'Inactivado por administrador');

            $inactivarPoderService = new InactivarPoderService($idAsamblea);
            $poderActualizado = $inactivarPoderService->main([
                'motivo' => $motivo,
                'poder' => $poder
            ]);

            return response()->json([
                'update_poder' => true,
                'msj' => 'El poder se actualizo con éxito',
                'success' => true,
                'poder' => $poderActualizado
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Eliminar poder
     */
    public function remover($documento)
    {
        try {
            // Verificar permisos
            if (!(auth()->user()) || !$this->tienePermiso(['SuperAdmin', 'Poderes'])) {
                return response()->json([
                    'success' => false,
                    'msj' => 'Error no dispone de permisos'
                ], 401);
            }

            $removePoderService = new RemovePoderService();
            $out = $removePoderService->main($documento);

            return response()->json([
                'success' => true,
                'msj' => 'El proceso de borrado se completo con éxito.',
                'out' => ['documento' => $documento]
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Obtener criterios de rechazo
     */
    public function criterios_rechazo()
    {
        try {
            $criterios = DB::table('criterios_rechazos')
                ->where('tipo', 'POD')
                ->get();

            return response()->json([
                'success' => true,
                'criterios' => $criterios
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Cargue masivo de poderes
     */
    public function cargue_masivo(Request $request)
    {
        try {
            // Verificar permisos
            if (!(auth()->user()) || !$this->tienePermiso('SuperAdmin')) {
                return response()->json([
                    'success' => false,
                    'msj' => 'No dispone de permisos para un cargue masivo.'
                ], 401);
            }

            if (!$request->hasFile('file')) {
                return response()->json([
                    'success' => false,
                    'msj' => 'No se ha proporcionado ningún archivo.'
                ], 422);
            }

            $file = $request->file('file');
            $filepath = $file->storeAs('uploads', $file->getClientOriginalName(), 'local');

            $headers = [];
            $creados = 0;
            $fallidos = [];
            $cruzados = [];

            $handle = fopen(storage_path('app/' . $filepath), 'r');
            if ($handle) {
                $row = 0;
                while (($line = fgets($handle)) !== false) {
                    $line = str_replace(["\n", "\t", "\r"], ' ', $line);

                    if (strlen(trim($line)) == 0) continue;

                    if ($row == 0) {
                        $headers = explode(';', $line);
                    } else {
                        $fila = explode(';', $line);
                        if (count($fila) > 0) {
                            try {
                                $documento = trim($fila[0] ?? '');
                                if (strlen($documento) == 0) continue;

                                $fecha = trim($fila[1] ?? date('Y-m-d'));
                                $apoderado_nit = trim($fila[2] ?? '');
                                $poderdante_nit = trim($fila[3] ?? '');
                                $estado = trim($fila[4] ?? 'A');
                                $radicado = trim($fila[5] ?? '');
                                $apoderado_cedrep = trim($fila[6] ?? '');
                                $apoderado_repleg = trim($fila[7] ?? '');
                                $poderdante_cedrep = trim($fila[8] ?? '');
                                $poderdante_repleg = trim($fila[9] ?? '');
                                $notificacion = trim($fila[10] ?? '');

                                $idAsamblea = $this->getIdAsambleaActiva();

                                // Verificar si ya existe el poder
                                $poder_existente = Poderes::where('apoderado_nit', $apoderado_nit)
                                    ->where('poderdante_nit', $poderdante_nit)
                                    ->where('asamblea_id', $idAsamblea)
                                    ->first();

                                if ($poder_existente) {
                                    throw new \Exception('Error el poder ya está registrado.');
                                }

                                // Verificar radicado
                                if ($radicado) {
                                    $radicado_existente = Poderes::where('radicado', $radicado)
                                        ->where('asamblea_id', $idAsamblea)
                                        ->first();

                                    if ($radicado_existente) {
                                        throw new \Exception('Error el radicado ya se encuentra registrado previamente.');
                                    }
                                }

                                // Crear o actualizar empresas
                                $this->crearOActualizarEmpresa($apoderado_nit, $apoderado_repleg, $apoderado_cedrep);
                                $this->crearOActualizarEmpresa($poderdante_nit, $poderdante_repleg, $poderdante_cedrep);

                                // Crear el poder
                                $poder = Poderes::create([
                                    'documento' => $documento ?: 'POW-' . date('Y') . '-' . str_pad(Poderes::count() + 1, 4, '0', STR_PAD_LEFT),
                                    'fecha' => $fecha,
                                    'apoderado_nit' => $apoderado_nit,
                                    'apoderado_cedrep' => $apoderado_cedrep,
                                    'apoderado_repleg' => $apoderado_repleg,
                                    'poderdante_nit' => $poderdante_nit,
                                    'poderdante_cedrep' => $poderdante_cedrep,
                                    'poderdante_repleg' => $poderdante_repleg,
                                    'radicado' => $radicado,
                                    'notificacion' => $notificacion,
                                    'estado' => $estado,
                                    'asamblea_id' => $idAsamblea,
                                ]);

                                $creados++;
                                $cruzados[] = $poder->documento;
                            } catch (\Exception $err_line) {
                                $fallidos[] = $err_line->getMessage();
                            }
                        }
                    }
                    $row++;
                }
                fclose($handle);
            }

            return response()->json([
                'headers' => $headers,
                'creados' => $creados,
                'filas' => $row - 1,
                'inactivos' => 0,
                'cruzados' => (count($cruzados) > 0) ? implode(',', $cruzados) : '0',
                'fallidos' => (count($fallidos) > 0) ? implode(',', $fallidos) : '0',
                'success' => true,
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Ingresar/activar poder existente
     */
    public function ingresar_poder(Request $request): JsonResponse
    {
        try {
            $idAsamblea = $this->getIdAsambleaActiva();

            $cedrep = $request->input('cedrep');
            $documento_poder = $request->input('documento_poder');

            // Buscar poder existente
            $poder = Poderes::where('documento', $documento_poder)
                ->where('apoderado_cedrep', $cedrep)
                ->where('asamblea_id', $idAsamblea)
                ->first();

            if ($poder) {
                $poder->estado = 'A';
                $poder->save();
                return response()->json(["success" => true]);
            } else {
                return response()->json(["success" => false]);
            }
        } catch (\Exception $err) {
            return response()->json([
                "success" => false,
                "msj" => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Buscar por apoderado específico
     */
    public function buscar_apoderado($apoderado_nit = 0): JsonResponse
    {
        try {
            $idAsamblea = $this->getIdAsambleaActiva();

            $query = Poderes::with(['apoderado', 'poderdante'])
                ->where('asamblea_id', $idAsamblea);

            if ($apoderado_nit) {
                $query->where('apoderado_nit', $apoderado_nit);
            }

            $poder = $query->first();

            $habil_apoderado = false;
            $habil_poderdante = false;
            $msj = "El poder no se encuentra registrado.";

            if ($poder) {
                $habil_apoderado = Empresas::where('nit', $poder->apoderado_nit)
                    ->where('asamblea_id', $idAsamblea)
                    ->first();

                $habil_poderdante = Empresas::where('nit', $poder->poderdante_nit)
                    ->where('asamblea_id', $idAsamblea)
                    ->first();

                $msj = "El poder se encuentra registrado.";
            }

            $criterio_rechazos = DB::table('criterios_rechazos')
                ->where('tipo', 'POD')
                ->get();

            return response()->json([
                'apoderado' => $habil_apoderado ? $habil_apoderado->toArray() : false,
                'poderdante' => $habil_poderdante ? $habil_poderdante->toArray() : false,
                "poder" => $poder ? $poder->toArray() : false,
                "msj" => $msj,
                'criterio_rechazos' => $criterio_rechazos,
                'success' => true,
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Buscar por poderdante específico
     */
    public function buscar_poderdante($poderdante_nit = 0): JsonResponse
    {
        try {
            $idAsamblea = $this->getIdAsambleaActiva();

            $query = Poderes::with(['apoderado', 'poderdante'])
                ->where('asamblea_id', $idAsamblea);

            if ($poderdante_nit) {
                $query->where('poderdante_nit', $poderdante_nit);
            }

            $poder = $query->first();

            $habil_apoderado = false;
            $habil_poderdante = false;
            $msj = "El poder no se encuentra registrado.";

            if ($poder) {
                $habil_apoderado = Empresas::where('nit', $poder->apoderado_nit)
                    ->where('asamblea_id', $idAsamblea)
                    ->first();

                $habil_poderdante = Empresas::where('nit', $poder->poderdante_nit)
                    ->where('asamblea_id', $idAsamblea)
                    ->first();

                $msj = "El poder ya se encuentra registrado y asignado a otra empresa.";
            }

            $criterio_rechazos = DB::table('criterios_rechazos')
                ->where('tipo', 'POD')
                ->get();

            return response()->json([
                'success' => true,
                'apoderado' => $habil_apoderado ? $habil_apoderado->toArray() : false,
                'poderdante' => $habil_poderdante ? $habil_poderdante->toArray() : false,
                "poder" => $poder ? $poder->toArray() : false,
                'criterio_rechazos' => $criterio_rechazos,
                "msj" => $msj
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Exportar lista de poderes a CSV
     */
    public function exportar_lista_csv(): JsonResponse
    {
        try {
            // Simulación - necesitaría implementar la clase PoderesListaReporte
            $idAsamblea = $this->getIdAsambleaActiva();

            // Lógica de exportación CSV
            $filename = 'poderes_lista_' . date('Y-m-d') . '.csv';

            return response()->json([
                "success" => true,
                "filename" => $filename,
                "url" => "storage/exports/{$filename}"
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Exportar poderes a PDF
     */
    public function exportar_pdf(): JsonResponse
    {
        try {
            // Simulación - necesitaría implementar la clase PoderesPdfReporte
            $idAsamblea = $this->getIdAsambleaActiva();

            // Lógica de exportación PDF
            $filename = 'poderes_' . date('Y-m-d') . '.pdf';

            return response()->json([
                "success" => true,
                "filename" => $filename,
                "url" => "storage/exports/{$filename}"
            ]);
        } catch (\Exception $err) {
            return response()->json([
                "success" => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Exportar lista general
     */
    public function exportar_lista(): JsonResponse
    {
        try {
            // Simulación - necesitaría implementar la clase PoderesReporte
            $idAsamblea = $this->getIdAsambleaActiva();

            // Lógica de exportación
            $filename = 'reporte_poderes_' . date('Y-m-d') . '.pdf';

            return response()->json([
                "success" => true,
                "filename" => $filename,
                "url" => "storage/exports/{$filename}"
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Acta de revisión y verificación de poderes
     */
    public function acta_revision_verificacion(): JsonResponse
    {
        try {
            // Simulación - necesitaría implementar la clase ActaPoderesReporte
            $idAsamblea = $this->getIdAsambleaActiva();

            // Lógica del acta
            $filename = 'acta_revision_poderes_' . date('Y-m-d') . '.pdf';

            return response()->json([
                "success" => true,
                "filename" => $filename,
                "url" => "storage/exports/{$filename}"
            ]);
        } catch (\Exception $err) {
            return response()->json([
                "success" => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Exportar asistencias
     */
    public function exportar_asistencias(): JsonResponse
    {
        try {
            // Simulación - necesitaría implementar la clase AsistenciasReporte
            $idAsamblea = $this->getIdAsambleaActiva();

            // Lógica de exportación de asistencias
            $filename = 'asistencias_' . date('Y-m-d') . '.pdf';

            return response()->json([
                "success" => true,
                "filename" => $filename,
                "url" => "storage/exports/{$filename}"
            ]);
        } catch (\Exception $err) {
            return response()->json([
                "success" => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * API: Registrar rechazo de poder
     */
    public function registrar_rechazo_poder(Request $request): JsonResponse
    {
        try {
            // Verificar permisos
            if (!(auth()->user()) || !$this->tienePermiso(['SuperAdmin', 'Poderes'])) {
                return response()->json([
                    'success' => false,
                    'msj' => 'Error no dispone de permisos'
                ], 401);
            }

            $idAsamblea = $this->getIdAsambleaActiva();

            $registraRechazoPoderService = new RegistraRechazoPoderService($idAsamblea);
            $poder = $registraRechazoPoderService->main([
                'nit1' => $request->input('nit1'),
                'nit2' => $request->input('nit2'),
                'radicado' => $request->input('radicado'),
                'razsoc1' => $request->input('razsoc1'),
                'razsoc2' => $request->input('razsoc2'),
                'cedrep1' => $request->input('cedrep1'),
                'cedrep2' => $request->input('cedrep2'),
                'repleg1' => $request->input('repleg1'),
                'repleg2' => $request->input('repleg2'),
                'notificacion' => $request->input('notificacion')
            ]);

            $poderArray = $registraRechazoPoderService->getArrayPoder();

            return response()->json([
                'msj' => 'El registro se completo con éxito.',
                'poder' => $poderArray,
                'success' => true
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'success' => false,
                "poder" => false,
                "errors" => $err->getMessage(),
                "msj" => $err->getMessage(),
            ], 500);
        }
    }

    /**
     * Método auxiliar para verificar permisos
     */
    private function tienePermiso($permisos): bool
    {
        $user = auth()->user();
        if (!$user) return false;

        // Lógica de permisos - adaptar según el sistema de autenticación
        if (is_array($permisos)) {
            return in_array($user->role, $permisos);
        }

        return $user->role === $permisos;
    }

    /**
     * Método auxiliar para crear o actualizar empresas
     */
    private function crearOActualizarEmpresa($nit, $razsoc, $cedrep)
    {
        $idAsamblea = $this->getIdAsambleaActiva();

        $empresa = Empresas::where('nit', $nit)
            ->where('asamblea_id', $idAsamblea)
            ->first();

        if (!$empresa) {
            $empresa = Empresas::create([
                'nit' => $nit,
                'razsoc' => $razsoc,
                'cedrep' => $cedrep,
                'repleg' => $razsoc,
                'asamblea_id' => $idAsamblea,
                'email' => '',
                'telefono' => '',
            ]);
        }

        return $empresa;
    }
}
