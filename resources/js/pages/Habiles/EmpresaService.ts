import Logger from "@/common/Logger";
import HabilesCollection from "@/componentes/habiles/collections/HabilesCollection";
import EmpresasCollection from "@/componentes/habiles/collections/HabilesCollection";
import HabilModel from "@/componentes/habiles/models/HabilModel";
import { BoxCollectionStorage } from "@/componentes/useStorage";
import { AppInstance } from "@/types/types";

interface SaveTransfer {
    model: any;
    callback: (success: boolean, data?: any) => void;
}

interface RemoveTransfer {
    model: any;
    callback: (success: boolean | any) => void;
}

interface NotifyTransfer {
    nit?: string;
    documento?: string;
}

interface xCollection {
    empresas: EmpresasCollection | null;
    habiles: HabilesCollection | null;
}

export default class EmpresaService {
    storage: BoxCollectionStorage;
    Collections: xCollection | { [key: string]: any };
    api: any;
    App: AppInstance | any;
    logger: Logger;

    constructor(options: any) {
        this.Collections = {
            empresas: new EmpresasCollection(),
            habiles: new HabilesCollection(),
        };
        this.api = null;
        this.App = null;
        this.logger = options.logger;
        this.storage = BoxCollectionStorage.getInstance();
        _.extend(this, options);
    }

    /**
     * Inicializar las colecciones necesarias usando BoxCollectionStorage
     */
    initializeCollections(): void {
        const empresas = this.storage.getCollection('empresas')?.value || null;
        const habiles = this.storage.getCollection('habiles')?.value || null;

        if (empresas) this.Collections.empresas = new EmpresasCollection(empresas);
        if (habiles) this.Collections.habiles = new HabilesCollection(habiles);
    }

    /**
     * Inicializar colección de empresas
     */
    initEmpresas(): void {
        if (!this.Collections || !this.Collections.empresas) {
            this.Collections.empresas = new EmpresasCollection();
            this.Collections.empresas.reset();
        }
    }

    /**
     * Inicializar colección de habiles
     */
    initHabiles(): void {
        if (!this.Collections || !this.Collections.habiles) {
            this.Collections.habiles = new HabilesCollection();
            this.Collections.habiles.reset();
        }
    }

    /**
     * Guardar empresa
     */
    __saveEmpresa(transfer: SaveTransfer): void {
        const { model, callback } = transfer;
        if (!model.isValid()) {
            const errors = model.validationError;
            this.App?.trigger('alert:error', { message: errors.toString() });
            callback(false);
        } else {
            this.App?.trigger('confirma', {
                message: 'Se requiere de confirmar la acción a realizar para guardar los datos',
                callback: (confirm: boolean) => {
                    if (confirm === true) {
                        this.saveHabil(model, callback);
                    } else {
                        return callback(false);
                    }
                },
            });

        }
    }

    private async saveHabil(model: any, callback: (success: boolean, data?: any) => void): Promise<void> {
        try {
            const response = await this.api.post('/habiles/saveEmpresaHabil', model.toJSON());
            if (response?.success) {

                this.App?.trigger('alert:success', response.msj);
                callback(true, {
                    empresa: response.data,
                    pre_registro: response.pre_registro,
                });
            } else {
                this.App?.trigger('alert:error', { message: response.message || 'Error al cargar carteras' });
            }
        } catch (error: any) {
            this.logger?.error('Error al cargar carteras:', error);
            this.App?.trigger('alert:error', { message: error.message || 'Error de conexión al cargar carteras' });
            callback(false);
        }
    }

    /**
     * Eliminar empresa
     */
    __removeEmpresa(transfer: RemoveTransfer): void {
        const { model, callback } = transfer;

        if (model instanceof Empresa) {

            this.App?.trigger('confirma', {
                message: 'Se requiere de confirmar la acción a realizar para remover el registro',
                callback: (confirm: boolean) => {
                    if (confirm === true) {
                        this.saveRemoveEmpresa(model, callback);
                    }
                    return callback(false);
                },
            });

        } else {
            return callback(false);
        }
    }

