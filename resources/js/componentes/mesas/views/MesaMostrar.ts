import { BackboneView } from "@/common/Bone";
import tmp_mostrar_mesa from "../templates/tmp_mostrar_mesa.hbs?raw";

interface MesaMostrarOptions {
    model?: any;
    mesas_disponibles?: any;
    asa_usuario?: any;
    App?: any;
    api?: any;
    logger?: any;
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
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;

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
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
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

        if ($App.router) {
            $App.router.navigate('listar', { trigger: true, replace: true });
        }
    }

    vincularMesa(e: Event): void {
        e.preventDefault();

        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        if (!this.model) {
            console.error('Modelo no disponible');
            target.removeAttr('disabled');
            return;
        }

        if (!this.asa_usuario || typeof this.asa_usuario.get !== 'function') {
            console.error('Usuario no disponible o sin método get');
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
                    console.error('Mesas disponibles no disponible');
                    target.removeAttr('disabled');
                    return;
                }
            } else {
                console.error('Elemento mesa_select_codigo no encontrado');
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

        const url = create_url('admin/vincular_mesa');
        const mesaEstadoElement = this.$el.find('#mesa_estado');
        const token = [
            'cedtra=' + this.asa_usuario.get('cedtra'),
            'estado=' + (mesaEstadoElement.length ? mesaEstadoElement.val() : ''),
            'create_mesa=' + create_mesa,
            'mesa_id=' + mesa.get('id'),
            'mesa_codigo=' + mesa.get('codigo')
        ].join('&');

        axios.post(url, token)
            .then((salida: any) => {
                target.removeAttr('disabled');

                if (salida) {
                    console.log('Vinculación de mesa exitosa:', salida);
                    // Podrías agregar una notificación aquí si lo deseas
                } else {
                    console.warn('Respuesta vacía al vincular mesa');
                }
            })
            .catch((err: any) => {
                console.error('Error al vincular mesa:', err);
                target.removeAttr('disabled');
            });
    }
}
