import { BackboneView } from "@/common/Bone";
import detalle from "@/componentes/asamblea/templates/tmp_detalle_consenso.hbs?raw";
import AsambleaService from "@/pages/Asamblea/AsambleaService";

interface ConsensoDetalleOptions {
    model?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class ConsensoDetalle extends BackboneView {
    template: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    asambleaService: AsambleaService;

    constructor(options: ConsensoDetalleOptions = {}) {
        super({ ...options, className: 'box', id: 'box_detalle_consenso' });
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.template = _.template(detalle);
        this.asambleaService = new AsambleaService({
            api: this.api,
            logger: this.logger,
            app: this.App
        });
    }

    initialize(): void {
        // Template ya asignado en el constructor
    }

    render(): this {
        const template = _.template(this.template);
        const consensoData = this.model ? this.model.toJSON() : {};
        this.$el.html(template({ consenso: consensoData }));
        this.$el.find('#estado_consenso').bootstrapSwitch();
        return this;
    }

    get events() {
        return {
            'click #bt_borrar_consenso': this.borrarConsenso,
            'click #bt_edit_consenso': this.edit_consenso,
            'switchChange.bootstrapSwitch #estado_consenso': this.changeEstadoConsenso,
        };
    }

    /**
     * Cambiar estado del consenso
     */
    async changeEstadoConsenso(e: Event): Promise<void> {
        const target = this.$el.find(e.currentTarget);

        if (target.is(':checked')) {
            if (this.model.get('estado') == 'A') return;

            if (this.App && typeof this.app.trigger === 'function') {
                this.app.trigger('confirma', {
                    message: 'Se requiere de confirmar si desea activar el consenso.',
                    callback: async (continuar: boolean) => {
                        if (continuar) {
                            try {
                                const response = await this.asambleaService.__activarConsenso(this.model.get('id'), 'A');

                                if (response && response.success) {
                                    this.model.set('estado', 'A');
                                    this.$el.find('#show_estado_text').text('ACTIVO');
                                    this.app.trigger('alert:success', response.msj);

                                    // Actualizar tabla de consensos
                                    this.updateConsensosTable(response.consensos);
                                } else {
                                    this.app.trigger('alert:error', response.msj || 'Error al activar consenso');
                                }
                            } catch (error: any) {
                                this.logger?.error('Error al activar consenso:', error);
                                this.app.trigger('alert:error', {
                                    title: 'Error',
                                    text: error.message || 'Error de conexión',
                                    button: 'OK!'
                                });
                            }
                        } else {
                            this.$el.find('#estado_consenso').trigger('click');
                        }
                    },
                });
            }
        } else {
            if (this.model.get('estado') == 'A') {
                if (this.App && typeof this.app.trigger === 'function') {
                    this.app.trigger('confirma', {
                        message: 'Se requiere de confirmar si desea inactivar el consenso.',
                        callback: async (continuar: boolean) => {
                            if (continuar) {
                                try {
                                    const response = await this.asambleaService.__activarConsenso(this.model.get('id'), 'I');

                                    if (response && response.success) {
                                        this.model.set('estado', 'I');
                                        this.$el.find('#show_estado_text').text('INACTIVO');
                                        this.app.trigger('alert:success', response.msj);

                                        // Actualizar tabla de consensos
                                        this.updateConsensosTable(response.consensos);
                                    } else {
                                        this.app.trigger('alert:error', response.msj || 'Error al inactivar consenso');
                                    }
                                } catch (error: any) {
                                    this.logger?.error('Error al inactivar consenso:', error);
                                    this.app.trigger('alert:error', {
                                        title: 'Error',
                                        text: error.message || 'Error de conexión',
                                        button: 'OK!'
                                    });
                                }
                            } else {
                                this.$el.find('#estado_consenso').trigger('click');
                            }
                        },
                    });
                }
            }
        }
    }

    /**
     * Editar consenso
     */
    edit_consenso(e: Event): void {
        e.preventDefault();
        this.logger?.info('ConsensoDetalle.edit_consenso() called');
        // Implementar lógica de edición
    }

    /**
     * Borrar consenso
     */
    async borrarConsenso(e: Event): Promise<void> {
        e.preventDefault();

        const close = this.$el.find('#notice_modal').find('.close');

        if (this.App && typeof this.app.trigger === 'function') {
            this.app.trigger('confirma', {
                message: 'Se requiere de confirmar si desea borrar el consenso. Con todos los datos que le relacionen.',
                callback: async (status: boolean) => {
                    if (status) {
                        try {
                            const response = await this.asambleaService.__borrarConsenso(this.model.get('id'));

                            if (response && response.success) {
                                this.trigger('set:consensos', response.consensos);

                                // Actualizar contador
                                if (this.App && this.app.Collections && this.app.Collections.consensos) {
                                    const consensosCount = this.app.Collections.consensos.length || 0;
                                    this.$el.find('#num_consensos').text(consensosCount.toString());
                                }

                                // Actualizar tabla de consensos
                                if (this.App && this.app.Collections && this.app.Collections.consensos) {
                                    this.updateConsensosTable(this.app.Collections.consensos.toJSON());
                                }

                                this.app.trigger('alert:success', response.msj);
                                close.trigger('click');
                            } else {
                                this.app.trigger('alert:error', response.msj || 'Error al borrar consenso');
                                close.trigger('click');
                            }
                        } catch (error: any) {
                            this.logger?.error('Error al borrar consenso:', error);
                            this.app.trigger('alert:error', {
                                title: 'Error',
                                text: error.message || 'Error de conexión',
                                button: 'OK!'
                            });
                            close.trigger('click');
                        }
                    }
                },
            });
        }
    }

    /**
     * Actualizar tabla de consensos
     */
    private updateConsensosTable(consensos: any[]): void {
        const tmp = _.template(`<% _.each(consensos, function(consenso){ %>
            <tr>
                <td><%=consenso.detalle%></td>
                <td><%=consenso.estado%></td>
                <td><%=consenso.create_at%></td>
                <th>
                    <button data-code='<%=consenso.id%>' class='btn btn-xs btn-primary' type='button' data-toggle='consenso'>
                        <i class='nc-icon nc-tap-01'></i>
                    </button>
                </th>
            </tr>
        <% }) %>`);

        this.$el.find('#tb_data_consensos').html(tmp({ consensos: consensos }));
    }
}
