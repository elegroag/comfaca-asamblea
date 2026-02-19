import { BackboneView } from "@/common/Bone";
import SubNavCartera from "./SubNavCartera";
import tmp_cargar_cartera from "../templates/tmp_cargar_cartera.hbs?raw";

declare global {
    var $App: any;
    var create_url: (path: string) => string;
    var loading: {
        show: () => void;
        hide: () => void;
    };
}

interface CargueMasivoCarteraOptions {
    model?: any;
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
    template: string;

    constructor(options?: CargueMasivoCarteraOptions) {
        super({ ...options, id: 'box_crear_carteras' });
        this.subNavCartera = null;
        this.template = tmp_cargar_cartera;
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

    hacerCargue(e: Event): void {
        e.preventDefault();
        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        $App.trigger('confirma', {
            message: 'Confirma que desea hacer el cargue masivo de cartera',
            callback: (status: boolean) => {
                if (status) {
                    const archivoInput = document.getElementById('archivo_cartera') as HTMLInputElement;
                    const archivo_cartera = archivoInput?.files;

                    if (!archivo_cartera || archivo_cartera.length === 0) {
                        this.setText('name_archivo', 'Seleccionar aquí...');
                        $App.trigger(
                            'alert:warning',
                            'Se requiere de seleccionar un archivo valido para hacer el cargue'
                        );
                        target.removeAttr('disabled');
                        return;
                    }

                    const form_data = new FormData();
                    form_data.append('file', archivo_cartera[0]);

                    $.ajax({
                        url: create_url('cartera/cargue_masivo'),
                        type: 'POST',
                        dataType: 'JSON',
                        cache: false,
                        data: form_data,
                        contentType: false,
                        processData: false,
                        beforeSend: function (xhr: JQueryXHR) {
                            loading.show();
                        },
                    } as any)
                        .done((salida: CargueResponse) => {
                            loading.hide();
                            target.removeAttr('disabled');
                            if (salida) {
                                if (salida.success) {
                                    $App.trigger(
                                        'success',
                                        `Ya se completo el cargue de cartera.\n
									Registrados: ${salida.creados}\n
									Cantidad: ${salida.filas}\n
									Fallos: ${salida.fallidos}\n
									Inactivas: ${salida.inactivas}`
                                    );
                                } else {
                                    $App.trigger('error', salida.msj);
                                }
                                this.setInput('archivo_cartera', '');
                                this.setText('name_archivo', 'Seleccionar aquí...');
                                this.$el.find('#remover_archivo').attr('disabled', 'true');
                            }
                        })
                        .fail((err: any) => {
                            loading.hide();
                            target.removeAttr('disabled');
                            $App.trigger('alert:error', err);
                            this.setInput('archivo_cartera', '');
                            this.setText('name_archivo', 'Seleccionar aquí...');
                            this.$el.find('#remover_archivo').attr('disabled', 'true');
                        });
                } else {
                    target.removeAttr('disabled');
                }
            },
        });
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
        }).render();
        this.$el.find('#showSubnav').html((this.subNavCartera as any).$el);
        (SubNavCartera as any).parentView = this;
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
