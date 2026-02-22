import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import { BoxCollectionStorage } from '@/componentes/useStorage';
import AsistenciasCollection from '@/collections/AsistenciasCollection';
import Poder from '@/models/Poder';
import Representante from '@/models/Representante';
import Empresa from '@/models/Empresa';
import Asistencia from '@/models/Asistencia';

export interface RecepcionServiceOptions extends ServiceOptions {
  // Opciones adicionales específicas del servicio si se necesitan
}

export interface RecepcionCollections {
  asistencias: AsistenciasCollection;
  poderes: any; // PoderCollection si existe
  representantes: any; // RepresentantesCollection si existe
  empresas: any; // EmpresasCollection si existe
}

export default class RecepcionService {
  private storage: BoxCollectionStorage;
  private collections: RecepcionCollections;

  constructor(private readonly opts: RecepcionServiceOptions) {
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
    const asistenciasStorage = this.storage.getCollection('asistencias')?.value;
    const poderesStorage = this.storage.getCollection('poderes')?.value;
    const representantesStorage = this.storage.getCollection('representantes')?.value;
    const empresasStorage = this.storage.getCollection('empresas')?.value;

    // Crear colecciones Backbone si no existen
    this.collections.asistencias = (asistenciasStorage as AsistenciasCollection) || new AsistenciasCollection();
    this.collections.poderes = poderesStorage || new (this.App as any).Collection();
    this.collections.representantes = representantesStorage || new (this.App as any).Collection();
    this.collections.empresas = empresasStorage || new (this.App as any).Collection();

    // Guardar colecciones en storage si no existen
    if (!asistenciasStorage) {
      this.storage.addCollection('asistencias', this.collections.asistencias);
    }
    if (!poderesStorage) {
      this.storage.addCollection('poderes', this.collections.poderes);
    }
    if (!representantesStorage) {
      this.storage.addCollection('representantes', this.collections.representantes);
    }
    if (!empresasStorage) {
      this.storage.addCollection('empresas', this.collections.empresas);
    }
  }

  // Métodos públicos (interfaz para controllers/vistas)

  /**
   * Crear contenido HTML para región
   */
  __createContent(): HTMLElement {
    const _el = document.createElement('div');
    _el.setAttribute('id', 'contentView');
    document.getElementById('app')?.appendChild(_el);
    if (typeof scroltop === 'function') {
      scroltop();
    }
    return _el;
  }

  /**
   * Agregar asistencia a la colección
   */
  __addAsistencias(asistencia: any): void {
    const _asistencia = asistencia instanceof Asistencia ? asistencia : new Asistencia(asistencia);
    this.collections.asistencias.add(_asistencia, { merge: true });
  }

