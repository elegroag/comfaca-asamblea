import { Controller } from '@/common/Controller';
import PoderesListarView from '@/componentes/poderes/views/PoderesListarView';
import PoderCrear from '@/componentes/poderes/views/PoderCrear';
import PoderBuscar from '@/componentes/poderes/views/PoderBuscar';
import RechazaPoder from '@/componentes/poderes/views/RechazaPoder';
import PoderMasivo from '@/componentes/poderes/views/PoderMasivo';
import PoderDetalle from '@/componentes/poderes/views/PoderDetalle';

import {
    PoderDetalleResponse,
    BuscarPersonaResponse,
    CriteriosRechazoResponse,
    EmpresaResponse
} from './types';

import PoderesCollection from '@/collections/Poderes';
import EmpresasCollection from '@/collections/EmpresasCollection';
import CriteriosRechazos from '@/collections/CriteriosRechazos';

export default class PoderesController extends Controller {

    currentView: any;
    Collections: any;

    constructor(options: any) {
        super(options);
        this.Collections = {
            poderes: new PoderesCollection(),
            empresas: new EmpresasCollection(),
            criteriosRechazos: new CriteriosRechazos(),
        };
    }

    // Listar poderes
    async listar(): Promise<void> {
        try {
            if (!this.api) return;

            const response = await this.api.get('/poderes/listar');

            if (response.success && (response as any).poderes) {

                this.Collections.poderes.add((response as any).poderes, { merge: true });

                const view = new PoderesListarView({
                    collection: this.Collections.poderes,
                    App: this.App,
                    router: this.router,
                    logger: this.logger,
                    api: this.api,
                    props: this.props
                });
                this.region.show(view);
                this.currentView = view;
            } else {
                this.App?.trigger('alert:error', { message: response.message || 'Error al cargar los poderes' });
                this.router.navigate('error', { trigger: true });
            }
        } catch (error: any) {
            this.logger.error(error);
            this.App?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            this.router.navigate('error', { trigger: true });
        }
    }

    // Crear poder
    crear(): void {
        console.log('PoderesController.crear() called');
        const view = new PoderCrear({
            collection: this.Collections.empresas,
            App: this,
            api: this.api,
            router: this.router,
            logger: this.logger,
            props: this.props
        });

        this.currentView = view;
        this.region.show(view);
        this.listenTo(view, 'search:empresa', this.__searchEmpresaValidation);
    }

    // Buscar poder
    buscar(): void {
        console.log('PoderesController.buscar() called');

        const view = new PoderBuscar({
            App: this.App,
            router: this.router,
            logger: this.logger,
            api: this.api,
            props: this.props
        });
        this.currentView = view;
        this.region.show(view);
    }

    // Mostrar detalle de poder
    async mostrar(documento: string): Promise<void> {
        console.log('PoderesController.mostrar() called', documento);

        try {
            if (!this.api) return;

            const response = await this.api.get(`/poderes/detalle/${documento}`) as unknown as PoderDetalleResponse;

            if (response && response.success === true && response.poder) {

                if (response.poder === false) {
                    this.App?.trigger('errors', response.msj);
                } else {
                    const view = new PoderDetalle({
                        model: response.poder,
                        apoderado: response.habil_apoderado,
                        poderdante: response.habil_poderdante,
                        criteriosRechazos: response.criterio_rechazos,
                        App: this,
                        router: this.router,
                        logger: this.logger,
                        api: this.api,
                        props: this.props
                    });
                    this.currentView = view;
                    this.region.show(view);
                }

            }
        } catch (error: any) {
            this.App?.trigger('error', error.message || 'Error de conexión');
            this.router.navigate('listar', { trigger: true });
        }
    }

