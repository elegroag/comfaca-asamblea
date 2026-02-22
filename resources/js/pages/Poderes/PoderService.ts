import { CommonDeps, ServiceOptions, ApiResponse, FileUploadTransfer } from '@/types/CommonDeps';
import { BoxCollectionStorage } from '@/componentes/useStorage';
import type { Poder } from './types';

export interface PoderServiceOptions extends ServiceOptions {
  // Opciones adicionales específicas del servicio si se necesitan
}

export interface PoderCollections {
  poderes: any; // PoderesCollection si existe
  rechazos: any; // RechazosCollection si existe
}

export default class PoderService {
  private storage: BoxCollectionStorage;
  private collections: PoderCollections;

  constructor(private readonly opts: PoderServiceOptions) {
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
    const poderesStorage = this.storage.getCollection('poderes')?.value;
    const rechazosStorage = this.storage.getCollection('rechazos')?.value;

    // Crear colecciones Backbone si no existen
    this.collections.poderes = poderesStorage || new (this.App as any).Collection();
    this.collections.rechazos = rechazosStorage || new (this.App as any).Collection();

    // Guardar colecciones en storage si no existen
    if (!poderesStorage) {
      this.storage.addCollection('poderes', this.collections.poderes);
    }
    if (!rechazosStorage) {
      this.storage.addCollection('rechazos', this.collections.rechazos);
    }
  }

  // Métodos públicos (interfaz para controllers/vistas)