  /**
   * Obtener todas las asistencias
   */
  async __findAllAsistencias(): Promise<void> {
    try {
      const response = await this.findAllAsistenciasApi();
      if (response?.success) {
        this.__setAsistencias((response as any).asistencias || []);
      } else {
        this.app.trigger('alert:error', { message: response?.msj || 'Error al cargar asistencias' });
      }
    } catch (error: any) {
      this.logger.error('Error al listar asistencias:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
    }
  }

  /**
   * Establecer lista de asistencias
   */
  __setAsistencias(asistencias: any[]): void {
    this.collections.asistencias.reset();
    this.collections.asistencias.add(asistencias, { merge: true });
  }

  /**
   * Guardar asistencia
   */
  async __saveAsistencia(asistencia: any): Promise<ApiResponse> {
    try {
      if (!asistencia.isValid()) {
        const errors = asistencia.validationError;
        this.app.trigger('alert:error', errors.toString());
        return { success: false, message: errors.toString() };
      }

      const response = await this.saveAsistenciaApi(asistencia.toJSON());

      if (response?.success) {
        this.app.trigger('alert:success', { message: response.msj || 'Asistencia guardada exitosamente' });
        this.__addAsistencias((response as any).asistencia);
      } else {
        this.app.trigger('alert:error', { message: response?.msj || 'Error al guardar asistencia' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al guardar asistencia:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Eliminar asistencia
   */
  async __removeAsistencia(asistencia: any): Promise<ApiResponse> {
    try {
      const response = await this.removeAsistenciaApi(asistencia.toJSON());

      if (response?.success) {
        this.app.trigger('alert:success', { message: response.msj || 'Asistencia eliminada exitosamente' });
        this.collections.asistencias.remove(asistencia);
      } else {
        this.app.trigger('alert:error', { message: response?.msj || 'Error al eliminar asistencia' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al eliminar asistencia:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * Buscar asistencia por cédula
   */
  async __buscarAsistencia(cedula: string): Promise<any> {
    try {
      const response = await this.buscarAsistenciaApi(cedula);
      return response?.success ? (response as any).asistencia : null;
    } catch (error: any) {
      this.logger.error('Error al buscar asistencia:', error);
      return null;
    }
  }

  /**
   * Validar asistencia
   */
  async __validarAsistencia(cedula: string): Promise<ApiResponse> {
    try {
      const response = await this.validarAsistenciaApi(cedula);
      return response;
    } catch (error: any) {
      this.logger.error('Error al validar asistencia:', error);
      return { success: false, message: error.message || 'Error de conexión' };
    }
  }

  /**
   * Mostrar ficha de asistencia
   */
  async __mostrarFicha(cedula: string): Promise<any> {
    try {
      const response = await this.mostrarFichaApi(cedula);
      return response?.success ? (response as any).ficha : null;
    } catch (error: any) {
      this.logger.error('Error al mostrar ficha:', error);
      return null;
    }
  }

  /**
   * Listar rechazados
   */
  async __listarRechazados(): Promise<any[]> {
    try {
      const response = await this.listarRechazadosApi();
      return response?.success ? (response as any).rechazados || [] : [];
    } catch (error: any) {
      this.logger.error('Error al listar rechazados:', error);
      return [];
    }
  }

  /**
   * Registrar empresa
   */
  async __registrarEmpresa(empresa: any): Promise<ApiResponse> {
    try {
      const response = await this.registrarEmpresaApi(empresa.toJSON());

      if (response?.success) {
        this.app.trigger('alert:success', { message: response.msj || 'Empresa registrada exitosamente' });
        // Agregar a la colección de empresas si existe
        if (this.collections.empresas) {
          this.collections.empresas.add((response as any).empresa, { merge: true });
        }
      } else {
        this.app.trigger('alert:error', { message: response?.msj || 'Error al registrar empresa' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al registrar empresa:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  // Métodos privados (solo Service)

  /**
   * Obtener asistencias desde API
   */
  private async findAllAsistenciasApi(): Promise<ApiResponse> {
    return await this.api.get('/recepcion/listarAsistencias');
  }

  /**
   * Guardar asistencia en API
   */
  private async saveAsistenciaApi(data: any): Promise<ApiResponse> {
    return await this.api.post('/recepcion/saveAsistencia', data);
  }

  /**
   * Eliminar asistencia en API
   */
  private async removeAsistenciaApi(data: any): Promise<ApiResponse> {
    return await this.api.post('/recepcion/removeAsistencia', data);
  }

  /**
   * Buscar asistencia en API
   */
  private async buscarAsistenciaApi(cedula: string): Promise<ApiResponse> {
    return await this.api.get(`/recepcion/buscarAsistencia?cedula=${encodeURIComponent(cedula)}`);
  }

  /**
   * Validar asistencia en API
   */
  private async validarAsistenciaApi(cedula: string): Promise<ApiResponse> {
    return await this.api.get(`/recepcion/validarAsistencia?cedula=${encodeURIComponent(cedula)}`);
  }

  /**
   * Mostrar ficha en API
   */
  private async mostrarFichaApi(cedula: string): Promise<ApiResponse> {
    return await this.api.get(`/recepcion/mostrarFicha?cedula=${encodeURIComponent(cedula)}`);
  }

  /**
   * Listar rechazados en API
   */
  private async listarRechazadosApi(): Promise<ApiResponse> {
    return await this.api.get('/recepcion/listarRechazados');
  }

  /**
   * Registrar empresa en API
   */
  private async registrarEmpresaApi(data: any): Promise<ApiResponse> {
    return await this.api.post('/recepcion/registrarEmpresa', data);
  }

  /**
   * Crear ingreso en API
   */
  async __crearIngreso(data: Record<string, any>): Promise<ApiResponse> {
    try {
      const response = await this.crearIngresoApi(data);
      return response;
    } catch (error: any) {
      this.logger.error('Error al crear ingreso:', error);
      throw error;
    }
  }

  /**
   * API para crear ingreso
   */
  private async crearIngresoApi(data: Record<string, any>): Promise<ApiResponse> {
    return await this.api.post('/habiles/crear_ingreso', data);
  }

  /**
   * Revocar poder en API
   */
  async __revocarPoder(data: Record<string, any>): Promise<ApiResponse> {
    try {
      const response = await this.revocarPoderApi(data);
      return response;
    } catch (error: any) {
      this.logger.error('Error al revocar poder:', error);
      throw error;
    }
  }

  /**
   * API para revocar poder
   */
  private async revocarPoderApi(data: Record<string, any>): Promise<ApiResponse> {
    return await this.api.post('/recepcion/revocarPoder', data);
  }

  /**
   * Crear asistencia en API
   */
  async __crearAsistencia(data: Record<string, any>): Promise<ApiResponse> {
    try {
      const response = await this.crearAsistenciaApi(data);
      return response;
    } catch (error: any) {
      this.logger.error('Error al crear asistencia:', error);
      throw error;
    }
  }

  /**
   * API para crear asistencia
   */
  private async crearAsistenciaApi(data: Record<string, any>): Promise<ApiResponse> {
    return await this.api.post('/recepcion/crearAsistencia', data);
  }

  /**
   * Obtener rechazo en API
   */
  async __obtenerRechazo(data: Record<string, any>): Promise<ApiResponse> {
    try {
      const response = await this.obtenerRechazoApi(data);
      return response;
    } catch (error: any) {
      this.logger.error('Error al obtener rechazo:', error);
      throw error;
    }
  }

  /**
   * API para obtener rechazo
   */
  private async obtenerRechazoApi(data: Record<string, any>): Promise<ApiResponse> {
    return await this.api.post('/recepcion/rechazo', data);
  }

  /**
   * Salvar inscripción en API
   */
  async __salvarInscripcion(data: Record<string, any>): Promise<ApiResponse> {
    try {
      const response = await this.salvarInscripcionApi(data);
      return response;
    } catch (error: any) {
      this.logger.error('Error al salvar inscripción:', error);
      throw error;
    }
  }

  /**
   * API para salvar inscripción
   */
  private async salvarInscripcionApi(data: Record<string, any>): Promise<ApiResponse> {
    return await this.api.post('/recepcion/salvar_inscripcion', data);
  }

  /**
   * Cruzar habil preregistro presencial en API
   */
  async __cruzarHabilPreregistroPresencial(): Promise<ApiResponse> {
    try {
      const response = await this.cruzarHabilPreregistroPresencialApi();
      return response;
    } catch (error: any) {
      this.logger.error('Error al cruzar habil preregistro presencial:', error);
      throw error;
    }
  }

  /**
   * API para cruzar habil preregistro presencial
   */
  private async cruzarHabilPreregistroPresencialApi(): Promise<ApiResponse> {
    return await this.api.get('/recepcion/cruzarHabilPreregistroPresencial');
  }

  /**
   * Buscar representante en API
   */
  async __buscarRepresentante(data: Record<string, any>): Promise<ApiResponse> {
    try {
      const response = await this.buscarRepresentanteApi(data);
      return response;
    } catch (error: any) {
      this.logger.error('Error al buscar representante:', error);
      throw error;
    }
  }

  /**
   * API para buscar representante
   */
  private async buscarRepresentanteApi(data: Record<string, any>): Promise<ApiResponse> {
    return await this.api.post('/recepcion/buscar', data);
  }

  /**
   * Ingresar poder al consenso
   */
  async __ingresarPoderConsenso(data: Record<string, any>): Promise<ApiResponse> {
    try {
      const response = await this.ingresarPoderConsensoApi(data);

      if (response?.success) {
        this.app.trigger('alert:success', { message: response.msj || 'Poder ingresado al consenso exitosamente' });
      } else {
        this.app.trigger('alert:error', { message: response?.msj || 'Error al ingresar poder al consenso' });
      }

      return response;
    } catch (error: any) {
      this.logger.error('Error al ingresar poder consenso:', error);
      this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
      return { success: false, message: error.message };
    }
  }

  /**
   * API para ingresar poder al consenso
   */
  private async ingresarPoderConsensoApi(data: Record<string, any>): Promise<ApiResponse> {
    return await this.api.post('/poderes/ingresar_poder', data);
  }
}
