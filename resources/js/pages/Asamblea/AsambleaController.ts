import { Region } from '@/common/Region';
import { Controller } from '@/common/Controller';
import AsambleaDetalle from '@/componentes/asamblea/views/AsambleaDetalle';
import ListarAsambleas from '@/componentes/asamblea/views/ListarAsambleas';
import AsambleaActiva from '@/componentes/asamblea/views/AsambleaActiva';

import {
    AsambleaResponse,
    ConsensoResponse,
    UsuarioResponse,
    AsaUsuarioResponse,
    MesaResponse
} from './types';
import AsambleasCollection from '@/collections/AsambleasCollection';
import ConsensosCollection from '@/collections/ConsensosCollection';
import UsuariosCollection from '@/collections/UsuariosCollection';
import AsaUsuariosCollection from '@/collections/AsaUsuariosCollection';
import MesasCollection from '@/collections/MesasCollection';

declare global {
    var $: any;
    var _: any;
    var $App: any;
    var create_url: (path: string) => string;
    var scroltop: () => void;
}

interface AsambleaControllerOptions {
    region?: Region;
    [key: string]: any;
}

export default class AsambleaController extends Controller {
    currentView: any;
    Collections: any;
    asamblea: any;

    constructor(options: AsambleaControllerOptions = {}) {
        super(options);
        this.Collections = {
            asambleas: new AsambleasCollection(),
            consensos: new ConsensosCollection(),
            mesas: new MesasCollection(),
            asa_usuarios: new AsaUsuariosCollection(),
            usuarios: new UsuariosCollection(),
        };
        this.asamblea = null;
    }

    /**
     * Mostrar detalle de asamblea
     */
    async asambleaDetalle(id: string): Promise<void> {
        try {
            console.log('AsambleaController.asambleaDetalle() called', id);

            if (!this.api) return;

            // Si ya tenemos la colección, buscar el modelo
            if (this.Collections.asambleas && this.Collections.asambleas.length > 0) {
                const asambleaDetalle = this.Collections.asambleas.get(id);
                if (asambleaDetalle) {
                    const view = new AsambleaDetalle({
                        model: asambleaDetalle,
                        App: this
                    });
                    this.region.show(view);
                    this.currentView = view;
                    return;
                }
            }

            // Si no, cargar desde la API
            const response = await this.api.get('/admin/listar_asambleas');

            if (response.success && (response as any).asambleas) {
                this.Collections.asambleas.add((response as any).asambleas, { merge: true });

                const asambleaDetalle = this.Collections.asambleas.get(id);
                if (asambleaDetalle) {
                    const view = new AsambleaDetalle({
                        model: asambleaDetalle,
                        App: this
                    });
                    this.region.show(view);
                    this.currentView = view;
                } else {
                    this.trigger('alert:error', { message: 'Asamblea no encontrada' });
                    this.router.navigate('listar_asambleas', { trigger: true });
                }
            } else {
                this.trigger('alert:error', { message: response.message || 'Error al cargar las asambleas' });
                this.router.navigate('listar_asambleas', { trigger: true });
            }
        } catch (error: any) {
            this.logger.error(error);
            this.trigger('alert:error', { message: error.message || 'Error de conexión' });
            this.router.navigate('listar_asambleas', { trigger: true });
        }
    }

    /**
     * Listar asambleas
     */
    async listarAsambleas(): Promise<void> {
        try {
            console.log('AsambleaController.listarAsambleas() called');

            if (!this.api) return;

            // Si ya tenemos datos, mostrar vista directamente
            if (this.Collections.asambleas && this.Collections.asambleas.length > 0) {
                const view = new ListarAsambleas({
                    collection: this.Collections.asambleas,
                    App: this
                });
                this.region.show(view);
                this.currentView = view;
                return;
            }

            // Si no, cargar desde la API
            const response = await this.api.get('/admin/listar_asambleas');

            if (response.success && (response as any).asambleas) {
                this.Collections.asambleas.add((response as any).asambleas, { merge: true });

                const view = new ListarAsambleas({
                    collection: this.Collections.asambleas,
                    App: this
                });
                this.region.show(view);
                this.currentView = view;
            } else {
                this.trigger('alert:error', { message: response.message || 'Error al cargar las asambleas' });
                this.router.navigate('error', { trigger: true });
            }
        } catch (error: any) {
            this.logger.error(error);
            this.trigger('alert:error', { message: error.message || 'Error de conexión' });
            this.router.navigate('error', { trigger: true });
        }
    }

