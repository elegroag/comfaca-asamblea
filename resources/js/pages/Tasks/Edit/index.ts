import { Task } from '@/types/types';

interface TaskEditProps {
    task?: Task;
    [key: string]: any;
}

interface TaskEditComponent {
    render(props: TaskEditProps): string;
    mount(el: HTMLElement, props: TaskEditProps): void;
}

const TaskEdit: TaskEditComponent = {
    render(props: TaskEditProps): string {
        const task = props?.task ?? {};
        return `
      <div class="tasks-edit">
        <h1>Editar Tarea</h1>
        <form id="task-form">
          <label>Nombre</label>
          <input name="name" type="text" value="${task.name ?? ''}" required />
          <button type="submit">Actualizar</button>
        </form>
        <form id="delete-form">
          <button type="submit" class="danger">Eliminar</button>
        </form>
      </div>
    `;
    },

    mount(el: HTMLElement, props: TaskEditProps): void {
        const task = props?.task ?? {};
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        if (!csrfToken) {
            console.error('CSRF token not found');
            return;
        }

        const form = el.querySelector('#task-form') as HTMLFormElement;
        if (form) {
            form.addEventListener('submit', async (e: Event) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                try {
                    const response = await fetch(window.route('tasks.update', { task: task.id }), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify({ ...data, _method: 'PUT' })
                    });
                    
                    if (response.ok) {
                        const { Inertia } = await import('@inertiajs/inertia');
                        Inertia.visit(window.route('tasks.index'));
                    } else {
                        console.error('Error updating task');
                    }
                } catch (error) {
                    console.error('Error in update request:', error);
                }
            });
        }

        const deleteForm = el.querySelector('#delete-form') as HTMLFormElement;
        if (deleteForm) {
            deleteForm.addEventListener('submit', async (e: Event) => {
                e.preventDefault();
                
                if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
                    return;
                }
                
                try {
                    const response = await fetch(window.route('tasks.destroy', { task: task.id }), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify({ _method: 'DELETE' })
                    });
                    
                    if (response.ok) {
                        const { Inertia } = await import('@inertiajs/inertia');
                        Inertia.visit(window.route('tasks.index'));
                    } else {
                        console.error('Error deleting task');
                    }
                } catch (error) {
                    console.error('Error in delete request:', error);
                }
            });
        }
    }
};

export default TaskEdit;