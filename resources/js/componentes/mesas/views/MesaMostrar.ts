import { BackboneView } from "@/common/Bone";
import tmp_mostrar_mesa from "@/componentes/mesas/templates/tmp_mostrar_mesa.hbs?raw";
import MesasService from "@/pages/Mesas/MesasService";

interface MesaMostrarOptions {
    model?: any;
    mesas_disponibles?: any;
    asa_usuario?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class MesaMostrar extends BackboneView {
    template: any;
    asamblea: any;
    mesa: any;
    mesas_disponibles?: any;
    asa_usuario?: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    mesasService: MesasService;

    constructor(options: MesaMostrarOptions) {
        super({
            ...options,
            id: 'box_mostrar_mesa',
            className: 'box',
        });

        this.template = _.template(tmp_mostrar_mesa);
        this.asamblea = null;
        this.mesa = options.model;
        this.mesas_disponibles = options.mesas_disponibles;
        this.asa_usuario = options.asa_usuario;
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;

        // Inicializar el servicio con las dependencias
        this.mesasService = new MesasService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    initialize(): void {
        // Propiedades ya inicializadas en el constructor
    }

    render(): this {
        const template = _.template(this.template);
        const mesaData = this.model ? this.model.toJSON() : {};
        this.$el.html(template({ mesa: mesaData }));
        return this;
    }

    get events(): Record<string, (e: Event) => void> {
        return {
            'click #vincular_mesa': this.vincularMesa,
            'click #bt_back': this.back,
        };
    }

    back(e: Event): void {
        e.preventDefault();
        this.remove();

        if (this.app && this.app.router) {
            this.app.router.navigate('listar', { trigger: true, replace: true });
        }
    }

    async vincularMesa(e: Event): Promise<void> {
        e.preventDefault();

        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        try {
            if (!this.model) {
                this.logger?.error('Modelo no disponible');
                target.removeAttr('disabled');
                return;
            }

            if (!this.asa_usuario || typeof this.asa_usuario.get !== 'function') {
                this.logger?.error('Usuario no disponible o sin método get');
                target.removeAttr('disabled');
                return;
            }

            const user = this.model.toJSON();
            const $input = this.$el.find("[id='check_buscar_mesa']");
            let create_mesa = -1;
            let mesa: any;

            if ($input.length && $input.is(':checked')) {
                // Usar mesa existente
                const mesaSelectElement = this.$el.find('#mesa_select_codigo');
                if (mesaSelectElement.length) {
                    const mesaSelectCodigo = mesaSelectElement.val() as string;
                    (window as any).mesa_select_codigo = mesaSelectCodigo;

                    if (this.mesas_disponibles && typeof this.mesas_disponibles.get === 'function') {
                        mesa = this.mesas_disponibles.get({
                            id: parseInt(mesaSelectCodigo) || 0,
                        });
                    } else {
                        this.logger?.error('Mesas disponibles no disponible');
                        target.removeAttr('disabled');
                        return;
                    }
                } else {
                    this.logger?.error('Elemento mesa_select_codigo no encontrado');
                    target.removeAttr('disabled');
                    return;
                }
            } else {
                // Crear nueva mesa
                const mesaCodigoElement = this.$el.find('#mesa_codigo');
                const mesaEstadoElement = this.$el.find('#mesa_estado');

                if (mesaCodigoElement.length && mesaEstadoElement.length) {
                    // Crear mesa con datos básicos - sin dependencia global _model
                    mesa = {
                        get: (key: string) => {
                            const data: any = {
                                codigo: mesaCodigoElement.val(),
                                cedtra_responsable: user.cedtra,
                                estado: mesaEstadoElement.val(),
                                id: Date.now().toString() // ID temporal
                            };
                            return data[key];
                        },
                        toJSON: () => ({
                            codigo: mesaCodigoElement.val(),
                            cedtra_responsable: user.cedtra,
                            estado: mesaEstadoElement.val(),
                            id: Date.now().toString()
                        })
                    };
                    create_mesa = 1;
                } else {
                    this.logger?.error('Elementos del formulario no encontrados');
                    target.removeAttr('disabled');
                    return;
                }
            }

            if (!mesa || typeof mesa.get !== 'function') {
                this.logger?.error('Mesa no válida o sin método get');
                target.removeAttr('disabled');
                return;
            }

            // Delegar al service para vincular la mesa
            const response = await this.mesasService.__vincularMesa({
                mesa: mesa,
                usuario: this.asa_usuario,
                create_mesa: create_mesa
            });

            if (response?.success) {
                this.app?.trigger('alert:success', {
                    message: 'Mesa vinculada exitosamente'
                });
            } else {
                this.app?.trigger('alert:error', {
                    message: (response as any)?.msj || 'Error al vincular mesa'
                });
            }
        } catch (error: any) {
            this.logger?.error('Error al vincular mesa:', error);
            this.app?.trigger('alert:error', {
                message: error.message || 'Error de conexión'
            });
        } finally {
            target.removeAttr('disabled');
        }
    }
}
