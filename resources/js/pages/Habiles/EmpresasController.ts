import { Controller } from '@/common/Controller';
import EmpresaListar from "@/componentes/habiles/views/EmpresaListarView";
import EmpresaCrear from "@/componentes/habiles/views/EmpresaCrearView";
import EmpresaEditar from "@/componentes/habiles/views/EmpresaEditarView";
import EmpresaDetalle from "@/componentes/habiles/views/EmpresaDetalleView";
import EmpresaMasivo from "@/componentes/habiles/views/EmpresaMasivoView";
import EmpresasListar from "./EmpresasListar";
import EmpresasHabiles from "./EmpresasHabiles";
import EmpresaService from "./EmpresaService";
import Loading from '@/common/Loading';
import HabilesCollection from '@/componentes/habiles/collections/HabilesCollection';
import EmpresasCollection from '@/collections/EmpresasCollection';
import Empresa from '@/models/Empresa';
import { CacheManager, cacheCollection, getCachedCollection } from '@/componentes/CacheManager';

export default class EmpresasController extends Controller {
    empresaService: EmpresaService;

    constructor(options: any) {
        super(options);

        this.empresaService = new EmpresaService({
            api: this.api,
            app: this.app,
            logger: this.logger,
            EmpresaModel: Empresa,
        });

        console.log('EmpresasController inicializado con cache global');
    }


    /**
     * Listar empresas
     */
    async listaEmpresas(): Promise<void> {
        this.logger.log('EmpresasController.listaEmpresas() called');

        try {
            const controller = this.startController(EmpresasListar) as EmpresasListar;

            // Obtener empresas desde cache
            let empresas = getCachedCollection('empresas', EmpresasCollection);

            if (_.size(empresas) === 0) {
                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.empresaService.findAllEmpresas();

                    if (response && response.success === true) {
                        // Crear collection y guardar en cache
                        empresas = new EmpresasCollection();
                        empresas.add(response.empresas || [], { merge: true });

                        // Guardar en cache para uso futuro
                        cacheCollection('empresas', empresas, {
                            persistent: true, // Persistir en localStorage
                            ttl: 60 * 60 * 1000 // 1 hora
                        });

                        controller.listaEmpresas();
                    } else {
                        this.app?.trigger('error', (response as any).msj || response.message || 'Error al listar empresas');
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar empresas:', error);
                    this.app?.trigger('error', error.message || 'Error de conexión al listar empresas');
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
            if (this.app?.trigger) {
                this.app.trigger('error', 'Error de conexión al listar empresas');
            }
        }
    }

    /**
     * Manejar eliminación de empresa desde la collection
     */
    private handleRemoveEmpresa(data: any): void {
        if (data.removeFromCollection && data.model) {
            // Obtener empresas desde cache y eliminar el modelo
            const empresas = getCachedCollection('empresas', EmpresasCollection);
            if (empresas) {
                empresas.remove(data.model);

                // Actualizar cache
                cacheCollection('empresas', empresas, {
                    persistent: true,
                    ttl: 60 * 60 * 1000
                });
            }
        }
    }

    /**
     * Manejar eliminación de habil desde la collection
     */
    private handleRemoveHabil(data: any): void {
        if (data.removeFromCollection && data.model) {
            // Obtener habiles desde cache y eliminar el modelo
            const habiles = getCachedCollection('habiles', HabilesCollection);
            if (habiles) {
                habiles.remove(data.model);

                // Actualizar cache
                cacheCollection('habiles', habiles, {
                    persistent: true,
                    ttl: 60 * 60 * 1000
                });
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

            // Obtener empresas desde cache
            let empresas = getCachedCollection('empresas', EmpresasCollection);

            if (!empresas || !empresas.length || empresas.length <= 1) {
                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.api.get('/habiles/listar');

                    if (response && response.success === true) {
                        // Crear collection y agregar datos
                        empresas = new EmpresasCollection();
                        empresas.add((response as any).empresas, { merge: true });

                        // Guardar en cache
                        cacheCollection('empresas', empresas, {
                            persistent: true,
                            ttl: 60 * 60 * 1000
                        });

                        const model = empresas.get(nit);
                        auth.editaEmpresa(model);
                    } else {
                        this.app?.trigger('alert:error', { message: response.message || 'Error al obtener datos de la empresa' });
                    }
                } catch (error: any) {
                    this.logger.error('Error al editar empresa:', error);
                    this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al editar empresa' });
                }
            } else {
                const model = empresas.get(nit);
                auth.editaEmpresa(model);
            }
        } catch (err: any) {
            this.logger.error('Error al editar empresa:', err);
            if (this.app?.trigger) {
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

            // Obtener empresas desde cache
            let empresas = getCachedCollection('empresas', EmpresasCollection);

            if (!empresas || !empresas.length || empresas.length === 0) {
                try {
                    if (!this.api) {
                        this.app?.trigger('alert:error', { message: 'API no disponible' });
                        return;
                    }

                    const response = await this.api.get('/habiles/listar');

                    if (response && response.success === true) {
                        // Crear collection y agregar datos
                        empresas = new EmpresasCollection();
                        empresas.add((response as any).empresas, { merge: true });

                        // Guardar en cache
                        cacheCollection('empresas', empresas, {
                            persistent: true,
                            ttl: 60 * 60 * 1000
                        });

                        const model = empresas.get(nit);
                        auth.detalleEmpresa(model);
                    } else {
                        this.app?.trigger('alert:error', { message: response.message || 'Error al obtener detalles de la empresa' });
                    }
                } catch (error: any) {
                    this.logger.error('Error al mostrar detalle de empresa:', error);
                    this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al mostrar detalles de la empresa' });
                }
            } else {
                const model = empresas.get(nit);
                auth.detalleEmpresa(model);
            }
        } catch (err: any) {
            this.logger.error('Error al mostrar detalle de empresa:', err);
            if (this.app?.trigger) {
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
            const controller = this.startController(EmpresasHabiles) as EmpresasHabiles;

            // Obtener habiles desde cache
            let habiles = getCachedCollection('habiles', HabilesCollection);

            if (_.size(habiles) === 0) {
                if (Loading) Loading.show();

                try {
                    if (!this.api) {
                        this.app?.trigger('alert:error', { message: 'API no disponible' });
                        return;
                    }

                    const response = await this.empresaService.findAllHabiles();

                    setTimeout(() => {
                        if (Loading) Loading.hide();
                    }, 300);

                    if (response && response.success === true) {
                        // Crear collection y agregar datos
                        habiles = new HabilesCollection();
                        habiles.add(response.empresas, { merge: true });

                        // Guardar en cache para uso futuro
                        cacheCollection('habiles', habiles, {
                            persistent: true, // Persistir en localStorage
                            ttl: 60 * 60 * 1000 // 1 hora
                        });

                        controller.listarHabiles();
                    } else {
                        this.app?.trigger('alert:error', { message: (response as any).msj || response.message || 'Error al listar habiles' });
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar habiles:', error);
                    if (Loading) Loading.hide();
                    this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar habiles' });
                }
            } else {
                controller.listarHabiles();
            }
        } catch (err: any) {
            this.logger.error('Error al listar habiles:', err);
            if (Loading) Loading.hide();
            if (this.app?.trigger) {
                this.app.trigger('alert:error', { message: 'Error de conexión al listar habiles' });
            }
        }
    }
}
