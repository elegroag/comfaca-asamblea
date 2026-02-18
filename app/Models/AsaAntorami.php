<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Consenso asamblea
 * Acuerdo producido por consentimiento entre todos los miembros de un grupo o entre varios grupos.
 */
class AsaAntorami extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'asa_antorami';

    protected $fillable = [
        'usuario',
        'clave',
        'cedrep',
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
     * Relación con el trabajador si existe
     */
    public function trabajador()
    {
        return $this->belongsTo(AsaTrabajadores::class, 'cedrep', 'cedtra');
    }

    /**
     * Scope para buscar por usuario
     */
    public function scopePorUsuario($query, $usuario)
    {
        return $query->where('usuario', $usuario);
    }

    /**
     * Scope para buscar por cédula del representado
     */
    public function scopePorCedulaRepresentado($query, $cedrep)
    {
        return $query->where('cedrep', $cedrep);
    }

    /**
     * Verificar si el usuario es válido
     */
    public function esUsuarioValido()
    {
        return !empty($this->usuario) && !empty($this->clave);
    }

    /**
     * Verificar si tiene representado asociado
     */
    public function tieneRepresentado()
    {
        return !empty($this->cedrep);
    }

    /**
     * Obtener nombre del representado si existe
     */
    public function getNombreRepresentadoAttribute()
    {
        return $this->trabajador ? $this->trabajador->nombre_completo : 'No encontrado';
    }

    /**
     * Validar credenciales
     */
    public function validarCredenciales($usuario, $clave)
    {
        return $this->usuario === $usuario && $this->clave === $clave;
    }

    /**
     * Obtener información completa
     */
    public function getInfoCompletaAttribute()
    {
        $info = "Usuario: {$this->usuario}";
        
        if ($this->tieneRepresentado()) {
            $info .= " | Representado: {$this->cedrep}";
            if ($this->trabajador) {
                $info .= " - {$this->trabajador->nombre_completo}";
            }
        }
        
        return $info;
    }
}