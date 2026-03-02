import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import NovedadesCollection from '@/collections/NovedadesCollection';
import Novedad from '@/models/Novedad';

export interface NovedadesServiceOptions extends ServiceOptions {
  // Opciones adicionales específicas del servicio si se necesitan
}

export default class NovedadesService {
  constructor(private readonly opts: NovedadesServiceOptions) {
    // SIN storage/persistencia local - solo API
  }

  private get api() { return this.opts.api; }
  private get logger() { return this.opts.logger; }
  private get app() { return this.opts.app; }

  /**
   * Obtener todas las novedades desde API
   */
  async findAllNovedades(): Promise<any> {
    try {
      const response = await this.api.get('/novedades/listar');
      if (response?.success) {
        return response;
      } else {
        this.app?.trigger('alert:error', { message: (response as any).msj || 'Error al listar novedades' });
        return null;
      }
    } catch (error: any) {
      this.logger?.error('Error al listar novedades:', error);
      this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar novedades' });
      return null;
    }
  }

  /**
   * Guardar novedad
   */
  async __saveNovedad(novedad: any): Promise<ApiResponse> {
    try {
      if (!novedad.isValid()) {
        const errors = novedad.validationError;
        this.app.trigger('alert:error', errors.toString());
        return { success: false, message: errors.toString() };
      }

      const response = await this.saveNovedadApi(novedad.toJSON());

      if (response?.success) {
        this.app.trigger('alert:success', { message: (response as any).msj || 'Novedad guardada exitosamente' });
      } else {
        this.app.trigger('alert:error', { message: (response as any).msj || 'Error al guardar novedad' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al guardar novedad:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Eliminar novedad
   */
  async __removeNovedad(novedad: any): Promise<ApiResponse> {
    try {
      const response = await this.removeNovedadApi(novedad.toJSON());

      if (response?.success) {
        this.app.trigger('alert:success', { message: (response as any).msj || 'Novedad eliminada exitosamente' });
      } else {
        this.app.trigger('alert:error', { message: (response as any).msj || 'Error al eliminar novedad' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al eliminar novedad:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Marcar novedad como leída
   */
  async __marcarLeida(novedad: any): Promise<ApiResponse> {
    try {
      const response = await this.marcarLeidaApi(novedad.toJSON());

      if (response?.success) {
        this.app.trigger('alert:success', { message: (response as any).msj || 'Novedad marcada como leída' });
        // Actualizar estado local del modelo
        novedad.set('leida', true);
      } else {
        this.app.trigger('alert:error', { message: (response as any).msj || 'Error al marcar novedad' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al marcar novedad:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Buscar novedades por criterio
   */
  async __buscarNovedades(criterio: string): Promise<any[]> {
    try {
      const response = await this.buscarNovedadesApi(criterio);
      if (response?.success) {
        return response.novedades || [];
      } else {
        this.logger.error('Error al buscar novedades:', (response as any).msj);
        return [];
      }
    } catch (error: any) {
      this.logger.error('Error al buscar novedades:', error);
      return [];
    }
  }

  /**
   * Obtener novedades no leídas
   */
  async __getNoLeidas(): Promise<any[]> {
    try {
      const response = await this.getNoLeidasApi();
      if (response?.success) {
        return response.novedades || [];
      } else {
        this.logger.error('Error al obtener novedades no leídas:', (response as any).msj);
        return [];
      }
    } catch (error: any) {
      this.logger.error('Error al obtener novedades no leídas:', error);
      return [];
    }
  }

  /**
   * Descargar archivo adjunto
   */
  async __downloadFile(fileId: string): Promise<void> {
    try {
      const response = await this.downloadFileApi(fileId);
      if (response?.success) {
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.href = response.url;
        link.download = response.filename || 'archivo';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        this.app?.trigger('alert:error', { message: (response as any).msj || 'Error al descargar archivo' });
      }
    } catch (error: any) {
      this.logger.error('Error al descargar archivo:', error);
      this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
    }
  }

  // Métodos privados (solo Service)

  /**
   * Guardar novedad en API
   */
  private async saveNovedadApi(data: any): Promise<ApiResponse> {
    return await this.api.post('/novedades/saveNovedad', data);
  }

  /**
   * Eliminar novedad en API
   */
  private async removeNovedadApi(data: any): Promise<ApiResponse> {
    return await this.api.post('/novedades/removeNovedad', data);
  }

  /**
   * Marcar novedad como leída en API
   */
  private async marcarLeidaApi(data: any): Promise<ApiResponse> {
    return await this.api.post('/novedades/marcarLeida', data);
  }

  /**
   * Buscar novedades en API
   */
  private async buscarNovedadesApi(criterio: string): Promise<ApiResponse> {
    return await this.api.get(`/novedades/buscar?q=${encodeURIComponent(criterio)}`);
  }

  /**
   * Obtener novedades no leídas en API
   */
  private async getNoLeidasApi(): Promise<ApiResponse> {
    return await this.api.get('/novedades/noLeidas');
  }

  /**
   * Descargar archivo en API
   */
  private async downloadFileApi(fileId: string): Promise<ApiResponse> {
    return await this.api.get(`/novedades/download/${fileId}`);
  }
}