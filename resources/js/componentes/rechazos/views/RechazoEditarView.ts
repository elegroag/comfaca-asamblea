import { BackboneView } from "@/common/Bone";

declare global {
    var _: any;
    var RechazosNav: any;
    var Empresa: any;
}

interface RechazoEditarViewOptions {
    [key: string]: any;
}

export default class RechazoEditarView extends BackboneView {
    model: any;
    template!: string;
    $el: any;

    constructor(options: RechazoEditarViewOptions) {
        super(options);
    }

    initialize() {
        this.template = $('#tmp_edita_empresa').html();
    }

    get events() {
        return { 'click #bt_edita_registro': 'editaRegistro' };
    }

    render() {
        let _template = _.template(this.template);
        let model = this.serealizeData();
        this.$el.html(_template(model));
        this.subNav();
        return this;
    }

    subNav() {
        let subnav = new RechazosNav({
            model: this.model,
            dataToggle: {
                listar: true,
                exportar: false,
                crear: true,
                editar: false,
                masivo: true,
            },
        });
        subnav.render();
        this.$el.find('#showSubnav').html(subnav.$el);
        (RechazosNav as any).parentView = this;
    }

    serealizeData(): any {
        var data = this.model ? this.model.toJSON() : {};
        return data;
    }

    editaRegistro(e: any) {
        e.preventDefault();
        let target = $(e.currentTarget);
        target.attr('disabled', 'true');

        const model = new Empresa({
            nit: parseInt(this.getInput('nit')),
            cedrep: parseInt(this.getInput('cedrep')),
            repleg: this.getInput('repleg'),
            telefono: this.getInput('telefono'),
            email: this.getInput('email'),
            razsoc: this.getInput('razsoc'),
            crear_pre_registro: this.getCheck('crear_pre_registro'),
            cruzar_cartera: this.getCheck('cruzar_cartera'),
        });

        this.trigger('form:edit', {
            model: model,
            callback: (success: any) => {
                target.removeAttr('disabled');
                this.trigger('item:edit', model);
            },
        });
    }

    getInput(selector: string): string {
        return this.$el.find(`[name='${selector}']`).val();
    }

    setInput(selector: string, val: string): void {
        this.$el.find(`[name='${selector}']`).val(val ?? '');
    }

    getCheck(selector: string): number {
        return this.$el.find(`[name='${selector}']:checked`).length;
    }

    serealizeForm(el: any): any {
        let _dataArray = el.find('#formulario').serializeArray();
        let _token: any = {};
        let i = 0;
        while (i < _.size(_dataArray)) {
            _token[_dataArray[i].name] = _dataArray[i].value.toUpperCase();
            i++;
        }
        return _token;
    }
}
