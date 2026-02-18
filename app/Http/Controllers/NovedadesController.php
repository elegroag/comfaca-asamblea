<?php

namespace App\Http\Controllers;

use App\Models\Novedades;
use App\Models\Carteras;
use App\Models\Empresas;
use App\Models\Poderes;
use App\Models\RegistroIngresos;
use App\Services\Asamblea\AsambleaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Exception;

class NovedadesController extends Controller
{
    protected AsambleaService $asambleaService;
    protected ?int $idAsamblea;
    protected ?string $cedtra;
    protected object $apisisu;

    public function __construct(AsambleaService $asambleaService)
    {
        $this->asambleaService = $asambleaService;
        $this->middleware(function ($request, $next) {
            $this->idAsamblea = $this->asambleaService->getAsambleaActiva();
            $this->cedtra = Auth::user()->cedtra ?? null;

            // Cargar configuración del sistema
            $this->apisisu = (object) [
                'enable_novedades' => Config::get('services.apisisu.enable_novedades', true)
            ];

            return $next($request);
        });
    }

    /**
     * Mostrar vista principal de novedades
     */
    public function index()
    {
        $userRole = Auth::user()->cedtra ?? null;
        if (!AsambleaService::isAdmin($userRole)) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        return response()->json([
            'titulo' => 'Novedades',
            'itemMenuSidebar' => 33
        ]);
    }

