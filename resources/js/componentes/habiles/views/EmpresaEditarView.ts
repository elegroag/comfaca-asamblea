import { BackboneView } from "@/common/Bone";
import tmp_edita_empresa from "../templates/edita_empresa?raw";

interface EmpresaEditarViewOptions {
    model?: any;
    collection?: any;
    router?: any;
    api?: any;
    App?: any;
    EmpresaModel: new (attrs?: any, options?: any) => any;
}

export default class EmpresaEditarView extends BackboneView {
    modelUse: any;
    template: any;

    constructor(options: EmpresaEditarViewOptions) {
        super({
            ...options,
            className: 'box',
        });
        this.modelUse = options.EmpresaModel;
        this.template = _.template(tmp_edita_empresa);
    }

    /**
     * @override
     */
    get events(): Record<string, (e: Event) => void> {
        return { 'click #bt_edita_registro': this.editaRegistro };
    }

    editaRegistro(e: Event): void {
        e.preventDefault();
        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

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

        if (typeof this.trigger === 'function') {
            this.trigger('form:edit', {
                model: model,
                callback: (success: boolean, response?: any) => {
                    if (success === true) {
                        target.removeAttr('disabled');
                        if (response?.data) {
                            this.trigger('set:empresas', response.data);
                        }
                        this.trigger('notify', model.get('nit'));
                        this.trigger('item:edit', model);
                    } else {
                        target.removeAttr('disabled');
                    }
                },
            });
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
