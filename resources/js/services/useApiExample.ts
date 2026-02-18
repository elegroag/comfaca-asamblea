// Ejemplo de uso del API client con Sanctum en TypeScript para Tasks

import $App from '@/core/App';

// Interfaces para tipado
interface Task {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

interface TaskStats {
    total: number;
    completed: number;
    pending: number;
    completion_rate: number;
}

interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

interface CreateTaskData {
    title: string;
    description?: string;
    completed?: boolean;
}

interface UpdateTaskData {
    title?: string;
    description?: string;
    completed?: boolean;
}

// 1. Obtener tareas del usuario
async function loadTasks(): Promise<Task[]> {
    try {
        const response: ApiResponse<Task[]> = await $App.api.get('/tasks');
        console.log('Tasks loaded:', response.data);

        // Renderizar tareas en la vista
        renderTasks(response.data);
        return response.data;
    } catch (error) {
        console.error('Error loading tasks:', error);
        $App.notify('error', 'Error al cargar tareas');
        return [];
    }
}

// 2. Crear nueva tarea
async function createTask(taskData: CreateTaskData): Promise<Task | null> {
    try {
        const response: ApiResponse<Task> = await $App.api.post('/tasks', {
            title: taskData.title,
            description: taskData.description || null,
            completed: taskData.completed || false
        });

        console.log('Task created:', response.data);
        $App.notify('success', 'Tarea creada exitosamente');

        // Recargar lista de tareas
        await loadTasks();
        return response.data;
    } catch (error) {
        console.error('Error creating task:', error);
        $App.notify('error', 'Error al crear tarea');
        return null;
    }
}

// 3. Actualizar tarea
async function updateTask(taskId: number, taskData: UpdateTaskData): Promise<Task | null> {
    try {
        const response: ApiResponse<Task> = await $App.api.put(`/tasks/${taskId}`, taskData);

        console.log('Task updated:', response.data);
        $App.notify('success', 'Tarea actualizada exitosamente');

        // Recargar lista de tareas
        await loadTasks();
        return response.data;
    } catch (error) {
        console.error('Error updating task:', error);
        $App.notify('error', 'Error al actualizar tarea');
        return null;
    }
}

// 4. Eliminar tarea
async function deleteTask(taskId: number): Promise<boolean> {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) {
        return false;
    }

    try {
        await $App.api.delete(`/tasks/${taskId}`);

        console.log('Task deleted:', taskId);
        $App.notify('success', 'Tarea eliminada exitosamente');

        // Recargar lista de tareas
        await loadTasks();
        return true;
    } catch (error) {
        console.error('Error deleting task:', error);
        $App.notify('error', 'Error al eliminar tarea');
        return false;
    }
}

// 5. Marcar tarea como completada
async function toggleTaskComplete(taskId: number): Promise<Task | null> {
    try {
        const response: ApiResponse<Task> = await $App.api.post(`/tasks/${taskId}/toggle-complete`);

        console.log('Task status toggled:', response.data);
        $App.notify('success', 'Estado de tarea actualizado');

        // Recargar lista de tareas
        await loadTasks();
        return response.data;
    } catch (error) {
        console.error('Error toggling task:', error);
        $App.notify('error', 'Error al cambiar estado de tarea');
        return null;
    }
}

// 6. Obtener estadísticas de tareas
async function loadTaskStats(): Promise<TaskStats | null> {
    try {
        const response: ApiResponse<TaskStats> = await $App.api.get('/tasks/stats');
        console.log('Task stats:', response.data);

        // Renderizar estadísticas
        renderStats(response.data);
        return response.data;
    } catch (error) {
        console.error('Error loading stats:', error);
        return null;
    }
}

// 7. Buscar tareas
async function searchTasks(query: string): Promise<Task[]> {
    try {
        const response: ApiResponse<Task[]> = await $App.api.get('/tasks/search', { q: query });
        console.log('Search results:', response.data);

        // Renderizar resultados de búsqueda
        renderTasks(response.data);
        return response.data;
    } catch (error) {
        console.error('Error searching tasks:', error);
        $App.notify('error', 'Error al buscar tareas');
        return [];
    }
}

// 8. Obtener tareas completadas
async function loadCompletedTasks(): Promise<Task[]> {
    try {
        const response: ApiResponse<Task[]> = await $App.api.get('/tasks/completed');
        console.log('Completed tasks:', response.data);

        renderTasks(response.data);
        return response.data;
    } catch (error) {
        console.error('Error loading completed tasks:', error);
        $App.notify('error', 'Error al cargar tareas completadas');
        return [];
    }
}

// 9. Obtener tareas pendientes
async function loadPendingTasks(): Promise<Task[]> {
    try {
        const response: ApiResponse<Task[]> = await $App.api.get('/tasks/pending');
        console.log('Pending tasks:', response.data);

        renderTasks(response.data);
        return response.data;
    } catch (error) {
        console.error('Error loading pending tasks:', error);
        $App.notify('error', 'Error al cargar tareas pendientes');
        return [];
    }
}

