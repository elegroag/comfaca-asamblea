<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AsaMesas;
use App\Models\AsaConsenso;
use App\Models\AsaUsuarios;
use App\Models\AsaAsamblea;
use App\Models\UsuarioSisu;
use App\Models\Empresas;
use App\Services\Asamblea\AsambleaService;
use App\Services\MesaService;
use App\Services\UploadFileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AdminApiController extends Controller
{
    protected $itemMenuSidebar = 5;
    protected $idAsamblea;

    public function __construct()
    {
        $this->middleware('auth');
        $this->idAsamblea = AsambleaService::getAsambleaActiva();
    }

    /**
     * Verificar permisos de administrador
     */
    protected function verificarPermisos($controller = '')
    {
        $user = Auth::user();
        if (!$user || !AsambleaService::isAdmin($user->role, $controller)) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        return null;
    }

    /**
     * Listar mesas (AJAX)
     */
    public function listar_mesas(): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $mesas = DB::table('asa_mesas')
                ->select('asa_mesas.*', 'usuario_sisu.nombre', 'usuario_sisu.usuario')
                ->leftJoin('asa_consenso', 'asa_consenso.id', '=', 'asa_mesas.consenso_id')
                ->leftJoin('usuario_sisu', 'usuario_sisu.cedtra', '=', 'asa_mesas.cedtra_responsable')
                ->where('asa_consenso.asamblea_id', $this->idAsamblea)
                ->orderBy('asa_mesas.create_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'mesas' => $mesas
            ]);
        } catch (\Exception $e) {
            Log::error('Error al listar mesas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al listar las mesas'
            ], 500);
        }
    }

    /**
     * Listar consensos (AJAX)
     */
    public function listar_consensos(): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $consensos = DB::table('asa_consenso')
                ->orderBy('create_at', 'desc')
                ->get();

            return response()->json([
                'consenso' => $consensos,
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Error al listar consensos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al listar los consensos'
            ], 500);
        }
    }

    /**
     * Listar usuarios de asamblea (AJAX)
     */
    public function listar_usuarios_asa(): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $usuarios = DB::table('asa_usuarios')
                ->select('asa_usuarios.*', 'usuario_sisu.nombre', 'usuario_sisu.usuario')
                ->join('usuario_sisu', 'usuario_sisu.cedtra', '=', 'asa_usuarios.cedtra')
                ->where('asa_usuarios.asamblea_id', $this->idAsamblea)
                ->get();

            $asamblea = AsaAsamblea::find($this->idAsamblea);

            return response()->json([
                'asamblea' => $asamblea,
                'asa_usuarios' => $usuarios
            ]);
        } catch (\Exception $e) {
            Log::error('Error al listar usuarios de asamblea: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al listar los usuarios'
            ], 500);
        }
    }

    /**
     * Listar todos los usuarios (AJAX)
     */
    public function listar_usuarios(): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $asaUsuariosCount = DB::table('asa_usuarios')->count();

            if ($asaUsuariosCount == 0) {
                $usuarios = UsuarioSisu::all();
            } else {
                $usuarios = DB::table('usuario_sisu as sisu')
                    ->select('sisu.usuario', 'sisu.cedtra', 'sisu.nombre', 'asa_usuarios.rol')
                    ->leftJoin('asa_usuarios', function ($join) {
                        $join->on('asa_usuarios.cedtra', '=', 'sisu.cedtra')
                            ->where('asa_usuarios.estado', '=', 'A');
                    })
                    ->get();
            }

            return response()->json([
                'usuarios' => $usuarios,
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Error al listar usuarios: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al listar los usuarios'
            ], 500);
        }
    }


    /**
     * Detalle de usuario (AJAX)
     */
    public function usuario_detalle($user = 0): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $usuario = UsuarioSisu::where('usuario', $user)->first();

            if (!$usuario) {
                return response()->json([
                    'success' => false,
                    'msj' => 'Usuario no encontrado'
                ], 404);
            }

            $cedtra = $usuario->cedtra;

            $asaUsuario = DB::table('asa_usuarios')
                ->where('cedtra', $cedtra)
                ->where('asamblea_id', $this->idAsamblea)
                ->first();

            $mesa = null;
            if ($asaUsuario) {
                $mesa = AsaMesas::where('cedtra_responsable', $cedtra)->first();
            }

            $mesasDisponibles = AsaMesas::where(function ($query) {
                $query->where('cedtra_responsable', 0)
                    ->orWhereNull('cedtra_responsable');
            })->whereIn('estado', ['A', 'P'])->get();

            $asamblea = AsaAsamblea::where('estado', 'A')->first();

            return response()->json([
                'usuario' => $usuario,
                'asamblea' => $asamblea,
                'asa_usuario' => $asaUsuario,
                'mesa' => $mesa,
                'mesas_disponibles' => $mesasDisponibles,
                'roles' => $this->getRolesArray()
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener detalle de usuario: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al obtener el detalle del usuario'
            ], 500);
        }
    }

    /**
     * Crear usuario de asamblea (AJAX)
     */
    public function asa_usuario_create(Request $request): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $cedtra = $request->input('cedtra');
            $estado = $request->input('estado');
            $create_at = $request->input('create_at', now());
            $asamblea_id = $request->input('asamblea_id', $this->idAsamblea);
            $create_mesa = $request->input('create_mesa');
            $mesa_id = $request->input('mesa_id');
            $mesa_codigo = $request->input('mesa_codigo');
            $rol = $request->input('rol');

            $errors = [];
            $msj = '';

            // Crear o actualizar usuario de asamblea
            $asaUsuario = AsaUsuarios::where('cedtra', $cedtra)->first();

            if (!$asaUsuario) {
                $asaUsuario = AsaUsuarios::create([
                    'cedtra' => $cedtra,
                    'rol' => $rol,
                    'estado' => $estado,
                    'create_at' => $create_at,
                    'asamblea_id' => $asamblea_id
                ]);
                $msj = "El registro de usuario para asamblea se completó con éxito.";
            }

            // Manejo de mesa
            $mesaService = new MesaService();
            $mesa = null;

            if ($create_mesa == 1) {
                $mesa = $mesaService->createUseMesa([
                    'mesa_codigo' => $mesa_codigo,
                    'cedtra' => $cedtra,
                    'estado' => $estado
                ]);
            } else {
                $mesa = AsaMesas::find($mesa_id);
                if ($mesa) {
                    $cedtra_responsable = $mesa->cedtra_responsable;
                    if ($cedtra_responsable == 0 || $cedtra_responsable == null) {
                        $mesa = $mesaService->updateUseMesa($mesa_id, $cedtra);
                        if (!$mesa) {
                            $errors[] = "La relación con la mesa no se puede realizar.";
                        }
                    } else {
                        $errors[] = "La mesa ya se encuentra asociada a un usuario. No se puede aplicar ninguna acción.";
                    }
                } else {
                    $errors[] = "La mesa no se encuentra registrada. No se puede aplicar ninguna acción.";
                }
                $mesa = AsaMesas::find($mesa_id);
            }

            return response()->json([
                'asa_usuario' => $asaUsuario,
                'mesa' => $mesa,
                'errors' => implode("\n", $errors),
                'msj' => $msj
            ]);
        } catch (\Exception $e) {
            Log::error('Error al crear usuario de asamblea: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al crear el usuario de asamblea'
            ], 500);
        }
    }

    /**
     * Vincular mesa (AJAX)
     */
    public function vincular_mesa(Request $request): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $cedtra = $request->input('cedtra');
            $create_mesa = $request->input('create_mesa');
            $mesa_id = $request->input('mesa_id');
            $mesa_codigo = $request->input('mesa_codigo');
            $estado = $request->input('estado');

            $consenso = AsaConsenso::where('estado', 'A')
                ->where('asamblea_id', $this->idAsamblea)
                ->first();

            if (!$consenso) {
                return response()->json([
                    'success' => false,
                    'msj' => 'No hay un consenso activo para esta asamblea'
                ], 400);
            }

            $mesa = null;
            if ($create_mesa == 1) {
                $mesa = AsaMesas::create([
                    'codigo' => $mesa_codigo,
                    'cedtra_responsable' => $cedtra,
                    'estado' => $estado,
                    'consenso_id' => $consenso->id,
                    'hora_apertura' => '',
                    'hora_cierre_mesa' => '',
                    'cantidad_votantes' => 0,
                    'cantidad_votos' => 0,
                    'create_at' => now()
                ]);
            } else {
                $mesa = AsaMesas::find($mesa_id);
                if ($mesa) {
                    $mesa->update(['cedtra_responsable' => $cedtra]);
                }
            }

            return response()->json([
                'mesa' => $mesa
            ]);
        } catch (\Exception $e) {
            Log::error('Error al vincular mesa: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al vincular la mesa'
            ], 500);
        }
    }

    /**
     * Remover usuario (AJAX)
     */
    public function remover_usuario($id): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $usuario = AsaUsuarios::find($id);
            $errors = [];

            if ($usuario) {
                $cedtra = $usuario->cedtra;
                $usuario->delete();
            } else {
                $errors[] = "El usuario no se encuentra registrado para continuar.";
            }

            // Liberar mesa asociada
            $mesa = AsaMesas::where('cedtra_responsable', $cedtra)->first();
            if ($mesa) {
                $mesa->update(['cedtra_responsable' => 0]);
            }

            return response()->json([
                'usuario' => $usuario,
                'mesa' => $mesa,
                'errors' => implode("\n", $errors)
            ]);
        } catch (\Exception $e) {
            Log::error('Error al remover usuario: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al remover el usuario'
            ], 500);
        }
    }

    /**
     * Listar asambleas (AJAX)
     */
    public function listar_asambleas(): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $asambleas = DB::table('asa_asamblea')
                ->select('asa_asamblea.*', DB::raw('(SELECT count(asa_usuarios.cedtra) FROM asa_usuarios WHERE asa_usuarios.asamblea_id=asa_asamblea.id) as usuarios'))
                ->orderBy('create_at', 'desc')
                ->get();

            $asambleaActiva = AsaAsamblea::where('estado', 'A')->first();

            $consensos = null;
            if ($asambleaActiva) {
                $consensos = AsaConsenso::where('asamblea_id', $asambleaActiva->id)->get();
            }

            return response()->json([
                'success' => true,
                'asambleas' => $asambleas,
                'asamblea_activa' => $asambleaActiva,
                'consensos' => $consensos
            ]);
        } catch (\Exception $e) {
            Log::error('Error al listar asambleas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear consenso (AJAX)
     */
    public function crear_consenso(Request $request): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $estado = $request->input('estado');
            $detalle = $request->input('detalle');

            $asambleaActiva = AsaAsamblea::where('estado', 'A')->first();
            $errors = [];

            if (!$asambleaActiva) {
                $errors[] = "No dispone de una asamblea activa para continuar.";
            }

            if (empty($errors)) {
                $consenso = AsaConsenso::create([
                    'detalle' => strip_tags($detalle),
                    'estado' => $estado,
                    'create_at' => now(),
                    'asamblea_id' => $asambleaActiva->id
                ]);

                return response()->json([
                    'asa_consenso' => $consenso,
                    'errors' => implode("\n", $errors)
                ]);
            }

            return response()->json([
                'asa_consenso' => false,
                'errors' => implode("\n", $errors)
            ]);
        } catch (\Exception $e) {
            Log::error('Error al crear consenso: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al crear el consenso'
            ], 500);
        }
    }

    /**
     * Borrar consenso (AJAX)
     */
    public function borrar_consenso($id): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $consenso = AsaConsenso::find($id);
            $errors = [];

            if ($consenso) {
                $consenso->delete();
            }

            $consensos = AsaConsenso::all();

            return response()->json([
                'consensos' => $consensos,
                'errors' => implode("\n", $errors)
            ]);
        } catch (\Exception $e) {
            Log::error('Error al borrar consenso: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al borrar el consenso'
            ], 500);
        }
    }

    /**
     * Activar/desactivar consenso (AJAX)
     */
    public function consenso_activar($id = 0, $estado = 'I'): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $consenso = AsaConsenso::find($id);
            $salida = [];

            if ($consenso) {
                $res = $consenso->update(['estado' => $estado]);
                $salida['success'] = $res;
                $salida['msj'] = ($res) ? 'El consenso se actualizó con éxito' : 'El consenso no se actualizó.';
            }

            $salida['consensos'] = AsaConsenso::all();

            return response()->json($salida);
        } catch (\Exception $e) {
            Log::error('Error al activar consenso: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al actualizar el consenso'
            ], 500);
        }
    }

    /**
     * Remover mesa (AJAX)
     */
    public function remover_mesa($id): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $errors = [];
            $mesa = AsaMesas::find($id);

            if ($mesa) {
                $mesa->delete();
            }

            $mesas = AsaMesas::all();

            return response()->json([
                'mesas' => $mesas,
                'errors' => implode("\n", $errors)
            ]);
        } catch (\Exception $e) {
            Log::error('Error al remover mesa: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al remover la mesa'
            ], 500);
        }
    }

    /**
     * Detalle de mesa (AJAX)
     */
    public function mesa_detalle($id): JsonResponse
    {
        $permisoCheck = $this->verificarPermisos();
        if ($permisoCheck) return $permisoCheck;

        try {
            $mesa = AsaMesas::where('id', $id)
                ->orderBy('create_at', 'desc')
                ->first();

            return response()->json([
                'mesa' => $mesa
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener detalle de mesa: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al obtener el detalle de la mesa'
            ], 500);
        }
    }

    /**
     * Actualizar empresas masivamente
     */
    public function actualiza_empresas(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'SuperAdmin') {
            return response()->json([
                'success' => false,
                'msj' => 'No dispone de permisos para un cargue masivo.'
            ], 403);
        }

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
            $filas = 0;
            $creados = 0;
            $noValidas = [];
            $fallidos = [];
            $inactivos = [];
            $cruzados = [];
            $duplicados = [];

            $fdata = fopen($filepath, 'r');
            if ($fdata) {
                $ai = 0;
                while (!feof($fdata)) {
                    $line = fgets($fdata);
                    $line = str_replace(["\n", "\t"], ["", " "], $line);

                    if ($ai == 0) {
                        $headers = explode(";", $line);
                    } else {
                        $fila = explode(";", $line);
                        $nit = trim($fila[0]);

                        if (empty($nit)) continue;

                        $nit = intval($nit);
                        $filas++;

                        $empresa = Empresas::where('nit', $nit)->first();
                        if (!$empresa) {
                            $noValidas[] = "'{$nit}'";
                            continue;
                        }

                        $razsoc = $empresa->razsoc;
                        $cedrep = intval($empresa->cedrep);
                        $repleg = $empresa->repleg;

                        $empresaAsamblea = Empresas::where('nit', $nit)
                            ->where('asamblea_id', $this->idAsamblea)
                            ->first();

                        if (!$empresaAsamblea) {
                            $nuevaEmpresa = Empresas::create([
                                'nit' => $nit,
                                'razsoc' => $razsoc,
                                'cedrep' => $cedrep,
                                'repleg' => $repleg,
                                'asamblea_id' => $this->idAsamblea
                            ]);

                            if ($nuevaEmpresa) {
                                $creados++;
                            } else {
                                $fallidos[] = "'{$nit}'";
                            }
                        } else {
                            $empresaAsamblea->update([
                                'razsoc' => $razsoc,
                                'cedrep' => $cedrep,
                                'repleg' => $repleg
                            ]);
                            $duplicados[] = "'{$nit}'";
                        }
                    }
                    $ai++;
                }
                fclose($fdata);
            }

            // Eliminar archivo temporal
            unlink($filepath);

            // Crear log
            $logData = [
                'no_validas' => count($noValidas) > 0 ? implode(",", $noValidas) : '0',
                'duplicados' => count($duplicados) > 0 ? implode(",", $duplicados) : '0',
                'headers' => $headers,
                'creados' => $creados,
                'filas' => $filas,
                'inactivos' => count($inactivos) > 0 ? implode(",", $inactivos) : '0',
                'cruzados' => count($cruzados) > 0 ? implode(",", $cruzados) : '0',
                'fallidos' => count($fallidos) > 0 ? implode(",", $fallidos) : '0'
            ];

            $logPath = storage_path('app/temp/log_empresas_' . time() . '.txt');
            file_put_contents($logPath, var_export($logData, true));

            return response()->json($logData);
        } catch (\Exception $e) {
            Log::error('Error al actualizar empresas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al procesar el archivo de empresas'
            ], 500);
        }
    }

    /**
     * Obtener array de roles
     */
    private function getRolesArray(): array
    {
        return [
            'SuperAdmin' => 'Super Administrador',
            'Poderes' => 'Poderes',
            'Recepción' => 'Recepción',
            'Apoyo' => 'Apoyo'
        ];
    }
}
