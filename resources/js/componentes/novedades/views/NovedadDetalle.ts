import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';
import detalle from "@/componentes/novedades/templates/detalle.hbs?raw";

interface NovedadDetalleOptions {
    model?: any;
    App?: AppInstance;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class NovedadDetalle extends BackboneView {
    App: AppInstance;
    template: any;
    api: any;
    logger: any;
    storage: any;
    region: any;

    constructor(options: NovedadDetalleOptions) {
        super(options);
        this.App = options.App || options.AppInstance;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
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

        if (this.App && this.App.router) {
            this.App.router.navigate('listar', { trigger: true, replace: true });
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

        if (this.App && typeof this.App.trigger === 'function') {
            this.App.trigger('confirma', {
                message: 'Confirma que desea procesar el registro',
                callback: (status: boolean) => {
                    if (status) {
                        this.trigger('item:procesar', {
                            model: this.model,
                            callback: (response: any) => {
                                if (response) {
                                    if (response.success) {
                                        if (this.App && typeof this.App.trigger === 'function') {
                                            this.App.trigger('alert:success', response.msj);
                                        }

                                        if (typeof download_file === 'function') {
                                            download_file(response);
                                        }
                                    } else {
                                        if (this.App && typeof this.App.trigger === 'function') {
                                            this.App.trigger('alert:error', response.msj);
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
