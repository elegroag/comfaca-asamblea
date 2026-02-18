<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Asambleas del sistema
 */
class AsaAsamblea extends Model
{
    use HasFactory;

    protected $table = 'asa_asambleas';

    protected $fillable = [
        'estado',
        'fecha_programada',
        'detalle',
        'modo',
    ];

    protected $casts = [
        'fecha_programada' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $dates = [
        'fecha_programada',
        'created_at',
        'updated_at'
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
     * Relación con usuarios de la asamblea
     */
    public function usuarios()
    {
        return $this->hasMany(AsaUsuarios::class, 'asamblea_id');
    }

    /**
     * Relación con mesas de la asamblea
     */
    public function mesas()
    {
        return $this->hasMany(AsaMesas::class, 'asamblea_id');
    }

    /**
     * Relación con consensos de la asamblea
     */
    public function consensos()
    {
        return $this->hasMany(AsaConsenso::class, 'asamblea_id');
    }

    /**
     * Relación con interventores de la asamblea
     */
    public function interventores()
    {
        return $this->hasMany(AsaInterventores::class, 'asamblea_id');
    }

    /**
     * Relación con representantes de la asamblea
     */
    public function representantes()
    {
        return $this->hasMany(AsaRepresentantes::class, 'asamblea_id');
    }

    /**
     * Relación con correos de la asamblea
     */
    public function correos()
    {
        return $this->hasMany(AsaCorreos::class, 'asamblea_id');
    }

    /**
     * Scope para asambleas programadas
     */
    public function scopeProgramadas($query)
    {
        return $query->where('estado', 'programada');
    }

    /**
     * Scope para asambleas activas
     */
    public function scopeActivas($query)
    {
        return $query->where('estado', 'activa');
    }

    /**
     * Scope para asambleas finalizadas
     */
    public function scopeFinalizadas($query)
    {
        return $query->where('estado', 'finalizada');
    }

    /**
     * Scope para asambleas canceladas
     */
    public function scopeCanceladas($query)
    {
        return $query->where('estado', 'cancelada');
    }

    /**
     * Scope para asambleas por modo
     */
    public function scopePorModo($query, $modo)
    {
        return $query->where('modo', $modo);
    }

    /**
     * Scope para asambleas futuras
     */
    public function scopeFuturas($query)
    {
        return $query->where('fecha_programada', '>', now());
    }

    /**
     * Scope para asambleas pasadas
     */
    public function scopePasadas($query)
    {
        return $query->where('fecha_programada', '<', now());
    }

    /**
     * Verificar si está programada
     */
    public function estaProgramada()
    {
        return $this->estado === 'programada';
    }

    /**
     * Verificar si está activa
     */
    public function estaActiva()
    {
        return $this->estado === 'activa';
    }

    /**
     * Verificar si está finalizada
     */
    public function estaFinalizada()
    {
        return $this->estado === 'finalizada';
    }

    /**
     * Verificar si está cancelada
     */
    public function estaCancelada()
    {
        return $this->estado === 'cancelada';
    }

    /**
     * Activar asamblea
     */
    public function activar()
    {
        $this->estado = 'activa';
        $this->save();
    }

    /**
     * Finalizar asamblea
     */
    public function finalizar()
    {
        $this->estado = 'finalizada';
        $this->save();
    }

    /**
     * Cancelar asamblea
     */
    public function cancelar()
    {
        $this->estado = 'cancelada';
        $this->save();
    }

    /**
     * Obtener descripción del modo
     */
    public function getModoDescripcionAttribute()
    {
        $modos = [
            'P' => 'Presencial',
            'V' => 'Virtual',
            'H' => 'Híbrido',
        ];

        return $modos[$this->modo] ?? 'No definido';
    }

    /**
     * Obtener descripción del estado
     */
    public function getEstadoDescripcionAttribute()
    {
        $estados = [
            'programada' => 'Programada',
            'activa' => 'Activa',
            'finalizada' => 'Finalizada',
            'cancelada' => 'Cancelada',
        ];

        return $estados[$this->estado] ?? 'No definido';
    }

    /**
     * Obtener número de participantes
     */
    public function getNumeroParticipantesAttribute()
    {
        return $this->usuarios()->count();
    }

    /**
     * Obtener número de mesas
     */
    public function getNumeroMesasAttribute()
    {
        return $this->mesas()->count();
    }

    /**
     * Obtener número de consensos
     */
    public function getNumeroConsensosAttribute()
    {
        return $this->consensos()->count();
    }

    /**
     * Verificar si la asamblea está en curso
     */
    public function estaEnCurso()
    {
        if (!$this->fecha_programada) {
            return false;
        }

        $now = now();
        $start = $this->fecha_programada->copy()->subHours(1);
        $end = $this->fecha_programada->copy()->addHours(8);

        return $now->between($start, $end) && $this->estaActiva();
    }

    /**
     * Obtener color del estado para UI
     */
    public function getColorEstadoAttribute()
    {
        $colores = [
            'programada' => 'info',
            'activa' => 'success',
            'finalizada' => 'secondary',
            'cancelada' => 'danger',
        ];

        return $colores[$this->estado] ?? 'light';
    }

    /**
     * Obtener color del modo para UI
     */
    public function getColorModoAttribute()
    {
        $colores = [
            'P' => 'primary',
            'V' => 'info',
            'H' => 'warning',
        ];

        return $colores[$this->modo] ?? 'secondary';
    }
}
