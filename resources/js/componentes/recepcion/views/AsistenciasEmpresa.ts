import { BackboneView } from "@/common/Bone";

interface AsistenciasEmpresaOptions {
    model?: any;
    collection?: any[];
    App?: any;
    [key: string]: any;
}

export default class AsistenciasEmpresa extends BackboneView {
    template!: string;
    App: any;
    representante: any;
    poder: any;

    constructor(options: AsistenciasEmpresaOptions = {}) {
        super(options);
        this.App = options.App;
        this.representante = void 0;
        this.poder = void 0;
    }

    initialize() {
        this.representante = void 0;
        this.poder = void 0;
    }

    back_lista(event: Event) {
        event.preventDefault();
        this.App.router.navigate('listar', { trigger: true, replace: true });
    }

    events() {
        return {
            'click #bt_back': 'back_lista',
        };
    }

    render() {
        this.representante = this.collection[0];
        this.poder = this.collection[1];
        let template = _.template($('#tmp_registro_empresa').html());
        this.el.innerHTML = template({
            empresa: this.model.toJSON(),
            representante: this.representante ? this.representante.toJSON() : false,
            poder: this.poder ? this.poder.toJSON() : false,
        });
        return this;
    }
}
