<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    function initialize() {}

    /** Dashboard principal */
    public function index()
    {
        $this->initialize('primary');

        $user = auth()->user();

        // Obtener estadísticas de tareas del usuario
        $stats = [
            'totalTasks' => Task::where('usuario_sisu_id', $user->id)->count(),
            'completedTasks' => Task::where('usuario_sisu_id', $user->id)->where('completed', true)->count(),
            'pendingTasks' => Task::where('usuario_sisu_id', $user->id)->where('completed', false)->count(),
        ];

        // Dual response: HTML/Inertia o JSON
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Dashboard loaded successfully',
                'data' => $stats
            ]);
        }

        return Inertia::render('Dashboard', [
            'title' => 'Dashboard',
            'stats' => $stats
        ]);
    }
}
