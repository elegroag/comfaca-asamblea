<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Tareas del sistema
 * Modelo para gestion de tareas relacionadas con usuarios del sistema SISU
 */
class Task extends Model
{
    use HasFactory;

    protected $table = 'tasks';

    protected $fillable = [
        'title',
        'description',
        'completed',
        'usuario_sisu_id',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the task.
     */
    public function usuarioSisu(): BelongsTo
    {
        return $this->belongsTo(UsuarioSisu::class, 'usuario_sisu_id');
    }

    /**
     * Get the user that owns the task (alias for compatibility).
     */
    public function user(): BelongsTo
    {
        return $this->usuarioSisu();
    }

    /**
     * Scope a query to only include completed tasks.
     */
    public function scopeCompleted($query)
    {
        return $query->where('completed', true);
    }

    /**
     * Scope a query to only include pending tasks.
     */
    public function scopePending($query)
    {
        return $query->where('completed', false);
    }

    /**
     * Scope a query to only include tasks for a specific user.
     */
    public function scopeForUsuarioSisu($query, $usuarioSisuId)
    {
        return $query->where('usuario_sisu_id', $usuarioSisuId);
    }

    /**
     * Scope a query to only include tasks for a specific user (alias).
     */
    public function scopeForUser($query, $userId)
    {
        return $query->forUsuarioSisu($userId);
    }

    /**
     * Scope a query to search tasks by title or description.
     */
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', '%' . $term . '%')
                ->orWhere('description', 'like', '%' . $term . '%');
        });
    }

    /**
     * Get the user's name for display purposes.
     */
    public function getUsuarioNombreAttribute()
    {
        return $this->usuarioSisu ? $this->usuarioSisu->nombre_completo : 'Sin asignar';
    }

    /**
     * Mark the task as completed.
     */
    public function marcarComoCompletada()
    {
        $this->completed = true;
        $this->save();
    }

    /**
     * Mark the task as pending.
     */
    public function marcarComoPendiente()
    {
        $this->completed = false;
        $this->save();
    }

    /**
     * Toggle the completion status.
     */
    public function toggleCompletado()
    {
        $this->completed = !$this->completed;
        $this->save();
    }

    /**
     * Get the status as a readable string.
     */
    public function getEstadoAttribute()
    {
        return $this->completed ? 'Completada' : 'Pendiente';
    }

    /**
     * Get the status color for UI.
     */
    public function getEstadoColorAttribute()
    {
        return $this->completed ? 'success' : 'warning';
    }

    /**
     * Check if the task is completed.
     */
    public function estaCompletada()
    {
        return $this->completed;
    }

    /**
     * Check if the task is pending.
     */
    public function estaPendiente()
    {
        return !$this->completed;
    }

    /**
     * Get the completion percentage.
     */
    public function getPorcentajeCompletadoAttribute()
    {
        return $this->completed ? 100 : 0;
    }

    /**
     * Get a brief description for display.
     */
    public function getResumenAttribute()
    {
        $length = strlen($this->title);
        return strlen($this->description) > 50 
            ? substr($this->description, 0, 47) . '...' 
            : $this->description;
    }
}