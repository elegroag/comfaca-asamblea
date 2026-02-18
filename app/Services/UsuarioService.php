<?php

namespace App\Services;

use App\Models\UsuarioSisu;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UsuarioService
{
    private $usuario;

    public function __construct()
    {
        // Constructor vacío para inicialización
    }

    /**
     * Actualizar datos de usuario
     */
    public function actualizaUsuario($datos)
    {
        $usuario = UsuarioSisu::where('cedtra', $datos->cedtra)->first();

        if (!$usuario) {
            throw new \Exception("Usuario no encontrado", 404);
        }

        $usuario->update([
            'criptada' => $datos->criptada ?? $usuario->criptada,
            'cedtra' => $datos->cedtra ?? $usuario->cedtra,
            'estado' => $datos->estado ?? $usuario->estado
        ]);

        return $usuario->fresh();
    }

    /**
     * Crear o actualizar usuario SISU
     */
    public function createUserSisu(array $data)
    {
        $usuario = UsuarioSisu::where('cedtra', intval($data['cedtra']))->first();

        if ($usuario) {
            // Actualizar usuario existente
            $usuario->update($data);
            return $usuario->fresh();
        } else {
            // Crear nuevo usuario
            return UsuarioSisu::create($data);
        }
    }

    /**
     * Buscar usuario por cédula
     */
    public function findUserSisuByCedtra($cedtra)
    {
        return UsuarioSisu::where('cedtra', $cedtra)->first();
    }

    /**
     * Buscar usuario por nombre de usuario
     */
    public function findUserSisuByUsuario($usuario)
    {
        return UsuarioSisu::where('usuario', $usuario)->first();
    }

    /**
     * Migrar usuario desde API externa
     */
    public function migrateUsuarioApiService(int $usuario)
    {
        try {
            // Simular llamada a API externa
            $response = $this->llamarApiExterna($usuario);

            if (!$response['success']) {
                return false;
            }

            // Procesar datos de respuesta
            $datosApi = $response['data'];
            $datosApi['scriptada'] = $datosApi['scriptada'] ?? '0';

            // Crear o actualizar usuario
            $this->usuario = $this->createUserSisu($datosApi);

            return $this->usuario;
        } catch (\Exception $e) {
            Log::error("Error en migración de usuario: " . $e->getMessage());
            throw new \Exception("Error en la migración del usuario", 500);
        }
    }

    /**
     * Simular llamada a API externa
     * NOTA: Este método simula la llamada al ProcesadorApi original
     * Debe ser reemplazado con la implementación real de la API
     */
    private function llamarApiExterna($usuario)
    {
        // Simulación de respuesta de API
        // En producción, esto debería hacer una llamada HTTP real

        $usuariosSimulados = [
            123456789 => [
                'cedtra' => 123456789,
                'usuario' => 'usuario_demo',
                'nombre' => 'Usuario Demo',
                'scriptada' => '1',
                'estado' => 'A'
            ],
            987654321 => [
                'cedtra' => 987654321,
                'usuario' => 'usuario_test',
                'nombre' => 'Usuario Test',
                'scriptada' => '0',
                'estado' => 'I'
            ]
        ];

        if (isset($usuariosSimulados[$usuario])) {
            return [
                'success' => true,
                'data' => $usuariosSimulados[$usuario]
            ];
        }

        return [
            'success' => false,
            'message' => 'Usuario no encontrado en API externa'
        ];
    }

    /**
     * Obtener todos los usuarios
     */
    public function getAllUsuarios()
    {
        return UsuarioSisu::orderBy('nombre')->get();
    }

    /**
     * Obtener usuarios por estado
     */
    public function getUsuariosPorEstado($estado)
    {
        return UsuarioSisu::where('estado', $estado)->orderBy('nombre')->get();
    }

    /**
     * Obtener usuarios activos
     */
    public function getUsuariosActivos()
    {
        return $this->getUsuariosPorEstado('A');
    }

    /**
     * Obtener usuarios inactivos
     */
    public function getUsuariosInactivos()
    {
        return $this->getUsuariosPorEstado('I');
    }

    /**
     * Cambiar estado de usuario
     */
    public function cambiarEstado($cedtra, $estado)
    {
        $usuario = UsuarioSisu::where('cedtra', $cedtra)->first();

        if (!$usuario) {
            throw new \Exception("Usuario no encontrado", 404);
        }

        $usuario->update(['estado' => $estado]);

        return $usuario->fresh();
    }

    /**
     * Activar usuario
     */
    public function activarUsuario($cedtra)
    {
        return $this->cambiarEstado($cedtra, 'A');
    }

    /**
     * Inactivar usuario
     */
    public function inactivarUsuario($cedtra)
    {
        return $this->cambiarEstado($cedtra, 'I');
    }

    /**
     * Eliminar usuario
     */
    public function eliminarUsuario($cedtra)
    {
        $usuario = UsuarioSisu::where('cedtra', $cedtra)->first();

        if (!$usuario) {
            throw new \Exception("Usuario no encontrado", 404);
        }

        $usuario->delete();

        return true;
    }

    /**
     * Validar si usuario existe
     */
    public function existeUsuario($cedtra)
    {
        return UsuarioSisu::where('cedtra', $cedtra)->exists();
    }

    /**
     * Buscar usuarios por término
     */
    public function buscarUsuarios($termino)
    {
        return UsuarioSisu::where(function ($query) use ($termino) {
            $query->where('nombre', 'LIKE', "%{$termino}%")
                ->orWhere('usuario', 'LIKE', "%{$termino}%")
                ->orWhere('cedtra', 'LIKE', "%{$termino}%");
        })->orderBy('nombre')->get();
    }

    /**
     * Obtener resumen de usuarios
     */
    public function getResumenUsuarios()
    {
        $total = UsuarioSisu::count();
        $activos = UsuarioSisu::where('estado', 'A')->count();
        $inactivos = UsuarioSisu::where('estado', 'I')->count();
        $conScriptada = UsuarioSisu::where('scriptada', '1')->count();
        $sinScriptada = UsuarioSisu::where('scriptada', '0')->count();

        return [
            'total_usuarios' => $total,
            'usuarios_activos' => $activos,
            'usuarios_inactivos' => $inactivos,
            'con_scriptada' => $conScriptada,
            'sin_scriptada' => $sinScriptada,
            'ultima_actualizacion' => UsuarioSisu::max('updated_at')
        ];
    }

    /**
     * Actualizar estado de scriptada
     */
    public function actualizarScriptada($cedtra, $scriptada)
    {
        $usuario = UsuarioSisu::where('cedtra', $cedtra)->first();

        if (!$usuario) {
            throw new \Exception("Usuario no encontrado", 404);
        }

        $usuario->update([
            'scriptada' => $scriptada,
            'updated_at' => now()
        ]);

        return $usuario->fresh();
    }

    /**
     * Validar credenciales de usuario
     */
    public function validarCredenciales($cedtra, $password)
    {
        $usuario = UsuarioSisu::where('cedtra', $cedtra)->first();

        if (!$usuario) {
            return [
                'autenticado' => false,
                'motivo' => 'Usuario no encontrado',
                'usuario' => null
            ];
        }

        // NOTA: En producción, aquí debería ir la lógica real de validación de contraseña
        // Por ahora, se asume que cualquier usuario con scriptada=1 es válido
        $passwordValido = $usuario->scriptada == '1';

        if (!$passwordValido) {
            return [
                'autenticado' => false,
                'motivo' => 'Contraseña incorrecta o usuario sin scriptada',
                'usuario' => null
            ];
        }

        return [
            'autenticado' => true,
            'motivo' => 'Autenticación exitosa',
            'usuario' => $usuario->toArray()
        ];
    }

    /**
     * Exportar usuarios a array
     */
    public function exportarUsuarios()
    {
        $usuarios = $this->getAllUsuarios();

        return $usuarios->map(function ($usuario) {
            return [
                'cedtra' => $usuario->cedtra,
                'usuario' => $usuario->usuario,
                'nombre' => $usuario->nombre,
                'scriptada' => $usuario->scriptada,
                'estado' => $usuario->estado,
                'created_at' => $usuario->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $usuario->updated_at->format('Y-m-d H:i:s')
            ];
        })->toArray();
    }

    /**
     * Obtener estadísticas de usuarios
     */
    public function getEstadisticasUsuarios()
    {
        $usuarios = UsuarioSisu::all();

        return [
            'total_registrados' => $usuarios->count(),
            'activos' => $usuarios->where('estado', 'A')->count(),
            'inactivos' => $usuarios->where('estado', 'I')->count(),
            'con_scriptada' => $usuarios->where('scriptada', '1')->count(),
            'usuarios_ultimos_30_dias' => $usuarios->where('updated_at', '>=', now()->subDays(30))->count(),
            'promedio_creacion_diaria' => $usuarios->count() / max(1, now()->diffInDays($usuarios->min('created_at')) + 1),
            'ultimo_registro' => $usuarios->max('created_at')
        ];
    }

    /**
     * Sincronizar usuarios desde API externa
     */
    public function sincronizarUsuariosDesdeApi()
    {
        try {
            // Obtener lista de usuarios desde API externa
            $usuariosApi = $this->obtenerUsuariosDesdeApi();

            $sincronizados = 0;
            $errores = [];

            foreach ($usuariosApi as $usuarioData) {
                try {
                    $this->migrateUsuarioApiService($usuarioData['cedtra']);
                    $sincronizados++;
                } catch (\Exception $e) {
                    $errores[] = [
                        'cedtra' => $usuarioData['cedtra'],
                        'error' => $e->getMessage()
                    ];
                }
            }

            return [
                'total_procesados' => count($usuariosApi),
                'sincronizados' => $sincronizados,
                'errores' => $errores,
                'exitoso' => count($errores) === 0
            ];
        } catch (\Exception $e) {
            Log::error("Error en sincronización: " . $e->getMessage());
            throw new \Exception("Error en la sincronización de usuarios", 500);
        }
    }

    /**
     * Obtener lista de usuarios desde API externa
     */
    private function obtenerUsuariosDesdeApi()
    {
        // Simulación de obtención de usuarios desde API externa
        // En producción, esto debería hacer una llamada HTTP real

        return [
            ['cedtra' => 123456789],
            ['cedtra' => 987654321],
            ['cedtra' => 55556666],
            ['cedtra' => 77778888]
        ];
    }

    /**
     * Actualizar múltiples usuarios
     */
    public function actualizarMultiplesUsuarios($datos)
    {
        $actualizados = 0;
        $errores = [];

        foreach ($datos as $dato) {
            try {
                $this->actualizaUsuario((object) $dato);
                $actualizados++;
            } catch (\Exception $e) {
                $errores[] = [
                    'cedtra' => $dato['cedtra'] ?? 'desconocido',
                    'error' => $e->getMessage()
                ];
            }
        }

        return [
            'total_procesados' => count($datos),
            'actualizados' => $actualizados,
            'errores' => $errores,
            'exitoso' => count($errores) === 0
        ];
    }

    /**
     * Validar datos de usuario
     */
    public function validarDatosUsuario($data)
    {
        $errores = [];

        // Validar cédula
        if (!isset($data['cedtra']) || !is_numeric($data['cedtra'])) {
            $errores[] = 'La cédula es requerida y debe ser numérica';
        }

        // Validar nombre
        if (!isset($data['nombre']) || empty(trim($data['nombre']))) {
            $errores[] = 'El nombre es requerido';
        }

        // Validar usuario
        if (!isset($data['usuario']) || empty(trim($data['usuario']))) {
            $errores[] = 'El nombre de usuario es requerido';
        }

        // Validar estado
        if (isset($data['estado']) && !in_array($data['estado'], ['A', 'I'])) {
            $errores[] = 'El estado debe ser A (activo) o I (inactivo)';
        }

        // Validar scriptada
        if (isset($data['scriptada']) && !in_array($data['scriptada'], ['0', '1'])) {
            $errores[] = 'El valor de scriptada debe ser 0 o 1';
        }

        return [
            'valido' => empty($errores),
            'errores' => $errores
        ];
    }

    /**
     * Crear usuario con validación
     */
    public function crearUsuarioConValidacion(array $data)
    {
        $validacion = $this->validarDatosUsuario($data);

        if (!$validacion['valido']) {
            throw new \Exception('Datos inválidos: ' . implode(', ', $validacion['errores']), 400);
        }

        return $this->createUserSisu($data);
    }
}
