<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Rechazos del sistema
 * Registro de rechazos en el proceso de ingreso a asambleas
 */
class Rechazos extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'rechazos';

    protected $fillable = [
        'dia',
        'hora',
        'regingre_id',
        'criterio_id',
    ];

    protected $casts = [
        'dia' => 'date',
        'hora' => 'datetime',
        'create_at' => 'datetime',
        'update_at' => 'datetime',
    ];

    protected $dates = [
        'dia',
        'hora',
        'create_at',
        'update_at',
        'deleted_at',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->create_at = now();
            $model->update_at = now();
        });

        static::updating(function ($model) {
            $model->update_at = now();
        });
    }

    /**
     * Relación con el registro de ingreso
     */
    public function registroIngreso()
    {
        return $this->belongsTo(RegistroIngresos::class, 'regingre_id');
    }

    /**
     * Relación con el criterio de rechazo
     */
    public function criterio()
    {
        return $this->belongsTo(CriteriosRechazos::class, 'criterio_id');
    }

    /**
     * Scope para rechazos por fecha
     */
    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('dia', $fecha);
    }

    /**
     * Scope para rechazos por rango de fechas
     */
    public function scopePorRangoFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('dia', [$fechaInicio, $fechaFin]);
    }

    /**
     * Scope para rechazos de hoy
     */
    public function scopeDeHoy($query)
    {
        return $query->whereDate('dia', now()->toDateString());
    }

    /**
     * Scope para rechazos por criterio
     */
    public function scopePorCriterio($query, $criterioId)
    {
        return $query->where('criterio_id', $criterioId);
    }

    /**
     * Scope para rechazos por registro de ingreso
     */
    public function scopePorRegistroIngreso($query, $regingreId)
    {
        return $query->where('regingre_id', $regingreId);
    }

    /**
     * Obtener fecha y hora formateadas
     */
    public function getFechaHoraFormateadaAttribute()
    {
        if ($this->dia && $this->hora) {
            return $this->dia->format('Y-m-d') . ' ' . $this->hora->format('H:i:s');
        }
        
        return $this->dia ? $this->dia->format('Y-m-d') : 'No definida';
    }

    /**
     * Obtener descripción del criterio de rechazo
     */
    public function getDescripcionCriterioAttribute()
    {
        return $this->criterio ? $this->criterio->descripcion : 'Criterio no encontrado';
    }

    /**
     * Obtener información del registro de ingreso
     */
    public function getInfoRegistroAttribute()
    {
        if ($this->registroIngreso) {
            $trabajador = $this->registroIngreso->trabajador;
            return $trabajador ? $trabajador->nombre_completo : 'Trabajador no encontrado';
        }
        
        return 'Registro no encontrado';
    }

    /**
     * Obtener resumen del rechazo
     */
    public function getResumenAttribute()
    {
        return "{$this->info_registro} - {$this->descripcion_criterio} ({$this->fecha_hora_formateada})";
    }

    /**
     * Verificar si el rechazo es reciente (últimas 24 horas)
     */
    public function esReciente()
    {
        return $this->hora && $this->hora->diffInHours(now()) < 24;
    }

    /**
     * Verificar si el rechazo es de hoy
     */
    public function esDeHoy()
    {
        return $this->dia && $this->dia->isToday();
    }

    /**
     * Obtener color para UI según antigüedad
     */
    public function getColorAntiguedadAttribute()
    {
        if ($this->esReciente()) {
            return 'danger'; // Rojo para rechazos recientes
        } elseif ($this->esDeHoy()) {
            return 'warning'; // Naranja para rechazos de hoy
        } else {
            return 'secondary'; // Gris para rechazos antiguos
        }
    }

    /**
     * Crear un rechazo automáticamente
     */
    public static function crearRechazo($regingreId, $criterioId)
    {
        return self::create([
            'dia' => now()->toDateString(),
            'hora' => now(),
            'regingre_id' => $regingreId,
            'criterio_id' => $criterioId,
        ]);
    }

    /**
     * Obtener estadísticas de rechazos por criterio
     */
    public static function getEstadisticasPorCriterio($fechaInicio = null, $fechaFin = null)
    {
        $query = self::with('criterio');
        
        if ($fechaInicio && $fechaFin) {
            $query->porRangoFechas($fechaInicio, $fechaFin);
        }
        
        return $query->get()
                    ->groupBy('criterio_id')
                    ->map(function ($rechazos) {
                        $criterio = $rechazos->first()->criterio;
                        return [
                            'criterio' => $criterio ? $criterio->descripcion : 'Sin criterio',
                            'cantidad' => $rechazos->count(),
                            'porcentaje' => 0, // Se calculará después
                        ];
                    });
    }

    /**
     * Obtener información completa del rechazo
     */
    public function getInfoCompletaAttribute()
    {
        $info = "Fecha: {$this->fecha_hora_formateada}\n";
        $info .= "Registro: {$this->info_registro}\n";
        $info .= "Criterio: {$this->descripcion_criterio}";

        if ($this->registroIngreso) {
            $info .= "\nDetalles del registro:";
            $info .= "\n- Cédula: {$this->registroIngreso->cedtra}";
            $info .= "\n- Asamblea: " . ($this->registroIngreso->asamblea_id ?? 'N/A');
        }

        return $info;
    }
}