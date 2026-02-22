import { BackboneView } from "@/common/Bone";
import Empresa from "@/models/Empresa";
import EmpresaService from "@/pages/Habiles/EmpresaService";
import tmp_cargar_habiles from "@/componentes/habiles/templates/cargar_habiles.hbs?raw";

interface EmpresaMasivoViewOptions {
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class EmpresaMasivoView extends BackboneView {
    modelUse: any;
    id: string;
    template: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    empresaService: EmpresaService;

    constructor(options: EmpresaMasivoViewOptions = {}) {
        super({
            ...options,
            className: 'box',
        });
        this.modelUse = Empresa;
        this.id = 'box_masivo_habiles';
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(tmp_cargar_habiles);

        // Inicializar el servicio con las dependencias
        this.empresaService = new EmpresaService({
            api: this.api,
            App: this.app,
            logger: this.logger
        });
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

    async hacerCargue(e: Event): Promise<void> {
        e.preventDefault();
        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        try {
            const cruzarCartera = $("[name='cruzar_cartera']:checked").length;
            const archivoHabiles = (document.getElementById('archivo_habiles') as HTMLInputElement)?.files;

            if (!archivoHabiles || archivoHabiles.length === 0) {
                target.removeAttr('disabled');
                this.app?.trigger('alert:warning', { message: 'Se requiere seleccionar un archivo válido' });
                return;
            }

            const formData = new FormData();
            formData.append('file', archivoHabiles[0]);
            formData.append('cruzar_cartera', cruzarCartera.toString());

            // Mostrar loading si está disponible
            if (typeof (window as any).loading !== 'undefined') {
                (window as any).loading.show();
            }

            // Delegar al service para el cargue masivo
            this.trigger('file:upload', {
                formData,
                callback: (success: boolean, salida?: any) => {
                    if (typeof (window as any).loading !== 'undefined') {
                        (window as any).loading.hide();
                    }
                    target.removeAttr('disabled');

                    if (success && salida) {
                        Swal.fire({
                            title: 'Notificación!',
                            text: `Ya se completo el cargue de los habiles.\nRegistrados: ${salida.creados}\nCantidad: ${salida.filas}\nFallos: ${salida.fallidos}`,
                            icon: 'success',
                            confirmButtonText: 'Continuar!'
                        });
                        this.limpiarFormulario();
                    } else {
                        Swal.fire({
                            title: 'Error!',
                            text: (salida && (salida.msj || salida.message)) || 'Error desconocido',
                            icon: 'error',
                            confirmButtonText: 'Continuar!'
                        });
                        this.limpiarFormulario();
                    }
                },
            });
        } catch (error: any) {
            target.removeAttr('disabled');
            this.logger?.error('Error al hacer cargue masivo:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });

            if (typeof (window as any).loading !== 'undefined') {
                (window as any).loading.hide();
            }
        }
    }

    removerArchivo(e: Event): void {
        e.preventDefault();
        this.limpiarFormulario();
    }

    searchFile(e: Event): void {
        e.preventDefault();
        this.$el.find("[name='archivo_habiles']").trigger('click');
    }

    limpiarFormulario(): void {
        this.$el.find('#archivo_habiles').val('');
        this.$el.find('#name_archivo').text('Seleccionar aquí...');
        this.$el.find('#remover_archivo').attr('disabled', 'true');
        this.$el.find('#bt_hacer_cargue').attr('disabled', 'true');
    }
}
