// Interfaces para las respuestas de la API
export interface PoderResponse {
    success: boolean;
    poder?: any;
    poderes?: any[];
    msj?: string;
}

export interface PoderListarResponse {
    success: boolean;
    poderes?: any[];
    message?: string;
}

export interface PoderDetalleResponse {
    success: boolean;
    poder?: any;
    rechazos?: any[];
    msj?: string;
}

export interface PoderCreateRequest {
    nombre: string;
    identificacion: string;
    tipo: string;
    estado: string;
    [key: string]: any;
}

export interface PoderUpdateRequest extends PoderCreateRequest {
    id: string;
}

export interface Poder {
    id: string;
    nombre: string;
    identificacion: string;
    tipo: string;
    estado: string;
    [key: string]: any;
}

export interface PoderTransfer {
    model?: Poder;
    callback?: (response: any) => void;
    [key: string]: any;
}