// Función de renderizado con tipado
function renderTasks(tasks: Task[]): void {
    const container = document.getElementById('tasks-container') as HTMLElement;
    if (!container) return;

    container.innerHTML = tasks.map((task: Task) => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
            <h3>${task.title}</h3>
            <p>${task.description || 'Sin descripción'}</p>
            <div class="task-meta">
                <small>Creada: ${new Date(task.created_at).toLocaleDateString()}</small>
                <small>Actualizada: ${new Date(task.updated_at).toLocaleDateString()}</small>
            </div>
            <div class="task-actions">
                <button onclick="toggleTaskComplete(${task.id})" class="btn-toggle">
                    ${task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                </button>
                <button onclick="deleteTask(${task.id})" class="btn-delete">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// Función de renderizado de estadísticas con tipado
function renderStats(stats: TaskStats): void {
    const container = document.getElementById('stats-container') as HTMLElement;
    if (!container) return;

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <h4>Total</h4>
                <span>${stats.total}</span>
            </div>
            <div class="stat-item">
                <h4>Completadas</h4>
                <span>${stats.completed}</span>
            </div>
            <div class="stat-item">
                <h4>Pendientes</h4>
                <span>${stats.pending}</span>
            </div>
            <div class="stat-item">
                <h4>Progreso</h4>
                <span>${stats.completion_rate}%</span>
            </div>
        </div>
    `;
}

// Clase TasksComponent para manejo completo
class TasksComponent {
    private tasks: Task[] = [];
    private stats: TaskStats | null = null;
    private currentFilter: 'all' | 'completed' | 'pending' = 'all';

    async mounted(): Promise<void> {
        // Verificar si hay token disponible
        const token = $App.api.getToken();
        if (!token) {
            console.warn('No Sanctum token available');
            $App.notify('error', 'No hay token de API disponible');
            return;
        }

        // Cargar datos iniciales
        await Promise.all([
            this.loadTasks(),
            this.loadStats()
        ]);

        this.setupEventListeners();
    }

    async loadTasks(): Promise<void> {
        this.tasks = await loadTasks();
    }

    async loadStats(): Promise<void> {
        this.stats = await loadTaskStats();
    }

    async createTask(taskData: CreateTaskData): Promise<void> {
        await createTask(taskData);
    }

    async updateTask(taskId: number, taskData: UpdateTaskData): Promise<void> {
        await updateTask(taskId, taskData);
    }

    async deleteTask(taskId: number): Promise<void> {
        await deleteTask(taskId);
    }

    async toggleComplete(taskId: number): Promise<void> {
        await toggleTaskComplete(taskId);
    }

    async searchTasks(query: string): Promise<void> {
        if (query.trim()) {
            this.tasks = await searchTasks(query);
        } else {
            await this.loadTasks();
        }
    }

    async filterTasks(filter: 'all' | 'completed' | 'pending'): Promise<void> {
        this.currentFilter = filter;

        switch (filter) {
            case 'completed':
                this.tasks = await loadCompletedTasks();
                break;
            case 'pending':
                this.tasks = await loadPendingTasks();
                break;
            default:
                await this.loadTasks();
        }
    }

    private setupEventListeners(): void {
        // Event listener para formulario de creación
        const form = document.getElementById('task-form') as HTMLFormElement;
        if (form) {
            form.addEventListener('submit', async (e: Event) => {
                e.preventDefault();
                const formData = new FormData(form);
                const title = formData.get('title') as string;
                const description = formData.get('description') as string;

                if (title.trim()) {
                    await this.createTask({ title, description });
                    form.reset();
                }
            });
        }

        // Event listener para búsqueda
        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        if (searchInput) {
            let searchTimeout: NodeJS.Timeout;
            searchInput.addEventListener('input', (e: Event) => {
                clearTimeout(searchTimeout);
                const query = (e.target as HTMLInputElement).value;

                searchTimeout = setTimeout(() => {
                    this.searchTasks(query);
                }, 300);
            });
        }

        // Event listeners para filtros
        const filterButtons = document.querySelectorAll('[data-filter]');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e: Event) => {
                const filter = (e.target as HTMLElement).dataset.filter as 'all' | 'completed' | 'pending';
                this.filterTasks(filter);

                // Actualizar botón activo
                filterButtons.forEach(btn => btn.classList.remove('active'));
                (e.target as HTMLElement).classList.add('active');
            });
        });
    }
}

// Declaraciones globales para TypeScript
declare global {
    interface Window {
        loadTasks: typeof loadTasks;
        createTask: typeof createTask;
        updateTask: typeof updateTask;
        deleteTask: typeof deleteTask;
        toggleTaskComplete: typeof toggleTaskComplete;
        searchTasks: typeof searchTasks;
        loadCompletedTasks: typeof loadCompletedTasks;
        loadPendingTasks: typeof loadPendingTasks;
        TasksComponent: typeof TasksComponent;
    }
}

// Exportar funciones y clase para uso global
window.loadTasks = loadTasks;
window.createTask = createTask;
window.updateTask = updateTask;
window.deleteTask = deleteTask;
window.toggleTaskComplete = toggleTaskComplete;
window.searchTasks = searchTasks;
window.loadCompletedTasks = loadCompletedTasks;
window.loadPendingTasks = loadPendingTasks;
window.TasksComponent = TasksComponent;

// Inicialización cuando el componente se monta
document.addEventListener('DOMContentLoaded', function () {
    const tasksComponent = new TasksComponent();
    tasksComponent.mounted();
});

export {
    TasksComponent,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    searchTasks,
    loadCompletedTasks,
    loadPendingTasks,
    loadTaskStats
};

export type {
    Task,
    TaskStats,
    ApiResponse,
    CreateTaskData,
    UpdateTaskData
};
