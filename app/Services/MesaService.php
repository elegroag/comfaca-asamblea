<?php

namespace App\Services;

use App\Models\AsaMesas;
use App\Models\AsaConsenso;
use App\Services\Asamblea\AsambleaService;
use Illuminate\Support\Facades\DB;

class MesaService
{
    private $idAsamblea;

    public function __construct()
    {
        $this->idAsamblea = AsambleaService::getAsambleaActiva();
    }

    /**
     * Crear mesa para uso en asamblea
     */
    public function createUseMesa($data)
    {
        $consenso = AsaConsenso::where('estado', 'A')
            ->where('asamblea_id', $this->idAsamblea)
            ->first();

        if (!$consenso) {
            throw new \Exception("No hay consenso activo para esta asamblea", 404);
        }

        $mesa = AsaMesas::create([
            'codigo' => $data['mesa_codigo'],
            'cedtra_responsable' => $data['cedtra'],
            'estado' => $data['estado'],
            'consenso_id' => $consenso->id,
            'cantidad_votantes' => 0,
            'cantidad_votos' => 0,
            'create_at' => now()->format('Y-m-d'),
            'update_at' => now()->format('Y-m-d')
        ]);

        return $mesa;
    }

    /**
     * Actualizar mesa existente
     */
    public function updateUseMesa($id, $cedtra)
    {
        $consenso = AsaConsenso::where('estado', 'A')
            ->where('asamblea_id', $this->idAsamblea)
            ->first();

        if (!$consenso) {
            throw new \Exception("No hay consenso activo para esta asamblea", 404);
        }

        $mesa = AsaMesas::find($id);
        if (!$mesa) {
            throw new \Exception("La mesa no existe", 404);
        }

        $mesa->update([
            'cedtra_responsable' => $cedtra,
            'consenso_id' => $consenso->id,
            'update_at' => now()->format('Y-m-d H:i:s')
        ]);

        return $mesa;
    }

    /**
     * Obtener todas las mesas de la asamblea activa
     */
    public function getMesasPorAsamblea()
    {
        return AsaMesas::with(['consenso'])
            ->whereHas('consenso', function ($query) {
                $query->where('estado', 'A')
                    ->where('asamblea_id', $this->idAsamblea);
            })
            ->orderBy('codigo')
            ->get();
    }

    /**
     * Obtener mesa por ID
     */
    public function getMesaPorId($id)
    {
        return AsaMesas::with(['consenso'])
            ->whereHas('consenso', function ($query) {
                $query->where('estado', 'A')
                    ->where('asamblea_id', $this->idAsamblea);
            })
            ->find($id);
    }

    /**
     * Obtener mesa por código
     */
    public function getMesaPorCodigo($codigo)
    {
        return AsaMesas::with(['consenso'])
            ->where('codigo', $codigo)
            ->whereHas('consenso', function ($query) {
                $query->where('estado', 'A')
                    ->where('asamblea_id', $this->idAsamblea);
            })
            ->first();
    }

    /**
     * Cambiar estado de mesa
     */
    public function cambiarEstadoMesa($id, $estado)
    {
        $mesa = AsaMesas::find($id);
        if (!$mesa) {
            throw new \Exception("La mesa no existe", 404);
        }

        $mesa->update([
            'estado' => $estado,
            'update_at' => now()->format('Y-m-d H:i:s')
        ]);

        return $mesa;
    }

    /**
     * Actualizar conteo de votantes en mesa
     */
    public function actualizarConteoVotantes($id, $cantidad_votantes)
    {
        $mesa = AsaMesas::find($id);
        if (!$mesa) {
            throw new \Exception("La mesa no existe", 404);
        }

        $mesa->update([
            'cantidad_votantes' => $cantidad_votantes,
            'update_at' => now()->format('Y-m-d H:i:s')
        ]);

        return $mesa;
    }

    /**
     * Actualizar conteo de votos en mesa
     */
    public function actualizarConteoVotos($id, $cantidad_votos)
    {
        $mesa = AsaMesas::find($id);
        if (!$mesa) {
            throw new \Exception("La mesa no existe", 404);
        }

        $mesa->update([
            'cantidad_votos' => $cantidad_votos,
            'update_at' => now()->format('Y-m-d H:i:s')
        ]);

        return $mesa;
    }

    /**
     * Abrir mesa para votación
     */
    public function abrirMesa($id)
    {
        return $this->cambiarEstadoMesa($id, 'A');
    }

