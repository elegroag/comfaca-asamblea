import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import { BoxCollectionStorage } from '@/componentes/useStorage';
import TrabajadoresCollection from '@/componentes/trabajadores/collections/TrabajadoresCollection';
import Trabajador from '@/componentes/trabajadores/models/Trabajador';

export interface TrabajadorServiceOptions extends ServiceOptions {
  // Opciones adicionales específicas del servicio si se necesitan
}

export interface TrabajadorCollections {
  trabajadores: TrabajadoresCollection;
}

export default class TrabajadorService {
  private storage: BoxCollectionStorage;
  private collections: TrabajadorCollections;

  constructor(private readonly opts: TrabajadorServiceOptions) {
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
    const trabajadoresStorage = this.storage.getCollection('trabajadores')?.value;

    // Crear colecciones Backbone si no existen
    this.collections.trabajadores = (trabajadoresStorage as TrabajadoresCollection) || new TrabajadoresCollection();

    // Guardar colecciones en storage si no existen
    if (!trabajadoresStorage) {
      this.storage.addCollection('trabajadores', this.collections.trabajadores);
    }
  }

  // Métodos públicos (interfaz para controllers/vistas)

  /**
   * Obtener todos los trabajadores
   */
  async __findAll(): Promise<void> {
    try {
      const response = await this.findAllApi();
      if (response?.success) {
        this.__setTrabajadores((response as any).trabajadores || []);
      } else {
        this.App.trigger('alert:error', { message: response?.msj || 'Error al cargar trabajadores' });
      }
    } catch (error: any) {
      this.logger.error('Error al listar trabajadores:', error);
      this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
    }
  }

  /**
   * Establecer lista de trabajadores
   */
  __setTrabajadores(trabajadores: any[]): void {
    this.collections.trabajadores.reset();
    this.collections.trabajadores.add(trabajadores, { merge: true });
  }

  /**
   * Agregar trabajador a la colección
   */
  __addTrabajadores(trabajador: any): void {
    const _trabajador = trabajador instanceof Trabajador ? trabajador : new Trabajador(trabajador);
    this.collections.trabajadores.add(_trabajador, { merge: true });
  }

  /**
   * Guardar trabajador
   */
  async __saveTrabajador(model: any): Promise<ApiResponse> {
    try {
      if (!model.isValid()) {
        const errors = model.validationError;
        this.App.trigger('alert:error', errors.toString());
        return { success: false, message: errors.toString() };
      }

      const response = await this.saveTrabajadorApi(model.toJSON());

      if (response?.success) {
        this.App.trigger('alert:success', { message: response.msj || 'Trabajador guardado exitosamente' });
        this.__addTrabajadores((response as any).trabajador);
      } else {
        this.App.trigger('alert:error', { message: response?.msj || 'Error al guardar trabajador' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al guardar trabajador:', error);
      this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
        this.App.trigger('alert:success', { message: response.msj || 'Trabajador eliminado exitosamente' });
        this.collections.trabajadores.remove(trabajador);
      } else {
        this.App.trigger('alert:error', { message: response?.msj || 'Error al eliminar trabajador' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al eliminar trabajador:', error);
      this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
   * Obtener trabajadores desde API
   */
  private async findAllApi(): Promise<ApiResponse> {
    return await this.api.get('/trabajadores/listar');
  }

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
