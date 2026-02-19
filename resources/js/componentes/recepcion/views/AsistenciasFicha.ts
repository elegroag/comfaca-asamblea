import { BackboneView } from "@/common/Bone";

interface AsistenciasFichaOptions {
    model?: any;
    collection?: any[];
    App?: any;
    [key: string]: any;
}

export default class AsistenciasFicha extends BackboneView {
    template!: string;
    App: any;
    poder: any;
    votos: any;
    empresas: any;

    constructor(options: AsistenciasFichaOptions = {}) {
        super(options);
        this.App = options.App;
        this.poder = void 0;
        this.votos = void 0;
        this.empresas = void 0;
    }

    initialize() {
        this.poder = void 0;
        this.votos = void 0;
        this.empresas = void 0;
        this.template = $('#tmp_ficha_ingreso').html();
    }

    render() {
        const { empresas, poder, votos } = this.collection[0];
        this.empresas = _.sortBy(empresas.toJSON(), 'asistente_estado');
        this.poder = poder;
        this.votos = votos;

        let _template = _.template(this.template);
        this.$el.html(
            _template({
                representante: this.model.toJSON(),
                empresas: this.empresas,
                poder: this.poder instanceof Poder ? this.poder.toJSON() : false,
                votos: this.votos,
            })
        );
        return this;
    }

    events() {
        return {
            'click #aplicar_unpoder': 'aplicar_unpoder',
            'click #ingreso_poder_manual': 'ingresoPoderManual',
            'click #bt_imprimir_ficha': 'imprimirFicha',
        };
    }

    imprimirFicha(e: JQuery.Event) {
        e.preventDefault();
        const cedrep = this.model.get('cedrep');
        const anchor = document.createElement('a');
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('href', create_url('recepcion/imprimir_ficha/' + cedrep));
        anchor.click();
    }

    ingresoPoderManual(e: JQuery.Event) {
        e.preventDefault();
        $(e.target).attr('disabled', true);
        const cedrep = this.model.get('cedrep');
        const nit_poder = this.poder.nit2;
        const documento_poder = this.poder.documento;

        const token = {
            cedrep,
            nit_poder,
            documento_poder,
        };

        $App.trigger('confirma', {
            message: 'Se requiere de confirmar si desea ingresar el poder al consenso.',
            callback: (success: boolean) => {
                if (success) {
                    const url = create_url('poderes/ingresar_poder');
                    $App.trigger('syncro', {
                        url,
                        data: token,
                        callback: (response: any) => {
                            $(e.target).removeAttr('disabled');
                            if (response.success) {
                                $App.trigger('success', 'El registro se completo con éxito.');
                                Backbone.history.loadUrl();
                            } else {
                                $App.trigger('error', 'Se ha generado un error interno y el registro no se completo.');
                            }
                        },
                    });
                } else {
                    return false;
                }
            },
        });
    }

    aplicar_unpoder(e: JQuery.Event) {
        e.preventDefault();
        alert('Opción pendiente para desarrollo. No se requiere de ninguna acción');
    }
}
