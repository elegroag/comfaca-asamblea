<?php

namespace App\Http\Controllers;

use App\Services\UsuarioService;
use App\Models\UsuarioSisu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Exception;

class UsuariosController extends Controller
{
    private $idAsamblea;
    protected $cedtra;

    public function __construct()
    {
        $this->middleware('auth');
        $this->idAsamblea = $this->getAsambleaActiva();
        $this->cedtra = Session::get("cedtra");
    }

    /**
     * Obtener asamblea activa
     */
    private function getAsambleaActiva()
    {
        // Implementar lógica para obtener asamblea activa
        return Session::get('idAsamblea', 1);
    }

    /**
     * Verificar permisos de administrador
     */
    private function isAdmin()
    {
        // Implementar lógica de verificación de permisos
        return true; // Temporal hasta implementar autenticación completa
    }

    /**
     * Cargue masivo de usuarios
     */
    public function cargueMasivo(Request $request)
    {
        try {
            if (!Session::get("SuperAdmin")) {
                throw new Exception("No dispone de permisos para un cargue masivo.", 1);
            }

            $file = $request->file('file');
            
            if (!$file) {
                throw new Exception("No se ha proporcionado ningún archivo", 1);
            }

            $name = $file->getClientOriginalName();
            $filepath = $file->storeAs('uploads', $name, 'public');
            $fullPath = storage_path('app/public/' . $filepath);

            $headers = [];
            $filas = 0;
            $creados = 0;
            $fdata = fopen($fullPath, "rb");
            
            if ($fdata) {
                $ai = 0;
                while (!feof($fdata)) {
                    $line = fgets($fdata);
                    $line = str_replace("\n", "", $line);
                    $line = str_replace("\t", " ", $line);
                    if ($ai == 0) {
                        $headers = explode(";", $line);
                    } else {
                        $fila = explode(";", $line);
                        $cedtra = trim($fila[0]);
                        
                        if (strlen($cedtra) > 0) {
                            $filas++;

                            $usuarioService = new UsuarioService();
                            $cedtra = intval($cedtra);
                            $usuario = trim($fila[1]);
                            $nombre = trim($fila[2]);
                            $clave = trim($fila[3]);

                            $usuarioSisu = UsuarioSisu::where('cedtra', $cedtra)->first();
                            if (!$usuarioSisu) {
                                $creados++;
                                $usuarioSisu = $usuarioService->migrateUsuarioApiService($usuario);
                                
                                // Solo si se pasa una clave nueva
                                if ($usuarioSisu && strlen($clave) > 0) {
                                    $criptada = Hash::make($clave);
                                    UsuarioSisu::where('cedtra', $cedtra)->update(['criptada' => $criptada]);
                                }
                            } else {
                                // Actualiza la clave si ya existe
                                $criptada = Hash::make($clave);
                                UsuarioSisu::where('cedtra', $cedtra)->update([
                                    'nombre' => $nombre, 
                                    'criptada' => $criptada
                                ]);
                            }
                        }
                    }
                    $ai++;
                }
            }
            fclose($fdata);

            // Eliminar archivo temporal
            Storage::disk('public')->delete($filepath);

            $salida = [
                "no_validas" => '0',
                "duplicados" => '0',
                "headers" => $headers,
                "creados" => $creados,
                "filas" => $filas,
                "success" => true
            ];

            return response()->json($salida);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ]);
        }
    }

    /**
     * Crear usuario SISU individual
     */
    public function createUsuarioSisu(Request $request)
    {
        try {
            if (!Session::get("SuperAdmin")) {
                throw new Exception("No dispone de permisos para crear usuarios.", 1);
            }
            
            $usuarioService = new UsuarioService();

            $cedtra = $request->input("cedtra");
            $usuario = $request->input("usuario");
            $nombre = $request->input("nombre");
            $clave = $request->input("clave");

            $usuarioSisu = UsuarioSisu::where('cedtra', $cedtra)->first();
            if (!$usuarioSisu) {
                $usuarioSisu = $usuarioService->migrateUsuarioApiService($usuario);
                
                // Solo si se pasa una clave nueva
                if ($usuarioSisu && strlen($clave) > 0) {
                    $criptada = Hash::make($clave);
                    UsuarioSisu::where('cedtra', $cedtra)->update(['criptada' => $criptada]);
                }
            } else {
                // Actualiza la clave si ya existe
                $criptada = Hash::make($clave);
                UsuarioSisu::where('cedtra', $cedtra)->update([
                    'nombre' => $nombre, 
                    'criptada' => $criptada
                ]);
            }

            return response()->json([
                "success" => true,
                "usuario_sisu" => $usuarioSisu->toArray(),
                'msj' => 'Proceso de registro se completo con éxito'
            ]);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ]);
        }
    }

    /**
     * Listar todos los usuarios
     */
    public function listar()
    {
        try {
            $usuarios = UsuarioSisu::all();
            
            return response()->json([
                "success" => true,
                "usuarios" => $usuarios
            ]);
        } catch (Exception $e) {
            return response()->json([
                "success" => false,
                "message" => $e->getMessage()
            ]);
        }
    }

    /**
     * Buscar usuario por cédula
     */
    public function buscar($cedtra)
    {
        try {
            $usuario = UsuarioSisu::where('cedtra', $cedtra)->first();
            
            if ($usuario) {
                return response()->json([
                    "success" => true,
                    "usuario" => $usuario,
                    "message" => "Usuario encontrado"
                ]);
            } else {
                return response()->json([
                    "success" => false,
                    "message" => "Usuario no encontrado"
                ]);
            }
        } catch (Exception $e) {
            return response()->json([
                "success" => false,
                "message" => $e->getMessage()
            ]);
        }
    }

    /**
     * Actualizar usuario
     */
    public function actualizar($cedtra, Request $request)
    {
        try {
            $usuarioService = new UsuarioService();
            
            $datos = (object)[
                'cedtra' => $cedtra,
                'nombre' => $request->input('nombre'),
                'estado' => $request->input('estado')
            ];

            // Si se proporciona una nueva clave, actualizarla también
            if ($request->has('clave') && !empty($request->input('clave'))) {
                $datos->criptada = Hash::make($request->input('clave'));
            }

            $usuario = $usuarioService->actualizaUsuario($datos);

            return response()->json([
                'success' => true,
                'usuario' => $usuario,
                'message' => 'Usuario actualizado correctamente'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Eliminar usuario
     */
    public function eliminar($cedtra)
    {
        try {
            $this->isAdmin();
            
            $usuario = UsuarioSisu::where('cedtra', $cedtra)->first();
            
            if ($usuario) {
                $usuario->delete();
                return response()->json([
                    "success" => true,
                    "message" => "Usuario eliminado correctamente"
                ]);
            } else {
                return response()->json([
                    "success" => false,
                    "message" => "Usuario no encontrado"
                ]);
            }
        } catch (Exception $e) {
            return response()->json([
                "success" => false,
                "message" => $e->getMessage()
            ]);
        }
    }

    /**
     * Cambiar estado de usuario (activar/desactivar)
     */
    public function cambiarEstado($cedtra, Request $request)
    {
        try {
            $estado = $request->input('estado'); // 'A' o 'I'
            
            $usuario = UsuarioSisu::where('cedtra', $cedtra)->first();
            if (!$usuario) {
                throw new Exception("Usuario no encontrado", 404);
            }

            $usuario->update(['estado' => $estado]);

            return response()->json([
                'success' => true,
                'message' => "Usuario " . ($estado == 'A' ? 'activado' : 'desactivado') . " correctamente"
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Resetear contraseña de usuario
     */
    public function resetearClave($cedtra, Request $request)
    {
        try {
            $this->isAdmin();
            
            $nueva_clave = $request->input('nueva_clave');
            
            if (empty($nueva_clave)) {
                throw new Exception("La nueva clave no puede estar vacía", 400);
            }

            $criptada = Hash::make($nueva_clave);
            
            $usuario = UsuarioSisu::where('cedtra', $cedtra)->first();
            if (!$usuario) {
                throw new Exception("Usuario no encontrado", 404);
            }

            $usuario->update(['criptada' => $criptada]);

            return response()->json([
                'success' => true,
                'message' => 'Contraseña reseteada correctamente'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Validar credenciales de usuario
     */
    public function validarCredenciales(Request $request)
    {
        try {
            $cedtra = $request->input('cedtra');
            $clave = $request->input('clave');

            $usuario = UsuarioSisu::where('cedtra', $cedtra)->first();
            
            if (!$usuario) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ]);
            }

            if ($usuario->estado !== 'A') {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario inactivo'
                ]);
            }

            if (!Hash::check($clave, $usuario->criptada)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Contraseña incorrecta'
                ]);
            }

            return response()->json([
                'success' => true,
                'usuario' => $usuario->toArray(),
                'message' => 'Credenciales válidas'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener estadísticas de usuarios
     */
    public function estadisticas()
    {
        try {
            $total = UsuarioSisu::count();
            $activos = UsuarioSisu::where('estado', 'A')->count();
            $inactivos = UsuarioSisu::where('estado', 'I')->count();
            
            // Usuarios creados en el último mes
            $ultimo_mes = UsuarioSisu::where('created_at', '>=', now()->subMonth())->count();

            return response()->json([
                'success' => true,
                'estadisticas' => [
                    'total' => $total,
                    'activos' => $activos,
                    'inactivos' => $inactivos,
                    'ultimo_mes' => $ultimo_mes
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Exportar lista de usuarios
     */
    public function exportarLista()
    {
        try {
            $usuarios = UsuarioSisu::all();
            
            // Preparar datos para exportación
            $data = [];
            foreach ($usuarios as $usuario) {
                $data[] = [
                    'cedtra' => $usuario->cedtra,
                    'nombre' => $usuario->nombre,
                    'usuario' => $usuario->usuario,
                    'estado' => $usuario->estado,
                    'created_at' => $usuario->created_at->format('Y-m-d H:i:s')
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Datos de usuarios preparados para exportación',
                'file_path' => 'storage/export/usuarios_' . date('Y-m-d_H-i-s') . '.csv'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
}
