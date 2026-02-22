import { BackboneView } from "@/common/Bone";
import SubNavCartera from "./SubNavCartera";
import CarteraService from "@/pages/Cartera/CarteraService";
import tmp_cargar_cartera from "@/componentes/cartera/templates/tmp_cargar_cartera.hbs?raw";

interface CargueMasivoCarteraOptions {
    model?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
}

interface CargueResponse {
    success: boolean;
    creados?: number;
    filas?: number;
    fallidos?: number;
    inactivas?: number;
    msj?: string;
}

class CargueMasivoCartera extends BackboneView {
    subNavCartera: SubNavCartera | null;
    template: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    carteraService: CarteraService;

    constructor(options?: CargueMasivoCarteraOptions) {
        super({ ...options, id: 'box_crear_carteras' });
        this.subNavCartera = null;
        this.template = _.template(tmp_cargar_cartera);
        this.api = options?.api;
        this.logger = options?.logger;
        this.app = options?.app;
        this.storage = options?.storage;
        this.carteraService = new CarteraService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    get className(): string {
        return 'box';
    }

    initialize(): void {
        this.template = tmp_cargar_cartera;
    }

    get events(): Record<string, (e: Event) => void> {
        return {
            "click [data-toggle-file='searchfile']": this.searchFile,
            'click #remover_archivo': this.removerArchivo,
            'click #bt_hacer_cargue': this.hacerCargue,
        };
    }

    render(): CargueMasivoCartera {
        const template = _.template(this.template);
        this.$el.html(template());
        this.subNav();
        return this;
    }

    async hacerCargue(e: Event): Promise<void> {
        e.preventDefault();
        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        try {
            // Confirmación con SweetAlert
            const result = await Swal.fire({
                title: 'Confirmar',
                text: 'Confirma que desea hacer el cargue masivo de cartera',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, cargar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                const archivoInput = document.getElementById('archivo_cartera') as HTMLInputElement;
                const archivo_cartera = archivoInput?.files;

                if (!archivo_cartera || archivo_cartera.length === 0) {
                    this.setText('name_archivo', 'Seleccionar aquí...');
                    this.app?.trigger(
                        'alert:warning',
                        'Se requiere de seleccionar un archivo valido para hacer el cargue'
                    );
                    return;
                }

                const form_data = new FormData();
                form_data.append('file', archivo_cartera[0]);

                // Delegar al servicio pero manteniendo el callback existente
                this.carteraService.__uploadMasivo({
                    formData: form_data,
                    callback: (success: boolean, response: any) => {
                        if (success && response) {
                            this.app?.trigger(
                                'success',
                                `Ya se completo el cargue de cartera.\n
								Registrados: ${response.creados || 0}\n
								Cantidad: ${response.filas || 0}\n
								Fallos: ${response.fallidos || 0}\n
								Inactivas: ${response.inactivas || 0}`
                            );
                        } else {
                            this.app?.trigger('error', response?.msj || 'Error en el cargue');
                        }
                        this.setInput('archivo_cartera', '');
                        this.setText('name_archivo', 'Seleccionar aquí...');
                        this.$el.find('#remover_archivo').attr('disabled', 'true');
                    }
                });
            }
        } catch (error: any) {
            this.logger?.error('Error en cargue masivo:', error);
            this.app?.trigger('error', error.message || 'Error de conexión');
        } finally {
            target.removeAttr('disabled');
        }
    }

    removerArchivo(e: Event): void {
        e.preventDefault();
        this.$el.find('#archivo_cartera').val('');
        this.$el.find('#name_archivo').text('Seleccionar aquí...');
        this.$el.find('#remover_archivo').attr('disabled', 'true');
        this.$el.find('#bt_hacer_cargue').attr('disabled', 'true');
    }

    searchFile(e: Event): void {
        e.preventDefault();
        this.$el.find("[name='archivo_cartera']").trigger('click');
    }

    subNav(): void {
        this.subNavCartera = new SubNavCartera({
            model: this.model,
            dataToggle: {
                listar: true,
                crear: true,
                editar: false,
                masivo: false,
                exportar: false,
            },
            api: this.api,
            logger: this.logger,
            app: this.app,
            parentView: this,
            router: this.app?.router
        }).render();
        this.$el.find('#showSubnav').html((this.subNavCartera as any).$el);
    }

    getInput(selector: string): string {
        return this.$el.find(`[name='${selector}']`).val() as string;
    }

    setInput(selector: string, val: string | number | null): void {
        this.$el.find(`[name='${selector}']`).val(val ?? '');
    }

    setText(selector: string, val: string | number | null): void {
        this.$el.find(`[id='${selector}']`).text(val ?? '');
    }

    remove(): CargueMasivoCartera {
        if (this.subNavCartera) this.subNavCartera.remove();
        (Backbone as any).View.prototype.remove.call(this);
        return this;
    }
}

export default CargueMasivoCartera;
