// Interfaz para las respuestas de la API
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    poderes?: any;
    poder?: any;
    criterio_rechazos?: any;
    msj?: string;
}

// Interfaz para errores de API
interface ApiError {
    message: string;
    status: number;
    statusText: string;
}

// Servicio de API para autenticación web (session)
class WebApiService {

    props: any;
    constructor(props: any) {
        this.props = props;
    }

    /**
     * Obtener headers configurados para requests API con session auth
     */
    getHeaders(): Record<string, string> {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
    }

    /**
     * Manejar errores de API de forma consistente
     */
    private handleError(error: any, url: string): never {
        let errorMessage = 'Error en la solicitud';
        let status = 500;
        let statusText = 'Internal Server Error';

        if (error instanceof Response) {
            status = error.status;
            statusText = error.statusText;

            if (error.status === 401) {
                errorMessage = 'No autorizado - Sesión expirada';
                window.location.href = '/login';
            } else if (error.status === 403) {
                errorMessage = 'Acceso denegado - No tienes permisos para esta acción';
            } else if (error.status === 404) {
                errorMessage = 'Recurso no encontrado';
            } else if (error.status >= 500) {
                errorMessage = 'Error del servidor - Inténtalo más tarde';
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        const apiError: ApiError = {
            message: errorMessage,
            status,
            statusText
        };

        console.error(`Web API Error [${status}] ${url}:`, apiError);
        throw apiError;
    }

    /**
     * Request GET
     */
    async get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
        try {
            const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
            const response = await fetch(`/api${url}${queryString}`, {
                method: 'GET',
                headers: this.getHeaders(),
                credentials: 'same-origin' // Importante para session auth
            });

            if (!response.ok) {
                this.handleError(response, url);
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, url);
        }
    }

    /**
     * Request POST
     */
    async post<T = any>(url: string, data?: Record<string, any>): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`/api${url}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: data ? JSON.stringify(data) : null,
                credentials: 'same-origin' // Importante para session auth
            });

            if (!response.ok) {
                this.handleError(response, url);
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, url);
        }
    }

    /**
     * Request DELETE
     */
    async delete<T = any>(url: string): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`/api${url}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                credentials: 'same-origin' // Importante para session auth
            });

            if (!response.ok) {
                this.handleError(response, url);
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, url);
        }
    }

    /**
     * Upload de archivos
     */
    async upload<T = any>(url: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            if (additionalData) {
                Object.keys(additionalData).forEach(key => {
                    formData.append(key, additionalData[key]);
                });
            }

            const headers: Record<string, string> = {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };

            const response = await fetch(`/api${url}`, {
                method: 'POST',
                headers,
                body: formData,
                credentials: 'same-origin' // Importante para session auth
            });

            if (!response.ok) {
                this.handleError(response, url);
            }

            return await response.json();
        } catch (error) {
            this.handleError(error, url);
        }
    }
}

// Exportar el servicio
export default WebApiService;
export type { ApiResponse, ApiError };
