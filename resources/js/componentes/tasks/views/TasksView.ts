import { BackboneView } from "@/common/Bone";
import { Inertia } from "@inertiajs/inertia";

export default class TasksView extends BackboneView {
    constructor(options: any) {
        super(options);
    }

    onRender() {
        /*   const items = Array.isArray(props?.tasks) ? props.tasks : [];
          const list = items
              .map((task: Task) => `
                  <li data-id="${task.id}">
                      <span>${task.name ?? task.title ?? "(sin nombre)"}</span>
                      <button class="edit" data-id="${task.id}">Editar</button>
                      <button class="delete" data-id="${task.id}">Eliminar</button>
                  </li>
              `)
              .join("");

          return `
              <div class="tasks-index">
                  <h1>Tareas</h1>
                  <div class="actions">
                      <a id="create-link" href="${window.route(
              "tasks.create"
          )}">Nueva</a>
                  </div>
                  <ul>${list}</ul>
                  <button id="refresh">Refresh</button>
              </div>
          `; */
        return this;
    }

    mount(el: HTMLElement) {
        const refreshBtn = el.querySelector("#refresh");
        if (refreshBtn) {
            refreshBtn.addEventListener("click", () => Inertia.reload());
        }

        // Navegación crear
        const createLink = el.querySelector("#create-link") as HTMLAnchorElement;
        if (createLink) {
            createLink.addEventListener("click", (e: MouseEvent) => {
                e.preventDefault();
                Inertia.visit(window.route("tasks.create"));
            });
        }

        // Delegación para editar/eliminar
        el.addEventListener("click", async (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (target.matches("button.edit")) {
                const id = target.getAttribute("data-id");
                e.preventDefault();
                Inertia.visit(window.route("tasks.edit", { task: id }));
            }

            if (target.matches("button.delete")) {
                const id = target.getAttribute("data-id");
                e.preventDefault();

                const csrf = document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content");

                if (!csrf) {
                    console.error("CSRF token not found");
                    return;
                }

                try {
                    const res = await fetch(
                        window.route("tasks.destroy", { task: id }),
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRF-TOKEN": csrf,
                                "X-Requested-With": "XMLHttpRequest",
                            },
                        }
                    );

                    if (res.ok) {
                        // Recargar la página para mostrar los cambios
                        Inertia.reload();
                    } else {
                        console.error("Error al eliminar la tarea");
                    }
                } catch (error) {
                    console.error("Error en la petición:", error);
                }
            }
        });
    }
}
