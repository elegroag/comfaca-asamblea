import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import Poder from '@/models/Poder';
import Representante from '@/models/Representante';
import Empresa from '@/models/Empresa';
import Asistencia from '@/models/Asistencia';

export interface RecepcionServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export default class RecepcionService {
    constructor(private readonly opts: RecepcionServiceOptions) {
        // SIN storage/persistencia local - solo API
    }

    private get api() { return this.opts.api; }
    private get logger() { return this.opts.logger; }
    private get app() { return this.opts.app; }

    /**
     * Obtener todas las asistencias desde API
     */
    async findAllRecepciones(): Promise<any> {
        try {
            const response = await this.api.get('/recepcion/listar');
            if (response?.success) {
                return response;
            } else {
                this.app?.trigger('alert:error', { message: (response as any).msj || 'Error al listar recepciones' });
                return null;
            }
        } catch (error: any) {
            this.logger?.error('Error al listar recepciones:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar recepciones' });
            return null;
        }
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
                this.app.trigger('alert:success', { message: (response as any).msj || 'Asistencia guardada exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al guardar asistencia' });
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
                this.app.trigger('alert:success', { message: (response as any).msj || 'Asistencia eliminada exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al eliminar asistencia' });
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
                this.app.trigger('alert:success', { message: (response as any).msj || 'Empresa registrada exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al registrar empresa' });
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
}
