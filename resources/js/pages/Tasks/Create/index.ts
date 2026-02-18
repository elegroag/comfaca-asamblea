interface TaskFormData {
    name: string;
}

interface TaskCreateComponent {
    render(): string;
    mount(el: HTMLElement): void;
}

export default {
    render(): string {
        return `
            <div class="tasks-create">
                <h1>Nueva Tarea</h1>
                <form id="task-form">
                    <label>Nombre</label>
                    <input name="name" type="text" required />
                    <button type="submit">Guardar</button>
                </form>
            </div>
        `;
    },
    
    mount(el: HTMLElement): void {
        const form = el.querySelector('#task-form') as HTMLFormElement;
        if (form) {
            form.addEventListener('submit', async (e: Event) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data: TaskFormData = Object.fromEntries(formData.entries()) as TaskFormData;
                
                const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                
                if (!token) {
                    console.error('CSRF token not found');
                    return;
                }
                
                try {
                    const response = await fetch(window.route('tasks.store'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': token,
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify(data)
                    });
                    
                    if (response.ok) {
                        const { Inertia } = await import('@inertiajs/inertia');
                        Inertia.visit(window.route('tasks.index'));
                    } else {
                        console.error('Error al crear la tarea');
                    }
                } catch (error) {
                    console.error('Error en la petición:', error);
                }
            });
        }
    }
} as TaskCreateComponent;