    private async saveRemoveEmpresa(model: any, callback: (success: boolean, data?: any) => void): Promise<void> {
        try {
            const response = await this.api.delete(`/habiles/removeEmpresa/${model.get('nit')}`);
            if (response?.success) {
                this.App?.trigger('alert:success', { message: response.msj });
                this.Collections.empresas.remove(model);
                callback(true, response);
            } else {
                this.App?.trigger('alert:error', { message: response.message || 'Error al cargar carteras' });
            }
        } catch (error: any) {
            this.logger?.error('Error al cargar carteras:', error);
            this.App?.trigger('alert:error', { message: error.message || 'Error de conexión al cargar carteras' });
            callback(false);
        }
    }

    /**
     * Buscar todas las empresas
     */
    __findAll(): void {
        if (!this.Collections.empresas || !_.size(this.Collections.empresas) || _.size(this.Collections.empresas) === 0) {
            this.findAllApi();
        }
    }

    private async findAllApi(): Promise<void> {
        try {
            const response = await this.api.get('/habiles/listar');
            if (response?.success) {
                this.__setEmpresas(response.empresas);
            } else {
                this.App?.trigger('alert:error', { message: response.msj });
            }
        } catch (error: any) {
            this.logger?.error('Error al listar empresas:', error);
            this.App?.trigger('alert:error', { message: error.message || 'Error de conexión al listar empresas' });
        }
    }

    /**
     * Establecer colección de empresas
     */
    __setEmpresas(empresas: any[]): void {
        this.initEmpresas();
        if (this.Collections && this.Collections.empresas) {
            this.Collections.empresas.add(empresas, { merge: true });
        }
    }

    /**
     * Agregar empresa a la colección
     */
    __addEmpresas(empresa: any): void {
        this.initEmpresas();
        const _empresa = empresa instanceof Empresa ? empresa : new Empresa(empresa);
        if (this.Collections && this.Collections.empresas) {
            this.Collections.empresas.add(_empresa, { merge: true });
        }
    }

    /**
     * Establecer colección de habiles
     */
    __setHabiles(empresas: any[]): void {
        this.initHabiles();
        if (this.Collections && this.Collections.habiles) {
            this.Collections.habiles.add(empresas, { merge: true });
        }
    }

    /**
     * Agregar habil a la colección
     */
    __addHabiles(empresa: any): void {
        this.initHabiles();
        const _empresa = empresa instanceof HabilModel ? empresa : new HabilModel(empresa);
        if (this.Collections && this.Collections.habiles) {
            this.Collections.habiles.add(_empresa, { merge: true });
        }
    }

    /**
     * Eliminar habil
     */
    __removeHabil(transfer: RemoveTransfer): void {
        const { model, callback } = transfer;

        if (model instanceof HabilModel) {
            this.App?.trigger('confirma', {
                message: 'Se requiere de confirmar la acción a realizar para remover el registro',
                callback: (confirm: boolean) => {
                    if (confirm === true) {
                        this.removeHabilApi(model, callback);
                    }
                    callback(false);
                },
            });

        } else {
            callback(false);
        }
    }


    private async removeHabilApi(model: any, callback: (success: boolean | any) => void): Promise<void> {
        try {
            const response = await this.api.post('/habiles/remove_habil', {
                nit: model.get('nit'),
                cedrep: model.get('cedula_representa'),
                criterio: 26,
            });

            if (response?.success) {
                if (this.Collections && this.Collections.habiles) {
                    this.Collections.habiles.remove(model);
                }
                this.App?.trigger('alert:success', { message: response.msj });
                callback(response);
            } else {
                this.App?.trigger('alert:error', { message: response.msj });
                callback(false);
            }
        } catch (error: any) {
            this.logger?.error('Error al remover habil:', error);
            this.App?.trigger('alert:error', { message: error.message || 'Error de conexión al remover habil' });
            callback(false);
        }
    }

    /**
     * Notificar a plataforma
     */
    __notifyPlataforma(transfer: NotifyTransfer = {}): void {
        this.notifyPlataformaApi(transfer);
    }

    private async notifyPlataformaApi(transfer: NotifyTransfer): Promise<void> {
        try {
            const response = await this.api.post('/novedades/notyChangeHabil', {
                nit: transfer.nit,
                documento: transfer.documento,
            });

            if (response?.success === true) {
                this.App?.trigger('alert:success', { message: response.msj });
            } else {
                this.App?.trigger('alert:error', { message: response.msj });
            }
        } catch (error: any) {
            this.logger?.error('Error al notificar plataforma:', error);
            this.App?.trigger('alert:error', error.message || 'Error de conexión al notificar plataforma');
        }
    }
}
