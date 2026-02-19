import { Controller } from "@/common/Controller";
import MesasCrear from "@/componentes/mesas/views/MesasCrear";
import MesasListar from "@/componentes/mesas/views/MesasListar";
import MesaMostrar from "@/componentes/mesas/views/MesaMostrar";
import $App from "@/core/App";

// Declaraciones para las colecciones globales
declare global {
    var $App: any;
    var create_url: (path: string) => string;
    var loading: {
        show: () => void;
        hide: () => void;
    };
    var scroltop: () => void;
    var axios: {
        get: (url: string) => Promise<any>;
    };
    var Mesa: any;
    var MesasCollection: any;
}

interface MesasControllerOptions {
    router?: any;
    region?: {
        el: HTMLElement;
        id: string;
    };
    logger?: any;
}

export default class MesasController {
    private mesas_disponibles: any;
    private asamblea: any;
    private router?: any;
    public region: {
        el: HTMLElement;
        id: string;
    };

    constructor(options: MesasControllerOptions = {}) {
        this.mesas_disponibles = undefined;
        this.asamblea = undefined;
        this.router = options.router;
        this.region = options.region || { el: document.createElement('div'), id: 'content' };
        this.__initializeCollections();
    }

    /**
     * Inicializar las colecciones necesarias
     */
    private __initializeCollections(): void {
        $App.Collections.mesas = null;
    }

    /**
     * Mostrar detalle de una mesa
     */
    mostrarMesas(mesa: string = ''): void {
        this.__createContent();

        const url = create_url('admin/mesa_detalle/' + mesa);
        loading.show();

        axios
            .get(url)
            .then((salida: any) => {
                loading.hide();
                if (salida.data?.mesa) {
                    const mesaModel = new Mesa(salida.data.mesa);
                    const view = new MesaMostrar({
                        model: mesaModel,
                    });
                    $(this.region.el).html(view.render().el);
                } else {
                    $App.trigger('alert:error', 'Mesa no encontrada');
                }
            })
            .catch((err: any) => {
                loading.hide();
                console.error('Error al cargar mesa:', err);
                $App.trigger('alert:error', 'Error al cargar mesa');
            });
    }

    /**
     * Crear una nueva mesa
     */
    crearMesa(): void {
        this.__createContent();
        const view = new MesasCrear();
        $(this.region.el).html(view.render().el);
    }

    /**
     * Listar todas las mesas
     */
    listarMesas(): void {
        this.__createContent();
        const url = create_url('admin/listar_mesas');
        loading.show();

        axios
            .get(url)
            .then((salida: any) => {
                loading.hide();
                if (salida.status === 200 && salida.data?.mesas) {
                    this.__setMesas(salida.data.mesas);

                    const view = new MesasListar({
                        collection: $App.Collections.mesas,
                    });
                    $(this.region.el).html(view.render().el);
                } else {
                    $App.trigger('alert:error', 'No se pudieron cargar las mesas');
                }
            })
            .catch((err: any) => {
                loading.hide();
                console.error('Error al listar mesas:', err);
                $App.trigger('alert:error', 'Error al listar mesas');
            });
    }

    /**
     * Editar una mesa existente
     */
    editaMesa(id: string): void {
        this.__createContent();
        const url = create_url('admin/mesa_detalle/' + id);
        loading.show();

        axios
            .get(url)
            .then((salida: any) => {
                loading.hide();
                if (salida.data?.mesa) {
                    const mesaModel = new Mesa(salida.data.mesa);
                    const view = new MesasCrear({
                        model: mesaModel,
                        isNew: false
                    });
                    $(this.region.el).html(view.render().el);
                } else {
                    $App.trigger('alert:error', 'Mesa no encontrada');
                }
            })
            .catch((err: any) => {
                loading.hide();
                console.error('Error al cargar mesa para editar:', err);
                $App.trigger('alert:error', 'Error al cargar mesa');
            });
    }

    /**
     * Establecer mesas en la colección
     */
    private __setMesas(mesas: any[]): void {
        if (!$App.Collections.mesas) {
            if (typeof MesasCollection !== 'undefined') {
                $App.Collections.mesas = new MesasCollection();
            } else {
                // Fallback si MesasCollection no está disponible
                $App.Collections.mesas = new ($App as any).Collection();
            }
            $App.Collections.mesas.reset();
        }

        if (mesas && Array.isArray(mesas)) {
            $App.Collections.mesas.add(mesas, { merge: true });
        }
    }

    /**
     * Crear elemento de contenido
     */
    private __createContent(): HTMLElement {
        if (this.region?.el) {
            $(this.region.el).remove();
        }
        const el = document.createElement('div');
        el.setAttribute('id', this.region.id || 'content');
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.appendChild(el);
        }
        if (typeof scroltop === 'function') {
            scroltop();
        }
        return el;
    }
}
