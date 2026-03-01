import { BackboneView } from "@/common/Bone";
import Poder from "@/models/Poder";
import crearRechazoPoder from '@/componentes/poderes/templates/crear_rechazo_poder.hbs?raw';
import PoderesService from "@/pages/Poderes/PoderService";

interface RechazaPoderOptions {
    collection?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class RechazaPoder extends BackboneView {
    modal: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    poderesService: PoderesService;

    constructor(options: RechazaPoderOptions) {
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
        this.modal = void 0;
    }

    get events() {
        return {
            'click #btn_back_list': 'backList',
            'click #btnRegistraRechazo': 'registraRechazo',
            'click #bt_buscar_poderdante': 'buscarPoderdante',
            'click #bt_buscar_apoderado': 'buscarApoderado',
            'keypress #apoderado_nit': 'keyBuscarApoderado',
            'keypress #poderdante_nit': 'keyBuscarPoderdante',
            'click #copyMemory': 'copyMemory',
        };
    }

    render() {
        let template = _.template(crearRechazoPoder);
        this.$el.html(template({ criterios_rechazos: this.collection.toJSON() }));

        const today = new Date();
        const formattedDate = today.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');

        this.$el.find("[name='fecha']").val(formattedDate);
        return this;
    }

    copyMemory(e: Event) {
        e.preventDefault();
        let id = this.$el.find('#criterio_rechazo').val();
        let criterio = this.collection.get(parseInt(id));
        let motivo = this.$el.find('#motivo').val();
        motivo =
            motivo == ''
                ? criterio.get('estatutos') + ' ' + criterio.get('detalle')
                : motivo + '\n' + criterio.get('estatutos') + ' ' + criterio.get('detalle') + ', ';
        this.$el.find('#motivo').val(motivo);
    }

    keyBuscarApoderado(e: any) {
        var keycode = e.keyCode ? e.keyCode : e.which;
        if (keycode == 13) {
            this.$el.find('#bt_buscar_apoderado').trigger('click');
        }
    }

    keyBuscarPoderdante(e: any) {
        var keycode = e.keyCode ? e.keyCode : e.which;
        if (keycode == 13) {
            this.$el.find('#bt_buscar_poderdante').trigger('click');
        }
    }

    buscarApoderado(e: Event) {
        e.preventDefault();
        const apoderado_nit = this.getInput('apoderado_nit');
        const poderdante_nit = this.getInput('poderdante_nit');

        if (apoderado_nit == poderdante_nit) {
            this.app?.trigger('alert:error', 'La empresa poderdante no puede ser la misma empresa apoderada.');
            return false;
        }

        if (apoderado_nit !== '') {
            // Delegar al servicio para buscar empresa
            this.poderesService.__buscarEmpresa(apoderado_nit).then((response: any) => {
                if (response) {
                    if (!response.success) {
                        this.app?.trigger('alert:error', response.msj);
                    } else {
                        const empresa = response.empresa;
                        this.setInput('apoderado_cedula', empresa.cedrep);
                        this.setInput('razsoc_apoderado', empresa.razsoc);
                        this.setInput('repleg_apoderado', empresa.repleg);
                    }
                } else {
                    this.app?.trigger(
                        'alert:error',
                        'Se ha generado un error interno. Se requiere de reportar al área de TICS'
                    );
                }
            }).catch((error: any) => {
                this.logger?.error('Error al buscar empresa:', error);
                this.app?.trigger('alert:error', 'Error de conexión');
            });
        } else {
            this.setInput('apoderado_cedula', '');
            this.setInput('razsoc_apoderado', '');
            this.setInput('repleg_apoderado', '');
        }
    }

    buscarPoderdante(e: Event) {
        e.preventDefault();
        const apoderado_nit = this.getInput('apoderado_nit');
        const poderdante_nit = this.getInput('poderdante_nit');

        if (poderdante_nit == apoderado_nit) {
            this.app?.trigger('alert:error', 'La empresa poderdante no puede ser la misma empresa apoderada.');
            return false;
        }

        if (poderdante_nit !== '') {
            // Delegar al servicio para buscar empresa
            this.poderesService.__buscarEmpresa(poderdante_nit).then((response: any) => {
                if (response) {
                    if (!response.success) {
                        this.app?.trigger('alert:error', response.msj);
                    } else {
                        if (response.data.available === true) {
                            this.setInput('poderdante_cedula', response.data.cedrep);
                            this.setInput('razsoc_poderdante', response.data.razsoc);
                            this.setInput('repleg_poderdante', response.data.repleg);
                        }
                    }
                } else {
                    this.app?.trigger(
                        'alert:error',
                        'Se ha generado un error interno. Se requiere de reportar al área de TICS'
                    );
                }
            }).catch((error: any) => {
                this.logger?.error('Error al buscar empresa:', error);
                this.app?.trigger('alert:error', 'Error de conexión');
            });
        } else {
            this.setInput('poderdante_cedula', '');
            this.setInput('razsoc_poderdante', '');
            this.setInput('repleg_poderdante', '');
        }
    }

    registraRechazo(e: Event) {
        e.preventDefault();
        var target = this.$el.find(e.currentTarget);
        target.attr('disabled', true);

        const apoderado_nit = this.getInput('apoderado_nit');
        const poderdante_nit = this.getInput('poderdante_nit');
        const apoderado_cedula = this.getInput('apoderado_cedula');
        const poderdante_cedula = this.getInput('poderdante_cedula');
        const radicado = this.getInput('radicado');
        const criterio_rechazo = this.getInput('criterio_rechazo');
        const notificacion = this.getInput('motivo');

        const model = new Poder({
            nit1: apoderado_nit,
            cedrep1: apoderado_cedula,
            nit2: poderdante_nit,
            cedrep2: poderdante_cedula,
            radicado: radicado,
            criterio_rechazo: criterio_rechazo,
            notificacion: notificacion,
            estado: 'R',
        });

        if (apoderado_nit == '' && poderdante_nit == '') {
            this.app?.trigger('alert:error', 'La empresa poderdante no puede ser la misma empresa apoderada.');
            target.removeAttr('disabled');
            return false;
        }

        model.setForRechazo(true);

        if (!model.isValid()) {
            this.app?.trigger('alert:error', model.validationError);
            setTimeout(() => this.$el.find('.error').html(''), 3000);
            target.removeAttr('disabled');
            // Establecer fecha actual sin dependencia global moment
            const today = new Date();
            const formattedDate = today.toLocaleDateString('es-CO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '-');
            this.setInput('fecha', formattedDate);
            return false;
        }

        // Delegar al servicio para registrar rechazo
        this.poderesService.__registrarRechazo(model.toJSON()).then((response: any) => {
            target.removeAttr('disabled');
            if (response) {
                if (!response.poder) {
                    this.app?.trigger('alert:error', response.errors || 'Error al registrar rechazo');
                } else {
                    this.app?.trigger('success', response.msj);

                    _.each(response.poder, (value: any, key: string) => model.set(key, value));
                    this.trigger('add:poder', model);

                    this.$el.find('input').val('');
                    this.setText('razsoc_apoderado', 'Razón social');
                    this.setText('razsoc_poderdante', 'Razón social');
                    this.setText('repleg_apoderado', 'Representante legal');
                    this.setText('repleg_poderdante', 'Representante legal');

                    // Establecer fecha actual
                    const today = new Date();
                    const formattedDate = today.toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }).replace(/\//g, '-');
                    this.setInput('fecha', formattedDate);

                    if (this.app && this.app.router) {
                        this.app.router.navigate('mostrar/' + model.get('documento'), { trigger: true, replace: true });
                    }
                }
            } else {
                this.setText('razsoc_apoderado', 'Razón social');
                this.setText('razsoc_poderdante', 'Razón social');
                this.setText('repleg_apoderado', 'Representante legal');
                this.setText('repleg_poderdante', 'Representante legal');

                // Establecer fecha actual
                const today = new Date();
                const formattedDate = today.toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).replace(/\//g, '-');
                this.setInput('fecha', formattedDate);
            }
        }).catch((error: any) => {
            target.removeAttr('disabled');
            this.logger?.error('Error al registrar rechazo:', error);
            this.app?.trigger('alert:error', 'Error de conexión');
        });

        return false;
    }

    backList(e: Event) {
        e.preventDefault();
        this.remove();
        if (this.app && this.app.router) {
            this.app.router.navigate('listar', { trigger: true, replace: true });
        }
        return false;
    }

    getInput(selector: string) {
        return this.$el.find(`[name='${selector}']`).val();
    }

    setInput(selector: string, val: string) {
        return this.$el.find(`[name='${selector}']`).val(val ?? '');
    }

    setText(selector: string, val: string) {
        return this.$el.find(`[id='${selector}']`).text(val ?? '');
    }
}
