import { BackboneView } from "@/common/Bone";

import crear from "@/componentes/asamblea/templates/tmp_nuevo_consenso.hbs?raw";
import AsambleaService from "@/pages/Asamblea/AsambleaService";

interface ConsensoCrearOptions {
    model?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class ConsensoCrear extends BackboneView {
    template: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    asambleaService: AsambleaService;

    constructor(options: ConsensoCrearOptions = {}) {
        super({ ...options, className: 'box', id: 'box_nuevo_consenso' });
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.template = _.template(crear);
        this.asambleaService = new AsambleaService({
            api: this.api,
            logger: this.logger,
            app: this.App
        });
    }

    render(): this {
        const template = _.template(this.template);
        this.$el.html(template());
        return this;
    }

    get events() {
        return {
            'click #bt_crear_consenso': this.crear_consenso,
        };
    }

    /**
     * Crear nuevo consenso
     */
    async crear_consenso(e: Event): Promise<void> {
        e.preventDefault();

        const close = this.$el.find('#notice_modal').find('.close');

        if (this.App && typeof this.app.trigger === 'function') {
            this.app.trigger('confirma', {
                message: 'Se requiere de confirmar si desea registrar el consenso.',
                callback: async (status: boolean) => {
                    if (status) {
                        try {
                            const detalle = this.$el.find('[name="detalle"]').val();
                            const estado = this.$el.find('[name="estado"]').val();

                            // Validación básica
                            if (!detalle || detalle.trim() === '') {
                                this.app.trigger('alert:error', 'El detalle del consenso es requerido');
                                close.trigger('click');
                                return;
                            }

                            const consensoData = {
                                detalle: detalle,
                                estado: estado
                            };

                            const response = await this.asambleaService.__crearConsenso(consensoData);

                            if (response && response.success) {
                                // Actualizar consensos en el router
                                if (this.App && this.app.router && typeof this.app.router.set_consensos === 'function') {
                                    this.app.router.set_consensos(response.data);
                                }

                                // Actualizar contador
                                if (this.App && this.app.router && this.app.router.consensos) {
                                    const consensosCount = this.app.router.consensos.length || 0;
                                    this.$el.find('#num_consensos').text(consensosCount.toString());
                                }

                                // Agregar nueva fila a la tabla
                                this.addConsensosRow(response.data);

                                this.app.trigger('alert:success', 'El registro se completo con éxito.');
                                close.trigger('click');
                            } else {
                                this.app.trigger('alert:error', response.msj || 'Error al crear consenso');
                                close.trigger('click');
                            }
                        } catch (error: any) {
                            this.logger?.error('Error al crear consenso:', error);
                            this.app.trigger('alert:error', {
                                title: 'Error',
                                text: error.message || 'Error de conexión',
                                button: 'OK!'
                            });
                            close.trigger('click');
                        }
                    } else {
                        close.trigger('click');
                    }
                },
            });
        }
    }

    /**
     * Agregar fila de consenso a la tabla
     */
    private addConsensosRow(consenso: any): void {
        const tmp = _.template(`<tr>
            <td><%=detalle%></td>
            <td><%=estado%></td>
            <td><%=create_at%></td>
            <th>
                <button data-code='<%=id%>' class='btn btn-xs btn-primary' type='button' data-toggle='consenso'>
                    <i class='nc-icon nc-tap-01'></i>
                </button>
            </th>
        </tr>`);

        this.$el.find('#tb_data_consensos').append(tmp(consenso));
    }
}
