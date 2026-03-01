import Logger from "@/common/Logger";
import HabilModel from "@/componentes/habiles/models/HabilModel";
import { AppInstance } from "@/types/types";
import type {
    NotifyTransfer,
    RemoveTransfer,
    SaveTransfer
} from "./types";


export interface EmpresaServiceOptions {
    api: any;
    app: AppInstance | any;
    logger: Logger;
    EmpresaModel?: any; // opcional, si se requiere construir explícitamente modelos de empresa
}

export default class EmpresaService {
    api: any;
    app: AppInstance | any;
    logger: Logger;
    private EmpresaModel?: any;

    constructor(options: EmpresaServiceOptions) {
        this.api = options.api;
        this.app = options.app;
        this.logger = options.logger;
        this.EmpresaModel = options.EmpresaModel;
    }

    /**
     * Obtener todas las empresas desde API
     */
    async findAllEmpresas(): Promise<any> {
        try {
            const response = await this.api.get('/habiles/listar');
            if (response?.success) {
                return response;
            } else {
                this.app?.trigger('alert:error', { message: response.msj || 'Error al listar empresas' });
                return null;
            }
        } catch (error: any) {
            this.logger?.error('Error al listar empresas:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar empresas' });
            return null;
        }
    }

    /**
     * Obtener todas las empresas hábiles desde API
     */
    async findAllHabiles(): Promise<any> {
        try {
            const response = await this.api.get('/habiles/lista-habiles');
            if (response?.success) {
                return response;
            } else {
                this.app?.trigger('alert:error', { message: response.msj || 'Error al listar habiles' });
                return null;
            }
        } catch (error: any) {
            this.logger?.error('Error al listar habiles:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar habiles' });
            return null;
        }
    }

    /**
     * Guardar empresa
     */
    __saveEmpresa(transfer: SaveTransfer): void {
        const { model, callback } = transfer;
        if (!model.isValid()) {
            const errors = model.validationError;
            this.app?.trigger('alert:error', { message: errors.toString() });
            callback(false);
        } else {
            this.app?.trigger('confirma', {
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

                this.app?.trigger('alert:success', response.msj);
                callback(true, {
                    empresa: response.data,
                    pre_registro: response.pre_registro,
                });
            } else {
                this.app?.trigger('alert:error', { message: response.message || 'Error al cargar carteras' });
            }
        } catch (error: any) {
            this.logger?.error('Error al cargar carteras:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al cargar carteras' });
            callback(false);
        }
    }

    /**
     * Eliminar empresa
     */
    __removeEmpresa(transfer: RemoveTransfer & { controller?: any }): void {
        const { model, callback, controller } = transfer;

        if (model && typeof model.get === 'function') {

            this.app?.trigger('confirma', {
                message: 'Se requiere de confirmar la acción a realizar para remover el registro',
                callback: (confirm: boolean) => {
                    if (confirm === true) {
                        this.saveRemoveEmpresa(model, callback, controller);
                    }
                    return callback(false);
                },
            });

        } else {
            return callback(false);
        }
    }

    private async saveRemoveEmpresa(model: any, callback: (success: boolean, data?: any) => void, controller?: any): Promise<void> {
        try {
            const response = await this.api.delete(`/habiles/removeEmpresa/${model.get('nit')}`);
            if (response?.success) {
                this.app?.trigger('alert:success', { message: response.msj });

                // Si hay controller, delegar la eliminación de la collection
                if (controller && typeof controller.handleRemoveEmpresa === 'function') {
                    controller.handleRemoveEmpresa({ removeFromCollection: true, model });
                }

                callback(true, response);
            } else {
                this.app?.trigger('alert:error', { message: response.message || 'Error al eliminar empresa' });
            }
        } catch (error: any) {
            this.logger?.error('Error al eliminar empresa:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al eliminar empresa' });
            callback(false);
        }
    }


    /**
     * Eliminar habil
     */
    __removeHabil(transfer: RemoveTransfer & { controller?: any }): void {
        const { model, callback, controller } = transfer;

        if (model instanceof HabilModel) {
            this.app?.trigger('confirma', {
                message: 'Se requiere de confirmar la acción a realizar para remover el registro',
                callback: (confirm: boolean) => {
                    if (confirm === true) {
                        this.removeHabilApi(model, callback, controller);
                    }
                    callback(false);
                },
            });

        } else {
            callback(false);
        }
    }


    private async removeHabilApi(model: any, callback: (success: boolean | any) => void, controller?: any): Promise<void> {
        try {
            const response = await this.api.post('/habiles/remove_habil', {
                nit: model.get('nit'),
                cedrep: model.get('cedula_representa'),
                criterio: 26,
            });

            if (response?.success) {
                this.app?.trigger('alert:success', { message: response.msj });

                // Si hay controller, delegar la eliminación de la collection
                if (controller && typeof controller.handleRemoveHabil === 'function') {
                    controller.handleRemoveHabil({ removeFromCollection: true, model });
                }

                callback(response);
            } else {
                this.app?.trigger('alert:error', { message: response.msj });
                callback(false);
            }
        } catch (error: any) {
            this.logger?.error('Error al remover habil:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al remover habil' });
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
                this.app?.trigger('alert:success', { message: response.msj });
            } else {
                this.app?.trigger('alert:error', { message: response.msj });
            }
        } catch (error: any) {
            this.logger?.error('Error al notificar plataforma:', error);
            this.app?.trigger('alert:error', error.message || 'Error de conexión al notificar plataforma');
        }
    }

    /**
     * Cargue masivo de habiles (delegado desde la vista)
     */
    __uploadMasivo = async (transfer: { formData: FormData, callback: (success: boolean, data?: any) => void }): Promise<void> => {
        const { formData, callback } = transfer;
        try {
            const response = await this.api.post('/habiles/cargue_masivo', formData);
            if (response && response.success === true) {
                this.app?.trigger('alert:success', { message: response.msj || 'Cargue masivo completado' });
                return callback(true, response);
            } else {
                this.app?.trigger('alert:error', { message: (response && (response.msj || response.message)) || 'Error en cargue masivo' });
                return callback(false);
            }
        } catch (error: any) {
            this.logger?.error('Error en cargue masivo:', error);
            this.app?.trigger('alert:error', error.message || 'Error de conexión en cargue masivo');
            return callback(false);
        }
    };

    /** Exportar lista en formato descargable */
    __exportLista = async (): Promise<void> => {
        try {
            const response = await this.api.get('/habiles/exportar_lista');
            if (response?.success && response.url) {
                this.app?.download({ url: response.url, filename: response.filename || 'empresas.csv' });
                this.app?.trigger('alert:success', { message: response.msj || 'Exportación iniciada' });
            } else {
                this.app?.trigger('alert:error', { message: response?.msj || response?.message || 'No fue posible exportar la lista' });
            }
        } catch (error: any) {
            this.logger?.error('Error al exportar lista:', error);
            this.app?.trigger('alert:error', error.message || 'Error de conexión al exportar lista');
        }
    };

    /** Exportar informe (PDF u otro) */
    __exportInforme = async (): Promise<void> => {
        try {
            const response = await this.api.get('/habiles/exportar_pdf');
            if (response?.success && response.url) {
                this.app?.download({ url: response.url, filename: response.filename || 'informe.pdf' });
                this.app?.trigger('alert:success', { message: response.msj || 'Generación de informe iniciada' });
            } else {
                this.app?.trigger('alert:error', { message: response?.msj || response?.message || 'No fue posible generar el informe' });
            }
        } catch (error: any) {
            this.logger?.error('Error al exportar informe:', error);
            this.app?.trigger('alert:error', error.message || 'Error de conexión al exportar informe');
        }
    };
}
