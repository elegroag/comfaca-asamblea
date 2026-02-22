import { BackboneView } from "@/common/Bone";
import RechazoService from "@/pages/Rechazos/RechazoService";
import masivo from "@/componentes/rechazos/templates/masivo.hbs?raw";

interface RechazoMasivoViewOptions {
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class RechazoMasivoView extends BackboneView {
    region: any;
    template: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    rechazoService: RechazoService;

    constructor(options: RechazoMasivoViewOptions) {
        super({
            ...options,
            className: 'box',
        });
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(masivo);
        this.rechazoService = new RechazoService({
            api: this.api,
            logger: this.logger,
            app: this.App
        });
    }

    /**
     * @override
     */
    get events() {
        return {
            "click [data-toggle-file='searchfile']": 'searchFile',
            'click #remover_archivo': 'removerArchivo',
            'click #bt_hacer_cargue': 'hacerCargue',
        };
    }

    async hacerCargue(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        target.attr('disabled', 'true');

        const cruzarData = this.$el.find("[name='cruzar_data']:checked").length;
        const archivoRechazos = (document.getElementById('archivo_rechazos') as HTMLInputElement).files;

        if (!archivoRechazos || archivoRechazos.length === 0) {
            target.removeAttr('disabled');
            return false;
        }

        const formData = new FormData();
        formData.append('file', archivoRechazos[0]);
        formData.append('cruzar', cruzarData.toString());

        try {
            const response = await this.rechazoService.__cargarMasivo(formData);

            target.removeAttr('disabled');

            if (response && response.success) {
                if (this.App && typeof this.App.trigger === 'function') {
                    this.App.trigger('alert:success', {
                        title: 'Notificación!',
                        text: `Ya se completo el cargue de los rechazos.\nRegistrados: ${response.data.creados}\nCantidad: ${response.data.filas}\nFallos: ${response.data.fallidos}`,
                        button: 'Continuar!'
                    });
                }

                // Limpiar formulario
                this.$el.find('#archivo_rechazos').val('');
                this.$el.find('#name_archivo').text('Seleccionar aquí...');
                this.$el.find('#remover_archivo').attr('disabled', 'true');
            } else {
                if (this.App && typeof this.App.trigger === 'function') {
                    this.App.trigger('alert:error', {
                        title: 'Error!',
                        text: response.msj || 'Error al cargar los rechazos',
                        button: 'Continuar!'
                    });
                }
            }
        } catch (error: any) {
            target.removeAttr('disabled');
            this.logger?.error('Error al cargar rechazos masivo:', error);
            if (this.App && typeof this.App.trigger === 'function') {
                this.App.trigger('alert:error', {
                    title: 'Error!',
                    text: 'Ocurrió un error al cargar los rechazos',
                    button: 'Continuar!'
                });
            }
        }
    }

    removerArchivo(e: Event) {
        e.preventDefault();
        this.$el.find('#archivo_rechazos').val('');
        this.$el.find('#name_archivo').text('Seleccionar aquí...');
        this.$el.find('#remover_archivo').attr('disabled', 'true');
        this.$el.find('#bt_hacer_cargue').attr('disabled', 'true');
    }

    searchFile(e: Event) {
        e.preventDefault();
        this.$el.find("[name='archivo_rechazos']").trigger('click');
    }
}
