import { route as ziggyRoute } from "ziggy-js";
import { InertiaProgress } from "@inertiajs/progress";
import "./styles/app.css";
import Logger from './common/Logger';
import ApiService from './services/ApiService';
import type { PageComponent, PageData } from './types/types';

// Mapeo de páginas usando Vite (incluye ambos para compatibilidad)
const pages = import.meta.glob("./pages/**/*.{ts,js}");

// Resuelve una página por nombre (por ejemplo, 'Tasks/Index')
async function resolvePage(name: string): Promise<PageComponent> {
    // Intentar diferentes formatos de clave
    const possibleKeys = [
        `./pages/${name}/index.ts`,
        `./pages/${name}.ts`,
        `./Pages/${name}/index.ts`,
        `./Pages/${name}.ts`,
    ];

    let loader: any = null;
    let usedKey = '';

    for (const key of possibleKeys) {
        if (pages[key]) {
            loader = pages[key];
            usedKey = key;
            break;
        }
    }

    if (!loader) {
        console.error("Página no encontrada:", name);
        console.error("Claves disponibles:", Object.keys(pages));
        throw new Error(`Página no encontrada: ${name}`);
    }

    console.log("Cargando página:", usedKey);
    const mod = await loader() as { default: PageComponent } | PageComponent;
    return mod.default ?? mod;
}

// Render simple: el componente debe exponer render(props) y opcional mount(el, props)
async function renderPage(page: PageData): Promise<void> {
    const component = await resolvePage(page.component);
    const el = document.getElementById("app");

    console.log("Props:", page.props);

    if (!el) {
        console.error("Elemento #app no encontrado en el DOM");
        return;
    }

    const logger = new Logger();
    const api = new ApiService(page.props);

    // Render HTML
    const html = component.render ? component.render({ ...page.props, api, logger }) : "";
    el.innerHTML = html;

    // Hook de montaje
    if (typeof component.mount === "function") {
        component.mount(el, { ...page.props, api, logger });
    }
}

// Inicio: lee data-page del div generado por @inertia
function getInitialPage(): PageData {
    const el = document.getElementById("app");
    if (!el) throw new Error("Elemento #app no encontrado");

    const data = el.getAttribute("data-page");
    if (!data) throw new Error("data-page no encontrado en #app");

    return JSON.parse(data) as PageData;
}

async function boot(): Promise<void> {
    // Barra de progreso
    InertiaProgress.init();

    // Exponer helper global de rutas (Ziggy)
    window.route = (name: string, params: Record<string, any> = {}, absolute: boolean = false): string =>
        ziggyRoute(name, params, absolute, window.Ziggy);

    // Render inicial
    const initialPage = getInitialPage();
    await renderPage(initialPage);

    // Re-render en navegación Inertia
    document.addEventListener("inertia:navigate", async (event: Event) => {
        const customEvent = event as CustomEvent<PageData>;
        const page = customEvent.detail?.page;
        if (page) await renderPage(page);
    });
}

// Iniciar la aplicación
boot().catch(error => {
    console.error("Error al iniciar la aplicación:", error);
});

export type { PageComponent, PageData };
