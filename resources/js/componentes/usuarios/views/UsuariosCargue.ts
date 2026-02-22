import { BackboneView } from "@/common/Bone";
import tmp_cargar_usuarios from "@/componentes/usuarios/templates/tmp_cargar_usuarios.hbs?raw";
import UsuarioService from "@/pages/Usuarios/UsuarioService";
import Loading from "@/common/Loading";

interface UsuariosCargueOptions {
    model?: any;
    collection?: any;
    api?: any;
    logger?: any;
    app?: any;
}

export default class UsuariosCargue extends BackboneView {
    template: string;
    api: any;
    logger: any;
    app: any;
    usuarioService: UsuarioService;

    constructor(options: UsuariosCargueOptions = {}) {
        super({ ...options, className: 'box', id: 'box_cargue_usuarios' });
        this.template = tmp_cargar_usuarios;
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;

        // Inicializar el servicio con las dependencias
        this.usuarioService = new UsuarioService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    initialize(): void {
        // Template ya está asignado en el constructor
    }

    render(): this {
        const template = _.template(this.template);
        this.$el.html(template());
        return this;
    }

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

        const archivoUploadElement = document.getElementById('archivo_usuarios') as HTMLInputElement;
        const archivoUpload = archivoUploadElement?.files;

        if (!archivoUpload || archivoUpload.length === 0) {
            target.removeAttr('disabled');
            return;
        }

        try {
            Loading.show();

            // Delegar al service para el cargue masivo
            const resultado = await this.usuarioService.cargarUsuariosApi(archivoUpload[0]);

            Loading.hide();

            if (resultado) {
                Swal.fire({
                    title: 'Notificación!',
                    text: `Ya se completó el cargue de los usuarios.\nRegistrados: ${resultado.creados || 0}\nCantidad: ${resultado.filas || 0}\nFallos: ${resultado.fallidos || 0}`,
                    confirmButtonText: 'Continuar!',
                });

                this.$el.find('#archivo_habiles').val('');
                this.$el.find('#name_archivo').text('Seleccionar aquí...');
                this.$el.find('#remover_archivo').attr('disabled', 'true');
            }
        } catch (error: any) {
            Loading.hide();
            Swal.fire({
                title: 'Error!',
                text: error.message || 'Ocurrió un error durante el cargue',
                confirmButtonText: 'Continuar!',
            });

            this.$el.find('#archivo_habiles').val('');
            this.$el.find('#name_archivo').text('Seleccionar aquí...');
            this.$el.find('#remover_archivo').attr('disabled', 'true');
        } finally {
            target.removeAttr('disabled');
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
