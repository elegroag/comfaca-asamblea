import { BackboneView } from "@/common/Bone";
import tmp_edita_empresa from "@/componentes/habiles/templates/edita_empresa.hbs?raw";
import EmpresaService from "@/pages/Habiles/EmpresaService";

interface EmpresaEditarViewOptions {
    model?: any;
    collection?: any;
    router?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    EmpresaModel: new (attrs?: any, options?: any) => any;
}

export default class EmpresaEditarView extends BackboneView {
    modelUse: any;
    template: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    empresaService: EmpresaService;

    constructor(options: EmpresaEditarViewOptions) {
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
        this.template = _.template(tmp_edita_empresa);

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
        return { 'click #bt_edita_registro': this.editaRegistro };
    }

    async editaRegistro(e: Event): Promise<void> {
        e.preventDefault();
        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        try {
            const model = new this.modelUse({
                nit: parseInt(this.getInput('nit') || '0'),
                cedrep: parseInt(this.getInput('cedrep') || '0'),
                repleg: this.getInput('repleg'),
                telefono: this.getInput('telefono'),
                email: this.getInput('email'),
                razsoc: this.getInput('razsoc'),
                crear_pre_registro: this.getCheck('crear_pre_registro'),
                cruzar_cartera: this.getCheck('cruzar_cartera'),
            });

            // Delegar al service para editar
            this.empresaService.__saveEmpresa({
                model: model,
                callback: (success: boolean, response?: any) => {
                    target.removeAttr('disabled');
                    if (success === true) {
                        if (response?.data) {
                            this.trigger('set:empresas', response.data);
                        }
                        this.trigger('notify', model.get('nit'));
                        this.trigger('item:edit', model);

                        this.app?.trigger('alert:success', { message: 'Empresa actualizada exitosamente' });
                    } else {
                        this.app?.trigger('alert:error', { message: response?.msj || 'Error al actualizar empresa' });
                    }
                }
            });
        } catch (error: any) {
            target.removeAttr('disabled');
            this.logger?.error('Error al editar empresa:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
}
