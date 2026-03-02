import { Controller } from '@/common/Controller';
import { CommonDeps } from '@/types/CommonDeps';
import RecepcionService from './RecepcionService';
import { cacheCollection, getCachedCollection } from '@/componentes/CacheManager';
import AsistenciasCollection from '@/collections/AsistenciasCollection';
import Loading from '@/common/Loading';

interface RecepcionControllerOptions extends CommonDeps {
    [key: string]: any;
}

export default class RecepcionController extends Controller {
    private service: RecepcionService;

    constructor(options: RecepcionControllerOptions) {
        super(options);
        this.service = new RecepcionService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    /**
     * Listar recepción
     */
    async listaRecepcion(): Promise<void> {
        try {
            // Obtener asistencias desde cache
            let asistencias = getCachedCollection('asistencias', AsistenciasCollection);
            if (asistencias === null) {
                if (Loading) Loading.show();

                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.service.findAllRecepciones();

                    if (response && response.success === true) {
                        // Crear collection y guardar en cache
                        asistencias = new AsistenciasCollection();
                        asistencias.add(response.asistencias || [], { merge: true });

                        // Guardar en cache para uso futuro
                        cacheCollection('asistencias', asistencias, {
                            persistent: true, // Persistir en localStorage
                            ttl: 30 * 60 * 1000 // 30 minutos
                        });
                    } else {
                        this.app?.trigger('error', (response as any).msj || response.message || 'Error al listar recepciones');
                        return;
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar recepción:', error);
                    this.app?.trigger('error', error.message || 'Error de conexión al listar recepción');
                    return;
                } finally {
                    if (Loading) Loading.hide();
                }
            } else {
                if (Loading) Loading.show();
                setTimeout(() => {
                    if (Loading) Loading.hide();
                }, 300);
            }

            // Implementación completa con vistas
            this.region.show(`
                <div class="container-fluid p-4">
                    <h3 class="mb-4">Recepción de Asamblea</h3>
                    <div class="row">
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-header">
                                    <h5>Lista de Asistentes</h5>
                                </div>
                                <div class="card-body">
                                    <p>Total de asistentes: ${asistencias.length}</p>
                                    <div class="table-responsive">
                                        <table class="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Cédula</th>
                                                    <th>Nombre</th>
                                                    <th>Empresa</th>
                                                    <th>Estado</th>
                                                    <th>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${asistencias.map((asistente: any) => `
                                                    <tr>
                                                        <td>${asistente.get('cedrep') || ''}</td>
                                                        <td>${asistente.get('nomrep') || ''}</td>
                                                        <td>${asistente.get('razsoc') || ''}</td>
                                                        <td>
                                                            <span class="badge badge-${asistente.get('estado') === 'activo' ? 'success' : 'secondary'}">
                                                                ${asistente.get('estado') || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button class="btn btn-sm btn-primary" onclick="window.location.href='#/recepcion/mostrar/${asistente.get('cedrep')}'>
                                                                Ver
                                                            </button>
                                                        </td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `);

        } catch (error: any) {
            this.logger?.error('Error al listar recepción:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar recepción');
        }
    }

    /**
     * Mostrar asistente
     */
    async mostrarAsistente(cedrep: string): Promise<void> {
        try {
            // Obtener asistencias desde cache
            let asistencias = getCachedCollection('asistencias', AsistenciasCollection);
            if (asistencias === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllRecepciones();
                if (response && response.success === true) {
                    asistencias = new AsistenciasCollection();
                    asistencias.add(response.asistencias || [], { merge: true });
                    cacheCollection('asistencias', asistencias, {
                        persistent: true,
                        ttl: 30 * 60 * 1000
                    });
                }
            }

            const asistente = asistencias.findWhere({ cedrep: cedrep });

            if (!asistente) {
                this.app?.trigger('alert:error', 'Asistente no encontrado');
                return;
            }

            // Implementación completa con vista detallada
            this.region.show(`
                <div class="container-fluid p-4">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-header">
                                    <h5>Detalles del Asistente</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <table class="table table-borderless">
                                                <tr>
                                                    <td><strong>Cédula:</strong></td>
                                                    <td>${asistente.get('cedrep') || ''}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Nombre:</strong></td>
                                                    <td>${asistente.get('nomrep') || ''}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Empresa:</strong></td>
                                                    <td>${asistente.get('razsoc') || ''}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>NIT:</strong></td>
                                                    <td>${asistente.get('nit') || ''}</td>
                                                </tr>
                                            </table>
                                        </div>
                                        <div class="col-md-6">
                                            <table class="table table-borderless">
                                                <tr>
                                                    <td><strong>Estado:</strong></td>
                                                    <td>
                                                        <span class="badge badge-${asistente.get('estado') === 'activo' ? 'success' : 'secondary'}">
                                                            ${asistente.get('estado') || 'N/A'}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Teléfono:</strong></td>
                                                    <td>${asistente.get('telrep') || ''}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Email:</strong></td>
                                                    <td>${asistente.get('email') || ''}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Dirección:</strong></td>
                                                    <td>${asistente.get('direccion') || ''}</td>
                                                </tr>
                                            </table>
                                        </div>
                                    </div>
                                    <div class="mt-3">
                                        <button class="btn btn-secondary" onclick="window.history.back()">
                                            Volver
                                        </button>
                                        <button class="btn btn-primary ml-2" onclick="window.location.href='#/recepcion/editar/${asistente.get('cedrep')}'>
                                            Editar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `);

        } catch (error: any) {
            this.logger?.error('Error al mostrar asistente:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar asistente');
        }
    }

    /**
     * Mostrar validación de asistente
     */
    async mostrarValidacion(cedrep: string): Promise<void> {
        try {
            // Implementación básica
            this.region.show(`<div class="p-4">Validando asistente: ${cedrep}</div>`);
        } catch (error: any) {
            this.logger?.error('Error al mostrar validación:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar validación');
        }
    }

    /**
     * Buscar asistencia
     */
    async buscarAsistencia(): Promise<void> {
        try {
            // Implementación básica
            this.region.show('<div class="p-4">Buscar asistencia</div>');
        } catch (error: any) {
            this.logger?.error('Error al buscar asistencia:', error);
            this.app?.trigger('alert:error', error.message || 'Error al buscar asistencia');
        }
    }

    /**
     * Listar rechazados
     */
    async listarRechazos(): Promise<void> {
        try {
            // Implementación básica
            this.region.show('<div class="p-4">Lista de rechazados</div>');
        } catch (error: any) {
            this.logger?.error('Error al listar rechazados:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar rechazados');
        }
    }

    /**
     * Mostrar ficha de asistente
     */
    async mostrarFicha(cedrep: string): Promise<void> {
        try {
            // Implementación básica
            this.region.show(`<div class="p-4">Ficha de asistente: ${cedrep}</div>`);
        } catch (error: any) {
            this.logger?.error('Error al mostrar ficha:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar ficha');
        }
    }

    /**
     * Mostrar error
     */
    mostrarError(): void {
        this.app?.trigger('alert:error', 'Error en la aplicación de Recepción');
    }

    /**
     * Registro de empresa
     */
    async registroEmpresa(nit: string): Promise<void> {
        try {
            // Implementación básica
            this.region.show(`<div class="p-4">Registro de empresa: ${nit}</div>`);
        } catch (error: any) {
            this.logger?.error('Error al registrar empresa:', error);
            this.app?.trigger('alert:error', error.message || 'Error al registrar empresa');
        }
    }

    /**
     * Crear registro
     */
    crearRegistro(): void {
        // Implementación básica
        this.region.show('<div class="p-4">Crear registro</div>');
    }

    /**
     * Listar inscritos
     */
    async listarInscritos(): Promise<void> {
        try {
            // Implementación básica
            this.region.show('<div class="p-4">Lista de inscritos</div>');
        } catch (error: any) {
            this.logger?.error('Error al listar inscritos:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar inscritos');
        }
    }

    /**
     * Registros pendientes
     */
    async registrosPendientes(): Promise<void> {
        try {
            // Implementación básica
            this.region.show('<div class="p-4">Registros pendientes</div>');
        } catch (error: any) {
            this.logger?.error('Error al listar pendientes:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar pendientes');
        }
    }

    /**
     * Manejar errores
     */
    error(): void {
        this.app?.trigger('alert:error', 'Error en la aplicación de Recepción');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
