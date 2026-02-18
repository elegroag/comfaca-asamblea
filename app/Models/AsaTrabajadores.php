<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Trabajadores del sistema
 */
class AsaTrabajadores extends Model
{
    use HasFactory;

    protected $table = 'asa_trabajadores';

    protected $fillable = [
        'cedtra',
        'nombre',
        'apellido',
        'email',
        'telefono',
        'departamento',
        'cargo',
        'estado',
        'fecha_ingreso',
    ];

    protected $casts = [
        'fecha_ingreso' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $dates = [
        'fecha_ingreso',
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
     * Relación con usuarios de asambleas
     */
    public function usuariosAsamblea()
    {
        return $this->hasMany(AsaUsuarios::class, 'cedtra', 'cedtra');
    }

    /**
     * Relación con mesas donde es responsable
     */
    public function mesasResponsable()
    {
        return $this->hasMany(AsaMesas::class, 'cedtra_responsable', 'cedtra');
    }

    /**
     * Relación con interventores
     */
    public function interventores()
    {
        return $this->hasMany(AsaInterventores::class, 'cedtra', 'cedtra');
    }

    /**
     * Relación con representantes
     */
    public function representantes()
    {
        return $this->hasMany(AsaRepresentantes::class, 'cedtra', 'cedtra');
    }

    /**
     * Scope para trabajadores activos
     */
    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }

    /**
     * Scope para trabajadores inactivos
     */
    public function scopeInactivos($query)
    {
        return $query->where('estado', 'inactivo');
    }

    /**
     * Scope para buscar por nombre completo
     */
    public function scopePorNombre($query, $nombre)
    {
        return $query->where(function ($q) use ($nombre) {
            $q->where('nombre', 'like', "%{$nombre}%")
              ->orWhere('apellido', 'like', "%{$nombre}%");
        });
    }

    /**
     * Scope para buscar por departamento
     */
    public function scopePorDepartamento($query, $departamento)
    {
        return $query->where('departamento', $departamento);
    }

    /**
     * Scope para buscar por cargo
     */
    public function scopePorCargo($query, $cargo)
    {
        return $query->where('cargo', $cargo);
    }

    /**
     * Obtener nombre completo
     */
    public function getNombreCompletoAttribute()
    {
        return trim("{$this->nombre} {$this->apellido}");
    }

    /**
     * Verificar si está activo
     */
    public function estaActivo()
    {
        return $this->estado === 'activo';
    }

    /**
     * Activar trabajador
     */
    public function activar()
    {
        $this->estado = 'activo';
        $this->save();
    }

    /**
     * Desactivar trabajador
     */
    public function desactivar()
    {
        $this->estado = 'inactivo';
        $this->save();
    }

    /**
     * Obtener antigüedad en años
     */
    public function getAntiguedadAniosAttribute()
    {
        if (!$this->fecha_ingreso) {
            return 0;
        }
        
        return $this->fecha_ingreso->diffInYears(now());
    }

    /**
     * Obtener antigüedad en formato legible
     */
    public function getAntiguedadLegibleAttribute()
    {
        if (!$this->fecha_ingreso) {
            return 'N/A';
        }
        
        return $this->fecha_ingreso->diffForHumans();
    }

    /**
     * Verificar si puede participar en asambleas
     */
    public function puedeParticiparEnAsambleas()
    {
        return $this->estaActivo();
    }

    /**
     * Obtener número de asambleas en las que ha participado
     */
    public function getNumeroAsambleasAttribute()
    {
        return $this->usuariosAsamblea()->count();
    }

    /**
     * Obtener número de mesas que ha gestionado
     */
    public function getNumeroMesasGestionadasAttribute()
    {
        return $this->mesasResponsable()->count();
    }
}