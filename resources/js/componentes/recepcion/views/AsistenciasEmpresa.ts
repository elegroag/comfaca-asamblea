import { BackboneView } from "@/common/Bone";

interface AsistenciasEmpresaOptions {
    model?: any;
    collection?: any[];
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class AsistenciasEmpresa extends BackboneView {
    template!: string;
    app: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    representante: any;
    poder: any;

    constructor(options: AsistenciasEmpresaOptions = {}) {
        super(options);
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.representante = void 0;
        this.poder = void 0;
    }

    initialize() {
        this.representante = void 0;
        this.poder = void 0;
    }

    back_lista(event: Event) {
        event.preventDefault();
        if (this.app && this.app.router) {
            this.app.router.navigate('listar', { trigger: true, replace: true });
        }
    }

    events() {
        return {
            'click #bt_back': 'back_lista',
        };
    }

    render() {
        this.representante = this.collection[0];
        this.poder = this.collection[1];
        // Template ya inicializado en el constructor
        const template = _.template(this.template);
        this.el.innerHTML = template({
            empresa: this.model.toJSON(),
            representante: this.representante ? this.representante.toJSON() : false,
            poder: this.poder ? this.poder.toJSON() : false,
        });
        return this;
    }
}
