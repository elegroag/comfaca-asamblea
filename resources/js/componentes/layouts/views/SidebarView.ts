import { BackboneView } from "@/common/Bone";
import tmp_sidebar from "@/componentes/layouts/templates/sidebar.hbs?raw";
import { route } from "ziggy-js";

interface SidebarItem {
    id: number;
    sidebar_id: number;
    rol: string;
    created_at: string;
    updated_at: string;
    sidebar: {
        id: number;
        label: string;
        estado: string;
        resource_router: string | null;
        orden: number;
        sidebar_id: number | null;
        ambiente: string;
        icon: string;
        created_at: string;
        updated_at: string;
    };
}

export default class SidebarView extends BackboneView {
    constructor(options: any) {
        super({
            ...options,
            className: 'sidebar-container'
        });
        this.template = _.template(tmp_sidebar);
        this.model = options.model || { menu: [], user: { name: 'Usuario', email: 'usuario@example.com' } };
    }

    static parentView = void 0;

    render() {
        console.log('SidebarView render', this.model.menu);

        // Procesar el menú para añadir hijos y propiedades adicionales
        const processedMenu = this.processMenu(this.model.menu || []);

        const el = this.$el;
        const template = this.template({
            user: this.model.user,
            menu: processedMenu
        });
        el.html(template);

        // Inicializar eventos después de renderizar
        this.initializeEvents();

        return this;
    }

    get events() {
        return {
            'click #bt_listar': 'listarData',
            'keydown #bt_listar': 'toggleSidebar',
            'click  #bt_logout': 'logout'
        };
    }

    logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Redirigir al logout
            window.location.href = route('logout');
        }
    }

    listarData() {
        console.log('listarData');
    }

    toggleSidebar(e: KeyboardEvent) {
        // Ctrl/Cmd + B para toggle sidebar
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            document.body.classList.toggle('sidebar-collapsed');
        }
    }

    /**
     * Procesa el menú para organizarlo jerárquicamente
     * Convierte el array plano en estructura de árbol
     */
    processMenu(items: SidebarItem[]): SidebarItem[] {
        if (!items || items.length === 0) {
            return [];
        }

        // 1. Crear un mapa de todos los items para acceso rápido
        const itemMap = new Map<number, SidebarItem & { hasChildren?: boolean; children?: SidebarItem[] }>();

        items.forEach(item => {
            itemMap.set(item.id, { ...item, hasChildren: false, children: [] });
        });

        // 2. Identificar items raíz (sin padre)
        const rootItems: (SidebarItem & { hasChildren?: boolean; children?: SidebarItem[] })[] = [];

        items.forEach(item => {
            const processedItem = itemMap.get(item.id)!;

            if (item.sidebar.sidebar_id === null) {
                // Es un item raíz
                rootItems.push(processedItem);
            } else {
                // Es un hijo, buscar su padre
                const parent = itemMap.get(item.sidebar.sidebar_id);
                if (parent) {
                    parent.children!.push(processedItem);
                    parent.hasChildren = true;
                }
            }
        });

        // 3. Ordenar items raíz por el campo orden
        rootItems.sort((a, b) => a.sidebar.orden - b.sidebar.orden);

        // 4. Ordenar hijos de cada item raíz
        rootItems.forEach(rootItem => {
            if (rootItem.children && rootItem.children.length > 0) {
                rootItem.children.sort((a, b) => a.sidebar.orden - b.sidebar.orden);
            }
        });

        console.log('Processed menu:', rootItems);
        return rootItems;
    }

    /**
     * Verifica si un item tiene hijos (método alternativo)
     */
    hasChildren(item: SidebarItem, allItems: SidebarItem[]): boolean {
        return allItems.some(child => child.sidebar.sidebar_id === item.sidebar.id);
    }

    /**
     * Obtiene los hijos de un item (método alternativo)
     */
    getChildren(item: SidebarItem, allItems: SidebarItem[]): SidebarItem[] {
        return allItems
            .filter(child => child.sidebar.sidebar_id === item.sidebar.id)
            .sort((a, b) => a.sidebar.orden - b.sidebar.orden);
    }

    /**
     * Inicializa eventos del menú
     */
    initializeEvents(): void {
        // Manejar clic en menús con hijos
        this.$el.on('click', '.menu-link.has-children', (e: any) => {
            e.preventDefault();

            const menuItem = this.$el.find(e.currentTarget).closest('.menu-item');
            if (menuItem.length) {
                menuItem.toggleClass('expanded');
            }
        });

        // Manejar navegación
        this.$el.on('click', '.menu-link:not(.has-children)', (e: any) => {
            const $link = this.$el.find(e.currentTarget);
            const href = $link.attr('href');

            if (href && href !== '#') {
                // Remover clase active de todos los enlaces
                this.$el.find('.menu-link').removeClass('active');

                // Agregar clase active al enlace actual
                $link.addClass('active');
            }
        });
    }
}
