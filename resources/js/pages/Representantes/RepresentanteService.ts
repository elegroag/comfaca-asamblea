import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import { BoxCollectionStorage } from '@/componentes/useStorage';
import RepresentantesCollection from '@/collections/RepresentantesCollection';
import Representante from '@/models/Representante';

export interface RepresentanteServiceOptions extends ServiceOptions {
  // Opciones adicionales específicas del servicio si se necesitan
}

export interface RepresentanteCollections {
  representantes: RepresentantesCollection;
}

export default class RepresentanteService {
  private storage: BoxCollectionStorage;
  private collections: RepresentanteCollections;

  constructor(private readonly opts: RepresentanteServiceOptions) {
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
    const representantesStorage = this.storage.getCollection('representantes')?.value;

    // Crear colecciones Backbone si no existen
    this.collections.representantes = (representantesStorage as RepresentantesCollection) || new RepresentantesCollection();

    // Guardar colecciones en storage si no existen
    if (!representantesStorage) {
      this.storage.addCollection('representantes', this.collections.representantes);
    }
  }

  // Métodos públicos (interfaz para controllers/vistas)

  /**
   * Obtener todos los representantes
   */
  async __findAll(): Promise<void> {
    try {
      const response = await this.findAllApi();
      if (response?.success) {
        this.__setRepresentantes((response as any).representantes || []);
      } else {
        this.App.trigger('alert:error', { message: response?.msj || 'Error al cargar representantes' });
      }
    } catch (error: any) {
      this.logger.error('Error al listar representantes:', error);
      this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
    }
  }

  /**
   * Establecer lista de representantes
   */
  __setRepresentantes(representantes: any[]): void {
    this.collections.representantes.reset();
    this.collections.representantes.add(representantes, { merge: true });
  }

  /**
   * Agregar representante a la colección
   */
  __addRepresentantes(representante: any): void {
    const _representante = representante instanceof Representante ? representante : new Representante(representante);
    this.collections.representantes.add(_representante, { merge: true });
  }

  /**
   * Guardar representante
   */
  async __saveRepresentante(representante: any): Promise<ApiResponse> {
    try {
      if (!representante.isValid()) {
        const errors = representante.validationError;
        this.App.trigger('alert:error', errors.toString());
        return { success: false, message: errors.toString() };
      }

      const response = await this.saveRepresentanteApi(representante.toJSON());

      if (response?.success) {
        this.App.trigger('alert:success', { message: response.msj || 'Representante guardado exitosamente' });
        this.__addRepresentantes((response as any).representante);
      } else {
        this.App.trigger('alert:error', { message: response?.msj || 'Error al guardar representante' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al guardar representante:', error);
      this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Eliminar representante
   */
  async __removeRepresentante(representante: any): Promise<ApiResponse> {
    try {
      const response = await this.removeRepresentanteApi(representante.toJSON());

      if (response?.success) {
        this.App.trigger('alert:success', { message: response.msj || 'Representante eliminado exitosamente' });
        this.collections.representantes.remove(representante);
      } else {
        this.App.trigger('alert:error', { message: response?.msj || 'Error al eliminar representante' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al eliminar representante:', error);
      this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Cargue masivo de representantes
   */
  async __uploadMasivo({ formData, callback }: any): Promise<void> {
    try {
      const response = await this.uploadMasivoApi(formData);

      if (response?.success) {
        this.App.trigger('alert:success', { message: response.msj || 'Cargue masivo exitoso' });
        await this.__findAll(); // Recargar datos
        callback(true, response);
      } else {
        this.App.trigger('alert:error', { message: response?.msj || 'Error en el cargue masivo' });
        callback(false);
      }
    } catch (error: any) {
      this.logger.error('Error en cargue masivo:', error);
      this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
      callback(false);
    }
  }

  /**
   * Buscar representantes por criterio
   */
  async __buscarRepresentantes(criterio: string): Promise<any[]> {
    try {
      const response = await this.buscarRepresentantesApi(criterio);
      return response?.success ? (response as any).representantes || [] : [];
    } catch (error: any) {
      this.logger.error('Error al buscar representantes:', error);
      return [];
    }
  }

  /**
   * Obtener representantes por empresa
   */
  async __getPorEmpresa(empresaId: string): Promise<any[]> {
    try {
      const response = await this.getPorEmpresaApi(empresaId);
      return response?.success ? (response as any).representantes || [] : [];
    } catch (error: any) {
      this.logger.error('Error al obtener representantes por empresa:', error);
      return [];
    }
  }

  // Métodos privados (solo Service)

  /**
   * Obtener representantes desde API
   */
  private async findAllApi(): Promise<ApiResponse> {
    return await this.api.get('/representantes/listar');
  }

  /**
   * Guardar representante en API
   */
  private async saveRepresentanteApi(data: any): Promise<ApiResponse> {
    return await this.api.post('/representantes/saveRepresentante', data);
  }

  /**
   * Eliminar representante en API
   */
  private async removeRepresentanteApi(data: any): Promise<ApiResponse> {
    return await this.api.post('/representantes/removeRepresentante', data);
  }

  /**
   * Subir archivo masivo a API
   */
  private async uploadMasivoApi(formData: FormData): Promise<ApiResponse> {
    return await this.api.post('/representantes/cargue_masivo', formData);
  }

  /**
   * Buscar representantes en API
   */
  private async buscarRepresentantesApi(criterio: string): Promise<ApiResponse> {
    return await this.api.get(`/representantes/buscar?criterio=${encodeURIComponent(criterio)}`);
  }

  /**
   * Obtener representantes por empresa desde API
   */
  private async getPorEmpresaApi(empresaId: string): Promise<ApiResponse> {
    return await this.api.get(`/representantes/porEmpresa/${empresaId}`);
  }
}
