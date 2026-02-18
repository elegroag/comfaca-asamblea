<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Hash;

/**
 * Usuarios del sistema SISU
 * Sistema de autenticación principal unificado
 */
class UsuarioSisu extends Authenticatable
{
    use HasFactory, HasApiTokens, Notifiable;

    protected $table = 'usuario_sisu';

    protected $fillable = [
        'usuario',
        'cedtra',
        'nombre',
        'password',
        'email',
        'is_active',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->created_at = now();
            $model->updated_at = now();
        });

        static::updating(function ($model) {
            $model->updated_at = now();
        });
    }

    /**
     * Relación flexible con trabajador (sin foreign key)
     * Esta relación no es estricta y puede retornar null
     */
    public function trabajador()
    {
        return $this->belongsTo(AsaTrabajadores::class, 'cedtra', 'cedtra');
    }

    /**
     * Obtener trabajador relacionado de forma segura
     * Método alternativo que maneja la relación sin dependencia estricta
     */
    public function getTrabajadorRelacionado()
    {
        if (!$this->cedtra) {
            return null;
        }

        return AsaTrabajadores::where('cedtra', $this->cedtra)->first();
    }

    /**
     * Verificar si tiene trabajador relacionado
     */
    public function tieneTrabajadorRelacionado()
    {
        return $this->getTrabajadorRelacionado() !== null;
    }

    /**
     * Scope para buscar por usuario
     */
    public function scopePorUsuario($query, $usuario)
    {
        return $query->where('usuario', $usuario);
    }

    /**
     * Scope para buscar por cédula
     */
    public function scopePorCedula($query, $cedtra)
    {
        return $query->where('cedtra', $cedtra);
    }

    /**
     * Scope para buscar por nombre
     */
    public function scopePorNombre($query, $nombre)
    {
        return $query->where('nombre', 'like', "%{$nombre}%");
    }

    /**
     * Scope para buscar por email
     */
    public function scopePorEmail($query, $email)
    {
        return $query->where('email', $email);
    }

    /**
     * Scope para usuarios activos
     */
    public function scopeActivos($query)
    {
        return $query->where('is_active', 'S');
    }

    /**
     * Scope para usuarios inactivos
     */
    public function scopeInactivos($query)
    {
        return $query->where('is_active', 'N');
    }

    /**
     * Scope para usuarios con trabajador relacionado
     */
    public function scopeConTrabajador($query)
    {
        return $query->whereNotNull('cedtra')
            ->whereIn('cedtra', function ($subquery) {
                $subquery->select('cedtra')
                    ->from('asa_trabajadores');
            });
    }

    /**
     * Scope para usuarios sin trabajador relacionado
     */
    public function scopeSinTrabajador($query)
    {
        return $query->where(function ($subquery) {
            $subquery->whereNull('cedtra')
                ->orWhereNotIn('cedtra', function ($innerQuery) {
                    $innerQuery->select('cedtra')
                        ->from('asa_trabajadores');
                });
        });
    }

    /**
     * Obtener el nombre para mostrar
     */
    public function getAuthIdentifierName()
    {
        return 'usuario';
    }

    /**
     * Obtener el email para notificaciones
     */
    public function getEmailForVerification()
    {
        return $this->email;
    }

    /**
     * Obtener el email para reset de contraseña
     */
    public function getEmailForPasswordReset()
    {
        return $this->email;
    }

    /**
     * Verificar contraseña
     */
    public function verifyPassword($password)
    {
        return Hash::check($password, $this->password);
    }

    /**
     * Establecer contraseña
     */
    public function setPassword($password)
    {
        $this->password = Hash::make($password);
        $this->save();
    }

    /**
     * Obtener nombre completo (prioriza trabajador relacionado)
     */
    public function getNombreCompletoAttribute()
    {
        $trabajador = $this->getTrabajadorRelacionado();

        if ($trabajador && $trabajador->nombre_completo) {
            return $trabajador->nombre_completo;
        }

        return $this->nombre;
    }

    /**
     * Obtener email completo (prioriza trabajador relacionado)
     */
    public function getEmailCompletoAttribute()
    {
        $trabajador = $this->getTrabajadorRelacionado();

        if ($trabajador && $trabajador->email) {
            return $trabajador->email;
        }

        return $this->email;
    }

    /**
     * Verificar si está activo (basado en campo is_active)
     */
    public function estaActivo()
    {
        return ($this->is_active == 'S') ? true : false;
    }

    /**
     * Verificar si puede participar en asambleas
     */
    public function puedeParticiparEnAsambleas()
    {
        return $this->estaActivo();
    }

    /**
     * Verificar si el usuario es SuperAdmin
     */
    public function isSuperAdmin()
    {
        // Implementar lógica según el sistema
        // Por ahora, basado en el usuario o algún campo específico
        return $this->usuario === 'admin' ||
            $this->cedtra === 'admin' ||
            str_contains(strtolower($this->usuario), 'admin');
    }

    /**
     * Verificar si el usuario tiene permisos de administrador
     */
    public function isAdmin()
    {
        return $this->isSuperAdmin() ||
            $this->hasPermission('admin') ||
            str_contains(strtolower($this->usuario), 'admin');
    }

    /**
     * Verificar si tiene un permiso específico
     */
    public function hasPermission(string $permission): bool
    {
        // Implementar lógica de permisos según sea necesario
        // Por ahora, todos los usuarios activos tienen permisos básicos
        return $this->is_active;
    }

    /**
     * Desactivar usuario
     */
    public function desactivar()
    {
        $this->is_active = 'N';
        $this->save();
    }

    /**
     * Obtener información completa del usuario
     */
    public function getInfoCompletaAttribute()
    {
        $info = "Usuario: {$this->usuario}\n";
        $info .= "Cédula: " . ($this->cedtra ?: 'No especificada') . "\n";
        $info .= "Nombre: {$this->nombre_completo}\n";
        $info .= "Email: " . ($this->email_completo ?: 'No especificado') . "\n";
        $info .= "Estado: " . ($this->estaActivo() ? 'Activo' : 'Inactivo');
        $info .= "\nTrabajador relacionado: " . ($this->tieneTrabajadorRelacionado() ? 'Sí' : 'No');

        return $info;
    }

    /**
     * Buscar usuario por credenciales
     */
    public static function buscarPorCredenciales($usuario, $password)
    {
        $user = self::porUsuario($usuario)->first();

        if ($user && $user->verifyPassword($password)) {
            return $user;
        }

        return null;
    }

    /**
     * Crear usuario SISU
     */
    public static function crearUsuario($data)
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        return self::create($data);
    }

    /**
     * Verificar si el usuario existe
     */
    public static function existeUsuario($usuario)
    {
        return self::porUsuario($usuario)->exists();
    }

    /**
     * Verificar si la cédula está registrada
     */
    public static function existeCedula($cedtra)
    {
        return self::porCedula($cedtra)->exists();
    }

    /**
     * Sincronizar con trabajador (si existe)
     */
    public function sincronizarConTrabajador()
    {
        $trabajador = $this->getTrabajadorRelacionado();

        if ($trabajador) {
            $this->nombre = $trabajador->nombre_completo;

            if (!$this->email && $trabajador->email) {
                $this->email = $trabajador->email;
            }

            $this->save();
        }
    }

    /**
     * Obtener estadísticas de usuarios
     */
    public static function getEstadisticas()
    {
        $total = self::count();
        $activos = self::activos()->count();
        $inactivos = self::inactivos()->count();

        $conTrabajador = self::conTrabajador()->count();
        $sinTrabajador = self::sinTrabajador()->count();

        return [
            'total' => $total,
            'activos' => $activos,
            'inactivos' => $inactivos,
            'con_trabajador' => $conTrabajador,
            'sin_trabajador' => $sinTrabajador,
            'porcentaje_activos' => $total > 0 ? round(($activos / $total) * 100, 2) : 0,
            'porcentaje_con_trabajador' => $total > 0 ? round(($conTrabajador / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Enviar notificación de verificación de email
     */
    public function sendEmailVerificationNotification()
    {
        if ($this->email) {
            $this->notify(new \Illuminate\Auth\Notifications\VerifyEmail());
        }
    }

    /**
     * Enviar notificación de reset de contraseña
     */
    public function sendPasswordResetNotification($token)
    {
        if ($this->email) {
            $this->notify(new \Illuminate\Auth\Notifications\ResetPassword($token));
        }
    }

    /**
     * Determinar si el usuario ha verificado su email
     */
    public function hasVerifiedEmail()
    {
        // Como no tenemos campo email_verified_at, asumimos que siempre está verificado
        // o puedes agregar el campo a la tabla si necesitas esta funcionalidad
        return true;
    }

    /**
     * Marcar email como verificado
     */
    public function markEmailAsVerified()
    {
        // Si agregas el campo email_verified_at, descomenta esta línea:
        // $this->forceFill(['email_verified_at' => now()])->save();
        return true;
    }

    /**
     * Mantener compatibilidad con el campo 'name' de Laravel
     */
    public function getNameAttribute()
    {
        return $this->nombre_completo;
    }

    /**
     * Mantener compatibilidad con el campo 'name' de Laravel
     */
    public function setNameAttribute($value)
    {
        $this->nombre = $value;
    }

    /**
     * Mantener compatibilidad con el campo 'email_verified_at' de Laravel
     */
    public function getEmailVerifiedAtAttribute()
    {
        return $this->created_at; // Usar created_at como verificación
    }

    /**
     * Mantener compatibilidad con el campo 'remember_token' de Laravel
     */
    public function getRememberTokenAttribute()
    {
        return null; // No usamos remember tokens en UsuarioSisu
    }

    /**
     * Mantener compatibilidad con el campo 'remember_token' de Laravel
     */
    public function setRememberTokenAttribute($value)
    {
        // No almacenar remember tokens
    }

    /**
     * Mantener compatibilidad con el método de Laravel
     */
    public function getRememberTokenName()
    {
        return 'remember_token';
    }
}
