<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Poderes de asamblea
 * Documentos que autorizan representación legal en asambleas
 */
class Poderes extends Model
{
    use HasFactory;

    protected $table = 'poderes';

    protected $fillable = [
        'documento',
        'fecha',
        'estado',
        'radicado',
        'poderdante_nit', // poderdante
        'poderdante_repleg',
        'poderdante_cedrep',
        'apoderado_nit', // apoderado
        'apoderado_repleg',
        'apoderado_cedrep',
        'notificacion',
        'asamblea_id',
    ];

    protected $casts = [
        'fecha' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $dates = [
        'fecha',
        'created_at',
        'updated_at',
    ];

    const ESTADO_RECHAZADO = 'I';
    const ESTADO_APROBADO = 'A';
    const ESTADO_REVOCADO = 'R';

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
     * Relación con el apoderado (empresa)
     */
    public function apoderado()
    {
        return $this->belongsTo(Empresas::class, 'apoderado_nit', 'nit');
    }

    /**
     * Relación con el poderdante (empresa)
     */
    public function poderdante()
    {
        return $this->belongsTo(Empresas::class, 'poderdante_nit', 'nit');
    }

    /**
     * Relación con el representante legal del apoderado si existe
     */
    public function representanteApoderado()
    {
        return $this->belongsTo(AsaTrabajadores::class, 'apoderado_cedrep', 'cedtra');
    }

    /**
     * Relación con el representante legal del poderdante
     */
    public function representantePoderdante()
    {
        return $this->belongsTo(AsaTrabajadores::class, 'poderdante_cedrep', 'cedtra');
    }

    /**
     * Scope para poderes por estado
     */
    public function scopePorEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Scope para poderes aprobados
     */
    public function scopeAprobados($query)
    {
        return $query->where('estado', self::ESTADO_APROBADO);
    }

    /**
     * Scope para poderes rechazados
     */
    public function scopeRechazados($query)
    {
        return $query->where('estado', self::ESTADO_RECHAZADO);
    }

    /**
     * Scope para poderes revocados
     */
    public function scopeRevocados($query)
    {
        return $query->where('estado', self::ESTADO_REVOCADO);
    }

    /**
     * Scope para poderes por asamblea
     */
    public function scopePorAsamblea($query, $asambleaId)
    {
        return $query->where('asamblea_id', $asambleaId);
    }

    /**
     * Scope para buscar por documento
     */
    public function scopePorDocumento($query, $documento)
    {
        return $query->where('documento', $documento);
    }

    /**
     * Scope para buscar por radicado
     */
    public function scopePorRadicado($query, $radicado)
    {
        return $query->where('radicado', $radicado);
    }

    /**
     * Verificar si está aprobado
     */
    public function estaAprobado()
    {
        return $this->estado === self::ESTADO_APROBADO;
    }

    /**
     * Verificar si está rechazado
     */
    public function estaRechazado()
    {
        return $this->estado === self::ESTADO_RECHAZADO;
    }

    /**
     * Verificar si está revocado
     */
    public function estaRevocado()
    {
        return $this->estado === self::ESTADO_REVOCADO;
    }

    /**
     * Aprobar poder
     */
    public function aprobar()
    {
        $this->estado = self::ESTADO_APROBADO;
        $this->save();
    }

    /**
     * Rechazar poder
     */
    public function rechazar()
    {
        $this->estado = self::ESTADO_RECHAZADO;
        $this->save();
    }

    /**
     * Revocar poder
     */
    public function revocar()
    {
        $this->estado = self::ESTADO_REVOCADO;
        $this->save();
    }

    /**
     * Obtener array de estados
     */
    public static function getEstadosArray()
    {
        return [
            self::ESTADO_RECHAZADO => 'R',
            self::ESTADO_APROBADO => 'A',
            self::ESTADO_REVOCADO => 'R',
        ];
    }

    /**
     * Obtener descripción del estado
     */
    public function getEstadoDetalleAttribute()
    {
        $detalle = "";
        switch ($this->estado) {
            case self::ESTADO_RECHAZADO:
                $detalle = 'Rechazado';
                break;
            case self::ESTADO_APROBADO:
                $detalle = 'Aprobado';
                break;
            case self::ESTADO_REVOCADO:
                $detalle = 'Revocado'; //Revocado
                break;
        }
        return $detalle;
    }

    /**
     * Obtener nombre del apoderado
     */
    public function getNombreApoderadoAttribute()
    {
        return $this->apoderado ? $this->apoderado->razsoc : 'No encontrado';
    }

    /**
     * Obtener nombre del poderdante
     */
    public function getNombrePoderdanteAttribute()
    {
        return $this->poderdante ? $this->poderdante->razsoc : 'No encontrado';
    }

    /**
     * Obtener nombre del representante del apoderado
     */
    public function getNombreRepresentanteApoderadoAttribute()
    {
        if ($this->representanteApoderado) {
            return $this->representanteApoderado->nombre_completo;
        }
        return $this->repleg1;
    }

    /**
     * Obtener nombre del representante del poderdante
     */
    public function getNombreRepresentantePoderdanteAttribute()
    {
        if ($this->representantePoderdante) {
            return $this->representantePoderdante->nombre_completo;
        }
        return $this->repleg2;
    }

    /**
     * Obtener resumen del poder
     */
    public function getResumenAttribute()
    {
        return "Poder: {$this->nombre_poderdante} → {$this->nombre_apoderado} ({$this->estado_detalle})";
    }

    /**
     * Obtener color del estado para UI
     */
    public function getColorEstadoAttribute()
    {
        $colores = [
            self::ESTADO_APROBADO => 'success',
            self::ESTADO_RECHAZADO => 'danger',
            self::ESTADO_REVOCADO => 'warning',
        ];

        return $colores[$this->estado] ?? 'secondary';
    }

    /**
     * Obtener información completa del poder
     */
    public function getInfoCompletaAttribute()
    {
        $info = "Documento: {$this->documento}\n";
        $info .= "Fecha: " . $this->fecha->format('Y-m-d') . "\n";
        $info .= "Poderdante: {$this->nombre_poderdante} (NIT: {$this->poderdante_nit})\n";
        $info .= "Apoderado: {$this->nombre_apoderado} (NIT: {$this->apoderado_nit})\n";
        $info .= "Estado: {$this->estado_detalle}";

        if ($this->radicado) {
            $info .= "\nRadicado: {$this->radicado}";
        }

        if ($this->notificacion) {
            $info .= "\nNotificación: {$this->notificacion}";
        }

        return $info;
    }
}
