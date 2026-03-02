import Logger from "@/common/Logger";
import Representante from "@/models/Representante";
import { AppInstance } from "@/types/types";

export interface RepresentanteServiceOptions {
  api: any;
  app: AppInstance | any;
  logger: Logger;
  RepresentanteModel?: any; // opcional, si se requiere construir explícitamente modelos de representante
}

export default class RepresentanteService {
  api: any;
  app: AppInstance | any;
  logger: Logger;
  private RepresentanteModel?: any;

  constructor(options: RepresentanteServiceOptions) {
    this.api = options.api;
    this.app = options.app;
    this.logger = options.logger;
    this.RepresentanteModel = options.RepresentanteModel;
  }

  /**
   * Obtener todos los representantes desde API
   */
  async findAllRepresentantes(): Promise<any> {
    try {
      const response = await this.api.get('/representantes/listar');
      if (response?.success) {
        return response;
      } else {
        this.app?.trigger('alert:error', { message: response.msj || 'Error al listar representantes' });
        return null;
      }
    } catch (error: any) {
      this.logger?.error('Error al listar representantes:', error);
      this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar representantes' });
      return null;
    }
  }

  /**
   * Obtener representante específico por ID desde API
   */
  async findByRepresentante(id: string): Promise<any> {
    try {
      const response = await this.api.get(`/representantes/representante/${id}`);
      if (response?.success) {
        return response;
      } else {
        this.app?.trigger('alert:error', { message: response.msj || 'Error al obtener representante' });
        return null;
      }
    } catch (error: any) {
      this.logger?.error('Error al obtener representante:', error);
      this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al obtener representante' });
      return null;
    }
  }

  /**
   * Guardar representante
   */
  __saveRepresentante(transfer: { model: any, callback: (success: boolean, data?: any) => void }): void {
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
            this.saveRepresentante(model, callback);
          } else {
            return callback(false);
          }
        },
      });
    }
  }

  private async saveRepresentante(model: any, callback: (success: boolean, data?: any) => void): Promise<void> {
    try {
      const response = await this.api.post('/representantes/saveRepresentante', model.toJSON());
      if (response?.success) {
        this.app?.trigger('alert:success', response.msj);
        callback(true, {
          representante: response.data,
        });
      } else {
        this.app?.trigger('alert:error', { message: response.message || 'Error al guardar representante' });
      }
    } catch (error: any) {
      this.logger?.error('Error al guardar representante:', error);
      this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al guardar representante' });
      callback(false);
    }
  }

  /**
   * Eliminar representante
   */
  __removeRepresentante(transfer: { model: any, callback: (success: boolean, data?: any) => void, controller?: any }): void {
    const { model, callback, controller } = transfer;

    if (model && typeof model.get === 'function') {
      this.app?.trigger('confirma', {
        message: 'Se requiere de confirmar la acción a realizar para remover el registro',
        callback: (confirm: boolean) => {
          if (confirm === true) {
            this.saveRemoveRepresentante(model, callback, controller);
          }
          return callback(false);
        },
      });
    } else {
      return callback(false);
    }
  }

  private async saveRemoveRepresentante(model: any, callback: (success: boolean, data?: any) => void, controller?: any): Promise<void> {
    try {
      const response = await this.api.delete(`/representantes/removeRepresentante/${model.get('id')}`);
      if (response?.success) {
        this.app?.trigger('alert:success', { message: response.msj });

        // Si hay controller, delegar la eliminación de la collection
        if (controller && typeof controller.handleRemoveRepresentante === 'function') {
          controller.handleRemoveRepresentante({ removeFromCollection: true, model });
        }

        callback(true, response);
      } else {
        this.app?.trigger('alert:error', { message: response.message || 'Error al eliminar representante' });
      }
    } catch (error: any) {
      this.logger?.error('Error al eliminar representante:', error);
      this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al eliminar representante' });
      callback(false);
    }
  }

  /**
   * Cargue masivo de representantes (delegado desde la vista)
   */
  __uploadMasivo = async (transfer: { formData: FormData, callback: (success: boolean, data?: any) => void }): Promise<void> => {
    const { formData, callback } = transfer;
    try {
      const response = await this.api.post('/representantes/cargue_masivo', formData);
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
      const response = await this.api.get('/representantes/exportar_lista');
      if (response?.success && response.url) {
        this.app?.download({ url: response.url, filename: response.filename || 'representantes.csv' });
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
      const response = await this.api.get('/representantes/exportar_pdf');
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

  /**
   * Buscar representantes por criterio
   */
  async buscarRepresentantes(criterio: string): Promise<any> {
    try {
      const response = await this.api.get(`/representantes/buscar?criterio=${encodeURIComponent(criterio)}`);
      if (response?.success) {
        return response;
      } else {
        this.app?.trigger('alert:error', { message: response.msj || 'Error al buscar representantes' });
        return null;
      }
    } catch (error: any) {
      this.logger?.error('Error al buscar representantes:', error);
      this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al buscar representantes' });
      return null;
    }
  }

  /**
   * Obtener representantes por empresa
   */
  async getPorEmpresa(empresaId: string): Promise<any> {
    try {
      const response = await this.api.get(`/representantes/porEmpresa/${empresaId}`);
      if (response?.success) {
        return response;
      } else {
        this.app?.trigger('alert:error', { message: response.msj || 'Error al obtener representantes por empresa' });
        return null;
      }
    } catch (error: any) {
      this.logger?.error('Error al obtener representantes por empresa:', error);
      this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al obtener representantes por empresa' });
      return null;
    }
  }
}
