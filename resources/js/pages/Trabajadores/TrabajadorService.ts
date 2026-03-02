import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import Trabajador from '@/componentes/trabajadores/models/Trabajador';

export interface TrabajadorServiceOptions extends ServiceOptions {
  // Opciones adicionales específicas del servicio si se necesitan
}

export default class TrabajadorService {
  constructor(private readonly opts: TrabajadorServiceOptions) {
    // SIN storage/persistencia local - solo API
  }

  private get api() { return this.opts.api; }
  private get logger() { return this.opts.logger; }
  private get app() { return this.opts.app; }

  /**
   * Obtener todos los trabajadores desde API
   */
  async findAllTrabajadores(): Promise<any> {
    try {
      const response = await this.api.get('/trabajadores/listar');
      if (response?.success) {
        return response;
      } else {
        this.app?.trigger('alert:error', { message: (response as any).msj || 'Error al listar trabajadores' });
        return null;
      }
    } catch (error: any) {
      this.logger?.error('Error al listar trabajadores:', error);
      this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar trabajadores' });
      return null;
    }
  }

  /**
   * Guardar trabajador
   */
  async __saveTrabajador(model: any): Promise<ApiResponse> {
    try {
      if (!model.isValid()) {
        const errors = model.validationError;
        this.app.trigger('alert:error', errors.toString());
        return { success: false, message: errors.toString() };
      }

      const response = await this.saveTrabajadorApi(model.toJSON());

      if (response?.success) {
        this.app.trigger('alert:success', { message: (response as any).msj || 'Trabajador guardado exitosamente' });
      } else {
        this.app.trigger('alert:error', { message: (response as any).msj || 'Error al guardar trabajador' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al guardar trabajador:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Eliminar trabajador
   */
  async __removeTrabajador(trabajador: any): Promise<ApiResponse> {
    try {
      const response = await this.removeTrabajadorApi(trabajador.toJSON());

      if (response?.success) {
        this.app.trigger('alert:success', { message: (response as any).msj || 'Trabajador eliminado exitosamente' });
      } else {
        this.app.trigger('alert:error', { message: (response as any).msj || 'Error al eliminar trabajador' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al eliminar trabajador:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Cargar trabajadores masivamente en API
   */
  async __uploadMasivo(formData: FormData): Promise<ApiResponse> {
    try {
      const response = await this.uploadMasivoApi(formData);
      return response;
    } catch (error: any) {
      this.logger.error('Error en cargue masivo:', error);
      throw error;
    }
  }

  /**
   * Crear trabajador
   */
  async __crearTrabajador(data: Record<string, any>): Promise<ApiResponse> {
    try {
      const response = await this.crearTrabajadorApi(data);
      return response;
    } catch (error: any) {
      this.logger.error('Error al crear trabajador:', error);
      throw error;
    }
  }

  // Métodos privados (solo Service)

  /**
   * Guardar trabajador en API
   */
  private async saveTrabajadorApi(data: any): Promise<ApiResponse> {
    return await this.api.post('/trabajadores/saveTrabajador', data);
  }

  /**
   * API para crear trabajador
   */
  private async crearTrabajadorApi(data: Record<string, any>): Promise<ApiResponse> {
    return await this.api.post('/trabajadores/crear', data);
  }

  /**
   * Eliminar trabajador en API
   */
  private async removeTrabajadorApi(data: any): Promise<ApiResponse> {
    return await this.api.post('/trabajadores/removeTrabajador', data);
  }

  /**
   * Subir archivo masivo a API
   */
  private async uploadMasivoApi(formData: FormData): Promise<ApiResponse> {
    return await this.api.post('/trabajadores/cargue_masivo', formData);
  }
}
