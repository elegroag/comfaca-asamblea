import { BackboneView } from "@/common/Bone";
import tmp_crear_habiles from "@/componentes/habiles/templates/crear_habiles.hbs?raw";
import EmpresaService from "@/pages/Habiles/EmpresaService";

interface EmpresaCrearViewOptions {
    EmpresaModel: new (attrs?: any, options?: any) => any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}


export default class EmpresaCrearView extends BackboneView {
    modelUse: any;
    template: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    empresaService: EmpresaService;

    constructor(options: EmpresaCrearViewOptions) {
        super({
            ...options,
            className: 'box',
        });
        this.modelUse = options.EmpresaModel;
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(tmp_crear_habiles);

        // Inicializar el servicio con las dependencias
        this.empresaService = new EmpresaService({
            api: this.api,
            App: this.app,
            logger: this.logger
        });
    }

    /**
     * @override
     */
    get events(): Record<string, (e: Event) => void> {
        return {
            'click #bt_guardar': this.guardarDatos,
            "focusout input[name='nit']": this.enableBoton,
            "focusout input[name='cedrep']": this.enableBoton,
        };
    }

    async guardarDatos(e: Event): Promise<boolean> {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        const nit = this.getInput('nit');
        const model = new this.modelUse({
            nit: parseInt(nit || '0'),
            cedrep: parseInt(this.getInput('cedrep') || '0'),
            repleg: this.getInput('repleg'),
            telefono: this.getInput('telefono'),
            email: this.getInput('email'),
            razsoc: this.getInput('razsoc'),
            crear_pre_registro: this.getCheck('crear_pre_registro'),
            cruzar_cartera: this.getCheck('cruzar_cartera'),
        });

        if (!nit || nit.trim() === '') {
            this.app?.trigger('alert:error', { message: 'El nit de la empresa es un valor requerido' });
            target.removeAttr('disabled');
            return false;
        }

        try {
            // Delegar al service para guardar
            this.empresaService.__saveEmpresa({
                model: model,
                callback: (success: boolean, data?: any) => {
                    target.removeAttr('disabled');
                    if (success === true) {
                        if (data?.empresa) {
                            this.trigger('add:empresas', data.empresa);
                        }
                        if (data?.pre_registro?.documento) {
                            this.trigger('notify', { nit: model.get('nit'), documento: data.pre_registro.documento });
                        }

                        this.$el.find('input').val('');
                        this.setInput('razsoc', 'razón social');
                        this.setInput('repleg', 'representante legal');

                        this.app?.trigger('alert:success', { message: 'Empresa guardada exitosamente' });
                    } else {
                        this.app?.trigger('alert:error', { message: data?.msj || 'Error al guardar empresa' });
                    }
                }
            });
        } catch (error: any) {
            target.removeAttr('disabled');
            this.logger?.error('Error al guardar empresa:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
        }

        return false;
    }

    enableBoton(e: Event): void {
        e.preventDefault();
        const nit = this.getInput('nit');
        const cedrep = this.getInput('cedrep');

        if ((nit === '' || cedrep === '') === false) {
            this.$el.find('#bt_guardar').removeAttr('disabled');
        } else {
            this.$el.find('#bt_guardar').attr('disabled', 'true');
        }
    }

    getInput(selector: string): string {
        const element = this.$el.find(`[name='${selector}']`);
        return element.length ? element.val() as string : '';
    }

    getCheck(selector: string): boolean {
        const element = this.$el.find(`[name='${selector}']`);
        return element.length ? element.is(':checked') : false;
    }

    setInput(selector: string, value: string): void {
        this.$el.find(`[name='${selector}']`).val(value || '');
    }
}
