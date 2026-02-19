import { BackboneView } from "@/common/Bone";


interface PreregistroPresencialOptions {
    model?: any;
    App?: any;
    [key: string]: any;
}

export default class PreregistroPresencial extends BackboneView {
    template!: string;
    App: any;
    estado: any;

    constructor(options: PreregistroPresencialOptions = {}) {
        super({ ...options, className: 'box', id: 'box_preregistro_presencial', tagName: 'div' });
        this.App = options.App;
        this.estado = void 0;
    }

    initialize() {
        this.template = $('#tmp_cruzar_habil_preregistro_presencial').html();
        this.estado = void 0;
    }

    events() {
        return {
            'click #bt_cruce_preregistro': 'crucePreregistro',
        };
    }

    render() {
        let template = _.template(this.template);
        this.$el.html(template({ titulo: 'Preregistro Presencial' }));
        return this;
    }

    crucePreregistro(e: JQuery.Event) {
        e.preventDefault();
        var target = $(e.currentTarget);
        target.attr('disabled', true);

        $App.trigger('confirma', {
            message: 'Se requiere de confirmar si desea ejecutar el proceso.',
            callback: (success: boolean) => {
                if (success) {
                    let url = create_url('recepcion/cruzarHabilPreregistroPresencial');
                    loading.show();
                    axios
                        .get(url)
                        .then((salida: any) => {
                            loading.hide();
                            target.removeAttr('disabled');
                            if (salida.status == 200) {
                                Swal.fire({
                                    title: 'Notificación!',
                                    text: salida.data.msj,
                                    icon: 'success',
                                    button: 'Continuar!',
                                });
                            }
                        })
                        .catch(function (err: any) {
                            loading.hide();
                            target.removeAttr('disabled');
                            console.log(err);
                        });
                } else {
                    target.removeAttr('disabled');
                }
            },
        });
    }
}
