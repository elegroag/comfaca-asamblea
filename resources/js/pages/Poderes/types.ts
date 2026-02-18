// Interfaces para las respuestas de la API
export interface PoderDetalleResponse {
    success: boolean;
    poder: any | false;
    habil_apoderado?: any;
    habil_poderdante?: any;
    criterio_rechazos?: any;
    msj?: string;
}

export interface PoderesListarResponse {
    success: boolean;
    poderes?: any[];
    message?: string;
}

export interface BuscarPersonaResponse {
    success: boolean;
    poder?: any;
    apoderado?: any;
    poderdante?: any;
    criterio_rechazos?: any;
    msj?: string;
}

export interface CriteriosRechazoResponse {
    success: boolean;
    criterios?: any[];
    msj?: string;
}

export interface EmpresaResponse {
    success: boolean;
    msj?: string;
    [key: string]: any;
}
