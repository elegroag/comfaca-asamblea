import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import { BoxCollectionStorage } from '@/componentes/useStorage';
import NovedadesCollection from '@/collections/NovedadesCollection';
import Novedad from '@/models/Novedad';

export interface NovedadesServiceOptions extends ServiceOptions {
  // Opciones adicionales específicas del servicio si se necesitan
}

export interface NovedadesCollections {
  novedades: NovedadesCollection;
}

export default class NovedadesService {
  private storage: BoxCollectionStorage;
  private collections: NovedadesCollections;

  constructor(private readonly opts: NovedadesServiceOptions) {
    this.storage = BoxCollectionStorage.getInstance();
    this.__initializeCollections();
  }

  private get api() { return this.opts.api; }
  private get logger() { return this.opts.logger; }
  private get App() { return this.opts.app; }

  /**
   * Inicializar las colecciones necesarias usando BoxCollectionStorage
   */
  private __initializeCollections(): void {
    // Inicializar colecciones persistentes en localStorage
    const novedadesStorage = this.storage.getCollection('novedades')?.value;

    // Crear colecciones Backbone si no existen
    this.collections.novedades = (novedadesStorage as NovedadesCollection) || new NovedadesCollection();

    // Guardar colecciones en storage si no existen
    if (!novedadesStorage) {
      this.storage.addCollection('novedades', this.collections.novedades);
    }
  }

  // Métodos públicos (interfaz para controllers/vistas)

  /**
   * Obtener todas las novedades
   */
  async __findAll(): Promise<void> {
    try {
      const response = await this.findAllApi();
      if (response?.success) {
        this.__setNovedades((response as any).novedades || []);
      } else {
        this.App.trigger('alert:error', { message: response?.msj || 'Error al cargar novedades' });
      }
    } catch (error: any) {
      this.logger.error('Error al listar novedades:', error);
      this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
    }
  }

  /**
   * Establecer lista de novedades
   */
  __setNovedades(novedades: any[]): void {
    this.collections.novedades.reset();
    this.collections.novedades.add(novedades, { merge: true });
  }

  /**
   * Agregar novedad a la colección
   */
  __addNovedades(novedad: any): void {
    const _novedad = novedad instanceof Novedad ? novedad : new Novedad(novedad);
    this.collections.novedades.add(_novedad, { merge: true });
  }

  /**
   * Guardar novedad
   */
  async __saveNovedad(novedad: any): Promise<ApiResponse> {
    try {
      if (!novedad.isValid()) {
        const errors = novedad.validationError;
        this.App.trigger('alert:error', errors.toString());
        return { success: false, message: errors.toString() };
      }

      const response = await this.saveNovedadApi(novedad.toJSON());

      if (response?.success) {
        this.App.trigger('alert:success', { message: response.msj || 'Novedad guardada exitosamente' });
        this.__addNovedades((response as any).novedad);
      } else {
        this.App.trigger('alert:error', { message: response?.msj || 'Error al guardar novedad' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al guardar novedad:', error);
      this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
        this.App.trigger('alert:success', { message: response.msj || 'Novedad eliminada exitosamente' });
        this.collections.novedades.remove(novedad);
      } else {
        this.App.trigger('alert:error', { message: response?.msj || 'Error al eliminar novedad' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al eliminar novedad:', error);
      this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
        this.App.trigger('alert:success', { message: response.msj || 'Novedad marcada como leída' });
        // Actualizar el modelo en la colección
        if (novedad.set) {
          novedad.set('leida', true);
        }
      } else {
        this.App.trigger('alert:error', { message: response?.msj || 'Error al marcar novedad como leída' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al marcar novedad como leída:', error);
      this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Buscar novedades por criterio
   */
  async __buscarNovedades(criterio: string): Promise<any[]> {
    try {
      const response = await this.buscarNovedadesApi(criterio);
      return response?.success ? (response as any).novedades || [] : [];
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
      return response?.success ? (response as any).novedades || [] : [];
    } catch (error: any) {
      this.logger.error('Error al obtener novedades no leídas:', error);
      return [];
    }
  }

  // Métodos privados (solo Service)

  /**
   * Obtener novedades desde API
   */
  private async findAllApi(): Promise<ApiResponse> {
    return await this.api.get('/novedades/listar');
  }

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
    return await this.api.get(`/novedades/buscar?criterio=${encodeURIComponent(criterio)}`);
  }

  /**
   * Obtener novedades no leídas desde API
   */
  private async getNoLeidasApi(): Promise<ApiResponse> {
    return await this.api.get('/novedades/noLeidas');
  }
}
