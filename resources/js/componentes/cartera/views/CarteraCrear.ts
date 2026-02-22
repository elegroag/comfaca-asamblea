import { BackboneView } from "@/common/Bone";
import Cartera from "@/models/Cartera";
import SubNavCartera from "./SubNavCartera";
import tmp_crear_cartera from "@/componentes/cartera/templates/tmp_crear_cartera.hbs?raw";
import CarteraService from "@/pages/Cartera/CarteraService";

interface CarteraCrearOptions {
    model: Cartera;
    isNew: boolean;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
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

export default class CarteraCrear extends BackboneView {
    isNew: boolean;
    subNavCartera: SubNavCartera | null;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    carteraService: CarteraService;

    constructor(options: CarteraCrearOptions) {
        super({
            ...options,
            id: 'box_crear_carteras',
            className: 'box'
        });
        this.isNew = options.isNew;
        this.subNavCartera = null;
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(tmp_crear_cartera);

        // Inicializar el servicio con las dependencias
        this.carteraService = new CarteraService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
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

        // Validación básica sin dependencia externa
        if (!nit || nit.length < 4 || nit.length > 20) {
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('alert:error', { message: 'El NIT debe tener entre 4 y 20 dígitos' });
            }
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
                        if (this.app && typeof this.app.trigger === 'function') {
                            this.app.trigger('alert:info', response.msj);
                        }
                    } else {
                        if (this.app && typeof this.app.trigger === 'function') {
                            this.app.trigger('alert:warning', response.msj);
                        }
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
        if (this.app && this.app.router) {
            this.app.router.navigate('listar', { trigger: true, replace: true });
        }
    }

    async guardarRegistro(e: Event): Promise<void> {
        e.preventDefault();
        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        try {
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
                this.app?.trigger('alert:error', errors.join(', '));
                return;
            }

            // Confirmación con SweetAlert
            const result = await Swal.fire({
                title: 'Confirmar',
                text: 'Confirma la acción de guardar el registro de cartera',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, guardar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                // Delegar al service para guardar
                const response = await this.carteraService.__saveCartera(this.model.toJSON() as any);

                if (response?.success) {
                    if (Object.keys(response as any).includes('cartera')) {
                        _.each((response as any).cartera, (value: any, key: string) => this.model.set(key, value));
                        this.trigger('add:cartera', this.model);
                        this.remove();
                        if (this.app?.router) {
                            this.app.router.navigate('listar', { trigger: true, replace: true });
                        }
                    }
                    if ((response as any).isValid === true) {
                        this.app?.trigger('success', (response as any).msj);
                    } else {
                        this.app?.trigger('error', (response as any).msj);
                    }
                } else {
                    this.app?.trigger('error', (response as any)?.msj || 'Error al guardar');
                    this.setInput('nit', '');
                    this.setInput('concepto', '');
                    this.setInput('codigo', '');
                    this.setInput('razsoc', '');
                    this.setInput('repleg', '');
                    this.setInput('cedrep', '');
                }
            }
        } catch (error: any) {
            this.logger?.error('Error al guardar cartera:', error);
            this.app?.trigger('error', error.message || 'Error de conexión');
        } finally {
            target.removeAttr('disabled');
        }
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

