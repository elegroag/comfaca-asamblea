import { BackboneView } from "@/common/Bone";
import RecepcionService from "@/pages/Recepcion/RecepcionService";
import RouterRecepcion from "@/pages/Recepcion/RouterRecepcion";
import buscar from "@/componentes/recepcion/templates/buscar.hbs?raw";

interface ScannerBuscarOptions {
    model?: any;
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class ScannerBuscar extends BackboneView {
    template: any;
    app: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    recepcionService: RecepcionService;

    constructor(options: ScannerBuscarOptions) {
        super(options);
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(buscar);
        this.recepcionService = new RecepcionService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    initialize() { }

    events() {
        return {
            'click #bt_buscar_asistente': 'buscar_asistente',
        };
    }

    noevent(e: Event) {
        e.preventDefault();
        return false;
    }

    key_buscar_cedrep(e: any) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            this.$el.find('#bt_buscar_asistente').trigger('click');
        }
    }

    async buscar_asistente(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        const cedrep = this.$el.find('#cedrep').val();

        if (cedrep === '' || cedrep === undefined || cedrep.trim() === '') {
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('alert:warning', {
                    title: 'Notificación!',
                    text: 'El documento no es valido para mostrar los datos del representante.',
                    button: 'OK!'
                });
            }
            return false;
        }

        if (!/^([0-9]+){5,20}(.*)?/.test(cedrep)) {
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('alert:warning', {
                    title: 'Notificación!',
                    text: 'El documento no es valido para mostrar los datos del representante.',
                    button: 'OK!'
                });
            }
            return false;
        }

        target.attr('disabled', 'true');

        try {
            const response = await this.recepcionService.__buscarRepresentante({ cedrep });

            target.removeAttr('disabled');

            if (response && response.success) {
                if (response.data.representante !== false) {
                    var representante = response.data.representante;
                    representante.asistente = response.data.asistente;

                    // Guardar representante en el storage del service
                    if (this.app && this.app.Collections && this.app.Collections.representantes) {
                        this.app.Collections.representantes.add(representante);
                    }

                    if (response.data.asistente !== false) {
                        // Guardar asistente en el storage del service
                        if (this.app && this.app.Collections && this.app.Collections.asistencias) {
                            this.app.Collections.asistencias.add(response.data.asistente);
                        }
                    }
                } else {
                    //mostrar notificacion representante no valido
                    if (this.app && typeof this.app.trigger === 'function') {
                        this.app.trigger('alert:warning', {
                            title: 'Notificación!',
                            text: 'El representante no está habil para ingreso.',
                            button: 'OK!'
                        });
                    }
                    return false;
                }

                if (response.data.empresas !== false) {
                    // Guardar empresas en el storage del service
                    if (this.app && this.app.Collections && this.app.Collections.empresas) {
                        response.data.empresas.forEach((empresa: any) => {
                            this.app.Collections.empresas.add(empresa);
                        });
                    }
                } else {
                    //mostrar notificacion empresas no valido
                    if (this.app && typeof this.app.trigger === 'function') {
                        this.app.trigger('alert:warning', {
                            title: 'Notificación!',
                            text: 'No dispone de empresas habiles para el ingreso.',
                            button: 'OK!'
                        });
                    }
                    return false;
                }

                if (response.data.tipo_ingreso === 'V') {
                    if (this.app && typeof this.app.trigger === 'function') {
                        this.app.trigger('alert:warning', {
                            title: 'Notificación!',
                            text: 'Su participación en la asamblea se registro en el modo Virtual. No se admite su ingreso.',
                            button: 'OK!'
                        });
                    }
                    return false;
                }

                // Navegación usando app.router
                if (this.app && this.app.router) {
                    this.app.router.navigate('mostrar/' + cedrep, { trigger: true });
                }
            } else {
                if (this.app && typeof this.app.trigger === 'function') {
                    this.app.trigger('alert:error', {
                        title: 'Error!',
                        text: 'Error al buscar representante',
                        button: 'OK!'
                    });
                }
            }
        } catch (error: any) {
            target.removeAttr('disabled');
            this.logger?.error('Error al buscar representante:', error);
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('alert:error', {
                    title: 'Error!',
                    text: 'Ocurrió un error al buscar el representante',
                    button: 'OK!'
                });
            }
        }
    }

    render() {
        const template = _.template(this.template);
        this.$el.html(template());
        return this;
    }
}
