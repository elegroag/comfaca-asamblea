<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Registro de ingresos a asamblea
 * Control de acceso y registro de participantes
 */
class RegistroIngresos extends Model
{
    use HasFactory;

    protected $table = 'registro_ingresos';

    protected $fillable = [
        'documento',
        'fecha',
        'hora',
        'nit',
        'usuario',
        'estado',
        'votos',
        'mesa_id',
        'asamblea_id',
        'tipo_ingreso',
        'fecha_asistencia',
        'cedula_representa',
        'nombre_representa',
        'orden',
    ];

    protected $casts = [
        'fecha' => 'date',
        'hora' => 'datetime',
        'fecha_asistencia' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $dates = [
        'fecha',
        'hora',
        'fecha_asistencia',
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
     * Relación con la mesa
     */
    public function mesa()
    {
        return $this->belongsTo(AsaMesas::class, 'mesa_id');
    }

    /**
     * Relación con la asamblea
     */
    public function asamblea()
    {
        return $this->belongsTo(AsaAsamblea::class, 'asamblea_id');
    }

    /**
     * Relación con la empresa si existe
     */
    public function empresa()
    {
        return $this->belongsTo(Empresas::class, 'nit', 'nit');
    }

    /**
     * Relación con los rechazos asociados
     */
    public function rechazos()
    {
        return $this->hasMany(Rechazos::class, 'regingre_id');
    }

    /**
     * Scope para registros por asamblea
     */
    public function scopePorAsamblea($query, $asambleaId)
    {
        return $query->where('asamblea_id', $asambleaId);
    }

    /**
     * Scope para registros por fecha
     */
    public function scopePorFecha($query, $fecha)
    {
        return $query->where('fecha', $fecha);
    }

    /**
     * Scope para registros por estado
     */
    public function scopePorEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Scope para registros pendientes
     */
    public function scopePendientes($query)
    {
        return $query->where('estado', 'pendiente');
    }

    /**
     * Scope para registros aprobados
     */
    public function scopeAprobados($query)
    {
        return $query->where('estado', 'aprobado');
    }

    /**
     * Scope para registros rechazados
     */
    public function scopeRechazados($query)
    {
        return $query->where('estado', 'rechazado');
    }

    /**
     * Scope para registros que asistieron
     */
    public function scopeAsistieron($query)
    {
        return $query->where('estado', 'asistio');
    }

    /**
     * Scope para registros que no asistieron
     */
    public function scopeNoAsistieron($query)
    {
        return $query->where('estado', 'no_asistio');
    }

    /**
     * Scope para registros por tipo de ingreso
     */
    public function scopePorTipoIngreso($query, $tipo)
    {
        return $query->where('tipo_ingreso', $tipo);
    }

    /**
     * Scope para buscar por documento
     */
    public function scopePorDocumento($query, $documento)
    {
        return $query->where('documento', 'documento');
    }

    /**
     * Scope para buscar por usuario
     */
    public function scopePorUsuario($query, $usuario)
    {
        return $query->where('usuario', 'like', "%{$usuario}%");
    }

    /**
     * Verificar si está pendiente
     */
    public function estaPendiente()
    {
        return $this->estado === 'pendiente';
    }

    /**
     * Verificar si está aprobado
     */
    public function estaAprobado()
    {
        return $this->estado === 'aprobado';
    }

    /**
     * Verificar si está rechazado
     */
    public function estaRechazado()
    {
        return $this->estado === 'rechazado';
    }

    /**
     * Verificar si asistió
     */
    public function asistio()
    {
        return $this->estado === 'asistio';
    }

    /**
     * Verificar si no asistió
     */
    public function noAsistio()
    {
        return $this->estado === 'no_asistio';
    }

    /**
     * Aprobar registro
     */
    public function aprobar()
    {
        $this->estado = 'aprobado';
        $this->save();
    }

    /**
     * Rechazar registro
     */
    public function rechazar()
    {
        $this->estado = 'rechazado';
        $this->save();
    }

    /**
     * Marcar como asistió
     */
    public function marcarAsistencia()
    {
        $this->estado = 'asistio';
        $this->fecha_asistencia = now();
        $this->save();
    }

    /**
     * Marcar como no asistió
     */
    public function marcarNoAsistencia()
    {
        $this->estado = 'no_asistio';
        $this->save();
    }

    /**
     * Obtener array de estados
     */
    public static function getEstadosArray()
    {
        return [
            'pendiente' => 'Pendiente',
            'aprobado' => 'Aprobado',
            'rechazado' => 'Rechazado',
            'asistio' => 'Asistió',
            'no_asistio' => 'No Asistió',
        ];
    }

    /**
     * Obtener array de tipos de ingreso
     */
    public static function getTiposIngresoArray()
    {
        return [
            'participante' => 'Participante',
            'invitado' => 'Invitado',
            'observador' => 'Observador',
            'interventor' => 'Interventor',
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
     * Obtener descripción del tipo de ingreso
     */
    public function getTipoIngresoDescripcionAttribute()
    {
        $tipos = self::getTiposIngresoArray();
        return $tipos[$this->tipo_ingreso] ?? 'No definido';
    }

    /**
     * Obtener nombre de la empresa
     */
    public function getNombreEmpresaAttribute()
    {
        return $this->empresa ? $this->empresa->razsoc : 'No asignada';
    }

    /**
     * Obtener código de la mesa
     */
    public function getCodigoMesaAttribute()
    {
        return $this->mesa ? $this->mesa->codigo : 'Sin mesa';
    }

    /**
     * Obtener resumen del registro
     */
    public function getResumenAttribute()
    {
        return "{$this->usuario} - {$this->estado_descripcion} ({$this->nombre_empresa})";
    }

    /**
     * Obtener color del estado para UI
     */
    public function getColorEstadoAttribute()
    {
        $colores = [
            'pendiente' => 'warning',
            'aprobado' => 'info',
            'rechazado' => 'danger',
            'asistio' => 'success',
            'no_asistio' => 'secondary',
        ];

        return $colores[$this->estado] ?? 'light';
    }

    /**
     * Obtener color del tipo de ingreso para UI
     */
    public function getColorTipoIngresoAttribute()
    {
        $colores = [
            'participante' => 'primary',
            'invitado' => 'info',
            'observador' => 'warning',
            'interventor' => 'success',
        ];

        return $colores[$this->tipo_ingreso] ?? 'secondary';
    }

    /**
     * Verificar si tiene rechazos asociados
     */
    public function tieneRechazos()
    {
        return $this->rechazos()->exists();
    }

    /**
     * Obtener información completa del registro
     */
    public function getInfoCompletaAttribute()
    {
        $info = "Documento: {$this->documento}\n";
        $info .= "Usuario: {$this->usuario}\n";
        $info .= "Empresa: {$this->nombre_empresa} (NIT: {$this->nit})\n";
        $info .= "Estado: {$this->estado_descripcion}\n";
        $info .= "Tipo: {$this->tipo_ingreso_descripcion}\n";
        $info .= "Fecha: " . $this->fecha->format('Y-m-d') . "\n";
        $info .= "Hora: " . $this->hora->format('H:i:s');

        if ($this->mesa_id) {
            $info .= "\nMesa: {$this->codigo_mesa}";
        }

        if ($this->votos > 0) {
            $info .= "\nVotos: {$this->votos}";
        }

        if ($this->cedula_representa) {
            $info .= "\nRepresenta a: {$this->nombre_representa} (CC: {$this->cedula_representa})";
        }

        return $info;
    }
}