    /**
     * Listar todas las novedades
     */
    public function listar(): JsonResponse
    {
        try {
            $novedades = DB::table('novedades')
                ->orderBy('syncro', 'desc')
                ->get()
                ->toArray();

            return response()->json([
                'success' => true,
                'novedades' => $novedades,
                'msj' => 'Consulta ok'
            ]);
        } catch (Exception $err) {
            Log::error('Error listando novedades: ' . $err->getMessage());

            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * Crear novedad para remover cartera
     */
    public function notyRemoveCartera(Request $request): JsonResponse
    {
        try {
            if (!$this->apisisu->enable_novedades) {
                return response()->json([
                    'success' => true,
                    'novedad' => $this->apisisu->enable_novedades,
                    'msj' => 'No está disponible la creación de novedades'
                ]);
            }

            $nit = $request->input('nit');

            // Verificar si existe cartera activa
            $cartera = Carteras::where('nit', $nit)->first();
            if ($cartera) {
                throw new Exception("Error aun posee cartera, no se puede habilitar la empresa", 301);
            }

            // Buscar empresa habil
            $empresa = $this->findEmpresaByNit($nit);
            if (!$empresa) {
                throw new Exception("Error la empresa no está registrada en el sistema como empresa habil", 301);
            }

            // Crear novedad de remoción de cartera
            $novedad = $this->createRemoveCarteraNovedad($empresa);

            return response()->json([
                'success' => true,
                'novedad' => $novedad,
                'msj' => 'Proceso completado ok'
            ]);
        } catch (Exception $err) {
            Log::error('Error en notyRemoveCartera: ' . $err->getMessage());

            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * Crear novedad para nuevo habil
     */
    public function notyNuevoHabil(Request $request): JsonResponse
    {
        try {
            if (!$this->apisisu->enable_novedades) {
                return response()->json([
                    'success' => true,
                    'novedad' => false,
                    'msj' => 'No está disponible la creación de novedades'
                ]);
            }

            $nit = $request->input('nit');
            $empresa = $this->findEmpresaByNit($nit);

            if (!$empresa) {
                throw new Exception("Error la empresa no está registrada en el sistema como empresa habil", 301);
            }

            $novedad = $this->createNuevoHabilNovedad($empresa);

            return response()->json([
                'success' => true,
                'novedad' => $novedad,
                'msj' => 'Proceso completado ok'
            ]);
        } catch (Exception $err) {
            Log::error('Error en notyNuevoHabil: ' . $err->getMessage());

            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * Crear novedad para cambiar habil
     */
    public function notyChangeHabil(Request $request): JsonResponse
    {
        try {
            if (!$this->apisisu->enable_novedades) {
                return response()->json([
                    'success' => true,
                    'novedad' => false,
                    'msj' => 'No está disponible la creación de novedades'
                ]);
            }

            $nit = $request->input('nit');
            $documento = $request->input('documento');

            $empresa = Empresas::where('nit', $nit)->first();
            if (!$empresa) {
                throw new Exception("Error la empresa no está registrada en el sistema como empresa habil", 301);
            }

            $registro = RegistroIngresos::where('documento', $documento)->first();
            if (!$registro) {
                throw new Exception("Error no se encuentra el registro de ingreso", 301);
            }

            $novedad = $this->createChangeHabilNovedad($empresa, $registro);

            return response()->json([
                'success' => true,
                'novedad' => $novedad,
                'msj' => 'Proceso completado ok'
            ]);
        } catch (Exception $err) {
            Log::error('Error en notyChangeHabil: ' . $err->getMessage());

            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * Crear novedad para revocar poder
     */
    public function notyPoderRevocar(Request $request): JsonResponse
    {
        try {
            if (!$this->apisisu->enable_novedades) {
                return response()->json([
                    'success' => true,
                    'novedad' => false,
                    'msj' => 'No está disponible la creación de novedades'
                ]);
            }

            $documento = $request->input('documento');
            $poder = Poderes::where('documento', $documento)->first();

            if (!$poder) {
                throw new Exception("Error no se encuentra el poder", 301);
            }

            $novedades = $this->createRevocarPoderNovedad($poder);

            return response()->json([
                'success' => true,
                'novedades' => $novedades,
                'msj' => 'Proceso completado ok'
            ]);
        } catch (Exception $err) {
            Log::error('Error en notyPoderRevocar: ' . $err->getMessage());

            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * Procesar activación de novedades
     */
    public function procesaActivar(Request $request): JsonResponse
    {
        try {
            if (!$this->apisisu->enable_novedades) {
                return response()->json([
                    'success' => true,
                    'novedad' => false,
                    'msj' => 'No está disponible la creación de novedades'
                ]);
            }

            $estado = $request->input('estado');
            if (is_null($estado) || $estado == '') {
                throw new Exception("Error no se reporta el estado", 301);
            }

            $novedades = Novedades::where('syncro', 0)
                ->where('estado', $estado)
                ->get();

            $dataQuorum = [];
            foreach ($novedades as $novedad) {
                $exp = [
                    'nit' => $novedad->nit,
                    'razon_social' => $novedad->razon_social,
                    'cedula_representante' => $novedad->cedula_representante,
                    'nombre_representante' => $novedad->nombre_representante,
                    'apoderado_nit' => $novedad->apoderado_nit,
                    'apoderado_cedula' => $novedad->apoderado_cedula,
                    'apoderado_nombre' => $novedad->apoderado_nombre,
                    'clave' => $novedad->clave,
                    'linea' => $novedad->linea
                ];
                $dataQuorum[] = $exp;

                // Marcar como sincronizado
                $novedad->syncro = 1;
                $novedad->save();
            }

            // Procesar con NovedadQuorum
            $out = $this->procesarNovedadQuorum($dataQuorum);

            return response()->json([
                ...$out,
                'success' => true,
                'novedades' => $novedades->toArray(),
                'msj' => 'Consulta ok'
            ]);
        } catch (Exception $err) {
            Log::error('Error en procesaActivar: ' . $err->getMessage());

            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una novedad
     */
    public function remove(int $id): JsonResponse
    {
        try {
            $novedad = Novedades::find($id);
            if ($novedad) {
                $novedad->delete();
            }

            return response()->json([
                'success' => true,
                'msj' => 'Proceso completado ok'
            ]);
        } catch (Exception $err) {
            Log::error('Error eliminando novedad: ' . $err->getMessage());

            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * Procesar una novedad individual
     */
    public function procesar(int $id): JsonResponse
    {
        try {
            $novedad = Novedades::findOrFail($id);

            $dataQuorum = [
                [
                    'nit' => $novedad->nit,
                    'razon_social' => $novedad->razon_social,
                    'cedula_representante' => $novedad->cedula_representante,
                    'nombre_representante' => $novedad->nombre_representante,
                    'apoderado_nit' => $novedad->apoderado_nit,
                    'apoderado_cedula' => $novedad->apoderado_cedula,
                    'apoderado_nombre' => $novedad->apoderado_nombre,
                    'clave' => $novedad->clave,
                    'linea' => $novedad->linea
                ]
            ];

            // Marcar como sincronizado
            $novedad->syncro = 1;
            $novedad->save();

            // Procesar con NovedadQuorum
            $out = $this->procesarNovedadQuorum($dataQuorum);

            return response()->json([
                ...$out,
                'success' => true,
                'novedad' => $novedad->toArray(),
                'msj' => 'Consulta ok'
            ]);
        } catch (Exception $err) {
            Log::error('Error procesando novedad: ' . $err->getMessage());

            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar habiles (método original con shell_exec)
     */
    public function updateHabiles(Request $request): JsonResponse
    {
        try {
            if ($this->apisisu->enable_novedades) {
                return response()->json([
                    'success' => true,
                    'novedad' => false,
                    'msj' => 'No está disponible durante la Asamblea'
                ]);
            }

            $estado = $request->input('estado');
            if (is_null($estado) || $estado == '') {
                throw new Exception("Error no se reporta el estado", 301);
            }

            // Ejecutar comando shell (manteniendo lógica original)
            $command = "php " . base_path() . " artisan habiles:process 450 eyJwZXJpb2RvIjoiMjAyMzEyIn0= 1";
            $procesar = shell_exec($command);

            if ($procesar) {
                $novedades = Novedades::where('syncro', 0)
                    ->where('estado', $estado)
                    ->get();

                $dataQuorum = [];
                foreach ($novedades as $novedad) {
                    $exp = [
                        'nit' => $novedad->nit,
                        'razon_social' => $novedad->razon_social,
                        'cedula_representante' => $novedad->cedula_representante,
                        'nombre_representante' => $novedad->nombre_representante,
                        'apoderado_nit' => $novedad->apoderado_nit,
                        'apoderado_cedula' => $novedad->apoderado_cedula,
                        'apoderado_nombre' => $novedad->apoderado_nombre,
                        'clave' => $novedad->clave,
                        'linea' => $novedad->linea
                    ];
                    $dataQuorum[] = $exp;

                    // Marcar como sincronizado
                    $novedad->syncro = 1;
                    $novedad->save();
                }

                $out = $this->procesarNovedadQuorum($dataQuorum);

                return response()->json([
                    ...$out,
                    'success' => true,
                    'novedades' => $novedades->toArray(),
                    'msj' => 'Consulta ok'
                ]);
            } else {
                throw new Exception("Error procesando el comando", 301);
            }
        } catch (Exception $err) {
            Log::error('Error en updateHabiles: ' . $err->getMessage());

            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * Métodos auxiliares
     */
    private function findEmpresaByNit(string $nit): ?Empresas
    {
        return Empresas::where('nit', $nit)->first();
    }

    private function createRemoveCarteraNovedad(Empresas $empresa): array
    {
        // Lógica para crear novedad de remoción de cartera
        return [
            'tipo' => 'remove_cartera',
            'nit' => $empresa->nit,
            'razon_social' => $empresa->razsoc,
            'created_at' => now()
        ];
    }

    private function createNuevoHabilNovedad(Empresas $empresa): array
    {
        // Lógica para crear novedad de nuevo habil
        return [
            'tipo' => 'nuevo_habil',
            'nit' => $empresa->nit,
            'razon_social' => $empresa->razsoc,
            'created_at' => now()
        ];
    }

    private function createChangeHabilNovedad(Empresas $empresa, RegistroIngresos $registro): array
    {
        // Lógica para crear novedad de cambio de habil
        return [
            'tipo' => 'change_habil',
            'nit' => $empresa->nit,
            'razon_social' => $empresa->razsoc,
            'documento' => $registro->documento,
            'created_at' => now()
        ];
    }

    private function createRevocarPoderNovedad(Poderes $poder): array
    {
        // Lógica para crear novedad de revocación de poder
        return [
            'tipo' => 'revocar_poder',
            'documento' => $poder->documento,
            'cedrep1' => $poder->cedrep1,
            'created_at' => now()
        ];
    }

    private function procesarNovedadQuorum(array $dataQuorum): array
    {
        // Implementar lógica de NovedadQuorum
        // Por ahora retornamos estructura básica
        return [
            'procesados' => count($dataQuorum),
            'exitosos' => count($dataQuorum),
            'fallidos' => 0
        ];
    }
}