    /**
     * Mostrar asamblea activa
     */
    async asambleaActiva(): Promise<void> {
        try {
            console.log('AsambleaController.asambleaActiva() called');

            if (!this.api) return;

            // Si ya tenemos la asamblea activa, mostrar vista directamente
            if (this.asamblea) {
                const view = new AsambleaActiva({
                    model: this.asamblea,
                    collection: this.Collections.consensos,
                    App: this
                });
                this.region.show(view);
                this.currentView = view;
                return;
            }

            // Si no, cargar desde la API
            const response = await this.api.get('/admin/listar_asambleas');

            if (response.success) {
                const data = response as any;

                // Establecer asamblea activa
                if (data.asamblea_activa) {
                    this.asamblea = new (this.Collections.asambleas.model || this.Collections.asambleas.model)(data.asamblea_activa);
                }

                // Cargar colecciones
                if (data.asambleas) {
                    this.Collections.asambleas.add(data.asambleas, { merge: true });
                }

                if (data.consensos) {
                    this.Collections.consensos.add(data.consensos, { merge: true });
                }

                const view = new AsambleaActiva({
                    model: this.asamblea,
                    collection: this.Collections.consensos,
                    App: this
                });
                this.region.show(view);
                this.currentView = view;
            } else {
                this.trigger('alert:error', { message: response.message || 'Error al cargar la asamblea activa' });
                this.router.navigate('listar_asambleas', { trigger: true });
            }
        } catch (error: any) {
            this.logger.error(error);
            this.trigger('alert:error', { message: error.message || 'Error de conexión' });
            this.router.navigate('listar_asambleas', { trigger: true });
        }
    }

    /**
     * Establecer usuarios
     */
    private __setUsuarios(usuarios: UsuarioResponse[]): void {
        if (!this.Collections.usuarios) {
            this.Collections.usuarios = new UsuariosCollection();
            this.Collections.usuarios.reset();
        }
        this.Collections.usuarios.add(usuarios, { merge: true });
    }

    /**
     * Establecer usuarios de asamblea
     */
    private __setUsuariosAsa(asa_usuarios: AsaUsuarioResponse[]): void {
        if (!this.Collections.asa_usuarios) {
            this.Collections.asa_usuarios = new AsaUsuariosCollection();
            this.Collections.asa_usuarios.reset();
        }
        this.Collections.asa_usuarios.add(asa_usuarios, { merge: true });
    }

    /**
     * Establecer consensos
     */
    private __setConsensos(consensos: ConsensoResponse[]): void {
        if (!this.Collections.consensos) {
            this.Collections.consensos = new ConsensosCollection();
            this.Collections.consensos.reset();
        }
        this.Collections.consensos.add(consensos, { merge: true });
    }

    /**
     * Establecer asambleas
     */
    private __setAsambleas(asambleas: AsambleaResponse[]): void {
        if (!this.Collections.asambleas) {
            this.Collections.asambleas = new AsambleasCollection();
            this.Collections.asambleas.reset();
        }
        this.Collections.asambleas.add(asambleas, { merge: true });
    }

    /**
     * Establecer mesas
     */
    private __setMesas(mesas: MesaResponse[]): void {
        if (!this.Collections.mesas) {
            this.Collections.mesas = new MesasCollection();
            this.Collections.mesas.reset();
        }
        this.Collections.mesas.add(mesas, { merge: true });
    }
}
