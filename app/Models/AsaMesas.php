<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Mesas de votación asamblea
 */
class AsaMesas extends Model
{
    use HasFactory;

    protected $table = 'asa_mesas';

    protected $fillable = [
        'codigo',
        'cedtra_responsable',
        'estado',
        'consenso_id',
        'hora_apertura',
        'hora_cierre_mesa',
        'cantidad_votantes',
        'cantidad_votos',
        'create_at',
        'update_at',
    ];

    protected $casts = [
        'hora_apertura' => 'datetime',
        'hora_cierre_mesa' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $dates = [
        'hora_apertura',
        'hora_cierre_mesa',
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
     * Relación con el consenso
     */
    public function consenso()
    {
        return $this->belongsTo(AsaConsenso::class, 'consenso_id');
    }

    /**
     * Relación con el responsable (trabajador)
     */
    public function responsable()
    {
        return $this->belongsTo(AsaTrabajadores::class, 'cedtra_responsable', 'cedtra');
    }

    /**
     * Relación con la asamblea
     */
    public function asamblea()
    {
        return $this->belongsTo(AsaAsamblea::class, 'asamblea_id');
    }

    /**
     * Scope para mesas abiertas
     */
    public function scopeAbiertas($query)
    {
        return $query->where('estado', 'A');
    }

    /**
     * Scope para mesas cerradas
     */
    public function scopeCerradas($query)
    {
        return $query->where('estado', 'C');
    }

    /**
     * Verificar si está abierta
     */
    public function estaAbierta()
    {
        return $this->estado === 'A';
    }

    /**
     * Verificar si está cerrada
     */
    public function estaCerrada()
    {
        return $this->estado === 'C';
    }

    /**
     * Abrir mesa
     */
    public function abrir()
    {
        $this->estado = 'A';
        $this->hora_apertura = now();
        $this->save();
    }

    /**
     * Cerrar mesa
     */
    public function cerrar()
    {
        $this->estado = 'C';
        $this->hora_cierre_mesa = now();
        $this->save();
    }

    /**
     * Incrementar cantidad de votantes
     */
    public function incrementarVotantes()
    {
        $this->increment('cantidad_votantes');
    }

    /**
     * Incrementar cantidad de votos
     */
    public function incrementarVotos()
    {
        $this->increment('cantidad_votos');
    }

    /**
     * Obtener nombre del responsable
     */
    public function getNombreResponsableAttribute()
    {
        return $this->responsable ? $this->responsable->nombre_completo : 'Sin asignar';
    }

    /**
     * Obtener porcentaje de participación
     */
    public function getPorcentajeParticipacionAttribute()
    {
        if ($this->cantidad_votantes == 0) {
            return 0;
        }
        return round(($this->cantidad_votos / $this->cantidad_votantes) * 100, 2);
    }

    /**
     * Obtener tiempo de apertura en formato legible
     */
    public function getTiempoAperturaAttribute()
    {
        if (!$this->hora_apertura) {
            return 'No abierta';
        }

        return $this->hora_apertura->diffForHumans();
    }
}
