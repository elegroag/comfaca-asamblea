// Interfaces para las respuestas de la API
export interface CarteraResponse {
    success: boolean;
    cartera?: any;
    carteras?: any[];
    msj?: string;
}

export interface CarteraListarResponse {
    success: boolean;
    carteras?: any[];
    message?: string;
}

export interface CarteraDetalleResponse {
    success: boolean;
    cartera?: any;
    empresa?: any;
    representantes?: any[];
    msj?: string;
}

export interface EmpresaValidationResponse {
    success: boolean;
    empresa?: any;
    msj?: string;
}

export interface CarteraRemoveResponse {
    success: boolean;
    msj?: string;
}

export interface CarteraCreateRequest {
    nit: string;
    cedrep: string;
    nombrerep: string;
    carterap: string;
    carteraa: string;
    carterat: string;
    carterac: string;
    carterav: string;
}

export interface CarteraUpdateRequest extends CarteraCreateRequest {
    id: string;
}

export interface Empresa {
    nit: string;
    razon_social: string;
    estado: string;
    [key: string]: any;
}

export interface Cartera {
    id: string;
    nit: string;
    cedrep: string;
    nombrerep: string;
    carterap: string;
    carteraa: string;
    carterat: string;
    carterac: string;
    carterav: string;
    empresa?: Empresa;
    [key: string]: any;
}

export interface CarteraTransfer {
    model?: Cartera;
    callback?: (response: any) => void;
    nit?: string;
    cedrep?: string;
    id?: string;
}