    /**
     * Cerrar mesa para votación
     */
    public function cerrarMesa($id)
    {
        $mesa = $this->cambiarEstadoMesa($id, 'C');
        
        // Registrar hora de cierre
        $mesa->update([
            'hora_cierre_mesa' => now()->format('H:i:s'),
            'update_at' => now()->format('Y-m-d H:i:s')
        ]);

        return $mesa;
    }

    /**
     * Eliminar mesa
     */
    public function eliminarMesa($id)
    {
        $mesa = AsaMesas::find($id);
        if (!$mesa) {
            throw new \Exception("La mesa no existe", 404);
        }

        // Verificar que no tenga votantes asignados
        if ($mesa->cantidad_votantes > 0) {
            throw new \Exception("No se puede eliminar una mesa con votantes asignados", 400);
        }

        $mesa->delete();
        return true;
    }

    /**
     * Obtener resumen de mesas
     */
    public function getResumenMesas()
    {
        $mesas = $this->getMesasPorAsamblea();
        
        return [
            'total_mesas' => $mesas->count(),
            'mesas_activas' => $mesas->where('estado', 'A')->count(),
            'mesas_cerradas' => $mesas->where('estado', 'C')->count(),
            'total_votantes' => $mesas->sum('cantidad_votantes'),
            'total_votos' => $mesas->sum('cantidad_votos'),
            'promedio_votantes_por_mesa' => $mesas->avg('cantidad_votantes'),
            'promedio_votos_por_mesa' => $mesas->avg('cantidad_votos'),
        ];
    }

    /**
     * Asignar votantes a mesa
     */
    public function asignarVotantesAMesa($id, $votantes)
    {
        $mesa = AsaMesas::find($id);
        if (!$mesa) {
            throw new \Exception("La mesa no existe", 404);
        }

        if ($mesa->estado !== 'A') {
            throw new \Exception("Solo se pueden asignar votantes a mesas activas", 400);
        }

        $cantidad_votantes = count($votantes);
        
        // Actualizar conteo de votantes
        $mesa->update([
            'cantidad_votantes' => $cantidad_votantes,
            'update_at' => now()->format('Y-m-d H:i:s')
        ]);

        // Aquí iría la lógica para asignar los votantes específicos
        // a la mesa (actualizar sus registros de ingreso)

        return [
            'mesa' => $mesa->fresh(),
            'votantes_asignados' => $cantidad_votantes
        ];
    }

    /**
     * Validar si una mesa puede recibir votantes
     */
    public function puedeRecibirVotantes($id)
    {
        $mesa = AsaMesas::find($id);
        
        if (!$mesa) {
            return ['puede' => false, 'motivo' => 'La mesa no existe'];
        }

        if ($mesa->estado !== 'A') {
            return ['puede' => false, 'motivo' => 'La mesa no está activa'];
        }

        return ['puede' => true, 'motivo' => 'Mesa disponible para recibir votantes'];
    }

    /**
     * Buscar mesas por responsable
     */
    public function getMesasPorResponsable($cedtra)
    {
        return AsaMesas::with(['consenso'])
            ->where('cedtra_responsable', $cedtra)
            ->whereHas('consenso', function ($query) {
                $query->where('estado', 'A')
                    ->where('asamblea_id', $this->idAsamblea);
            })
            ->orderBy('codigo')
            ->get();
    }

    /**
     * Obtener estadísticas de votación por mesa
     */
    public function getEstadisticasVotacionPorMesa()
    {
        $mesas = $this->getMesasPorAsamblea();
        
        $estadisticas = $mesas->map(function ($mesa) {
            return [
                'id' => $mesa->id,
                'codigo' => $mesa->codigo,
                'cedtra_responsable' => $mesa->cedtra_responsable,
                'cantidad_votantes' => $mesa->cantidad_votantes,
                'cantidad_votos' => $mesa->cantidad_votos,
                'porcentaje_participacion' => $mesa->cantidad_votantes > 0 ? 
                    round(($mesa->cantidad_votos / $mesa->cantidad_votantes) * 100, 2) : 0,
                'estado' => $mesa->estado,
                'estado_descripcion' => $this->getEstadoDescripcion($mesa->estado)
            ];
        });

        return $estadisticas;
    }

    /**
     * Obtener descripción del estado
     */
    private function getEstadoDescripcion($estado)
    {
        $estados = [
            'A' => 'Activa',
            'C' => 'Cerrada',
            'I' => 'Inactiva',
            'P' => 'Pendiente'
        ];

        return $estados[$estado] ?? 'Desconocido';
    }
}
