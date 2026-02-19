import { BackboneView } from "@/common/Bone";

declare global {
    var $: any;
    var _: any;
    var $App: any;
    var Testeo: any;
    var Representante: any;
    var create_url: (path: string) => string;
    var SubNavRepresentantes: any;
}

interface RepresentanteCrearOptions {
    isNew: boolean;
    [key: string]: any;
}

export default class RepresentanteCrear extends BackboneView {
    isNew: boolean;
    template!: string;
    model: any;
    $el: any;
    subNavView: any;

    constructor({ isNew, ...options }: RepresentanteCrearOptions) {
        super(options);
        this.isNew = isNew;
    }

    initialize() {
        this.template = $('#tmp_crear').html();
    }

    get events() {
        return {
            'click #btn_back_list': 'backlist',
            'click #bt_guardar': 'guardarData',
            "focusout [name='cedrep']": 'changeCedrep',
            "focusout [name='nit']": 'changeNit',
        };
    }

    render() {
        let template = _.template(this.template);
        this.$el.html(
            template({
                representante: this.model.toJSON(),
                isNew: this.isNew,
                title: this.isNew ? 'Crear Representante' : 'Editar Representante',
            })
        );
        this.subNav();
        return this;
    }

    changeCedrep(e: any) {
        e.preventDefault();
        let value = this.$el.find(e.currentTarget).val();
        let _erro = Testeo.identi(value, 'cedrep', 5, 20);
        if (_erro) {
            $App.trigger('alert:error', 'La cedula del representante no es un valor valido');
            return false;
        }
        if (value) {
            this.trigger('valid:representante', {
                cedrep: parseInt(value),
                callback: (response: any) => {
                    if (response) {
                        this.$el.find('#bt_guardar').removeAttr('disabled');
                    }
                },
            });
        } else {
            this.$el.find('#bt_guardar').attr('disabled', true);
        }
    }

    changeNit(e: any) {
        e.preventDefault();
        var target = this.$el.find(e.currentTarget);
        let value = target.val();
        let _erro = Testeo.identi(value, 'nit', 5, 20);
        if (_erro) {
            $App.trigger('alert:error', 'El nit de la empresa no es un valor valido');
            return false;
        }
        if (value) {
            this.trigger('search:empresa', {
                nit: parseInt(value),
                callback: (response: any) => {
                    if (response) {
                        const { empresa } = response;
                        $App.trigger('confirma', {
                            message: `La empresa ${empresa.razsoc} ya está registrada y con representante legal, desea continuar el cambio de representante ${empresa.repleg} y la cedula ${empresa.cedrep}`,
                            callback: (status: boolean) => {
                                if (status == false) {
                                    target.val('');
                                }
                            },
                        });
                    } else {
                        target.val('');
                    }
                },
            });
        }
    }

    guardarData(e: any) {
        e.preventDefault();
        let clave = this.getInput('clave');
        let err = Testeo.numerico(clave, 'clave');
        if (err) {
            $App.trigger('alert:error', 'Error con el valor númerico de la clave ' + err);
            this.setInput('clave', '');
            return false;
        }

        err = Testeo.identi(clave, 'clave', 5, 12);
        if (err) {
            $App.trigger('alert:error', err);
            return false;
        }

        var target = this.$el.find(e.currentTarget);
        target.attr('disabled', true);
        let model: any;
        if (this.isNew) {
            model = new Representante({
                cedrep: this.getInput('cedrep'),
                nombre: this.getInput('nombre'),
                clave: this.getInput('clave'),
                acepta_politicas: this.getCheck('acepta_politicas'),
                representa_existente: this.getCheck('representa_existente'),
                tiene_soportes: this.getCheck('tiene_soportes'),
                nit: this.getInput('nit'),
            });
        } else {
            model = this.model;
            model.set({
                cedrep: this.getInput('cedrep'),
                nombre: this.getInput('nombre'),
                clave: this.getInput('clave'),
                acepta_politicas: this.getCheck('acepta_politicas'),
            });
        }

        if (!model.isValid()) {
            let errors = model.validationError;
            setTimeout(() => {
                $('.error').html('');
            }, 3000);

            $App.trigger('alert:error', errors);

            target.removeAttr('disabled');
        } else {
            let url: string;
            if (this.isNew) {
                url = create_url('representantes/crear');
            } else {
                url = create_url('representantes/editar/' + this.model.get('cedrep'));
            }

            $App.trigger('syncro', {
                url,
                data: model.toJSON(),
                callback: (response: any) => {
                    target.removeAttr('disabled');
                    if (response.success) {
                        if (response.representante === false) {
                            $App.trigger('alert:error', response.msj);
                            this.$el.find('input').val('');
                        } else {
                            model.set('id', response.representante.id);
                            this.trigger('add:representante', model);
                            $App.trigger('success', response.msj);
                            this.$el.find('input').val('');
                        }
                    }
                },
            });
        }
        return false;
    }

    backlist(e: any) {
        e.preventDefault();
        this.remove();
        $App.router.navigate('listar', { trigger: true, replace: true });
        return false;
    }

    subNav() {
        this.subNavView = new SubNavRepresentantes({
            model: this.model,
            dataToggle: {
                listar: true,
                crear: false,
                editar: false,
            },
        }).render();
        this.$el.find('#showSubnav').html(this.subNavView.$el);
        (SubNavRepresentantes as any).parentView = this;
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
}
