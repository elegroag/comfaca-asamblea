<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Novedades del sistema
 * Cambios y actualizaciones en las empresas y representantes
 */
class Novedades extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'novedades';

    protected $fillable = [
        'linea',
        'syncro',
        'estado',
        'nit',
        'razon_social',
        'cedula_representante',
        'nombre_representante',
        'apoderado_nit',
        'apoderado_cedula',
        'apoderado_nombre',
        'clave',
    ];

    protected $casts = [
        'syncro' => 'boolean',
        'create_at' => 'datetime',
        'update_at' => 'datetime',
    ];

    protected $dates = [
        'create_at',
        'update_at',
        'deleted_at',
    ];

    const ESTADO_ACTIVAR = 'A';
    const ESTADO_INACTIVAR = 'I';
    const ESTADO_REEMPLAZAR = 'R';

    const SYNCRO_PENDIENTE = 0;
    const SYNCRO_ENVIADO = 1;

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
     * Relación con la empresa si existe
     */
    public function empresa()
    {
        return $this->belongsTo(Empresas::class, 'nit', 'nit');
    }

    /**
     * Relación con el representante legal si existe
     */
    public function representante()
    {
        return $this->belongsTo(AsaTrabajadores::class, 'cedula_representante', 'cedtra');
    }

    /**
     * Relación con el apoderado si existe
     */
    public function apoderado()
    {
        return $this->belongsTo(AsaTrabajadores::class, 'apoderado_cedula', 'cedtra');
    }

    /**
     * Scope para novedades pendientes de sincronización
     */
    public function scopePendientesSyncro($query)
    {
        return $query->where('syncro', self::SYNCRO_PENDIENTE);
    }

    /**
     * Scope para novedades sincronizadas
     */
    public function scopeSincronizadas($query)
    {
        return $query->where('syncro', self::SYNCRO_ENVIADO);
    }

    /**
     * Scope para novedades por estado
     */
    public function scopePorEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Scope para novedades de activación
     */
    public function scopeActivacion($query)
    {
        return $query->where('estado', self::ESTADO_ACTIVAR);
    }

    /**
     * Scope para novedades de inactivación
     */
    public function scopeInactivacion($query)
    {
        return $query->where('estado', self::ESTADO_INACTIVAR);
    }

    /**
     * Scope para novedades de reemplazo
     */
    public function scopeReemplazo($query)
    {
        return $query->where('estado', self::ESTADO_REEMPLAZAR);
    }

    /**
     * Scope para buscar por NIT
     */
    public function scopePorNit($query, $nit)
    {
        return $query->where('nit', $nit);
    }

    /**
     * Scope para buscar por línea
     */
    public function scopePorLinea($query, $linea)
    {
        return $query->where('linea', $linea);
    }

    /**
     * Verificar si está pendiente de sincronización
     */
    public function estaPendienteSyncro()
    {
        return $this->syncro === self::SYNCRO_PENDIENTE;
    }

    /**
     * Verificar si está sincronizada
     */
    public function estaSincronizada()
    {
        return $this->syncro === self::SYNCRO_ENVIADO;
    }

    /**
     * Marcar como sincronizada
     */
    public function marcarSincronizada()
    {
        $this->syncro = self::SYNCRO_ENVIADO;
        $this->save();
    }

    /**
     * Marcar como pendiente de sincronización
     */
    public function marcarPendiente()
    {
        $this->syncro = self::SYNCRO_PENDIENTE;
        $this->save();
    }

    /**
     * Verificar si es una novedad de activación
     */
    public function esActivacion()
    {
        return $this->estado === self::ESTADO_ACTIVAR;
    }

    /**
     * Verificar si es una novedad de inactivación
     */
    public function esInactivacion()
    {
        return $this->estado === self::ESTADO_INACTIVAR;
    }

    /**
     * Verificar si es una novedad de reemplazo
     */
    public function esReemplazo()
    {
        return $this->estado === self::ESTADO_REEMPLAZAR;
    }

    /**
     * Obtener array de estados
     */
    public static function getEstadosArray()
    {
        return [
            self::ESTADO_ACTIVAR => 'Activar',
            self::ESTADO_INACTIVAR => 'Inactivar',
            self::ESTADO_REEMPLAZAR => 'Reemplazar',
        ];
    }

    /**
     * Obtener array de sincronización
     */
    public static function getSyncroArray()
    {
        return [
            self::SYNCRO_PENDIENTE => 'Pendiente',
            self::SYNCRO_ENVIADO => 'Enviado',
        ];
    }

    /**
     * Obtener descripción del estado
     */
    public function getEstadoDescripcionAttribute()
    {
        $estados = self::getEstadosArray();
        return $estados[$this->estado] ?? 'No definido';
    }

    /**
     * Obtener descripción de la sincronización
     */
    public function getSyncroDescripcionAttribute()
    {
        $syncros = self::getSyncroArray();
        return $syncros[$this->syncro] ?? 'No definido';
    }

    /**
     * Obtener nombre de la empresa asociada
     */
    public function getNombreEmpresaAttribute()
    {
        return $this->empresa ? $this->empresa->razsoc : $this->razon_social;
    }

    /**
     * Obtener nombre completo del representante
     */
    public function getNombreCompletoRepresentanteAttribute()
    {
        if ($this->representante) {
            return $this->representante->nombre_completo;
        }
        return $this->nombre_representante;
    }

    /**
     * Obtener nombre completo del apoderado
     */
    public function getNombreCompletoApoderadoAttribute()
    {
        if ($this->apoderado) {
            return $this->apoderado->nombre_completo;
        }
        return $this->apoderado_nombre;
    }

    /**
     * Obtener resumen de la novedad
     */
    public function getResumenAttribute()
    {
        return "Línea {$this->linea}: {$this->nombre_empresa} - {$this->estado_descripcion}";
    }

    /**
     * Obtener color del estado para UI
     */
    public function getColorEstadoAttribute()
    {
        $colores = [
            self::ESTADO_ACTIVAR => 'success',
            self::ESTADO_INACTIVAR => 'danger',
            self::ESTADO_REEMPLAZAR => 'warning',
        ];

        return $colores[$this->estado] ?? 'secondary';
    }

    /**
     * Obtener color de sincronización para UI
     */
    public function getColorSyncroAttribute()
    {
        return $this->estaSincronizada() ? 'success' : 'warning';
    }

    /**
     * Verificar si la novedad requiere acción inmediata
     */
    public function requiereAccionInmediata()
    {
        return $this->estaPendienteSyncro() && ($this->esActivacion() || $this->esInactivacion());
    }

    /**
     * Obtener información completa de la novedad
     */
    public function getInfoCompletaAttribute()
    {
        $info = "Línea: {$this->linea}\n";
        $info .= "Empresa: {$this->nombre_empresa} (NIT: {$this->nit})\n";
        $info .= "Acción: {$this->estado_descripcion}\n";
        $info .= "Sincronización: {$this->syncro_descripcion}";

        if ($this->nombre_completo_representante) {
            $info .= "\nRepresentante: {$this->nombre_completo_representante}";
        }

        if ($this->nombre_completo_apoderado) {
            $info .= "\nApoderado: {$this->nombre_completo_apoderado}";
        }

        return $info;
    }
}