<?php

namespace App\Http\Controllers;

use App\Models\AsaMesas;
use App\Models\AsaConsenso;
use App\Services\Asamblea\AsambleaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MesasController extends Controller
{
    protected AsambleaService $asambleaService;
    protected ?int $idAsamblea;
    protected ?string $cedtra;

    public function __construct(AsambleaService $asambleaService)
    {
        $this->asambleaService = $asambleaService;
        $this->middleware(function ($request, $next) {
            $this->idAsamblea = $this->asambleaService->getAsambleaActiva();
            $this->cedtra = Auth::user()->cedtra ?? null;
            return $next($request);
        });
    }

    /**
     * Mostrar vista principal de mesas
     */
    public function index()
    {
        return view('mesas.index', [
            'titulo' => 'Mesas de Votación',
            'itemMenuSidebar' => 5
        ]);
    }

    /**
     * Crear una nueva mesa de votación
     */
    public function create(Request $request): JsonResponse
    {
        try {
            // Validar que exista un consenso activo para la asamblea
            $asaConsenso = AsaConsenso::where('id', $this->idAsamblea)
                ->where('estado', 'A')
                ->first();

            if (!$asaConsenso) {
                return response()->json([
                    'success' => false,
                    'error' => 'No hay un consenso activo para esta asamblea'
                ], 404);
            }

            // Validar datos de entrada
            $validated = $request->validate([
                'codigo' => 'required|string|max:20',
                'cedtra_responsable' => 'required|string|max:20',
                'estado' => 'required|string|max:2',
                'hora_apertura' => 'nullable|date_format:H:i',
                'hora_cierre_mesa' => 'nullable|date_format:H:i',
                'cantidad_votantes' => 'nullable|integer|min:0',
                'cantidad_votos' => 'nullable|integer|min:0'
            ]);

            // Crear la mesa
            $asaMesas = AsaMesas::create([
                'codigo' => $validated['codigo'],
                'cedtra_responsable' => $validated['cedtra_responsable'],
                'estado' => $validated['estado'],
                'consenso_id' => $asaConsenso->id,
                'hora_apertura' => $validated['hora_apertura'] ?? null,
                'hora_cierre_mesa' => $validated['hora_cierre_mesa'] ?? null,
                'cantidad_votantes' => $validated['cantidad_votantes'] ?? 0,
                'cantidad_votos' => $validated['cantidad_votos'] ?? 0,
                'create_at' => now()->format('Y-m-d'),
                'update_at' => now()->format('Y-m-d'),
            ]);

            Log::info('Mesa creada exitosamente', [
                'mesa_id' => $asaMesas->id,
                'codigo' => $asaMesas->codigo,
                'consenso_id' => $asaConsenso->id,
                'usuario' => Auth::user()->usuario
            ]);

            return response()->json([
                'success' => true,
                'mesa' => $asaMesas->toArray()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creando mesa: ' . $e->getMessage(), [
                'request' => $request->all(),
                'usuario' => Auth::user()->usuario ?? 'unknown'
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error al crear la mesa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar todas las mesas de la asamblea activa
     */
    public function listar(): JsonResponse
    {
        try {
            $mesas = AsaMesas::with(['consenso', 'responsable'])
                ->whereHas('consenso', function ($query) {
                    $query->where('id', $this->idAsamblea)
                        ->where('estado', 'A');
                })
                ->orderBy('codigo')
                ->get();

            return response()->json([
                'success' => true,
                'mesas' => $mesas->toArray(),
                'total' => $mesas->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error listando mesas: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Error al listar las mesas'
            ], 500);
        }
    }

    /**
     * Actualizar una mesa existente
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $mesa = AsaMesas::findOrFail($id);

            // Validar que la mesa pertenezca al consenso activo
            if ($mesa->consenso_id !== $this->idAsamblea) {
                return response()->json([
                    'success' => false,
                    'error' => 'La mesa no pertenece a la asamblea activa'
                ], 403);
            }

            $validated = $request->validate([
                'codigo' => 'sometimes|required|string|max:20',
                'cedtra_responsable' => 'sometimes|required|string|max:20',
                'estado' => 'sometimes|required|string|max:2',
                'hora_apertura' => 'nullable|date_format:H:i',
                'hora_cierre_mesa' => 'nullable|date_format:H:i',
                'cantidad_votantes' => 'nullable|integer|min:0',
                'cantidad_votos' => 'nullable|integer|min:0'
            ]);

            $mesa->update(array_merge($validated, [
                'update_at' => now()->format('Y-m-d')
            ]));

            Log::info('Mesa actualizada exitosamente', [
                'mesa_id' => $mesa->id,
                'usuario' => Auth::user()->usuario
            ]);

            return response()->json([
                'success' => true,
                'mesa' => $mesa->fresh()->toArray()
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Mesa no encontrada'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error actualizando mesa: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Error al actualizar la mesa'
            ], 500);
        }
    }

    /**
     * Eliminar una mesa
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $mesa = AsaMesas::findOrFail($id);

            // Validar que la mesa pertenezca al consenso activo
            if ($mesa->consenso_id !== $this->idAsamblea) {
                return response()->json([
                    'success' => false,
                    'error' => 'La mesa no pertenece a la asamblea activa'
                ], 403);
            }

            $mesa->delete();

            Log::info('Mesa eliminada exitosamente', [
                'mesa_id' => $id,
                'codigo' => $mesa->codigo,
                'usuario' => Auth::user()->usuario
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Mesa eliminada correctamente'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Mesa no encontrada'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error eliminando mesa: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Error al eliminar la mesa'
            ], 500);
        }
    }

    /**
     * Obtener detalles de una mesa específica
     */
    public function show(int $id): JsonResponse
    {
        try {
            $mesa = AsaMesas::with(['consenso', 'responsable'])
                ->findOrFail($id);

            // Validar que la mesa pertenezca al consenso activo
            if ($mesa->consenso_id !== $this->idAsamblea) {
                return response()->json([
                    'success' => false,
                    'error' => 'La mesa no pertenece a la asamblea activa'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'mesa' => $mesa->toArray()
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Mesa no encontrada'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error obteniendo detalles de mesa: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Error al obtener los detalles de la mesa'
            ], 500);
        }
    }

    /**
     * Cambiar estado de una mesa (abrir/cerrar)
     */
    public function cambiarEstado(Request $request, int $id): JsonResponse
    {
        try {
            $mesa = AsaMesas::findOrFail($id);

            // Validar que la mesa pertenezca al consenso activo
            if ($mesa->consenso_id !== $this->idAsamblea) {
                return response()->json([
                    'success' => false,
                    'error' => 'La mesa no pertenece a la asamblea activa'
                ], 403);
            }

            $validated = $request->validate([
                'estado' => 'required|string|max:2'
            ]);

            $mesa->update([
                'estado' => $validated['estado'],
                'update_at' => now()->format('Y-m-d')
            ]);

            // Actualizar horas según el estado
            if ($validated['estado'] === 'A') {
                $mesa->hora_apertura = now()->format('H:i:s');
            } elseif ($validated['estado'] === 'C') {
                $mesa->hora_cierre_mesa = now()->format('H:i:s');
            }

            $mesa->save();

            Log::info('Estado de mesa cambiado', [
                'mesa_id' => $mesa->id,
                'nuevo_estado' => $validated['estado'],
                'usuario' => Auth::user()->usuario
            ]);

            return response()->json([
                'success' => true,
                'mesa' => $mesa->fresh()->toArray(),
                'message' => 'Estado actualizado correctamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error cambiando estado de mesa: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Error al cambiar el estado de la mesa'
            ], 500);
        }
    }
}
