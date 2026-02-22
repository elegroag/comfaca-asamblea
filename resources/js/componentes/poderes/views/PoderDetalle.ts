import { BackboneView } from "@/common/Bone";
import RechazarDetallePoder from "./RechazarDetallePoder";
import detallePoder from "@/componentes/poderes/templates/detallePoder.hbs?raw";
import PoderesService from "@/pages/Poderes/PoderService";

interface PoderDetalleOptions {
    model?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class PoderDetalle extends BackboneView {
    criterios_rechazos: any;
    habil_apoderado: any;
    habil_poderdante: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    poderesService: PoderesService;

    constructor(options: PoderDetalleOptions) {
        super(options);
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;

        // Inicializar el servicio
        this.poderesService = new PoderesService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    initialize() {
        this.criterios_rechazos = void 0;
        this.habil_apoderado = void 0;
        this.habil_poderdante = void 0;
    }

    get events() {
        return {
            'click #btn_back_list': 'backList',
            "switchChange.bootstrapSwitch [id='estado_poder']": 'changeValidaEstado',
        };
    }

    backList(e: Event) {
        e.preventDefault();
        this.remove();
        if (this.app && this.app.router) {
            this.app.router.navigate('listar', { trigger: true, replace: true });
        }
        return false;
    }

    changeValidaEstado(e: Event) {
        let $input = this.$el.find(e.currentTarget);
        if ($input.is(':checked')) {
            if (this.model.get('estado') == 'A') return false;

            this.app?.trigger('confirma', {
                message: 'Se requiere de confirmar si desea activar el poder.',
                callback: async (continuar: boolean) => {
                    if (continuar) {
                        try {
                            const documento = this.model.get('documento');
                            const response = await this.poderesService.__activarPoder(documento);

                            if (response?.success) {
                                this.model.set('estado', 'A');
                                this.$el.find('#show_criterio_rechazo').text('No Aplicado');
                                this.$el.find('#show_estado_text').text('ACTIVO');
                                this.app?.trigger('alert:success', response.msj);
                            } else {
                                this.app?.trigger('alert:error', (response as any)?.err || 'Error al activar el poder');
                            }
                        } catch (error: any) {
                            this.logger?.error('Error al activar poder:', error);
                            this.app?.trigger('alert:error', 'Error de conexión');
                        }
                    } else {
                        this.$el.find("[id='estado_poder']").trigger('click');
                    }
                },
            });
        } else {
            if (this.model.get('estado') == 'A') {
                let view = new RechazarDetallePoder({ model: this.model, collection: this.criterios_rechazos });
                this.app?.trigger('show:modal', 'Rechazar Poder Detalle', view, { bootstrapSize: 'modal-lg' });
                this.listenTo(view, 'change:criterio', this.__changeCriterio);
            }
        }
    }

    render() {
        const { apoderado, poderdante, criteriosRechazos } = this.collection[0];

        this.habil_apoderado = apoderado;
        this.habil_poderdante = poderdante;
        this.criterios_rechazos = criteriosRechazos;

        let template = _.template(detallePoder);
        this.$el.html(
            template({
                poder: this.model.toJSON(),
                habil_apoderado: this.habil_apoderado.toJSON(),
                habil_poderdante: this.habil_poderdante.toJSON(),
                criterios_rechazos: this.criterios_rechazos,
            })
        );
        this.$el.find("[id='estado_poder']").bootstrapSwitch();
        return this;
    }

    __changeCriterio(model: any, motivo: any) {
        let criterioRechazo = model.get('criterio_rechazo');
        if (criterioRechazo) {
            this.$el.find('#show_motivo_rechazo').html(motivo);
            this.$el.find('#show_estado_text').text('RECHAZADO');
        } else {
            this.$el.find('#show_motivo_rechazo').html('No Aplicado');
            this.$el.find('#show_estado_text').text('ACTIVO');
        }
    }
}
