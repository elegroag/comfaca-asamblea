import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import RechazoModel from '@/componentes/rechazos/models/RechazoModel';

export interface RechazoServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export default class RechazoService {
    constructor(private readonly opts: RechazoServiceOptions) {
        // SIN storage/persistencia local - solo API
    }

    private get api() { return this.opts.api; }
    private get logger() { return this.opts.logger; }
    private get app() { return this.opts.app; }

    /**
     * Obtener todos los rechazos desde API
     */
    async findAllRechazos(): Promise<any> {
        try {
            const response = await this.api.get('/rechazos/listar');
            if (response?.success) {
                return response;
            } else {
                this.app?.trigger('alert:error', { message: (response as any).msj || 'Error al listar rechazos' });
                return null;
            }
        } catch (error: any) {
            this.logger?.error('Error al listar rechazos:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar rechazos' });
            return null;
        }
    }

    /**
     * Guardar rechazo
     */
    async __saveRechazo(rechazo: any): Promise<ApiResponse> {
        try {
            if (!rechazo.isValid()) {
                const errors = rechazo.validationError;
                this.app.trigger('alert:error', errors.toString());
                return { success: false, message: errors.toString() };
            }

            const response = await this.saveRechazoApi(rechazo.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Rechazo guardado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al guardar rechazo' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar rechazo:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Eliminar rechazo
     */
    async __removeRechazo(rechazo: any): Promise<ApiResponse> {
        try {
            const response = await this.removeRechazoApi(rechazo.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Rechazo eliminado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al eliminar rechazo' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar rechazo:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Aprobar rechazo
     */
    async __aprobarRechazo(rechazo: any): Promise<ApiResponse> {
        try {
            const response = await this.aprobarRechazoApi(rechazo.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Rechazo aprobado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al aprobar rechazo' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al aprobar rechazo:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Rechazar rechazo
     */
    async __rechazarRechazo(rechazo: any): Promise<ApiResponse> {
        try {
            const response = await this.rechazarRechazoApi(rechazo.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Rechazo procesado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al procesar rechazo' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al procesar rechazo:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Cargar archivo de rechazos masivos
     */
    async __cargarMasivo(file: File): Promise<ApiResponse> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await this.cargarMasivoApi(formData);

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Archivo procesado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al procesar archivo' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al cargar archivo:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Descargar plantilla
     */
    async __descargarPlantilla(): Promise<void> {
        try {
            const response = await this.descargarPlantillaApi();
            if (response?.success) {
                // Crear enlace de descarga
                const link = document.createElement('a');
                link.href = response.url;
                link.download = response.filename || 'plantilla_rechazos.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                this.app?.trigger('alert:error', { message: (response as any).msj || 'Error al descargar plantilla' });
            }
        } catch (error: any) {
            this.logger.error('Error al descargar plantilla:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
        }
    }

    // Métodos privados (solo Service)

    /**
     * Guardar rechazo en API
     */
    private async saveRechazoApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/rechazos/saveRechazo', data);
    }

    /**
     * Eliminar rechazo en API
     */
    private async removeRechazoApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/rechazos/removeRechazo', data);
    }

    /**
     * Aprobar rechazo en API
     */
    private async aprobarRechazoApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/rechazos/aprobarRechazo', data);
    }

    /**
     * Rechazar rechazo en API
     */
    private async rechazarRechazoApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/rechazos/rechazarRechazo', data);
    }

    /**
     * Cargar archivo masivo en API
     */
    private async cargarMasivoApi(formData: FormData): Promise<ApiResponse> {
        return await this.api.post('/rechazos/cargarMasivo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    /**
     * Descargar plantilla en API
     */
    private async descargarPlantillaApi(): Promise<ApiResponse> {
        return await this.api.get('/rechazos/descargarPlantilla');
    }
}