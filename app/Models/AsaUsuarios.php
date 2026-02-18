<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Usuarios de asamblea
 */
class AsaUsuarios extends Model
{
    use HasFactory;

    protected $table = 'asa_usuarios';

    protected $fillable = [
        'rol',
        'estado',
        'asamblea_id',
        'cedtra',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
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
     * Relación con la asamblea
     */
    public function asamblea()
    {
        return $this->belongsTo(AsaAsamblea::class, 'asamblea_id');
    }

    /**
     * Relación con el trabajador (si existe en otra tabla)
     */
    public function trabajador()
    {
        return $this->belongsTo(AsaTrabajadores::class, 'cedtra', 'cedtra');
    }

    /**
     * Scope para usuarios por asamblea
     */
    public function scopePorAsamblea($query, $asambleaId)
    {
        return $query->where('asamblea_id', $asambleaId);
    }

    /**
     * Scope para usuarios por trabajador
     */
    public function scopePorTrabajador($query, $cedtra)
    {
        return $query->where('cedtra', $cedtra);
    }

    /**
     * Scope para usuarios por rol
     */
    public function scopePorRol($query, $rol)
    {
        return $query->where('rol', $rol);
    }

    /**
     * Scope para usuarios por estado
     */
    public function scopePorEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Scope para usuarios activos
     */
    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }

    /**
     * Scope para usuarios inactivos
     */
    public function scopeInactivos($query)
    {
        return $query->where('estado', 'inactivo');
    }

    /**
     * Scope para administradores
     */
    public function scopeAdministradores($query)
    {
        return $query->where('rol', 'administrador');
    }

    /**
     * Scope para votantes
     */
    public function scopeVotantes($query)
    {
        return $query->where('rol', 'votante');
    }

    /**
     * Scope para interventores
     */
    public function scopeInterventores($query)
    {
        return $query->where('rol', 'interventor');
    }

    /**
     * Scope para observadores
     */
    public function scopeObservadores($query)
    {
        return $query->where('rol', 'observador');
    }

    /**
     * Verificar si está activo
     */
    public function estaActivo()
    {
        return $this->estado === 'activo';
    }

    /**
     * Verificar si está inactivo
     */
    public function estaInactivo()
    {
        return $this->estado === 'inactivo';
    }

    /**
     * Verificar si es administrador
     */
    public function esAdministrador()
    {
        return $this->rol === 'administrador';
    }

    /**
     * Verificar si es votante
     */
    public function esVotante()
    {
        return $this->rol === 'votante';
    }

    /**
     * Verificar si es interventor
     */
    public function esInterventor()
    {
        return $this->rol === 'interventor';
    }

    /**
     * Verificar si es observador
     */
    public function esObservador()
    {
        return $this->rol === 'observador';
    }

    /**
     * Activar usuario
     */
    public function activar()
    {
        $this->estado = 'activo';
        $this->save();
    }

    /**
     * Desactivar usuario
     */
    public function desactivar()
    {
        $this->estado = 'inactivo';
        $this->save();
    }

    /**
     * Obtener array de roles
     */
    public static function getRolesArray()
    {
        return [
            'administrador' => 'Administrador',
            'votante' => 'Votante',
            'interventor' => 'Interventor',
            'observador' => 'Observador',
        ];
    }

    /**
     * Obtener descripción del rol
     */
    public function getRolDescripcionAttribute()
    {
        $roles = self::getRolesArray();
        return $roles[$this->rol] ?? 'No definido';
    }

    /**
     * Obtener descripción del estado
     */
    public function getEstadoDescripcionAttribute()
    {
        $estados = [
            'activo' => 'Activo',
            'inactivo' => 'Inactivo',
        ];

        return $estados[$this->estado] ?? 'No definido';
    }

    /**
     * Obtener nombre del trabajador
     */
    public function getNombreTrabajadorAttribute()
    {
        return $this->trabajador ? $this->trabajador->nombre_completo : 'No encontrado';
    }

    /**
     * Obtener resumen del usuario
     */
    public function getResumenAttribute()
    {
        return "{$this->nombre_trabajador} - {$this->rol_descripcion} ({$this->estado_descripcion})";
    }

    /**
     * Obtener color del estado para UI
     */
    public function getColorEstadoAttribute()
    {
        return $this->estaActivo() ? 'success' : 'danger';
    }

    /**
     * Obtener color del rol para UI
     */
    public function getColorRolAttribute()
    {
        $colores = [
            'administrador' => 'danger',
            'votante' => 'primary',
            'interventor' => 'warning',
            'observador' => 'info',
        ];

        return $colores[$this->rol] ?? 'secondary';
    }

    /**
     * Verificar si puede participar en la asamblea
     */
    public function puedeParticipar()
    {
        return $this->estaActivo() && $this->asamblea && $this->asamblea->estaActiva();
    }

    /**
     * Verificar si puede votar
     */
    public function puedeVotar()
    {
        return $this->puedeParticipar() && $this->esVotante();
    }

    /**
     * Obtener información completa del usuario
     */
    public function getInfoCompletaAttribute()
    {
        $info = "Trabajador: {$this->nombre_trabajador}\n";
        $info .= "Rol: {$this->rol_descripcion}\n";
        $info .= "Estado: {$this->estado_descripcion}\n";
        $info .= "Asamblea: " . ($this->asamblea ? $this->asamblea->detalle : 'N/A');

        return $info;
    }
}