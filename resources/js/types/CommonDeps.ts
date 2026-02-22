import type ApiService from '@/services/ApiService';
import type Logger from '@/common/Logger';
import type { Region } from '@/common/Region';
import type { AppInstance } from '@/types/types';

export interface CommonDeps {
    api: ApiService;
    logger: Logger;
    app: AppInstance;
    region: Region;
    router: { [key: string]: any };
}

export interface RouterOptions extends Partial<CommonDeps> {
    region?: any;
    routes?: Record<string, string>;
    controller?: any;
}

export interface ControllerOptions extends CommonDeps {
    [key: string]: any;
}

export interface ServiceOptions {
    api: ApiService;
    logger: Logger;
    app: AppInstance;
}

// Tipos de respuesta de API estándar
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    msj?: string; // Para compatibilidad con código existente
    url?: string;
    filename?: string;
}

export interface ApiListResponse<T = any> extends ApiResponse<T[]> {
    total?: number;
    page?: number;
    perPage?: number;
}

export interface ApiDetailResponse<T = any> extends ApiResponse<T> {
    // Para respuestas de detalle individuales
}

// Interfaces para transferencia de datos entre componentes
export interface ModelTransfer<T = any> {
    model?: T;
    callback?: (response: any) => void;
    [key: string]: any;
}

export interface FileUploadTransfer {
    formData: FormData;
    callback: (success: boolean, response?: any) => void;
}

// Interfaces para navegación y eventos
export interface NavigationOptions {
    trigger?: boolean;
    replace?: boolean;
    [key: string]: any;
}

export interface AlertOptions {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    timeout?: number;
}

export interface ConfirmationOptions {
    message: string;
    callback: (confirmed: boolean) => void;
    title?: string;
}

// Interfaces para colecciones y almacenamiento
export interface CollectionOptions {
    model?: any;
    comparator?: string | Function;
    [key: string]: any;
}

export interface StorageOptions {
    key: string;
    ttl?: number; // time to live en segundos
    [key: string]: any;
}
