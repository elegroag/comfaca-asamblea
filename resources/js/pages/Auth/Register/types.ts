import { Region } from "@/common/Region";
import { AppInstance } from '@/types/types';

// Definir interfaces localmente para evitar problemas de importación
export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface RegisterViewOptions {
    region: Region;
    app: AppInstance | any;
}
