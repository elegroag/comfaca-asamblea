<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Interventores de asamblea
 */
class AsaInterventores extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'asa_interventores';

    protected $fillable = [
        'asamblea_id',
        'nit',
        'cedrep',
        'cedula',
        'razsoc',
        'repleg',
        'puede_votar',
        'tipo_representacion',
        'email',
        'cedtra',
        'tipo_interventor',
        'estado',
        'observaciones',
        'create_at',
        'update_at',
    ];

    protected $casts = [
        'create_at' => 'datetime',
        'update_at' => 'datetime',
    ];

    protected $dates = [
        'create_at',
        'update_at',
        'deleted_at',
    ];

    const TIPO_PRINCIPAL = 'principal';
    const TIPO_SUPLENTE = 'suplente';
    const TIPO_DELEGADO = 'delegado';

    // Constantes para tipo de representación (compatibilidad con código original)
    const TIPO_INTERVENTOR = 'I';
    const TIPO_SUPLENTE_REP = 'S';
    const TIPO_ASAMBLEISTA = 'A';
    const TIPO_CONSEJERO = 'C';

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
     * Relación con la asamblea
     */
    public function asamblea()
    {
        return $this->belongsTo(AsaAsamblea::class, 'asamblea_id');
    }

    /**
     * Relación con el trabajador
     */
    public function trabajador()
    {
        return $this->belongsTo(AsaTrabajadores::class, 'cedtra', 'cedtra');
    }

    /**
     * Scope para interventores activos
     */
    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }

    /**
     * Scope para interventores inactivos
     */
    public function scopeInactivos($query)
    {
        return $query->where('estado', 'inactivo');
    }

    /**
     * Scope para interventores principales
     */
    public function scopePrincipales($query)
    {
        return $query->where('tipo_interventor', self::TIPO_PRINCIPAL);
    }

    /**
     * Scope para interventores suplentes
     */
    public function scopeSuplentes($query)
    {
        return $query->where('tipo_interventor', self::TIPO_SUPLENTE);
    }

    /**
     * Scope para interventores delegados
     */
    public function scopeDelegados($query)
    {
        return $query->where('tipo_interventor', self::TIPO_DELEGADO);
    }

    /**
     * Verificar si está activo
     */
    public function estaActivo()
    {
        return $this->estado === 'activo';
    }

    /**
     * Verificar si es interventor principal
     */
    public function esPrincipal()
    {
        return $this->tipo_interventor === self::TIPO_PRINCIPAL;
    }

    /**
     * Verificar si es interventor suplente
     */
    public function esSuplente()
    {
        return $this->tipo_interventor === self::TIPO_SUPLENTE;
    }

    /**
     * Verificar si es interventor delegado
     */
    public function esDelegado()
    {
        return $this->tipo_interventor === self::TIPO_DELEGADO;
    }

    /**
     * Activar interventor
     */
    public function activar()
    {
        $this->estado = 'activo';
        $this->save();
    }

    /**
     * Desactivar interventor
     */
    public function desactivar()
    {
        $this->estado = 'inactivo';
        $this->save();
    }

    /**
     * Obtener nombre completo del interventor
     */
    public function getNombreCompletoAttribute()
    {
        return $this->trabajador ? $this->trabajador->nombre_completo : 'N/A';
    }

    /**
     * Obtener descripción del tipo de interventor
     */
    public function getDescripcionTipoAttribute()
    {
        $tipos = [
            self::TIPO_PRINCIPAL => 'Interventor Principal',
            self::TIPO_SUPLENTE => 'Interventor Suplente',
            self::TIPO_DELEGADO => 'Interventor Delegado',
        ];

        return $tipos[$this->tipo_interventor] ?? 'No definido';
    }

    /**
     * Obtener color de estado para UI
     */
    public function getColorEstadoAttribute()
    {
        return $this->estaActivo() ? 'success' : 'danger';
    }

    /**
     * Verificar si puede intervenir en la asamblea
     */
    public function puedeIntervenir()
    {
        return $this->estaActivo() && $this->asamblea && $this->asamblea->estaActiva();
    }

    /**
     * Obtener descripción del tipo de representación (compatibilidad con código original)
     */
    public function getDescripcionTipoRepresentacionAttribute()
    {
        $tipos = [
            self::TIPO_INTERVENTOR => 'Interventor',
            self::TIPO_SUPLENTE_REP => 'Suplente',
            self::TIPO_ASAMBLEISTA => 'Asambleista',
            self::TIPO_CONSEJERO => 'Concejero',
        ];

        return $tipos[$this->tipo_representacion] ?? 'Ninguno';
    }

    /**
     * Verificar si puede votar
     */
    public function puedeVotar()
    {
        return $this->puede_votar > 0;
    }

    /**
     * Obtener correo (prioridad email propio, luego email de empresa)
     */
    public function getCorreoAttribute()
    {
        if (!empty($this->email)) {
            return $this->email;
        }

        $empresa = Empresas::where('cedrep', $this->cedrep)->first();
        return $empresa ? $empresa->email : null;
    }
}
