import { BackboneView } from "@/common/Bone";
import EmpresasCollection from "@/collections/EmpresasCollection";
import Poder from "@/models/Poder";
import Empresa from "@/models/Empresa";
import RechazoEmpresaView from "./RechazoEmpresaView";
import RouterRecepcion from "@/pages/Recepcion/RouterRecepcion";
import RecepcionService from "@/pages/Recepcion/RecepcionService";
import mostrar from "@/componentes/recepcion/templates/mostrar.hbs?raw";

interface AsistenciasMostrarOptions {
    model?: any;
    collection?: any[];
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class AsistenciasMostrar extends BackboneView {
    template: any;
    app: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    recepcionService: RecepcionService;
    tieneIncripcion: boolean | null;
    modalView: any;
    empresas: any[];

    constructor(options: AsistenciasMostrarOptions) {
        super(options);
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(mostrar);
        this.tieneIncripcion = null;
        this.modalView = null;
        this.empresas = [];
        this.recepcionService = new RecepcionService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    async fichaIngreso(e: Event) {
        e.preventDefault();
        const cedrep = this.model.get('cedrep');

        if (this.app && typeof this.app.trigger === 'function') {
            this.app.trigger('confirma', {
                message: '¡Confirmar la acción de registro de ingreso a la Asamblea!',
                callback: async (success: boolean) => {
                    if (success) {
                        try {
                            const response = await this.recepcionService.__crearAsistencia({ cedrep });

                            if (response.success) {
                                this.trigger('add:representante', this.model);
                                if (this.app && typeof this.app.trigger === 'function') {
                                    this.app.trigger('alert:success', { message: response.msj });
                                }
                                if (this.app && this.app.router) {
                                    this.app.router.navigate('ficha/' + cedrep, { trigger: true });
                                }
                            } else {
                                if (this.app && typeof this.app.trigger === 'function') {
                                    this.app.trigger('alert:warning', { message: response.msj });
                                }
                            }
                        } catch (error: any) {
                            this.logger?.error('Error al crear asistencia:', error);
                            if (this.app && typeof this.app.trigger === 'function') {
                                this.app.trigger('alert:error', { message: 'Ocurrió un error al realizar el registro' });
                            }
                        }
                    }
                },
            });
        }
        return false;
    }

    crearIngreso(e: Event) {
        e.preventDefault();
        const cedrep = this.model.get('cedrep');
        if (this.App && typeof this.App.trigger === 'function') {
            this.App.trigger('set:representante', this.model.toJSON());
            this.App.trigger('navigate', 'validacion/' + cedrep);
        }
        return false;
    }

    events() {
        return {
            'click #bt_ficha_ingreso': 'fichaIngreso',
            'click #bt_crear_ingreso': 'crearIngreso',
            "click [data-toggle='bt_rechazo']": 'mostrarRechazo',
        };
    }

    render() {
        const _template = _.template(this.template);
        const { empresas, asistencias, poder, poderes } = this.collection[0];

        const habiles = _.filter(empresas.toJSON(), (empresa: any) => {
            return empresa.estado == 'A' || empresa.estado == 'P' ? empresa : null;
        });

        this.empresas = _.sortBy(empresas.toJSON(), 'inscripcion_estado');

        const inscripciones = _.where(this.empresas, { tiene_incripcion: 1 });

        this.tieneIncripcion = _.size(inscripciones) > 0 && _.size(habiles) > 0 ? true : false;

        this.$el.html(
            _template({
                representante: this.model.toJSON(),
                empresas: this.empresas,
                tiene_incripcion: this.tieneIncripcion,
                poder: poder instanceof Poder ? poder.toJSON() : poder,
                poderes: poderes instanceof EmpresasCollection ? poderes.toJSON() : poderes,
            })
        );
        return this;
    }

    async mostrarRechazo(e: Event) {
        e.preventDefault();
        const nit = this.$el.find(e.currentTarget).attr('data-cid');
        const cedrep = this.model.get('cedrep');

        try {
            const response = await this.recepcionService.__obtenerRechazo({ cedrep, nit });

            if (response && response.success) {
                const empresa = new Empresa(response.data.empresa);
                this.modalView = new RechazoEmpresaView({ model: empresa, collection: response.data.rechazos });
                if (this.App && typeof this.App.trigger === 'function') {
                    this.App.trigger('show:modal', 'Detalle Rechazo Empresa', this.modalView, { bootstrapSize: 'modal-md' });
                }
            }
        } catch (error: any) {
            this.logger?.error('Error al obtener rechazo:', error);
            if (this.App && typeof this.App.trigger === 'function') {
                this.App.trigger('alert:error', { message: 'Ocurrió un error al obtener el rechazo' });
            }
        }
    }
}
