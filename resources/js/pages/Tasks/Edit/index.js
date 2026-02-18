export default {
  render(props) {
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
  mount(el, props) {
    const task = props?.task ?? {};
    const csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    const form = el.querySelector('#task-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        const res = await fetch(window.route('tasks.update', { task: task.id }), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrf,
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ ...data, _method: 'PUT' })
        });
        if (res.ok) {
          const { Inertia } = await import('@inertiajs/inertia');
          Inertia.visit(window.route('tasks.index'));
        }
      });
    }

    const deleteForm = el.querySelector('#delete-form');
    if (deleteForm) {
      deleteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const res = await fetch(window.route('tasks.destroy', { task: task.id }), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrf,
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ _method: 'DELETE' })
        });
        if (res.ok) {
          const { Inertia } = await import('@inertiajs/inertia');
          Inertia.visit(window.route('tasks.index'));
        }
      });
    }
  }
};