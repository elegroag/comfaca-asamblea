import { BackboneView } from "@/common/Bone";
import $App from "@/core/App";
import { Testeo } from "@/core/Testeo";
import Cartera from "@/models/Cartera";
import SubNavCartera from "./SubNavCartera";
import tmp_crear_cartera from "../templates/tmp_crear_cartera.hbs?raw";

declare global {
    var create_url: (path: string) => string;
}

interface CarteraCrearOptions {
    model: Cartera;
    isNew: boolean;
}

interface EmpresaResponse {
    empresa?: {
        nit: string;
        cedrep: string;
        razsoc: string;
        repleg: string;
    };
    isValid?: boolean;
    msj?: string;
}

class CarteraCrear extends BackboneView {
    isNew: boolean;
    subNavCartera: SubNavCartera | null;

    constructor(options: CarteraCrearOptions) {
        super({ ...options, id: 'box_crear_carteras' });
        this.isNew = options.isNew;
        this.subNavCartera = null;
        this.template = tmp_crear_cartera;
    }

    get className(): string {
        return 'box';
    }

    initialize(): void {
        this.template = $('#tmp_crear_cartera').html();
    }

    get events(): Record<string, (e: Event) => void> {
        return {
            'click #bt_salir': this.closeForm,
            'click #bt_registrar': this.guardarRegistro,
            'keypress #nit': (e: Event) => this.keyBuscarEmpresa(e as KeyboardEvent),
            'click #bt_buscar_empresa': this.buscarEmpresa,
        };
    }

    render(): CarteraCrear {
        const template = _.template(this.template);
        const options: Record<string, string> = { '': 'Selecciona aquí', A: 'APORTES', S: 'SERVICIOS', L: 'LIBRANZA' };

        this.$el.html(
            template({
                cartera: this.model.toJSON(),
                title: this.isNew ? 'Crear Registro Cartera' : 'Editar Registro',
                isNew: this.isNew,
                options,
            })
        );
        this.subNav();
        return this;
    }

    keyBuscarEmpresa(e: KeyboardEvent): void {
        const keycode = e.keyCode ? e.keyCode : e.which;
        if (keycode === 13) {
            this.$el.find('#bt_buscar_empresa').trigger('click');
        }
    }

    buscarEmpresa(e: Event): void {
        e.preventDefault();
        const nit = this.getInput('nit');
        const error = Testeo.identi(nit, 'nit', 4, 20);

        if (error) {
            $App.trigger('alert:error', error);
            return;
        }

        this.trigger('search:empresa', {
            nit: nit,
            callback: (response: EmpresaResponse | false) => {
                if (response) {
                    if (Object.keys(response).includes('empresa')) {
                        this.setInput('nit', response.empresa!.nit);
                        this.setInput('cedrep', response.empresa!.cedrep);
                        this.setInput('razsoc', response.empresa!.razsoc);
                        this.setInput('repleg', response.empresa!.repleg);
                    }
                    if (response.isValid === true) {
                        $App.trigger('alert:info', response.msj);
                    } else {
                        $App.trigger('alert:warning', response.msj);
                    }
                    this.$el.find('#bt_registrar').removeAttr('disabled');
                } else {
                    this.setInput('cedrep', '');
                    this.setInput('repleg', '');
                    this.setInput('razsoc', '');
                }
            },
        });
    }

    closeForm(e: Event): void {
        e.preventDefault();
        this.remove();
        $App.router.navigate('listar', { trigger: true, replace: true });
    }

    guardarRegistro(e: Event): void {
        e.preventDefault();
        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        const cruzar_habiles = this.getCheck('cruzar_habiles');
        const nit = this.getInput('nit');
        const concepto = this.getInput('concepto');
        const codigo = this.getInput('codigo');
        const razsoc = this.getInput('razsoc');
        const repleg = this.getInput('repleg');
        const cedrep = this.getInput('cedrep');

        this.model.set({
            nit,
            concepto,
            codigo,
            razsoc,
            repleg,
            cedrep,
            cruzar_habiles: cruzar_habiles,
        });

        if (!this.model.isValid()) {
            const errors = this.model.validationError;
            $App.trigger('alert:error', errors.join(', '));
            target.removeAttr('disabled');
            return;
        }

        $App.trigger('confirma', {
            message: 'Confirma la acción de guardar el registro de cartera',
            callback: (status: boolean) => {
                if (status) {
                    const url = this.isNew
                        ? create_url('cartera/crearCartera')
                        : create_url('cartera/actualizaCartera/' + this.model.get('id'));

                    $App.trigger('syncro', {
                        url,
                        data: this.model.toJSON(),
                        callback: (response: any) => {
                            target.removeAttr('disabled');
                            if (response?.success) {
                                if (Object.keys(response).includes('cartera')) {
                                    _.each(response.cartera, (value: any, key: string) => this.model.set(key, value));
                                    this.trigger('add:cartera', this.model);
                                    this.remove();
                                    $App.router.navigate('listar', { trigger: true, replace: true });
                                }
                                if (response.isValid === true) {
                                    $App.trigger('success', response.msj);
                                } else {
                                    $App.trigger('error', response.msj);
                                }
                            } else {
                                $App.trigger('error', response?.msj || 'Error al guardar');
                                this.setInput('nit', '');
                                this.setInput('concepto', '');
                                this.setInput('codigo', '');
                                this.setInput('razsoc', '');
                                this.setInput('repleg', '');
                                this.setInput('cedrep', '');
                            }
                        },
                    });
                } else {
                    target.removeAttr('disabled');
                }
            },
        });
    }

    searchFile(e: Event): void {
        e.preventDefault();
        this.$el.find("[name='archivo_cartera']").trigger('click');
    }

    getInput(selector: string): string {
        return this.$el.find(`[name='${selector}']`).val() as string;
    }

    setInput(selector: string, val: string | number | null): void {
        this.$el.find(`[name='${selector}']`).val(val ?? '');
    }

    getCheck(selector: string): number {
        return this.$el.find(`[name='${selector}']:checked`).length;
    }

    subNav(): void {
        this.subNavCartera = new SubNavCartera({
            model: this.model,
            dataToggle: {
                listar: true,
                crear: false,
                editar: false,
                masivo: true,
                exportar: false,
            },
        }).render();
        this.$el.find('#showSubnav').html((this.subNavCartera as any).$el);
        (SubNavCartera as any).parentView = this;
    }

    remove(): CarteraCrear {
        if (this.subNavCartera) this.subNavCartera.remove();
        (Backbone as any).View.prototype.remove.call(this);
        return this;
    }
}

export default CarteraCrear;
