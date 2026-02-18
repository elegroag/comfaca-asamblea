<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Criterios de rechazo para asamblea
 * Criterios utilizados para rechazar poderes y documentos
 */
class CriteriosRechazos extends Model
{
    use HasFactory;

    protected $table = 'criterios_rechazos';

    protected $fillable = [
        'detalle',
        'estatutos',
        'tipo',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
    ];

    const TIPO_PODERES_REVOCADOS = 'POD';
    const TIPO_PODERDANTE = 'POA';
    const TIPO_CARTERA = 'CAR';
    const TIPO_FUNCIONARIO_CAJA = 'TRA';
    const TIPO_NO_HABIL = 'HAB';

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
     * Relación con los rechazos que usan este criterio
     */
    public function rechazos()
    {
        return $this->hasMany(Rechazos::class, 'criterio_id');
    }

    /**
     * Scope para criterios por tipo
     */
    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    /**
     * Scope para criterios de poderes revocados
     */
    public function scopePoderesRevocados($query)
    {
        return $query->where('tipo', self::TIPO_PODERES_REVOCADOS);
    }

    /**
     * Scope para criterios de poderdante
     */
    public function scopePoderdante($query)
    {
        return $query->where('tipo', self::TIPO_PODERDANTE);
    }

    /**
     * Scope para criterios de cartera
     */
    public function scopeCartera($query)
    {
        return $query->where('tipo', self::TIPO_CARTERA);
    }

    /**
     * Scope para criterios de funcionario de caja
     */
    public function scopeFuncionarioCaja($query)
    {
        return $query->where('tipo', self::TIPO_FUNCIONARIO_CAJA);
    }

    /**
     * Scope para criterios de no hábil
     */
    public function scopeNoHabil($query)
    {
        return $query->where('tipo', self::TIPO_NO_HABIL);
    }

    /**
     * Verificar si es criterio de poderes revocados
     */
    public function esPoderesRevocados()
    {
        return $this->tipo === self::TIPO_PODERES_REVOCADOS;
    }

    /**
     * Verificar si es criterio de poderdante
     */
    public function esPoderdante()
    {
        return $this->tipo === self::TIPO_PODERDANTE;
    }

    /**
     * Verificar si es criterio de cartera
     */
    public function esCartera()
    {
        return $this->tipo === self::TIPO_CARTERA;
    }

    /**
     * Verificar si es criterio de funcionario de caja
     */
    public function esFuncionarioCaja()
    {
        return $this->tipo === self::TIPO_FUNCIONARIO_CAJA;
    }

    /**
     * Verificar si es criterio de no hábil
     */
    public function esNoHabil()
    {
        return $this->tipo === self::TIPO_NO_HABIL;
    }

    /**
     * Obtener array de tipos
     */
    public static function getTiposArray()
    {
        return [
            self::TIPO_PODERES_REVOCADOS => 'Poderes Revocados',
            self::TIPO_PODERDANTE => 'Poderdante',
            self::TIPO_CARTERA => 'Cartera',
            self::TIPO_FUNCIONARIO_CAJA => 'Funcionario Caja',
            self::TIPO_NO_HABIL => 'No Hábil Concepto Juridico',
        ];
    }

    /**
     * Obtener descripción del tipo
     */
    public function getTipoDescripcionAttribute()
    {
        $tipos = self::getTiposArray();
        return $tipos[$this->tipo] ?? 'No definido';
    }

    /**
     * Obtener resumen del criterio
     */
    public function getResumenAttribute()
    {
        return "{$this->tipo_descripcion}: {$this->detalle}";
    }

    /**
     * Obtener color del tipo para UI
     */
    public function getColorTipoAttribute()
    {
        $colores = [
            self::TIPO_PODERES_REVOCADOS => 'danger',
            self::TIPO_PODERDANTE => 'warning',
            self::TIPO_CARTERA => 'info',
            self::TIPO_FUNCIONARIO_CAJA => 'primary',
            self::TIPO_NO_HABIL => 'secondary',
        ];

        return $colores[$this->tipo] ?? 'light';
    }

    /**
     * Obtener número de rechazos asociados
     */
    public function getNumeroRechazosAttribute()
    {
        return $this->rechazos()->count();
    }

    /**
     * Verificar si el criterio está en uso
     */
    public function estaEnUso()
    {
        return $this->numero_rechazos > 0;
    }

    /**
     * Verificar si se puede eliminar el criterio
     */
    public function sePuedeEliminar()
    {
        return !$this->estaEnUso();
    }

    /**
     * Obtener estadísticas de uso
     */
    public function getEstadisticasUsoAttribute()
    {
        $rechazos = $this->rechazos();
        
        return [
            'total' => $rechazos->count(),
            'hoy' => $rechazos->whereDate('dia', now()->toDateString())->count(),
            'ultima_semana' => $rechazos->where('dia', '>=', now()->subDays(7))->count(),
            'ultimo_mes' => $rechazos->where('dia', '>=', now()->subDays(30))->count(),
        ];
    }

    /**
     * Obtener información completa del criterio
     */
    public function getInfoCompletaAttribute()
    {
        $info = "Tipo: {$this->tipo_descripcion}\n";
        $info .= "Descripción: {$this->detalle}\n";
        
        if ($this->estatutos) {
            $info .= "Estatutos: {$this->estatutos}\n";
        }
        
        $info .= "Veces utilizado: {$this->numero_rechazos}";

        return $info;
    }

    /**
     * Buscar criterios por texto
     */
    public static function buscar($texto)
    {
        return self::where(function ($query) use ($texto) {
                        $query->where('detalle', 'like', "%{$texto}%")
                              ->orWhere('estatutos', 'like', "%{$texto}%")
                              ->orWhere('tipo', 'like', "%{$texto}%");
                    })
                    ->get();
    }
}