<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Consensos de asamblea
 * Votaciones y acuerdos producidos en asambleas
 */
class AsaConsenso extends Model
{
    use HasFactory;

    protected $table = 'asa_consensos';

    protected $fillable = [
        'asamblea_id',
        'titulo',
        'descripcion',
        'estado',
        'tipo_votacion',
        'votos_favor',
        'votos_contra',
        'votos_abstencion',
        'votos_blancos',
        'votos_nulos',
        'total_votantes',
        'fecha_inicio',
        'fecha_fin',
        'observaciones',
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $dates = [
        'fecha_inicio',
        'fecha_fin',
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
     * Relación con las mesas que participaron en este consenso
     */
    public function mesas()
    {
        return $this->hasMany(AsaMesas::class, 'consenso_id');
    }

    /**
     * Scope para consensos activos
     */
    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }

    /**
     * Scope para consensos finalizados
     */
    public function scopeFinalizados($query)
    {
        return $query->where('estado', 'finalizado');
    }

    /**
     * Scope para consensos en votación
     */
    public function scopeEnVotacion($query)
    {
        return $query->where('estado', 'votacion');
    }

    /**
     * Iniciar votación
     */
    public function iniciarVotacion()
    {
        $this->estado = 'votacion';
        $this->fecha_inicio = now();
        $this->save();
    }

    /**
     * Finalizar votación
     */
    public function finalizarVotacion()
    {
        $this->estado = 'finalizado';
        $this->fecha_fin = now();
        $this->save();
    }

    /**
     * Verificar si está en votación
     */
    public function estaEnVotacion()
    {
        return $this->estado === 'votacion';
    }

    /**
     * Verificar si está finalizado
     */
    public function estaFinalizado()
    {
        return $this->estado === 'finalizado';
    }

    /**
     * Obtener total de votos válidos
     */
    public function getTotalVotosValidosAttribute()
    {
        return $this->votos_favor + $this->votos_contra + $this->votos_abstencion;
    }

    /**
     * Obtener porcentaje de votos favor
     */
    public function getPorcentajeFavorAttribute()
    {
        $total = $this->total_votos_validos;
        if ($total == 0) return 0;
        
        return round(($this->votos_favor / $total) * 100, 2);
    }

    /**
     * Obtener porcentaje de votos contra
     */
    public function getPorcentajeContraAttribute()
    {
        $total = $this->total_votos_validos;
        if ($total == 0) return 0;
        
        return round(($this->votos_contra / $total) * 100, 2);
    }

    /**
     * Obtener porcentaje de abstenciones
     */
    public function getPorcentajeAbstencionAttribute()
    {
        $total = $this->total_votos_validos;
        if ($total == 0) return 0;
        
        return round(($this->votos_abstencion / $total) * 100, 2);
    }

    /**
     * Verificar si hay mayoría simple (más del 50% de los votos válidos)
     */
    public function tieneMayoriaSimple()
    {
        return $this->porcentaje_favor > 50;
    }

    /**
     * Verificar si hay mayoría calificada (más del 2/3 de los votos válidos)
     */
    public function tieneMayoriaCalificada()
    {
        return $this->porcentaje_favor > 66.67;
    }

    /**
     * Obtener resultado del consenso
     */
    public function getResultadoAttribute()
    {
        if (!$this->estaFinalizado()) {
            return 'Pendiente';
        }

        if ($this->tieneMayoriaCalificada()) {
            return 'Aprobado con mayoría calificada';
        } elseif ($this->tieneMayoriaSimple()) {
            return 'Aprobado con mayoría simple';
        } else {
            return 'Rechazado';
        }
    }

    /**
     * Obtener descripción del estado
     */
    public function getEstadoDescripcionAttribute()
    {
        $estados = [
            'activo' => 'Activo',
            'votacion' => 'En Votación',
            'finalizado' => 'Finalizado',
        ];

        return $estados[$this->estado] ?? 'No definido';
    }

    /**
     * Obtener descripción del tipo de votación
     */
    public function getTipoVotacionDescripcionAttribute()
    {
        $tipos = [
            'simple' => 'Mayoría Simple',
            'calificada' => 'Mayoría Calificada',
            'unanime' => 'Unánime',
        ];

        return $tipos[$this->tipo_votacion] ?? 'No definido';
    }

    /**
     * Obtener color del estado para UI
     */
    public function getColorEstadoAttribute()
    {
        $colores = [
            'activo' => 'info',
            'votacion' => 'warning',
            'finalizado' => 'success',
        ];

        return $colores[$this->estado] ?? 'secondary';
    }

    /**
     * Obtener color del resultado para UI
     */
    public function getColorResultadoAttribute()
    {
        if (!$this->estaFinalizado()) {
            return 'secondary';
        }

        if ($this->tieneMayoriaCalificada()) {
            return 'success';
        } elseif ($this->tieneMayoriaSimple()) {
            return 'info';
        } else {
            return 'danger';
        }
    }
}