    // Buscar apoderado
    async buscarApoderado(nit: string): Promise<void> {
        console.log('PoderesController.buscarApoderado() called', nit);

        this.App?.trigger('hide:modal', null);

        try {
            if (!this.api) return;

            const response = await this.api.get(`/poderes/buscar_apoderado/${nit}`) as unknown as BuscarPersonaResponse;

            if (response && response.success === true) {
                const view = new PoderDetalle({
                    model: response.poder,
                    apoderado: response.apoderado,
                    poderdante: response.poderdante,
                    criteriosRechazos: response.criterio_rechazos,
                    App: this,
                    router: this.router,
                    logger: this.logger,
                    api: this.api,
                    props: this.props
                });
                this.currentView = view;
                this.region.show(view);
            } else {
                this.App?.trigger('error', response.msj);
                this.router.navigate('listar', { trigger: true });
            }
        } catch (error: any) {
            this.App?.trigger('error', error.message || 'Error de conexión');
            this.router.navigate('listar', { trigger: true });
        }
    }

    // Buscar poderdante
    async buscarPoderdante(nit: string): Promise<void> {
        console.log('PoderesController.buscarPoderdante() called', nit);

        this.App?.trigger('hide:modal', null);

        try {
            if (!this.api) return;

            const response = await this.api.get(`/poderes/buscar_poderdante/${nit}`) as unknown as BuscarPersonaResponse;

            if (response && response.success === true) {
                const view = new PoderDetalle({
                    model: response.poder,
                    apoderado: response.apoderado,
                    poderdante: response.poderdante,
                    criteriosRechazos: response.criterio_rechazos,
                    App: this,
                    router: this.router,
                    logger: this.logger,
                    api: this.api,
                    props: this.props

                });
                this.currentView = view;
                this.region.show(view);
            } else {
                this.App?.trigger('warning', response.msj);
                this.router.navigate('listar', { trigger: true });
            }
        } catch (error: any) {
            this.App?.trigger('error', error.message || 'Error de conexión');
            this.router.navigate('listar', { trigger: true });
        }
    }

    // Rechazar poder
    async rechazar(): Promise<void> {
        console.log('PoderesController.rechazar() called');

        if (!this.Collections.criteriosRechazos || this.Collections.criteriosRechazos.length === 0) {
            try {
                if (!this.api) return;

                const response = await this.api.get('/poderes/criterios-rechazo') as unknown as CriteriosRechazoResponse;

                if (response && response.success === true) {
                    this.Collections.criteriosRechazos = response.criterios || [];
                    const view = new RechazaPoder({
                        collection: this.Collections.criteriosRechazos,
                        App: this,
                        router: this.router,
                        logger: this.logger,
                        api: this.api,
                        props: this.props
                    });
                    this.currentView = view;
                    this.region.show(view);
                    this.listenTo(view, 'add:poder', () => {
                        console.log('Adiciona poder por implementar');
                    });
                } else {
                    this.App?.trigger('alert:error', { message: response.msj });
                }
            } catch (error: any) {
                console.error(error);
                this.App?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            }
        } else {
            const view = new RechazaPoder({
                collection: this.Collections.criteriosRechazos,
                App: this,
                router: this.router,
                logger: this.logger,
                api: this.api,
                props: this.props
            });
            this.currentView = view;
            this.region.show(view);
        }
    }

    // Cargue masivo
    masivo(): void {
        console.log('PoderesController.masivo() called');

        const view = new PoderMasivo({ App: this });
        this.currentView = view;
        this.region.show(view);
    }

    // Métodos privados
    private async __searchEmpresaValidation(transfer: any): Promise<void> {
        const { nit, callback } = transfer;

        try {
            if (!this.api) return;

            const response = await this.api.get(`/poderes/buscar-empresa/${nit}`) as unknown as EmpresaResponse;

            if (response) {
                if (response.success === false) {
                    this.App?.trigger('alert:error', response.msj);
                    callback(false);
                } else {
                    callback(response);
                }
            } else {
                this.App?.trigger(
                    'alert:error',
                    'Se ha generado un error interno. Se requiere de reportar al área de TICS'
                );
                callback(false);
            }
        } catch (error: any) {
            this.App?.trigger('alert:error', error.message || 'Error de conexión');
            callback(false);
        }
    }

    error() {
        console.log('PoderesController.error() called');
        this.App?.trigger('error', 'Error al cargar los poderes');
    }

    // Destruir controlador
    destroy(): void {
        if (this.currentView && this.currentView.remove) {
            this.currentView.remove();
        }
        this.region.remove();
    }
}
