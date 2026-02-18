<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    function initialize() {}

    /** Listado */
    public function index()
    {
        $this->initialize('primary');

        $user = auth()->user();


        // Obtener tareas del usuario autenticado
        $tasks = Task::where('usuario_sisu_id', $user->id)
            ->select('id', 'title', 'description', 'completed', 'created_at', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->get();

        // Dual response: HTML/Inertia o JSON
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $tasks,
                'message' => 'Tasks loaded successfully'
            ]);
        }

        return Inertia::render('Tasks/Index', [
            'title' => 'Task',
            'tasks' => $tasks
        ]);
    }

    /** Vista de creación */
    public function create()
    {
        $this->initialize('primary');
        return Inertia::render('Tasks/Create');
    }

    /** Mostrar tarea específica */
    public function show(Task $task)
    {
        // Validar ownership: solo el dueño puede ver
        if ($task->usuario_sisu_id !== auth()->id()) {
            // Dual response: HTML/Inertia o JSON
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You can only view your own tasks'
                ], 403);
            }

            abort(403, 'Unauthorized - You can only view your own tasks');
        }

        $this->initialize('primary');

        // Dual response: HTML/Inertia o JSON
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $task,
                'message' => 'Task retrieved successfully'
            ]);
        }

        return Inertia::render('Tasks/Show', ['task' => $task]);
    }

    /** Guardar */
    public function store(StoreTaskRequest $request)
    {
        // Crear tarea con user_id del usuario autenticado
        $task = Task::create(array_merge($request->validated(), [
            'usuario_sisu_id' => auth()->id()
        ]));

        // Dual response: HTML/Inertia o JSON
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $task,
                'message' => 'Task created successfully'
            ], 201);
        }

        return redirect()->route('tasks.index')
            ->with('success', 'Task created successfully.');
    }

    /** Vista de edición */
    public function edit(Task $task)
    {
        // Validar ownership: solo el dueño puede editar
        if ($task->usuario_sisu_id !== auth()->id()) {
            // Dual response: HTML/Inertia o JSON
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You can only edit your own tasks'
                ], 403);
            }

            abort(403, 'Unauthorized - You can only edit your own tasks');
        }

        $this->initialize('primary');

        // Dual response: HTML/Inertia o JSON
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $task,
                'message' => 'Task retrieved for editing'
            ]);
        }

        return Inertia::render('Tasks/Edit', ['task' => $task]);
    }

    /** Actualizar */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        // Validar ownership: solo el dueño puede actualizar
        if ($task->usuario_sisu_id !== auth()->id()) {
            // Dual response: HTML/Inertia o JSON
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You can only update your own tasks'
                ], 403);
            }

            abort(403, 'Unauthorized - You can only update your own tasks');
        }

        $task->update($request->validated());

        // Dual response: HTML/Inertia o JSON
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => $task,
                'message' => 'Task updated successfully'
            ]);
        }

        return redirect()->route('tasks.index')
            ->with('success', 'Task updated successfully.');
    }

    /** Borrar */
    public function destroy(Task $task)
    {
        // Validar ownership: solo el dueño puede eliminar
        if ($task->usuario_sisu_id !== auth()->id()) {
            // Dual response: HTML/Inertia o JSON
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You can only delete your own tasks'
                ], 403);
            }

            abort(403, 'Unauthorized - You can only delete your own tasks');
        }

        $task->delete();

        // Dual response: HTML/Inertia o JSON
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Task deleted successfully'
            ]);
        }

        return back()->with('success', 'Task deleted.');
    }
}
