import EmpresasCollection from "@/collections/EmpresasCollection";
import HabilesCollection from "@/componentes/habiles/collections/HabilesCollection";
import { AppInstance, BackendAuthProps } from "@/types/types";

export interface SaveTransfer {
    model: any;
    callback: (success: boolean, data?: any) => void;
}

export interface RemoveTransfer {
    model: any;
    callback: (success: boolean | any) => void;
}

export interface NotifyTransfer {
    nit?: string;
    documento?: string;
}

export interface xCollection {
    empresas: EmpresasCollection | null;
    habiles: HabilesCollection | null;
}

export interface RouterHabilesOptions {
    app: AppInstance;
    routes?: Record<string, string>;
    [key: string]: any;
}


export interface DashboardComponent {
    props: string[];
    template: string | null;
    isLoading: boolean;
    mount(el: HTMLElement, props: BackendAuthProps): void;
    render(props: BackendAuthProps): string;
}
