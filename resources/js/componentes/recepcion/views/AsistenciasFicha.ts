import { BackboneView } from "@/common/Bone";
import Poder from "@/models/Poder";
import RecepcionService from "@/pages/Recepcion/RecepcionService";
import tmp_ficha_ingreso from '@/templates/recepcion/ficha_ingreso.hbs?raw';

interface AsistenciasFichaOptions {
    model?: any;
    collection?: any[];
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class AsistenciasFicha extends BackboneView {
    template!: string;
    app: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    recepcionService: RecepcionService;
    poder: any;
    votos: any;
    empresas: any;

    constructor(options: AsistenciasFichaOptions = {}) {
        super(options);
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.poder = void 0;
        this.votos = void 0;
        this.empresas = void 0;
        this.recepcionService = new RecepcionService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    initialize() {
        this.poder = void 0;
        this.votos = void 0;
        this.empresas = void 0;
        this.template = tmp_ficha_ingreso;
    }

    render() {
        const { empresas, poder, votos } = this.collection[0];
        this.empresas = _.sortBy(empresas.toJSON(), 'asistente_estado');
        this.poder = poder;
        this.votos = votos;

        let _template = _.template(this.template);
        this.$el.html(
            _template({
                representante: this.model.toJSON(),
                empresas: this.empresas,
                poder: this.poder instanceof Poder ? this.poder.toJSON() : false,
                votos: this.votos,
            })
        );
        return this;
    }

    events() {
        return {
            'click #aplicar_unpoder': 'aplicar_unpoder',
            'click #ingreso_poder_manual': 'ingresoPoderManual',
            'click #bt_imprimir_ficha': 'imprimirFicha',
        };
    }

    imprimirFicha(e: Event) {
        e.preventDefault();
        const cedrep = this.model.get('cedrep');
        const anchor = document.createElement('a');
        anchor.setAttribute('target', '_blank');
        // Usar navegación segura en lugar de create_url
        if (this.app && this.app.router) {
            this.app.router.navigate('imprimir_ficha/' + cedrep, { trigger: true });
        }
    }

    ingresoPoderManual(e: Event) {
        e.preventDefault();
        this.$el.find(e.target).attr('disabled', true);
        const cedrep = this.model.get('cedrep');
        const nit_poder = this.poder.nit2;
        const documento_poder = this.poder.documento;

        const token = {
            cedrep,
            nit_poder,
            documento_poder,
        };

        if (this.app && typeof this.app.trigger === 'function') {
            this.app.trigger('confirma', {
                message: 'Se requiere de confirmar si desea ingresar el poder al consenso.',
                callback: (success: boolean) => {
                    if (success) {
                        // Usar service layer en lugar de syncro
                        this.ingresarPoderConsenso(token, e.target);
                    } else {
                        return false;
                    }
                },
            });
        }
    }

    async ingresarPoderConsenso(token: any, target: any) {
        try {
            const response = await this.recepcionService.__ingresarPoderConsenso(token);

            this.$el.find(target).removeAttr('disabled');

            if (response.success) {
                if (this.app && typeof this.app.trigger === 'function') {
                    this.app.trigger('alert:success', 'El registro se completo con éxito.');
                }
                // Recargar la página actual de forma segura
                if (this.app && this.app.router) {
                    this.app.router.navigate('ficha/' + token.cedrep, { trigger: true, replace: true });
                }
            } else {
                if (this.app && typeof this.app.trigger === 'function') {
                    this.app.trigger('alert:error', 'Se ha generado un error interno y el registro no se completo.');
                }
            }
        } catch (error: any) {
            this.$el.find(target).removeAttr('disabled');
            this.logger?.error('Error al ingresar poder consenso:', error);
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('alert:error', 'Ocurrió un error al ingresar el poder.');
            }
        }
    }

    aplicar_unpoder(e: JQuery.Event) {
        e.preventDefault();
        alert('Opción pendiente para desarrollo. No se requiere de ninguna acción');
    }
}
