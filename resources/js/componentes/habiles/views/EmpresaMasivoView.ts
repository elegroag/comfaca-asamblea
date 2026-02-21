import { BackboneView } from "@/common/Bone";


export default class EmpresaMasivoView extends BackboneView {
    modelUse: any;
    id: string;
    template: any;

    constructor(options: any) {
        super({
            ...options,
            className: 'box',
        });
        this.modelUse = Empresa;
        this.id = 'box_masivo_habiles';
        this.template = _.template($('#tmp_cargar_habiles').html() || '');
    }

    /**
     * @override
     */
    get events(): Record<string, (e: Event) => void> {
        return {
            "click [data-toggle-file='searchfile']": this.searchFile,
            'click #remover_archivo': this.removerArchivo,
            'click #bt_hacer_cargue': this.hacerCargue,
        };
    }

    hacerCargue(e: Event): void {
        e.preventDefault();
        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        const cruzarCartera = $("[name='cruzar_cartera']:checked").length;
        const archivoHabiles = (document.getElementById('archivo_habiles') as HTMLInputElement)?.files;

        if (!archivoHabiles || archivoHabiles.length === 0) {
            target.removeAttr('disabled');
            return;
        }

        const formData = new FormData();
        formData.append('file', archivoHabiles[0]);
        formData.append('cruzar_cartera', cruzarCartera.toString());

        if (typeof this.trigger === 'function') {
            if (loading) loading.show();
            this.trigger('file:upload', {
                formData,
                callback: (success: boolean, salida?: any) => {
                    if (loading) loading.hide();
                    target.removeAttr('disabled');
                    if (success && salida) {
                        if (Swal) {
                            Swal.fire({
                                title: 'Notificación!',
                                text: `Ya se completo el cargue de los habiles.\nRegistrados: ${salida.creados}\nCantidad: ${salida.filas}\nFallos: ${salida.fallidos}`,
                                button: 'Continuar!',
                            });
                        }
                        this.$el.find('#archivo_habiles').val('');
                        this.$el.find('#name_archivo').text('Seleccionar aquí...');
                        this.$el.find('#remover_archivo').attr('disabled', 'true');
                    } else {
                        if (Swal) {
                            Swal.fire({
                                title: 'Error!',
                                text: (salida && (salida.msj || salida.message)) || 'Error desconocido',
                                button: 'Continuar!',
                            });
                        }
                        this.$el.find('#archivo_habiles').val('');
                        this.$el.find('#name_archivo').text('Seleccionar aquí...');
                        this.$el.find('#remover_archivo').attr('disabled', 'true');
                    }
                },
            });
        }
    }

    removerArchivo(e: Event): void {
        e.preventDefault();
        this.$el.find('#archivo_habiles').val('');
        this.$el.find('#name_archivo').text('Seleccionar aquí...');
        this.$el.find('#remover_archivo').attr('disabled', 'true');
        this.$el.find('#bt_hacer_cargue').attr('disabled', 'true');
    }

    searchFile(e: Event): void {
        e.preventDefault();
        this.$el.find("[name='archivo_habiles']").trigger('click');
    }
}
