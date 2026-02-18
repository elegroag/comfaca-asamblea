<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Empresas participantes en asambleas
 */
class Empresas extends Model
{
    use HasFactory;

    protected $table = 'empresas';

    protected $primaryKey = 'nit';

    protected $keyType = 'string';

    protected $fillable = [
        'nit',
        'razsoc',
        'cedrep',
        'repleg',
        'email',
        'telefono',
        'asamblea_id',
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
     * Relación con la asamblea
     */
    public function asamblea()
    {
        return $this->belongsTo(AsaAsamblea::class, 'asamblea_id');
    }

    /**
     * Relación con el representante legal si existe
     */
    public function representante()
    {
        return $this->belongsTo(AsaTrabajadores::class, 'cedrep', 'cedtra');
    }

    /**
     * Scope para buscar por NIT
     */
    public function scopePorNit($query, $nit)
    {
        return $query->where('nit', $nit);
    }

    /**
     * Scope para buscar por razón social
     */
    public function scopePorRazonSocial($query, $razsoc)
    {
        return $query->where('razsoc', 'like', "%{$razsoc}%");
    }

    /**
     * Scope para buscar por representante legal
     */
    public function scopePorRepresentante($query, $cedrep)
    {
        return $query->where('cedrep', $cedrep);
    }

    /**
     * Scope para empresas de una asamblea específica
     */
    public function scopeDeAsamblea($query, $asambleaId)
    {
        return $query->where('asamblea_id', $asambleaId);
    }

    /**
     * Obtener nombre completo del representante
     */
    public function getNombreRepresentanteAttribute()
    {
        return $this->representante ? $this->representante->nombre_completo : $this->repleg;
    }

    /**
     * Verificar si tiene representante legal asociado
     */
    public function tieneRepresentanteLegal()
    {
        return !empty($this->cedrep);
    }

    /**
     * Obtener información de contacto completa
     */
    public function getInfoContactoAttribute()
    {
        $contacto = [];
        
        if ($this->email) {
            $contacto[] = "Email: {$this->email}";
        }
        
        if ($this->telefono) {
            $contacto[] = "Tel: {$this->telefono}";
        }
        
        return implode(' | ', $contacto);
    }

    /**
     * Formatear NIT para visualización
     */
    public function getNitFormateadoAttribute()
    {
        $nit = $this->nit;
        
        // Formato básico de NIT colombiano: XXX.XXX.XXX-X
        if (strlen($nit) === 10) {
            return substr($nit, 0, 3) . '.' . 
                   substr($nit, 3, 3) . '.' . 
                   substr($nit, 6, 3) . '-' . 
                   substr($nit, 9, 1);
        }
        
        return $nit;
    }

    /**
     * Validar formato de NIT
     */
    public function validarNit()
    {
        $nit = preg_replace('/[^0-9]/', '', $this->nit);
        return strlen($nit) === 10 || strlen($nit) === 9;
    }

    /**
     * Verificar si la empresa está activa en alguna asamblea
     */
    public function estaActivaEnAsamblea()
    {
        return $this->asamblea && $this->asamblea->estaActiva();
    }

    /**
     * Obtener resumen de la empresa
     */
    public function getResumenAttribute()
    {
        return "NIT: {$this->nit} | {$this->razsoc}";
    }
}