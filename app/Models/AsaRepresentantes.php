<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Representantes de asamblea
 */
class AsaRepresentantes extends Model
{
    use HasFactory;

    protected $table = 'asa_representantes';

    protected $fillable = [
        'cedtra',
        'asamblea_id',
        'cedrep',
        'nombre_representado',
        'tipo_representacion',
        'estado',
        'observaciones',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
    ];

    const TIPO_LEGAL = 'legal';
    const TIPO_VOLUNTARIO = 'voluntario';
    const TIPO_JUDICIAL = 'judicial';

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
     * Relación con el trabajador representante
     */
    public function trabajador()
    {
        return $this->belongsTo(AsaTrabajadores::class, 'cedtra', 'cedtra');
    }

    /**
     * Scope para representantes activos
     */
    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }

    /**
     * Scope para representantes inactivos
     */
    public function scopeInactivos($query)
    {
        return $query->where('estado', 'inactivo');
    }

    /**
     * Scope para representantes legales
     */
    public function scopeLegales($query)
    {
        return $query->where('tipo_representacion', self::TIPO_LEGAL);
    }

    /**
     * Scope para representantes voluntarios
     */
    public function scopeVoluntarios($query)
    {
        return $query->where('tipo_representacion', self::TIPO_VOLUNTARIO);
    }

    /**
     * Scope para representantes judiciales
     */
    public function scopeJudiciales($query)
    {
        return $query->where('tipo_representacion', self::TIPO_JUDICIAL);
    }

    /**
     * Scope para buscar por cédula del representado
     */
    public function scopePorCedulaRepresentado($query, $cedrep)
    {
        return $query->where('cedrep', $cedrep);
    }

    /**
     * Scope para buscar por nombre del representado
     */
    public function scopePorNombreRepresentado($query, $nombre)
    {
        return $query->where('nombre_representado', 'like', "%{$nombre}%");
    }

    /**
     * Verificar si está activo
     */
    public function estaActivo()
    {
        return $this->estado === 'activo';
    }

    /**
     * Verificar si es representación legal
     */
    public function esRepresentacionLegal()
    {
        return $this->tipo_representacion === self::TIPO_LEGAL;
    }

    /**
     * Verificar si es representación voluntaria
     */
    public function esRepresentacionVoluntaria()
    {
        return $this->tipo_representacion === self::TIPO_VOLUNTARIO;
    }

    /**
     * Verificar si es representación judicial
     */
    public function esRepresentacionJudicial()
    {
        return $this->tipo_representacion === self::TIPO_JUDICIAL;
    }

    /**
     * Activar representante
     */
    public function activar()
    {
        $this->estado = 'activo';
        $this->save();
    }

    /**
     * Desactivar representante
     */
    public function desactivar()
    {
        $this->estado = 'inactivo';
        $this->save();
    }

    /**
     * Obtener array de tipos
     */
    public static function getTiposArray()
    {
        return [
            self::TIPO_LEGAL => 'Representación Legal',
            self::TIPO_VOLUNTARIO => 'Representación Voluntaria',
            self::TIPO_JUDICIAL => 'Representación Judicial',
        ];
    }

    /**
     * Obtener descripción del tipo
     */
    public function getTipoDescripcionAttribute()
    {
        $tipos = self::getTiposArray();
        return $tipos[$this->tipo_representacion] ?? 'No definido';
    }

    /**
     * Obtener nombre completo del representante
     */
    public function getNombreRepresentanteAttribute()
    {
        return $this->trabajador ? $this->trabajador->nombre_completo : 'N/A';
    }

    /**
     * Obtener descripción del tipo de representación
     */
    public function getDescripcionTipoAttribute()
    {
        $tipos = self::getTiposArray();
        return $tipos[$this->tipo_representacion] ?? 'No definido';
    }

    /**
     * Obtener información completa del representado
     */
    public function getInfoRepresentadoAttribute()
    {
        return "{$this->nombre_representado} (CC: {$this->cedrep})";
    }

    /**
     * Verificar si puede representar en la asamblea
     */
    public function puedeRepresentar()
    {
        return $this->estaActivo() && $this->asamblea && $this->asamblea->estaActiva();
    }

    /**
     * Obtener color de tipo para UI
     */
    public function getColorTipoAttribute()
    {
        $colores = [
            self::TIPO_LEGAL => 'primary',
            self::TIPO_VOLUNTARIO => 'success',
            self::TIPO_JUDICIAL => 'warning',
        ];

        return $colores[$this->tipo_representacion] ?? 'secondary';
    }

    /**
     * Obtener información completa del representante
     */
    public function getInfoCompletaAttribute()
    {
        $info = "Trabajador: {$this->nombre_representante}\n";
        $info .= "Cédula: {$this->cedrep}\n";
        $info .= "Asamblea: " . ($this->asamblea ? $this->asamblea->detalle : 'N/A');
        $info .= "Tipo: {$this->descripcion_tipo}\n";
        $info .= "Estado: {$this->estado}";

        if ($this->observaciones) {
            $info .= "\nObservaciones: {$this->observaciones}";
        }

        return $info;
    }
}