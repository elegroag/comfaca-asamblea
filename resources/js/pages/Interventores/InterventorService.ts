import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import { BoxCollectionStorage } from '@/componentes/useStorage';

export interface InterventorServiceOptions extends ServiceOptions {
  // Opciones adicionales específicas del servicio si se necesitan
}

export interface InterventorCollections {
  interventores: any; // InterventoresCollection si existe
}

export default class InterventorService {
  private storage: BoxCollectionStorage;
  private collections: IntervorCollections;

  constructor(private readonly opts: InterventorServiceOptions) {
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
    this.collections.interventores = this.storage.getCollection('interventores')?.value || null;

    // Crear colecciones Backbone si no existen
    if (!this.collections.interventores) {
      this.collections.interventores = new InterventoresCollection();
      this.storage.addCollection('interventores', this.collections.interventores);
    }
  }

  // Métodos públicos (interfaz para controllers/vistas)

  /**
   * Obtener todos los interventores
   */
  async __findAll(): Promise<void> {
    try {
      const response = await this.findAllApi();
      if (response?.success) {
        this.__setInterventores((response as any).interventores || []);
      } else {
        this.App.trigger('alert:error', { message: response?.msj || 'Error al cargar interventores' });
      }
    } catch (error: any) {
      this.logger.error('Error al listar interventores:', error);
      this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
    }
  }

  /**
   * Establecer lista de interventores
   */
  __setInterventores(interventores: any[]): void {
    this.collections.interventores.reset();
    this.collections.interventores.add(interventores, { merge: true });
  }

  /**
   * Agregar interventor a la colección
   */
  __addInterventores(interventor: any): void {
    const _interventor = interventor instanceof Interventor ? interventor : new Interventor(interventor);
    this.collections.interventores.add(_interventor, { merge: true });
  }

  /**
   * Guardar interventor
   */
  async __saveInterventor(interventor: any): Promise<ApiResponse> {
    try {
      if (!interventor.isValid()) {
        const errors = interventor.validationError;
        this.App.trigger('alert:error', errors.toString());
        return { success: false, message: errors.toString() };
      }

      const response = await this.saveInterventorApi(interventor.toJSON());

      if (response?.success) {
        this.App.trigger('alert:success', { message: response.msj || 'Interventor guardado exitosamente' });
        this.__addInterventores((response as any).interventor);
      } else {
        this.App.trigger('alert:error', { message: response?.msj || 'Error al guardar interventor' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al guardar interventor:', error);
      this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Eliminar interventor
   */
  async __removeInterventor(interventor: any): Promise<ApiResponse> {
    try {
      const response = await this.removeInterventorApi(interventor.toJSON());

      if (response?.success) {
        this.App.trigger('alert:success', { message: response.msj || 'Interventor eliminado exitosamente' });
        this.collections.interventores.remove(interventor);
      } else {
        this.App.trigger('alert:error', { message: response?.msj || 'Error al eliminar interventor' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al eliminar interventor:', error);
      this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Buscar interventores por criterio
   */
  async __buscarInterventores(criterio: string): Promise<any[]> {
    try {
      const response = await this.buscarInterventoresApi(criterio);
      return response?.success ? (response as any).interventores || [] : [];
    } catch (error: any) {
      this.logger.error('Error al buscar interventores:', error);
      return [];
    }
  }

  // Métodos privados (solo Service)

  /**
   * Obtener interventores desde API
   */
  private async findAllApi(): Promise<ApiResponse> {
    return await this.api.get('/interventores/listar');
  }

  /**
   * Guardar interventor en API
   */
  private async saveInterventorApi(data: any): Promise<ApiResponse> {
    return await this.api.post('/interventores/saveInterventor', data);
  }

  /**
   * Eliminar interventor en API
   */
  private async removeInterventorApi(data: any): Promise<ApiResponse> {
    return await this.api.post('/interventores/removeInterventor', data);
  }

  /**
   * Buscar interventores en API
   */
  private async buscarInterventoresApi(criterio: string): Promise<ApiResponse> {
    return await this.api.get(`/interventores/buscar?criterio=${encodeURIComponent(criterio)}`);
  }

  /**
   * Cargue masivo de interventores
   */
  async __uploadMasivo(formData: FormData): Promise<ApiResponse> {
    try {
      const response = await this.uploadMasivoApi(formData);

      if (response?.success) {
        this.App?.trigger('alert:success', { message: response.msj || 'Cargue masivo completado exitosamente' });
      } else {
        this.App?.trigger('alert:error', { message: response?.msj || 'Error en el cargue masivo' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error en cargue masivo:', error);
      this.App?.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message || 'Error de conexión' };
    }
  }

  /**
   * API para cargue masivo
   */
  private async uploadMasivoApi(formData: FormData): Promise<ApiResponse> {
    return await this.api.post('/interventores/uploadMasivo', formData);
  }
}
