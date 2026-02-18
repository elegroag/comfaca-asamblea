// Interfaces para modelos de datos del sistema

// Modelo Base
interface BaseModel {
    id: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

// Task (Tarea)
export interface Task extends BaseModel {
    name: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    assigned_to?: number;
    due_date?: string;
    completed_at?: string;
}

// User (Usuario)
export interface User extends BaseModel {
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'user' | 'moderator';
    active: boolean;
    last_login?: string;
    profile?: UserProfile;
}

export interface UserProfile {
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    avatar?: string;
    bio?: string;
}

// Beneficiario
export interface Beneficiario extends BaseModel {
    tipo_documento: string;
    numero_documento: string;
    nombre1: string;
    nombre2?: string;
    apellido1: string;
    apellido2?: string;
    fecha_nacimiento: string;
    genero: 'M' | 'F';
    estado_civil: string;
    telefono?: string;
    celular?: string;
    email?: string;
    direccion: string;
    barrio: string;
    municipio: string;
    departamento: string;
    sisben?: string;
    nivel_sisben?: string;
    estado: 'activo' | 'inactivo' | 'suspendido';
    afiliaciones?: Afiliacion[];
}

export interface Afiliacion {
    tipo: 'salud' | 'pension' | 'riesgos';
    entidad: string;
    estado: 'activo' | 'inactivo';
    fecha_afiliacion: string;
}

// Empresa/Independiente
export interface Independiente extends BaseModel {
    tipo_documento: string;
    numero_documento: string;
    razon_social: string;
    nombre_comercial?: string;
    telefono?: string;
    celular?: string;
    email?: string;
    direccion: string;
    barrio: string;
    municipio: string;
    departamento: string;
    actividad_economica: string;
    categoria: 'A' | 'B' | 'C';
    estado: 'activo' | 'inactivo' | 'suspendido';
    representantes?: Representante[];
}

export interface Representante {
    tipo_documento: string;
    numero_documento: string;
    nombre: string;
    cargo: string;
    telefono?: string;
    email?: string;
}

// Actualización de Datos
export interface Actualizadatos extends BaseModel {
    usuario_id: number;
    tipo: 'personal' | 'direccion' | 'contacto' | 'laboral';
    datos_anteriores: string; // JSON
    datos_nuevos: string; // JSON
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    revisado_por?: number;
    fecha_revision?: string;
    comentarios?: string;
}

// Tipos para formularios
export interface TaskFormData {
    name: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    assigned_to?: number;
    due_date?: string;
}

export interface BeneficiarioFormData {
    tipo_documento: string;
    numero_documento: string;
    nombre1: string;
    nombre2?: string;
    apellido1: string;
    apellido2?: string;
    fecha_nacimiento: string;
    genero: 'M' | 'F';
    estado_civil: string;
    telefono?: string;
    celular?: string;
    email?: string;
    direccion: string;
    barrio: string;
    municipio: string;
    departamento: string;
    sisben?: string;
    nivel_sisben?: string;
}

export interface IndependienteFormData {
    tipo_documento: string;
    numero_documento: string;
    razon_social: string;
    nombre_comercial?: string;
    telefono?: string;
    celular?: string;
    email?: string;
    direccion: string;
    barrio: string;
    municipio: string;
    departamento: string;
    actividad_economica: string;
    categoria: 'A' | 'B' | 'C';
}

// Tipos para respuestas API
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
    meta?: {
        total?: number;
        per_page?: number;
        current_page?: number;
        last_page?: number;
    };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
    };
}

// Tipos para filtros y búsqueda
export interface TaskFilters {
    status?: string;
    priority?: string;
    assigned_to?: number;
    search?: string;
    date_from?: string;
    date_to?: string;
}

export interface BeneficiarioFilters {
    search?: string;
    estado?: string;
    municipio?: string;
    departamento?: string;
    tipo_documento?: string;
}

export interface IndependienteFilters {
    search?: string;
    estado?: string;
    municipio?: string;
    departamento?: string;
    actividad_economica?: string;
}

// Tipos para opciones de select y dropdowns
export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface DocumentType extends SelectOption {
    abreviatura: string;
    longitud: number;
    permite_numeros: boolean;
    permite_letras: boolean;
}

export interface Municipio extends SelectOption {
    departamento_id: number;
    codigo_dane: string;
}

export interface Departamento extends SelectOption {
    codigo_dane: string;
}

// Tipos para validación
export interface ValidationRule {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    email?: boolean;
    numeric?: boolean;
    alpha?: boolean;
    alphanum?: boolean;
}

export interface ValidationErrors {
    [field: string]: string[];
}

// Tipos para notificaciones
export interface NotificationData {
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
    persistent?: boolean;
}

// Tipos para modales
export interface ModalOptions {
    title: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    backdrop?: boolean | 'static';
    keyboard?: boolean;
    centered?: boolean;
    scrollable?: boolean;
}

// Tipos para archivos
export interface FileUpload {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    file: File;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

// Exportaciones adicionales
export type StatusType = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type PriorityType = 'low' | 'medium' | 'high' | 'urgent';
export type GenderType = 'M' | 'F';
export type CivilStatusType = 'soltero' | 'casado' | 'divorciado' | 'viudo' | 'union_libre';
export type EntityType = 'beneficiario' | 'independiente' | 'empresa';
export type DocumentTypeCode = 'CC' | 'TI' | 'CE' | 'PA' | 'RC' | 'NIT' | 'PPN';

export {};