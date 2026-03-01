<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class TaskApiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $tasks = Task::where('user_id', auth()->id())
            ->select('id', 'title', 'description', 'completed', 'created_at', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $tasks->items(),
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description ?? null,
            'completed' => $request->completed ?? false,
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Task created successfully',
            'data' => [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'completed' => $task->completed,
                'created_at' => $task->created_at,
                'updated_at' => $task->updated_at,
            ]
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $task = Task::where('user_id', auth()->id())
            ->select('id', 'title', 'description', 'completed', 'created_at', 'updated_at')
            ->find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $task
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $task = Task::where('user_id', auth()->id())->find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = [];
        if ($request->has('title')) {
            $updateData['title'] = $request->title;
        }
        if ($request->has('description')) {
            $updateData['description'] = $request->description;
        }
        if ($request->has('completed')) {
            $updateData['completed'] = $request->completed;
        }

        $task->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully',
            'data' => [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'completed' => $task->completed,
                'created_at' => $task->created_at,
                'updated_at' => $task->updated_at,
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $task = Task::where('user_id', auth()->id())->find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found'
            ], 404);
        }

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully'
        ]);
    }

    /**
     * Toggle task completion status.
     */
    public function toggleComplete(string $id): JsonResponse
    {
        $task = Task::where('user_id', auth()->id())->find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found'
            ], 404);
        }

        $task->completed = !$task->completed;
        $task->save();

        return response()->json([
            'success' => true,
            'message' => 'Task status updated successfully',
            'data' => [
                'id' => $task->id,
                'completed' => $task->completed,
                'updated_at' => $task->updated_at,
            ]
        ]);
    }

    /**
     * Get completed tasks.
     */
    public function completed(): JsonResponse
    {
        $tasks = Task::where('user_id', auth()->id())
            ->where('completed', true)
            ->select('id', 'title', 'description', 'completed', 'created_at', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $tasks->items(),
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ]
        ]);
    }

    /**
     * Get pending tasks.
     */
    public function pending(): JsonResponse
    {
        $tasks = Task::where('user_id', auth()->id())
            ->where('completed', false)
            ->select('id', 'title', 'description', 'completed', 'created_at', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $tasks->items(),
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ]
        ]);
    }

    /**
     * Search tasks by title or description.
     */
    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $tasks = Task::where('user_id', auth()->id())
            ->where(function ($query) use ($request) {
                $query->where('title', 'like', '%' . $request->q . '%')
                    ->orWhere('description', 'like', '%' . $request->q . '%');
            })
            ->select('id', 'title', 'description', 'completed', 'created_at', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $tasks->items(),
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
            'search_query' => $request->q
        ]);
    }

    /**
     * Get task statistics.
     */
    public function stats(): JsonResponse
    {
        $userId = auth()->id();

        $stats = [
            'total' => Task::where('user_id', $userId)->count(),
            'completed' => Task::where('user_id', $userId)->where('completed', true)->count(),
            'pending' => Task::where('user_id', $userId)->where('completed', false)->count(),
            'completion_rate' => 0,
        ];

        if ($stats['total'] > 0) {
            $stats['completion_rate'] = round(($stats['completed'] / $stats['total']) * 100, 2);
        }

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