  /**
   * Obtener todos los poderes
   */
  async __findAll(): Promise<void> {
    try {
      const response = await this.findAllApi();
      if (response?.success) {
        this.__setPoderes((response as any).poderes || []);
      } else {
        this.app.trigger('alert:error', { message: response?.msj || 'Error al cargar poderes' });
      }
    } catch (error: any) {
      this.logger.error('Error al listar poderes:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
    }
  }

  /**
   * Establecer lista de poderes
   */
  __setPoderes(poderes: Poder[]): void {
    this.collections.poderes.reset();
    this.collections.poderes.add(poderes, { merge: true });
  }

  /**
   * Agregar poder a la colección
   */
  __addPoder(poder: Poder): void {
    this.collections.poderes.add(poder, { merge: true });
  }

  /**
   * Remover poder de la colección
   */
  __removePoder(poder: Poder): void {
    this.collections.poderes.remove(poder);
  }

  /**
   * Guardar poder (crear o actualizar)
   */
  async __savePoder(poder: Poder): Promise<ApiResponse> {
    try {
      const response = poder.id
        ? await this.updatePoderApi(poder)
        : await this.createPoderApi(poder);

      if (response?.success) {
        this.app.trigger('alert:success', { message: response.msj || 'Poder guardado exitosamente' });
        this.__addPoder((response as any).poder);
      } else {
        this.app.trigger('alert:error', { message: response?.msj || 'Error al guardar poder' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al guardar poder:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Eliminar poder
   */
  async __deletePoder(id: string): Promise<ApiResponse> {
    try {
      const response = await this.deletePoderApi(id);

      if (response?.success) {
        this.app.trigger('alert:success', { message: response.msj || 'Poder eliminado exitosamente' });
        const poder = this.collections.poderes.get(id);
        if (poder) {
          this.__removePoder(poder);
        }
      } else {
        this.app.trigger('alert:error', { message: response?.msj || 'Error al eliminar poder' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al eliminar poder:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Activar poder
   */
  async __activarPoder(id: string): Promise<ApiResponse> {
    try {
      const response = await this.activarPoderApi(id);

      if (response?.success) {
        this.app.trigger('alert:success', { message: response.msj || 'Poder activado exitosamente' });
        // Actualizar el poder en la colección
        const poder = this.collections.poderes.get(id);
        if (poder) {
          poder.set('estado', 'activo');
        }
      } else {
        this.app.trigger('alert:error', { message: response?.msj || 'Error al activar poder' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al activar poder:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Inactivar poder
   */
  async __inactivarPoder(id: string): Promise<ApiResponse> {
    try {
      const response = await this.inactivarPoderApi(id);

      if (response?.success) {
        this.app.trigger('alert:success', { message: response.msj || 'Poder inactivado exitosamente' });
        // Actualizar el poder en la colección
        const poder = this.collections.poderes.get(id);
        if (poder) {
          poder.set('estado', 'inactivo');
        }
      } else {
        this.app.trigger('alert:error', { message: response?.msj || 'Error al inactivar poder' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al inactivar poder:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Cargue masivo de poderes
   */
  async __uploadMasivo({ formData, callback }: FileUploadTransfer): Promise<void> {
    try {
      const response = await this.uploadMasivoApi(formData);

      if (response?.success) {
        this.app.trigger('alert:success', { message: response.msj || 'Cargue masivo exitoso' });
        await this.__findAll(); // Recargar datos
        callback(true, response);
      } else {
        this.app.trigger('alert:error', { message: response?.msj || 'Error en el cargue masivo' });
        callback(false);
      }
    } catch (error: any) {
      this.logger.error('Error en cargue masivo:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
      callback(false);
    }
  }

  /**
   * Exportar lista de poderes
   */
  async __exportLista(): Promise<void> {
    try {
      const response = await this.exportListaApi();

      if (response?.success && response.url) {
        this.app.download({
          url: response.url,
          filename: response.filename || 'poderes.csv'
        });
      } else {
        this.app.trigger('alert:error', { message: response?.msj || 'Error al exportar lista' });
      }
    } catch (error: any) {
      this.logger.error('Error al exportar lista:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
    }
  }

  // Métodos privados (solo Service)

  /**
   * Obtener poderes desde API
   */
  private async findAllApi(): Promise<ApiResponse> {
    return await this.api.get('/poderes/listar');
  }

  /**
   * Crear poder en API
   */
  private async createPoderApi(poder: Poder): Promise<ApiResponse> {
    return await this.api.post('/poderes/crear', poder);
  }

  /**
   * Actualizar poder en API
   */
  private async updatePoderApi(poder: Poder): Promise<ApiResponse> {
    return await this.api.put(`/poderes/editar/${poder.id}`, poder);
  }

  /**
   * Eliminar poder en API
   */
  private async deletePoderApi(id: string): Promise<ApiResponse> {
    return await this.api.delete(`/poderes/eliminar/${id}`);
  }

  /**
   * Activar poder en API
   */
  private async activarPoderApi(id: string): Promise<ApiResponse> {
    return await this.api.post(`/poderes/activar/${id}`);
  }

  /**
   * Inactivar poder en API
   */
  private async inactivarPoderApi(id: string): Promise<ApiResponse> {
    return await this.api.post(`/poderes/inactivar/${id}`);
  }

  /**
   * Subir archivo masivo a API
   */
  private async uploadMasivoApi(formData: FormData): Promise<ApiResponse> {
    return await this.api.post('/poderes/cargue_masivo', formData);
  }

  /**
   * Exportar lista desde API
   */
  private async exportListaApi(): Promise<ApiResponse> {
    return await this.api.get('/poderes/exportar_lista');
  }

  /**
   * Validación previa de poder
   */
  async __validarPoder(data: Record<string, string>): Promise<ApiResponse> {
    try {
      const response = await this.validarPoderApi(data);
      return response;
    } catch (error: any) {
      this.logger.error('Error en validación previa:', error);
      this.App?.trigger('alert:error', { message: error.message || 'Error de conexión' });
      throw error;
    }
  }

  /**
   * API para validación previa
   */
  private async validarPoderApi(data: Record<string, string>): Promise<ApiResponse> {
    return await this.api.post('/poderes/validacion_previa', data);
  }

  /**
   * Buscar empresa por NIT
   */
  async __buscarEmpresa(nit: string): Promise<ApiResponse> {
    try {
      const response = await this.buscarEmpresaApi(nit);
      return response;
    } catch (error: any) {
      this.logger.error('Error al buscar empresa:', error);
      this.App?.trigger('alert:error', { message: error.message || 'Error de conexión' });
      throw error;
    }
  }

  /**
   * API para buscar empresa
   */
  private async buscarEmpresaApi(nit: string): Promise<ApiResponse> {
    return await this.api.get(`/poderes/buscar_empresa/${nit}`);
  }

  /**
   * Registrar rechazo de poder
   */
  async __registrarRechazo(data: Record<string, any>): Promise<ApiResponse> {
    try {
      const response = await this.registrarRechazoApi(data);
      return response;
    } catch (error: any) {
      this.logger.error('Error al registrar rechazo:', error);
      this.App?.trigger('alert:error', { message: error.message || 'Error de conexión' });
      throw error;
    }
  }

  /**
   * API para registrar rechazo
   */
  private async registrarRechazoApi(data: Record<string, any>): Promise<ApiResponse> {
    return await this.api.post('/poderes/registraRechazoPoder', data);
  }
}
