<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Conceptos financieros de asamblea
 */
class Carteras extends Model
{
    use HasFactory;

    protected $table = 'carteras';

    protected $fillable = [
        'nit',
        'concepto',
        'asamblea_id',
        'codigo',
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
     * Relación con la empresa
     */
    public function empresa()
    {
        return $this->belongsTo(Empresas::class, 'nit', 'nit');
    }

    /**
     * Relación con la asamblea
     */
    public function asamblea()
    {
        return $this->belongsTo(AsaAsamblea::class, 'asamblea_id');
    }

    /**
     * Scope para carteras por asamblea
     */
    public function scopePorAsamblea($query, $asambleaId)
    {
        return $query->where('asamblea_id', $asambleaId);
    }

    /**
     * Scope para carteras por código
     */
    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('codigo', $codigo);
    }

    /**
     * Scope para carteras de aportes
     */
    public function scopeAportes($query)
    {
        return $query->where('codigo', 'A');
    }

    /**
     * Scope para carteras de servicios
     */
    public function scopeServicios($query)
    {
        return $query->where('codigo', 'S');
    }

    /**
     * Scope para carteras de libranza
     */
    public function scopeLibranza($query)
    {
        return $query->where('codigo', 'L');
    }

    /**
     * Scope para buscar por concepto
     */
    public function scopePorConcepto($query, $concepto)
    {
        return $query->where('concepto', 'like', "%{$concepto}%");
    }

    /**
     * Verificar si es un aporte
     */
    public function esAporte()
    {
        return $this->codigo === 'A';
    }

    /**
     * Verificar si es un servicio
     */
    public function esServicio()
    {
        return $this->codigo === 'S';
    }

    /**
     * Verificar si es una libranza
     */
    public function esLibranza()
    {
        return $this->codigo === 'L';
    }

    /**
     * Obtener array de códigos
     */
    public static function getCodigosArray()
    {
        return [
            'A' => 'APORTES',
            'S' => 'SERVICIOS',
            'L' => 'LIBRANZA',
        ];
    }

    /**
     * Obtener descripción del código
     */
    public function getCodigoDescripcionAttribute()
    {
        $codigos = self::getCodigosArray();
        return $codigos[$this->codigo] ?? 'No definido';
    }

    /**
     * Obtener resumen de la cartera
     */
    public function getResumenAttribute()
    {
        return "{$this->codigo_descripcion}: {$this->concepto}";
    }

    /**
     * Obtener color del código para UI
     */
    public function getColorCodigoAttribute()
    {
        $colores = [
            'A' => 'success',
            'S' => 'info',
            'L' => 'warning',
        ];

        return $colores[$this->codigo] ?? 'secondary';
    }

    /**
     * Obtener información completa de la cartera
     */
    public function getInfoCompletaAttribute()
    {
        $info = "Empresa: {$this->nombre_empresa} (NIT: {$this->nit})\n";
        $info .= "Tipo: {$this->codigo_descripcion}\n";
        $info .= "Concepto: {$this->concepto}";

        return $info;
    }
}