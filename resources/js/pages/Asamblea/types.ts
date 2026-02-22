// Interfaces para las respuestas de la API
export interface AsambleaResponse {
  success: boolean;
  asamblea?: any;
  asambleas?: any[];
  msj?: string;
}

export interface AsambleaListarResponse {
  success: boolean;
  asambleas?: any[];
  message?: string;
}

export interface AsambleaDetalleResponse {
  success: boolean;
  asamblea?: any;
  participantes?: any[];
  consensos?: any[];
  msj?: string;
}

export interface AsambleaCreateRequest {
  nombre: string;
  descripcion: string;
  fecha: string;
  estado: string;
  [key: string]: any;
}

export interface AsambleaUpdateRequest extends AsambleaCreateRequest {
  id: string;
}

export interface Asamblea {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  estado: string;
  [key: string]: any;
}

export interface AsambleaTransfer {
  model?: Asamblea;
  callback?: (response: any) => void;
  [key: string]: any;
}
