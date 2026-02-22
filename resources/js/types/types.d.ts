// Tipos globales para la aplicación
declare global {
    interface Window {
        app: any;
        $: JQueryStatic;
        jQuery: JQueryStatic;
        _: UnderscoreStatic;
        Backbone: BackboneStatic;
        Noty: any;
        Swal: any;
        bootstrap: any;
        route: (name: string, params?: Record<string, any>, absolute?: boolean) => string;
        Ziggy: any;
        $App: AppInstance;
    }
}

// Importar tipos específicos
export type {
    Task,
    User,
    Beneficiario,
    Independiente,
    Actualizadatos,
    TaskFormData,
    BeneficiarioFormData,
    IndependienteFormData,
    ApiResponse,
    PaginatedResponse,
    TaskFilters,
    BeneficiarioFilters,
    IndependienteFilters,
    SelectOption,
    DocumentType,
    Municipio,
    Departamento,
    ValidationRule,
    ValidationErrors,
    NotificationData,
    ModalOptions,
    FileUpload,
    UploadProgress,
    StatusType,
    PriorityType,
    GenderType,
    CivilStatusType,
    EntityType,
    DocumentTypeCode
} from './models';

// Tipos para el sistema de páginas
export interface PageComponent {
    render?(props: any): string;
    mount?(el: HTMLElement, props: any): void;
    setup?: () => void;
    default?: any;
}

export interface PageData {
    component: string;
    props: any;
    url: string;
    version?: string;
    meta?: Record<string, any>;
    page?: any
}


// Tipos para componentes
export interface Component {
    render(): string;
    mount(el: HTMLElement): void;
    destroy?(): void;
}

// Tipos Backbone
export interface BackboneStatic {
    View: new (options?: any) => Backbone.View;
    Model: new (attributes?: any, options?: any) => Backbone.Model;
    Collection: new (models?: any[], options?: any) => Backbone.Collection;
    Router: new (options?: any) => Backbone.Router;
    Events: Backbone.Events;
    ajax: (options: JQuery.AjaxSettings) => any;
    history: any;
}

export interface UnderscoreStatic {
    extend: (target: any, ...sources: any[]) => any;
    isArray: (value: any) => boolean;
    isObject: (value: any) => boolean;
    isFunction: (value: any) => boolean;
    isString: (value: any) => boolean;
    template: (template: string) => (data: any) => string;
    each: (list: any, iterator: (item: any, index: number) => void) => void;
    keys: (object: any) => string[];
    indexOf: (array: any[], value: any) => number;
}

// Tipos para App
export interface AppServices {
    [key: string]: any;
}

export interface SubApplicationOptions {
    region: any;
    api?: ApiService;
    props?: any;
    logger?: Logger;
    router?: BackboneRouter;
    App: AppInstance;
}

export interface SyncroRequest {
    url: string;
    data?: Record<string, any>;
    callback: (response: any) => void;
    silent?: boolean;
}

export interface ModalTransfer {
    title: string;
    view: any;
    options?: {
        daisySize?: 'modal-sm' | 'modal-md' | 'modal-lg' | 'modal-xl' | 'modal-2xl' | 'modal-3xl' | 'modal-full';
        daisyAction?: boolean;
        backdrop?: boolean;
        keyboard?: boolean;
    };
}

export interface ConfirmTransfer {
    message: string;
    callback: (confirmed: boolean) => void;
    title?: string;
    icon?: string;
}

export interface AlertTransfer {
    title?: string;
    message: string;
    timer?: number;
}

export interface DownloadTransfer {
    url: string;
    filename: string;
}

export interface UploadTransfer {
    url: string;
    data: FormData | { name: string; file: File };
    callback: (response: any) => void;
    silent?: boolean;
}

export interface ModelViewOptions {
    modelDOM?: any;
    onRender?: (el: JQuery) => void;
}

export interface RegionOptions {
    el?: string | HTMLElement;
    [key: string]: any;
}


export interface AppInstance {
    Models: Record<string, any>;
    Collections: Record<string, any>;
    router: any;
    currentSubapp: any;
    Modal: any;
    layout: string | null;
    el: string | null;
    mainRegion: any;
    props: any;
    startApp: (RouterModule: any, options: { defaultRoute: string, mainRegion: Region, props: { [key: string]: any } }) => void;
    startSubApplication: (app: any, collections?: any) => any;
    notify: (type: string, message: string) => void;
    alert: (type: string, transfer: string | AlertTransfer) => void;
    confirmaApp: (transfer: ConfirmTransfer) => void;
    syncroRequest: (transfer: SyncroRequest) => void;
    ajaxKumbia: (transfer: any) => void;
    renderModal: (transfer: ModalTransfer) => void;
    closeModal: () => void;
    download: (transfer: DownloadTransfer) => void;
    upload: (transfer: UploadTransfer) => void;
    showNoty: (type: string, message: string, timeout: number) => void;
    showAlert: (title: string, message: string, type: string, timer: number) => void;
    confirma: (transfer: ConfirmTransfer) => void;
    syncro: (transfer: SyncroRequest) => void;
    ajax: (transfer: any) => void;
    show_modal: (transfer: ModalTransfer) => void;
    hide_modal: () => void;
    download: (transfer: DownloadTransfer) => void;
    upload: (transfer: UploadTransfer) => void;
    listenTo: (object: any, event: string, callback: (...args: any[]) => void) => void;
    trigger: (event: string, ...args: any[]) => void;
    downLoadFile: (transfer: DownloadTransfer) => void;
    uploadFile: (transfer: UploadTransfer) => void;
}

export interface ApiProps {
    getToken: () => string | null;
    getHeaders: () => Record<string, string>;
    get: (url: string, params?: Record<string, any>) => Promise<any>;
    post: (url: string, data?: Record<string, any>) => Promise<any>;
    put: (url: string, data?: Record<string, any>) => Promise<any>;
    delete: (url: string) => Promise<any>;
}

export interface responseBody {
    success: boolean;
    message?: string;
    redirect?: string;
    data?: any;
    flag?: boolean;
}

// Tipos para el componente Dashboard
export interface BackendAuthProps {
    title: string;
    api: ApiService;
    logger: Logger;
    user: {
        name: string;
        email: string;
    };
    stats?: {
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
    };
    auth?: {
        user: {
            id: number;
            name: string;
            email: string;
        };
        menu: [{} | any] | any;
        token: string | null;
    };
}

export interface ControllerOptions {
    region: Region;
    api?: ApiService | null;
    props?: { [key: string]: any };
    logger: any;
    router: { [key: string]: any };
}


export { };

