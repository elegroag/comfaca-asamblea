<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Permisos del menú lateral
 */
class SidebarPermisos extends Model
{
    use HasFactory;

    protected $table = 'sidebar_permisos';

    protected $fillable = [
        'sidebar_id',
        'rol',
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
     * Relación con el elemento del menú
     */
    public function sidebar()
    {
        return $this->belongsTo(Sidebar::class, 'sidebar_id');
    }

    /**
     * Scope para permisos por rol
     */
    public function scopePorRol($query, $rol)
    {
        return $query->where('rol', $rol);
    }

    /**
     * Scope para permisos por elemento del menú
     */
    public function scopePorSidebar($query, $sidebarId)
    {
        return $query->where('sidebar_id', $sidebarId);
    }

    /**
     * Obtener array de roles
     */
    public static function getRolesArray()
    {
        return [
            'administrador' => 'Administrador',
            'supervisor' => 'Supervisor',
            'operador' => 'Operador',
            'invitado' => 'Invitado',
            'consulta' => 'Consulta',
        ];
    }

    /**
     * Obtener descripción del rol
     */
    public function getRolDescripcionAttribute()
    {
        $roles = self::getRolesArray();
        return $roles[$this->rol] ?? 'No definido';
    }

    /**
     * Obtener información del elemento del menú
     */
    public function getInfoMenuAttribute()
    {
        return $this->sidebar ? $this->sidebar->label : 'No encontrado';
    }

    /**
     * Verificar si el rol tiene acceso al menú
     */
    public static function tieneAcceso($sidebarId, $rol)
    {
        return self::where('sidebar_id', $sidebarId)
                   ->where('rol', $rol)
                   ->exists();
    }

    /**
     * Obtener elementos del menú accesibles por rol
     */
    public static function obtenerMenuPorRol($rol)
    {
        return Sidebar::whereHas('permisos', function ($query) use ($rol) {
                    $query->where('rol', $rol);
                })
                ->activos()
                ->ordenados()
                ->get();
    }

    /**
     * Obtener estructura jerárquica del menú por rol
     */
    public static function obtenerEstructuraMenuPorRol($rol)
    {
        $menuItems = self::obtenerMenuPorRol($rol);
        
        return $menuItems->filter(function ($item) {
            return $item->esRaiz();
        })->map(function ($item) use ($rol) {
            return $item->estructura_completa;
        })->toArray();
    }

    /**
     * Verificar si un elemento del menú es visible para un rol
     */
    public function esVisibleParaRol($rol)
    {
        return $this->rol === $rol;
    }

    /**
     * Obtener información completa del permiso
     */
    public function getInfoCompletaAttribute()
    {
        $info = "Menú: {$this->info_menu}\n";
        $info .= "Rol: {$this->rol_descripcion}";

        return $info;
    }
}