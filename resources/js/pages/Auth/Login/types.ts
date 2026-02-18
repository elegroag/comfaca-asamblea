import { Region } from "@/common/Region";
import { AppInstance } from "@/types/types";

// Definir interfaces localmente para evitar problemas de importación
export interface LoginCredentials {
    email: string;
    password: string;
    remember: boolean;
}

export interface LoginViewOptions {
    region: Region;
    App: AppInstance | any;
}
