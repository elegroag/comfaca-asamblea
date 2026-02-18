<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Menú lateral del sistema
 */
class Sidebar extends Model
{
    use HasFactory;

    protected $table = 'sidebar';

    protected $fillable = [
        'label',
        'estado',
        'resource_router',
        'orden',
        'sidebar_id',
        'ambiente',
        'icon',
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
     * Relación con el padre
     */
    public function padre()
    {
        return $this->belongsTo(Sidebar::class, 'sidebar_id');
    }

    /**
     * Relación con los hijos
     */
    public function hijos()
    {
        return $this->hasMany(Sidebar::class, 'sidebar_id')->orderBy('orden');
    }

    /**
     * Relación con los permisos
     */
    public function permisos()
    {
        return $this->hasMany(SidebarPermisos::class, 'sidebar_id');
    }

    /**
     * Scope para elementos activos
     */
    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }

    /**
     * Scope para elementos inactivos
     */
    public function scopeInactivos($query)
    {
        return $query->where('estado', 'inactivo');
    }

    /**
     * Scope para elementos raíz (sin padre)
     */
    public function scopeRaiz($query)
    {
        return $query->whereNull('sidebar_id');
    }

    /**
     * Scope para elementos por ambiente
     */
    public function scopePorAmbiente($query, $ambiente)
    {
        return $query->where('ambiente', $ambiente);
    }

    /**
     * Scope para elementos para todos los ambientes
     */
    public function scopeParaTodos($query)
    {
        return $query->where('ambiente', 'todos');
    }

    /**
     * Scope para elementos por orden
     */
    public function scopeOrdenados($query)
    {
        return $query->orderBy('orden');
    }

    /**
     * Verificar si está activo
     */
    public function estaActivo()
    {
        return $this->estado === 'activo';
    }

    /**
     * Verificar si es un elemento raíz
     */
    public function esRaiz()
    {
        return is_null($this->sidebar_id);
    }

    /**
     * Verificar si tiene hijos
     */
    public function tieneHijos()
    {
        return $this->hijos()->exists();
    }

    /**
     * Verificar si es para todos los ambientes
     */
    public function esParaTodos()
    {
        return $this->ambiente === 'todos';
    }

    /**
     * Activar elemento
     */
    public function activar()
    {
        $this->estado = 'activo';
        $this->save();
    }

    /**
     * Desactivar elemento
     */
    public function desactivar()
    {
        $this->estado = 'inactivo';
        $this->save();
    }

    /**
     * Obtener array de ambientes
     */
    public static function getAmbientesArray()
    {
        return [
            'desarrollo' => 'Desarrollo',
            'pruebas' => 'Pruebas',
            'produccion' => 'Producción',
            'todos' => 'Todos',
        ];
    }

    /**
     * Obtener descripción del ambiente
     */
    public function getAmbienteDescripcionAttribute()
    {
        $ambientes = self::getAmbientesArray();
        return $ambientes[$this->ambiente] ?? 'No definido';
    }

    /**
     * Obtener ruta completa del recurso
     */
    public function getRutaCompletaAttribute()
    {
        return $this->resource_router ? '/' . $this->resource_router : '#';
    }

    /**
     * Obtener icono con formato
     */
    public function getIconoFormateadoAttribute()
    {
        return $this->icon ?? 'nc-icon nc-bullet-list-67';
    }

    /**
     * Obtener color del estado para UI
     */
    public function getColorEstadoAttribute()
    {
        return $this->estaActivo() ? 'success' : 'danger';
    }

    /**
     * Obtener color del ambiente para UI
     */
    public function getColorAmbienteAttribute()
    {
        $colores = [
            'desarrollo' => 'info',
            'pruebas' => 'warning',
            'produccion' => 'success',
            'todos' => 'primary',
        ];

        return $colores[$this->ambiente] ?? 'secondary';
    }

    /**
     * Verificar si el elemento es visible en el ambiente actual
     */
    public function esVisibleEnAmbiente($ambienteActual)
    {
        return $this->esParaTodos() || $this->ambiente === $ambienteActual;
    }

    /**
     * Obtener estructura jerárquica completa
     */
    public function getEstructuraCompletaAttribute()
    {
        $estructura = [
            'id' => $this->id,
            'label' => $this->label,
            'ruta' => $this->ruta_completa,
            'icono' => $this->icono_formateado,
            'estado' => $this->estado,
            'orden' => $this->orden,
            'tiene_hijos' => $this->tieneHijos(),
            'hijos' => []
        ];

        if ($this->tieneHijos()) {
            $estructura['hijos'] = $this->hijos()
                ->activos()
                ->ordenados()
                ->get()
                ->map(function ($hijo) {
                    return $hijo->estructura_completa;
                })
                ->toArray();
        }

        return $estructura;
    }

    /**
     * Obtener información completa del elemento
     */
    public function getInfoCompletaAttribute()
    {
        $info = "Label: {$this->label}\n";
        $info .= "Estado: {$this->estado}\n";
        $info .= "Ambiente: {$this->ambiente_descripcion}\n";
        $info .= "Orden: {$this->orden}";

        if ($this->resource_router) {
            $info .= "\nRuta: {$this->ruta_completa}";
        }

        if ($this->icon) {
            $info .= "\nIcono: {$this->icon}";
        }

        if ($this->esRaiz()) {
            $info .= "\nTipo: Elemento raíz";
        } else {
            $info .= "\nPadre: " . ($this->padre ? $this->padre->label : 'No encontrado');
        }

        if ($this->tieneHijos()) {
            $info .= "\nHijos: " . $this->hijos()->count();
        }

        return $info;
    }
}