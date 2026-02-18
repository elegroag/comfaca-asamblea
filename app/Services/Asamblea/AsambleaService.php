<?php

namespace App\Services\Asamblea;

use App\Models\AsaAsamblea;

class AsambleaService
{
    /**
     * Obtener asamblea activa
     * Versión agnóstica del contexto HTTP
     */
    public static function getAsambleaActiva($idAsamblea = null)
    {
        // Si se proporciona un ID, usarlo directamente
        if ($idAsamblea) {
            return $idAsamblea;
        }
        
        // Buscar la asamblea activa en la base de datos
        $asamblea = AsaAsamblea::where('estado', 'A')->first();
        return $asamblea ? $asamblea->id : 0;
    }

    /**
     * Obtener el objeto de asamblea activa
     */
    public static function getAsambleaActivaModel($idAsamblea = null)
    {
        $id = self::getAsambleaActiva($idAsamblea);
        if ($id) {
            return AsaAsamblea::find($id);
        }
        return null;
    }

    /**
     * Verificar permisos de administrador
     * Versión agnóstica que retorna boolean en lugar de redirecciones
     */
    public static function isAdmin($userRole, $controller = '')
    {
        if (!$userRole) {
            return false;
        }

        switch ($controller) {
            case 'poderes':
                return in_array($userRole, ['SuperAdmin', 'Poderes']);
            case 'empresas':
                return in_array($userRole, ['SuperAdmin', 'Recepción']);
            case 'recepcion':
                return in_array($userRole, ['SuperAdmin', 'Recepción', 'Poderes', 'Apoyo']);
            default:
                return $userRole === 'SuperAdmin';
        }
    }

    /**
     * Verificar si el usuario tiene permisos específicos
     */
    public static function hasPermission($userRole, $permission)
    {
        $permissions = [
            'SuperAdmin' => ['all'],
            'Poderes' => ['poderes.view', 'poderes.create', 'poderes.edit', 'poderes.delete'],
            'Recepción' => ['empresas.view', 'empresas.create', 'empresas.edit', 'recepcion.view', 'recepcion.create'],
            'Apoyo' => ['recepcion.view', 'empresas.view'],
        ];

        if ($userRole === 'SuperAdmin') {
            return true;
        }

        return isset($permissions[$userRole]) && 
               (in_array('all', $permissions[$userRole]) || in_array($permission, $permissions[$userRole]));
    }

    /**
     * Obtener todas las asambleas
     */
    public static function getAllAsambleas()
    {
        return AsaAsamblea::orderBy('nombre')->get();
    }

    /**
     * Obtener asambleas por estado
     */
    public static function getAsambleasByEstado($estado)
    {
        return AsaAsamblea::where('estado', $estado)->orderBy('nombre')->get();
    }

    /**
     * Obtener asambleas activas
     */
    public static function getAsambleasActivas()
    {
        return self::getAsambleasByEstado('A');
    }

    /**
     * Obtener asambleas inactivas
     */
    public static function getAsambleasInactivas()
    {
        return self::getAsambleasByEstado('I');
    }

