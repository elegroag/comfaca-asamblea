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
            menu: processedMenu,
            resource_active: this.model.resource_active
        });
        el.html(template);

        // Inicializar eventos después de renderizar
        this.initializeEvents();

        // Expandir menú activo basado en resource_active
        this.expandActiveMenu();

        return this;
    }

    get events() {
        return {
            'click #bt_listar': 'listarData',
            'keydown #bt_listar': 'toggleSidebar',
            'click #bt_logout': 'logout'
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
            // Usar la clase sidebar-mini del Paper Dashboard
            document.body.classList.toggle('sidebar-mini');
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

    /**
     * Expande el menú correspondiente al recurso activo
     */
    expandActiveMenu(): void {
        const resourceActive = this.model.resource_active;

        if (!resourceActive) {
            console.log('No hay resource_active para expandir menú');
            return;
        }

        console.log('Expandiendo menú para resource_active:', resourceActive);

        // Buscar el item con el resource_router coincidente
        const activeItem = this.$el.find(`[data-resource="${resourceActive}"]`);

        if (activeItem.length) {
            console.log('Item activo encontrado:', activeItem);

            // Agregar clase active al item
            activeItem.addClass('active');
            activeItem.addClass('expanded');

            // Si es un submenu-item, expandir su padre
            if (activeItem.hasClass('submenu-item')) {
                const parentItem = activeItem.closest('.menu-item').parent().closest('.menu-item');
                if (parentItem.length) {
                    console.log('Expandiendo menú padre:', parentItem);
                    parentItem.addClass('expanded');
                }
            }

            // Agregar clase active al enlace
            const link = activeItem.find('.menu-link');
            if (link.length) {
                link.addClass('active');
            }
        } else {
            console.log('No se encontró item con resource_router:', resourceActive);

            // Intentar coincidencia parcial (para casos como 'poderes#listar')
            const baseResource = resourceActive.split('#')[0];
            const parentItem = this.$el.find(`[data-resource="${baseResource}"]`);

            if (parentItem.length) {
                console.log('Expandiendo menú padre por coincidencia parcial:', baseResource);
                parentItem.addClass('expanded');

                // Buscar y activar el submenu correspondiente
                const submenuItem = parentItem.find(`[data-resource*="${resourceActive}"]`);
                if (submenuItem.length) {
                    submenuItem.addClass('active');
                    submenuItem.find('.menu-link').addClass('active');
                }
            }
        }
    }
}
