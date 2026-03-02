import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import AsaUsuariosCollection from '@/collections/AsaUsuariosCollection';
import AsaUsuario from '@/models/AsaUsuario';

export interface UsuarioServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export default class UsuarioService {
    constructor(private readonly opts: UsuarioServiceOptions) {
        // SIN storage/persistencia local - solo API
    }

    private get api() { return this.opts.api; }
    private get logger() { return this.opts.logger; }
    private get app() { return this.opts.app; }

    /**
     * Obtener todos los usuarios desde API
     */
    async findAllUsuarios(): Promise<any> {
        try {
            const response = await this.api.get('/usuarios/listar');
            if (response?.success) {
                return response;
            } else {
                this.app?.trigger('alert:error', { message: response?.msj || 'Error al listar usuarios' });
                return null;
            }
        } catch (error: any) {
            this.logger?.error('Error al listar usuarios:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar usuarios' });
            return null;
        }
    }

    /**
     * Guardar usuario
     */
    async __saveUsuario(usuario: any): Promise<ApiResponse> {
        try {
            if (!usuario.isValid()) {
                const errors = usuario.validationError;
                this.app.trigger('alert:error', errors.toString());
                return { success: false, message: errors.toString() };
            }

            const response = await this.saveUsuarioApi(usuario.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: response.msj || 'Usuario guardado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: response?.msj || 'Error al guardar usuario' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar usuario:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Eliminar usuario
     */
    async __removeUsuario(usuario: any): Promise<ApiResponse> {
        try {
            const response = await this.removeUsuarioApi(usuario.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: response.msj || 'Usuario eliminado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: response?.msj || 'Error al eliminar usuario' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar usuario:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Cargue masivo de usuarios
     */
    async __cargarUsuarios(file: File): Promise<any> {
        try {
            this.logger?.info('Iniciando cargue masivo de usuarios', { fileName: file.name, size: file.size });

            const formData = new FormData();
            formData.append('file', file);

            const response = await this.uploadMasivoApi(formData);

            if (response?.success) {
                this.app.trigger('alert:success', { message: response.msj || 'Cargue masivo exitoso' });
                return response;
            } else {
                this.app.trigger('alert:error', { message: response?.msj || 'Error en el cargue masivo' });
                throw new Error(response?.msj || 'Error en el cargue masivo');
            }
        } catch (error: any) {
            this.logger.error('Error en cargue masivo:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            throw error;
        }
    }

    /**
     * Método API para el cargue masivo de usuarios
     */
    async cargarUsuariosApi(file: File): Promise<any> {
        return await this.__cargarUsuarios(file);
    }

    /**
     * Vincular usuario con asamblea
     */
    async __vincularAsamblea(data: any): Promise<ApiResponse> {
        try {
            this.logger?.info('Vinculando usuario con asamblea', data);

            const response = await this.api.post('/admin/asa_usuario_create', data);

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Vinculación exitosa' });
                return response;
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error en la vinculación' });
                throw new Error((response as any).msj || 'Error en la vinculación');
            }
        } catch (error: any) {
            this.logger.error('Error al vincular usuario con asamblea:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            throw error;
        }
    }

    /**
     * Vincular usuario con mesa
     */
    async __vincularMesa(data: any): Promise<ApiResponse> {
        try {
            this.logger?.info('Vinculando usuario con mesa', data);

            const response = await this.api.post('/admin/vincular_mesa', data);

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Vinculación exitosa' });
                return response;
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error en la vinculación' });
                throw new Error((response as any).msj || 'Error en la vinculación');
            }
        } catch (error: any) {
            this.logger.error('Error al vincular usuario con mesa:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            throw error;
        }
    }

    /**
     * Métodos API para vinculación
     */
    async vincularAsambleaApi(data: any): Promise<ApiResponse> {
        return await this.__vincularAsamblea(data);
    }

    async vincularMesaApi(data: any): Promise<ApiResponse> {
        return await this.__vincularMesa(data);
    }

    /**
     * Buscar usuarios por criterio
     */
    async __buscarUsuarios(criterio: string): Promise<any[]> {
        try {
            const response = await this.buscarUsuariosApi(criterio);
            return response?.success ? (response as any).usuarios || [] : [];
        } catch (error: any) {
            this.logger.error('Error al buscar usuarios:', error);
            return [];
        }
    }

    /**
     * Crear usuario
     */
    async __crearUsuario(data: Record<string, any>): Promise<ApiResponse> {
        try {
            const response = await this.crearUsuarioApi(data);
            return response;
        } catch (error: any) {
            this.logger.error('Error al crear usuario:', error);
            throw error;
        }
    }

    /**
     * Actualizar usuario
     */
    async __actualizarUsuario(id: string, data: Record<string, any>): Promise<ApiResponse> {
        try {
            const response = await this.actualizarUsuarioApi(id, data);
            return response;
        } catch (error: any) {
            this.logger.error('Error al actualizar usuario:', error);
            throw error;
        }
    }

    // Métodos privados (solo Service)

    /**
     * Obtener usuarios desde API
     */
    private async findAllApi(): Promise<ApiResponse> {
        return await this.api.get('/usuarios/listar');
    }

    /**
     * Guardar usuario en API
     */
    private async saveUsuarioApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/usuarios/saveUsuario', data);
    }

    /**
     * Eliminar usuario en API
     */
    private async removeUsuarioApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/usuarios/removeUsuario', data);
    }

    /**
     * Subir archivo masivo a API
     */
    private async uploadMasivoApi(formData: FormData): Promise<ApiResponse> {
        return await this.api.post('/usuarios/uploadMasivo', formData);
    }

    /**
     * Buscar usuarios en API
     */
    private async buscarUsuariosApi(criterio: string): Promise<ApiResponse> {
        return await this.api.post('/usuarios/buscar', { criterio });
    }

    /**
     * API para crear usuario
     */
    private async crearUsuarioApi(data: Record<string, any>): Promise<ApiResponse> {
        return await this.api.post('/usuarios/createUsuarioSisu', data);
    }

    /**
     * API para actualizar usuario
     */
    private async actualizarUsuarioApi(id: string, data: Record<string, any>): Promise<ApiResponse> {
        return await this.api.put(`/usuarios/${id}`, data);
    }
}
