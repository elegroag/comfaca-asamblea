import { Controller } from '@/common/Controller';
import EmpresaListar from "@/componentes/habiles/views/EmpresaListarView";
import EmpresaCrear from "@/componentes/habiles/views/EmpresaCrearView";
import EmpresaEditar from "@/componentes/habiles/views/EmpresaEditarView";
import EmpresaDetalle from "@/componentes/habiles/views/EmpresaDetalleView";
import EmpresaMasivo from "@/componentes/habiles/views/EmpresaMasivoView";
import EmpresasHabiles from "./EmpresasListar";
import EmpresaService from "./EmpresaService";
import Loading from '@/common/Loading';
import HabilesCollection from '@/componentes/habiles/collections/HabilesCollection';
import EmpresasCollection from '@/collections/EmpresasCollection';
import Empresa from '@/models/Empresa';

export default class EmpresasController extends Controller {
    public Collections: {
        empresas: any;
        habiles: any;
    };
    empresaService: EmpresaService;

    constructor(options: any) {
        super(options);

        this.empresaService = new EmpresaService({
            api: this.api,
            app: this.app,
            logger: this.logger,
            EmpresaModel: Empresa,
        });

        this.Collections = {
            empresas: new EmpresasCollection(),
            habiles: new HabilesCollection(),
        };
        this.empresaService.initializeCollections();
    }


    /**
     * Listar empresas
     */
    async listaEmpresas(): Promise<void> {
        this.logger.log('EmpresasController.listaEmpresas() called');

        try {
            const controller = this.startController(EmpresaListar);

            if (!this.Collections.empresas || !this.Collections.empresas.length || this.Collections.empresas.length === 0) {
                try {
                    if (!this.api) {
                        this.App?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.api.get('/habiles/listar');

                    if (response && response.success === true) {

                        this.empresaService.__setEmpresas((response as any).empresas);
                        controller.listaEmpresas();
                    } else {
                        this.App?.trigger('error', (response as any).msj || response.message || 'Error al listar empresas');
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar empresas:', error);
                    this.App?.trigger('error', error.message || 'Error de conexión al listar empresas');
                }
            } else {
                if (Loading) Loading.show();
                controller.listaEmpresas();
                setTimeout(() => {
                    if (Loading) Loading.hide();
                }, 300);
            }
        } catch (err: any) {
            this.logger.error('Error al listar empresas:', err);
            if (this.App?.trigger) {
                this.app.trigger('error', 'Error de conexión al listar empresas');
            }
        }
    }

    /**
     * Crear empresa
     */
    crearEmpresa(): void {
        this.logger.log('EmpresasController.crearEmpresa() called');

        const auth = this.startController(EmpresaCrear);
        auth.crearEmpresa();
    }

    /**
     * Cargue masivo de empresas
     */
    cargueMasivo(): void {
        this.logger.log('EmpresasController.cargueMasivo() called');

        const auth = this.startController(EmpresaMasivo);
        auth.cargueMasivo();
    }

    /**
     * Editar empresa
     */
    async editaEmpresa(nit: string): Promise<void> {
        this.logger.log('EmpresasController.editaEmpresa() called', nit);

        try {
            const auth = this.startController(EmpresaEditar);

            if (!this.Collections.empresas || !this.Collections.empresas.length || this.Collections.empresas.length <= 1) {
                try {
                    if (!this.api) {
                        this.App?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.api.get('/habiles/listar');

                    if (response && response.success === true) {
                        this.empresaService.__setEmpresas((response as any).empresas);
                        const model = this.Collections.empresas.get(nit);
                        auth.editaEmpresa(model);
                    } else {
                        this.App?.trigger('alert:error', { message: response.message || 'Error al obtener datos de la empresa' });
                    }
                } catch (error: any) {
                    this.logger.error('Error al editar empresa:', error);
                    this.App?.trigger('alert:error', { message: error.message || 'Error de conexión al editar empresa' });
                }
            } else {
                const model = this.Collections.empresas.get(nit);
                auth.editaEmpresa(model);
            }
        } catch (err: any) {
            this.logger.error('Error al editar empresa:', err);
            if (this.App?.trigger) {
                this.app.trigger('alert:error', { message: 'Error de conexión al editar empresa' });
            }
        }
    }

    /**
     * Detalle de empresa
     */
    async detalleEmpresa(nit: string): Promise<void> {
        this.logger.log('EmpresasController.detalleEmpresa() called', nit);

        try {
            const auth = this.startController(EmpresaDetalle);

            if (!this.Collections.empresas || !this.Collections.empresas.length || this.Collections.empresas.length === 0) {
                try {
                    if (!this.api) {
                        this.App?.trigger('alert:error', { message: 'API no disponible' });
                        return;
                    }

                    const response = await this.api.get('/habiles/listar');

                    if (response && response.success === true) {
                        this.empresaService.__setEmpresas((response as any).empresas);
                        const model = this.Collections.empresas.get(nit);
                        auth.detalleEmpresa(model);
                    } else {
                        this.App?.trigger('alert:error', { message: response.message || 'Error al obtener detalles de la empresa' });
                    }
                } catch (error: any) {
                    this.logger.error('Error al mostrar detalle de empresa:', error);
                    this.App?.trigger('alert:error', { message: error.message || 'Error de conexión al mostrar detalles de la empresa' });
                }
            } else {
                const model = this.Collections.empresas.get(nit);
                auth.detalleEmpresa(model);
            }
        } catch (err: any) {
            this.logger.error('Error al mostrar detalle de empresa:', err);
            if (this.App?.trigger) {
                this.app.trigger('alert:error', { message: 'Error de conexión al mostrar detalles de la empresa' });
            }
        }
    }

    /**
     * Listar habiles
     */
    async listarHabiles(): Promise<void> {
        this.logger.log('EmpresasController.listarHabiles() called');

        try {
            const auth = this.startController(EmpresasHabiles);

            if (!this.Collections.habiles || !this.Collections.habiles.length || this.Collections.habiles.length === 0) {
                if (Loading) Loading.show();

                try {
                    if (!this.api) {
                        this.App?.trigger('alert:error', { message: 'API no disponible' });
                        return;
                    }

                    const response = await this.api.get('/habiles/lista_habiles');

                    setTimeout(() => {
                        if (Loading) Loading.hide();
                    }, 300);

                    if (response && response.success === true) {
                        this.empresaService.__setHabiles((response as any).empresas);
                        auth.listarHabiles();
                    } else {
                        this.App?.trigger('alert:error', { message: (response as any).msj || response.message || 'Error al listar habiles' });
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar habiles:', error);
                    if (Loading) Loading.hide();
                    this.App?.trigger('alert:error', { message: error.message || 'Error de conexión al listar habiles' });
                }
            } else {
                auth.listarHabiles();
            }
        } catch (err: any) {
            this.logger.error('Error al listar habiles:', err);
            if (Loading) Loading.hide();
            if (this.App?.trigger) {
                this.app.trigger('alert:error', { message: 'Error de conexión al listar habiles' });
            }
        }
    }
}
