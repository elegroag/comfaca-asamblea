<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Correos del sistema de asambleas
 */
class AsaCorreos extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'asa_correos';

    protected $fillable = [
        'asamblea_id',
        'asunto',
        'mensaje',
        'tipo_destino',
        'destinatarios',
        'estado_envio',
        'fecha_programada',
        'fecha_envio',
        'intentos',
        'error_message',
    ];

    protected $casts = [
        'destinatarios' => 'array',
        'fecha_programada' => 'datetime',
        'fecha_envio' => 'datetime',
        'create_at' => 'datetime',
        'update_at' => 'datetime',
    ];

    protected $dates = [
        'fecha_programada',
        'fecha_envio',
        'create_at',
        'update_at',
        'deleted_at',
    ];

    const ESTADO_PENDIENTE = 'pendiente';
    const ESTADO_ENVIADO = 'enviado';
    const ESTADO_ERROR = 'error';
    const ESTADO_CANCELADO = 'cancelado';

    const TIPO_TODOS = 'todos';
    const TIPO_USUARIOS = 'usuarios';
    const TIPO_INTERVENTORES = 'interventores';
    const TIPO_REPRESENTANTES = 'representantes';
    const TIPO_PERSONALIZADO = 'personalizado';

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->create_at = now();
            $model->update_at = now();
            $model->intentos = 0;
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
     * Scope para correos pendientes
     */
    public function scopePendientes($query)
    {
        return $query->where('estado_envio', self::ESTADO_PENDIENTE);
    }

    /**
     * Scope para correos enviados
     */
    public function scopeEnviados($query)
    {
        return $query->where('estado_envio', self::ESTADO_ENVIADO);
    }

    /**
     * Scope para correos con error
     */
    public function scopeConError($query)
    {
        return $query->where('estado_envio', self::ESTADO_ERROR);
    }

    /**
     * Scope para correos programados para hoy
     */
    public function scopeParaHoy($query)
    {
        return $query->whereDate('fecha_programada', now()->toDateString());
    }

    /**
     * Scope para correos atrasados
     */
    public function scopeAtrasados($query)
    {
        return $query->where('fecha_programada', '<', now())
                    ->where('estado_envio', self::ESTADO_PENDIENTE);
    }

    /**
     * Verificar si está pendiente de envío
     */
    public function estaPendiente()
    {
        return $this->estado_envio === self::ESTADO_PENDIENTE;
    }

    /**
     * Verificar si fue enviado
     */
    public function fueEnviado()
    {
        return $this->estado_envio === self::ESTADO_ENVIADO;
    }

    /**
     * Verificar si tiene error
     */
    public function tieneError()
    {
        return $this->estado_envio === self::ESTADO_ERROR;
    }

    /**
     * Marcar como enviado
     */
    public function marcarEnviado()
    {
        $this->estado_envio = self::ESTADO_ENVIADO;
        $this->fecha_envio = now();
        $this->save();
    }

    /**
     * Marcar como error
     */
    public function marcarError($errorMessage = null)
    {
        $this->estado_envio = self::ESTADO_ERROR;
        $this->error_message = $errorMessage;
        $this->increment('intentos');
        $this->save();
    }

    /**
     * Cancelar envío
     */
    public function cancelar()
    {
        $this->estado_envio = self::ESTADO_CANCELADO;
        $this->save();
    }

    /**
     * Obtener descripción del tipo de destino
     */
    public function getDescripcionTipoAttribute()
    {
        $tipos = [
            self::TIPO_TODOS => 'Todos los participantes',
            self::TIPO_USUARIOS => 'Usuarios de la asamblea',
            self::TIPO_INTERVENTORES => 'Interventores',
            self::TIPO_REPRESENTANTES => 'Representantes',
            self::TIPO_PERSONALIZADO => 'Lista personalizada',
        ];

        return $tipos[$this->tipo_destino] ?? 'No definido';
    }

    /**
     * Obtener número de destinatarios
     */
    public function getNumeroDestinatariosAttribute()
    {
        return is_array($this->destinatarios) ? count($this->destinatarios) : 0;
    }

    /**
     * Obtener color de estado para UI
     */
    public function getColorEstadoAttribute()
    {
        $colores = [
            self::ESTADO_PENDIENTE => 'warning',
            self::ESTADO_ENVIADO => 'success',
            self::ESTADO_ERROR => 'danger',
            self::ESTADO_CANCELADO => 'secondary',
        ];

        return $colores[$this->estado_envio] ?? 'light';
    }

    /**
     * Verificar si se puede reintentar el envío
     */
    public function sePuedeReintentar()
    {
        return $this->tieneError() && $this->intentos < 3;
    }

    /**
     * Obtener lista de correos para enviar
     */
    public static function getCorreosParaEnviar()
    {
        return self::pendientes()
                   ->where(function ($query) {
                       $query->whereNull('fecha_programada')
                             ->orWhere('fecha_programada', '<=', now());
                   })
                   ->orderBy('fecha_programada')
                   ->get();
    }
}