    /**
     * Crear nueva asamblea
     */
    public static function createAsamblea($data)
    {
        return AsaAsamblea::create([
            'nombre' => $data['nombre'],
            'descripcion' => $data['descripcion'] ?? null,
            'fecha_inicio' => $data['fecha_inicio'] ?? null,
            'fecha_fin' => $data['fecha_fin'] ?? null,
            'estado' => $data['estado'] ?? 'I',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Actualizar asamblea
     */
    public static function updateAsamblea($id, $data)
    {
        $asamblea = AsaAsamblea::find($id);
        if (!$asamblea) {
            throw new \Exception("La asamblea no existe", 404);
        }

        $asamblea->update(array_merge($data, [
            'updated_at' => now()
        ]));

        return $asamblea->fresh();
    }

    /**
     * Activar asamblea
     */
    public static function activarAsamblea($id)
    {
        // Primero desactivar todas las asambleas
        AsaAsamblea::where('estado', 'A')->update(['estado' => 'I']);
        
        // Activar la asamblea especificada
        return self::updateAsamblea($id, ['estado' => 'A']);
    }

    /**
     * Desactivar asamblea
     */
    public static function desactivarAsamblea($id)
    {
        return self::updateAsamblea($id, ['estado' => 'I']);
    }

    /**
     * Eliminar asamblea
     */
    public static function deleteAsamblea($id)
    {
        $asamblea = AsaAsamblea::find($id);
        if (!$asamblea) {
            throw new \Exception("La asamblea no existe", 404);
        }

        // Verificar si hay datos asociados
        if (self::hasAssociatedData($id)) {
            throw new \Exception("No se puede eliminar la asamblea porque tiene datos asociados", 400);
        }

        return $asamblea->delete();
    }

    /**
     * Verificar si la asamblea tiene datos asociados
     */
    private static function hasAssociatedData($idAsamblea)
    {
        // Verificar si hay empresas, poderes, etc. asociados
        $hasEmpresas = \App\Models\Empresas::where('asamblea_id', $idAsamblea)->exists();
        $hasPoderes = \App\Models\Poderes::where('asamblea_id', $idAsamblea)->exists();
        $hasRegistroIngresos = \App\Models\RegistroIngresos::where('asamblea_id', $idAsamblea)->exists();
        
        return $hasEmpresas || $hasPoderes || $hasRegistroIngresos;
    }

    /**
     * Obtener resumen de asambleas
     */
    public static function getResumenAsambleas()
    {
        $total = AsaAsamblea::count();
        $activas = AsaAsamblea::where('estado', 'A')->count();
        $inactivas = AsaAsamblea::where('estado', 'I')->count();

        return [
            'total_asambleas' => $total,
            'asambleas_activas' => $activas,
            'asambleas_inactivas' => $inactivas,
            'ultima_actualizacion' => AsaAsamblea::max('updated_at')
        ];
    }

    /**
     * Buscar asambleas por término
     */
    public static function buscarAsambleas($termino)
    {
        return AsaAsamblea::where(function ($query) use ($termino) {
            $query->where('nombre', 'LIKE', "%{$termino}%")
                ->orWhere('descripcion', 'LIKE', "%{$termino}%");
        })->orderBy('nombre')->get();
    }

    /**
     * Obtener estadísticas de una asamblea
     */
    public static function getEstadisticasAsamblea($idAsamblea)
    {
        $asamblea = AsaAsamblea::find($idAsamblea);
        if (!$asamblea) {
            throw new \Exception("La asamblea no existe", 404);
        }

        $stats = [
            'empresas' => \App\Models\Empresas::where('asamblea_id', $idAsamblea)->count(),
            'poderes' => \App\Models\Poderes::where('asamblea_id', $idAsamblea)->count(),
            'poderes_activos' => \App\Models\Poderes::where('asamblea_id', $idAsamblea)->where('estado', 'A')->count(),
            'registro_ingresos' => \App\Models\RegistroIngresos::where('asamblea_id', $idAsamblea)->count(),
            'representantes' => \App\Models\AsaRepresentantes::where('asamblea_id', $idAsamblea)->count(),
        ];

        return array_merge($asamblea->toArray(), ['estadisticas' => $stats]);
    }

    /**
     * Validar datos de asamblea
     */
    public static function validarDatosAsamblea($data)
    {
        $errores = [];
        
        // Validar nombre
        if (!isset($data['nombre']) || empty(trim($data['nombre']))) {
            $errores[] = 'El nombre es requerido';
        }
        
        // Validar estado
        if (isset($data['estado']) && !in_array($data['estado'], ['A', 'I'])) {
            $errores[] = 'El estado debe ser A (activo) o I (inactivo)';
        }
        
        // Validar fechas si se proporcionan
        if (isset($data['fecha_inicio']) && isset($data['fecha_fin'])) {
            if ($data['fecha_inicio'] > $data['fecha_fin']) {
                $errores[] = 'La fecha de inicio no puede ser posterior a la fecha de fin';
            }
        }
        
        return [
            'valido' => empty($errores),
            'errores' => $errores
        ];
    }

    /**
     * Crear asamblea con validación
     */
    public static function crearAsambleaConValidacion($data)
    {
        $validacion = self::validarDatosAsamblea($data);
        
        if (!$validacion['valido']) {
            throw new \Exception('Datos inválidos: ' . implode(', ', $validacion['errores']), 400);
        }
        
        return self::createAsamblea($data);
    }

    /**
     * Verificar si existe asamblea activa
     */
    public static function existeAsambleaActiva()
    {
        return AsaAsamblea::where('estado', 'A')->exists();
    }

    /**
     * Obtener la asamblea activa o lanzar excepción
     */
    public static function getAsambleaActivaOrFail($idAsamblea = null)
    {
        $asamblea = self::getAsambleaActivaModel($idAsamblea);
        
        if (!$asamblea) {
            throw new \Exception("No hay una asamblea activa configurada", 404);
        }
        
        return $asamblea;
    }

    /**
     * Obtener información de la asamblea activa
     */
    public static function getAsambleaActivaInfo($idAsamblea = null)
    {
        $idAsamblea = self::getAsambleaActiva($idAsamblea);

        if ($idAsamblea === 0) {
            return null;
        }

        return AsaAsamblea::find($idAsamblea);
    }

    /**
     * Verificar si el usuario tiene rol específico
     */
    public static function tieneRol($userRole, $rolesPermitidos)
    {
        if (!$userRole) {
            return false;
        }

        if (is_array($rolesPermitidos)) {
            return in_array($userRole, $rolesPermitidos);
        }

        return $userRole === $rolesPermitidos;
    }

    /**
     * Obtener roles permitidos para un controlador
     */
    public static function getRolesPermitidos($controller)
    {
        $rolesPorControlador = [
            'poderes' => ['SuperAdmin', 'Poderes'],
            'empresas' => ['SuperAdmin', 'Recepción'],
            'recepcion' => ['SuperAdmin', 'Recepción', 'Poderes', 'Apoyo'],
        ];

        return $rolesPorControlador[$controller] ?? ['SuperAdmin'];
    }

    /**
     * Validar acceso a controlador
     */
    public static function validarAccesoControlador($userRole, $controller)
    {
        $rolesPermitidos = self::getRolesPermitidos($controller);
        return self::tieneRol($userRole, $rolesPermitidos);
    }
}
