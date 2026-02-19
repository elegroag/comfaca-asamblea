import { Region } from '@/common/Region';
import { Controller } from '@/common/Controller';
import InterventorMostrarView from '@/componentes/interventores/views/InterventorMostrarView';
import InterventorCrearView from '@/componentes/interventores/views/InterventorCrearView';
import InterventoresListView from '@/componentes/interventores/views/InterventoresListView';

import {
    InterventorResponse,
    InterventoresListResponse
} from './types';

declare global {
    var $: any;
    var _: any;
    var axios: any;
    var loading: any;
    var create_url: (path: string) => string;
    var _view: any;
    var scroltop: () => void;
}

interface InterventorControllerOptions {
    region?: Region;
    [key: string]: any;
}

export default class InterventorController extends Controller {
    currentView: any;
    interventores: any;

    constructor(options: InterventorControllerOptions = {}) {
        super(options);
        this.interventores = undefined;
    }

    /**
     * Mostrar detalle de interventor
     */
    async mostrar_interventor(usuario: string = ''): Promise<void> {
        try {
            console.log('InterventorController.mostrar_interventor() called', usuario);

            this.__createContent();

            if (!usuario) return;

            if (!this.api) return;

            const url = Utils.getURL('admin/usuario_detalle/' + usuario);

            // Mostrar loading
            if (loading && typeof loading.show === 'function') {
                loading.show(true);
            }

            const response = await this.api.get('/admin/usuario_detalle/' + usuario);

            if (loading && typeof loading.hide === 'function') {
                loading.hide(true);
            }

            if (response && response.data) {
                const view = new InterventorMostrarView({
                    el: '#content_template',
                    model: response.data.interventor,
                    App: this
                });
                this.currentView = view;
            }
        } catch (error: any) {
            if (loading && typeof loading.hide === 'function') {
                loading.hide(true);
            }
            this.logger.error(error);
            this.trigger('alert:error', { message: error.message || 'Error al cargar el interventor' });
        }
    }

    /**
     * Crear interventor
     */
    crear_interventor(): void {
        console.log('InterventorController.crear_interventor() called');

        this.__createContent();

        const view = new InterventorCrearView({
            el: '#content_template',
            App: this
        });
        this.currentView = view;
    }

    /**
     * Listar interventores
     */
    async lista_interventores(): Promise<void> {
        try {
            console.log('InterventorController.lista_interventores() called');

            this.__createContent();

            if (!this.api) return;

            // Mostrar loading
            if (loading && typeof loading.show === 'function') {
                loading.show(true);
            }

            const response = await this.api.get('/interventores/listar');

            if (loading && typeof loading.hide === 'function') {
                loading.hide(true);
            }

            if (response && response.status === 200 && response.data) {
                const view = new InterventoresListView({
                    collection: response.data.interventores,
                    el: '#content_template',
                    App: this
                });
                this.currentView = view;
            } else {
                this.trigger('alert:error', { message: 'No se encontraron interventores' });
            }
        } catch (error: any) {
            if (loading && typeof loading.hide === 'function') {
                loading.hide(true);
            }
            this.logger.error(error);
            this.trigger('alert:error', { message: error.message || 'Error al cargar los interventores' });
        }
    }

    /**
     * Crear contenido
     */
    private __createContent(): void {
        if (this.region && this.region.el) {
            $(this.region.el).remove();
        }

        const _el = document.createElement('div');
        _el.setAttribute('id', this.region.id);

        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.appendChild(_el);
        }

        if (typeof scroltop === 'function') {
            scroltop();
        }
    }
}
