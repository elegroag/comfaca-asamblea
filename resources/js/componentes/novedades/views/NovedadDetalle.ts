import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';
import detalle from "@/componentes/novedades/templates/detalle.hbs?raw";

interface NovedadDetalleOptions {
    model?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class NovedadDetalle extends BackboneView {
    app: AppInstance;
    template: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    novedadesService: any;

    constructor(options: NovedadDetalleOptions) {
        super(options);
        this.app = options.app || options.AppInstance;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;

        // Importar y crear el servicio dinámicamente para evitar dependencia circular
        import('@/pages/Novedades/NovedadesService').then(({ default: NovedadesService }) => {
            this.novedadesService = new NovedadesService({
                api: this.api,
                logger: this.logger,
                app: this.app
            });
        });
    }

    initialize(): void {
        this.template = _.template(detalle);
    }

    get events() {
        return {
            'click #btn_back_list': 'backList',
            'click #bt_procesar': 'procesarNovedad',
        };
    }

    /**
     * Volver a la lista
     */
    backList(e: Event): void {
        e.preventDefault();
        this.remove();

        if (this.app && this.app.router) {
            this.app.router.navigate('listar', { trigger: true, replace: true });
        }
    }

    render(): this {
        const template = _.template(this.template);
        this.$el.html(template({ novedad: this.model.toJSON() }));
        return this;
    }

    /**
     * Procesar novedad
     */
    procesarNovedad(e: Event): void {
        e.preventDefault();

        if (this.app && typeof this.app.trigger === 'function') {
            this.app.trigger('confirma', {
                message: 'Confirma que desea procesar el registro',
                callback: (status: boolean) => {
                    if (status) {
                        this.trigger('item:procesar', {
                            model: this.model,
                            callback: (response: any) => {
                                if (response) {
                                    if (response.success) {
                                        if (this.app && typeof this.app.trigger === 'function') {
                                            this.app.trigger('alert:success', response.msj);
                                        }

                                        // Delegar descarga al service
                                        if (this.novedadesService) {
                                            this.novedadesService.__downloadFile(response);
                                        }
                                    } else {
                                        if (this.app && typeof this.app.trigger === 'function') {
                                            this.app.trigger('alert:error', response.msj);
                                        }
                                    }
                                }
                            },
                        });
                    }
                },
            });
        }
    }
}
