import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';
import { Utils } from "@/core/Utils";
import detalleConsenso from "@/componentes/asamblea/templates/detalleConsenso.hbs?raw";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var create_url: (path: string) => string;
}

interface ConsensoDetalleOptions {
	model?: any;
	App?: AppInstance;
	[key: string]: any;
}

export default class ConsensoDetalle extends BackboneView {
	App: AppInstance;
	template: string;

	constructor(options: ConsensoDetalleOptions = {}) {
		super({ ...options, className: 'box', id: 'box_detalle_consenso' });
		this.App = options.App || options.AppInstance;
	}

	initialize(): void {
		this.template = $('#tmp_detalle_consenso').html();
	}

	render(): this {
		const _template = _.template(this.template);
		this.$el.html(_template({ consenso: this.model.toJSON() }));
		this.$el.find('#estado_consenso').bootstrapSwitch();
		return this;
	}

	get events() {
		return {
			'click #bt_borrar_consenso': 'borrarConsenso',
			'click #bt_edit_consenso': 'edit_consenso',
			'switchChange.bootstrapSwitch #estado_consenso': 'changeEstadoConsenso',
		};
	}

	/**
	 * Cambiar estado del consenso
	 */
	changeEstadoConsenso(e: Event): void {
		const $input = this.$el.find(e.currentTarget);

		if ($input.is(':checked')) {
			if (this.model.get('estado') == 'A') return;

			this.App.trigger('confirma', {
				message: 'Se requiere de confirmar si desea activar el consenso.',
				callback: (continuar: boolean) => {
					if (continuar) {
						this.App.trigger('syncro', {
							url: Utils.getURL('admin/consenso_activar/' + this.model.get('id') + '/A'),
							data: {},
							callback: (response: any) => {
								if (response) {
									if (response.success) {
										this.model.set('estado', 'A');
										this.$el.find('#show_estado_text').text('ACTIVO');
										this.App.trigger('alert:success', response.msj);

										// Actualizar tabla de consensos
										this.updateConsensosTable(response.consensos);
									} else {
										this.App.trigger('alert:error', response.msj);
									}
								}
							},
						});
					} else {
						this.$el.find('#estado_consenso').trigger('click');
					}
				},
			});
		} else {
			if (this.model.get('estado') == 'A') {
				this.App.trigger('confirma', {
					message: 'Se requiere de confirmar si desea inactivar el consenso.',
					callback: (continuar: boolean) => {
						if (continuar) {
							this.App.trigger('syncro', {
								url: Utils.getURL('admin/consenso_activar/' + this.model.get('id') + '/I'),
								data: {},
								callback: (response: any) => {
									if (response) {
										if (response.success) {
											this.model.set('estado', 'I');
											this.$el.find('#show_estado_text').text('INACTIVO');
											this.App.trigger('alert:success', response.msj);

											// Actualizar tabla de consensos
											this.updateConsensosTable(response.consensos);
										} else {
											this.App.trigger('alert:error', response.msj);
										}
									}
								},
							});
						} else {
							this.$el.find('#estado_consenso').trigger('click');
						}
					},
				});
			}
		}
	}

	/**
	 * Editar consenso
	 */
	edit_consenso(e: Event): void {
		e.preventDefault();
		console.log('ConsensoDetalle.edit_consenso() called');
		// Implementar lógica de edición
	}

	/**
	 * Borrar consenso
	 */
	borrarConsenso(e: Event): void {
		e.preventDefault();

		const close = $('#notice_modal').find('.close');
		this.App.trigger('confirma', {
			message: 'Se requiere de confirmar si desea borrar el consenso. Con todos los datos que le relacionen.',
			callback: (status: boolean) => {
				if (status) {
					this.App.trigger('syncro', {
						url: Utils.getURL('admin/borrar_consenso/' + this.model.get('id')),
						data: {},
						callback: (response: any) => {
							if (response) {
								if (response.success) {
									this.trigger('set:consensos', response.consensos);
									this.$el.find('#num_consensos').text(_.size($App.Collections.consensos));

									// Actualizar tabla de consensos
									this.updateConsensosTable($App.Collections.consensos.toJSON());

									this.App.trigger('alert:success', response.msj);
									close.trigger('click');
								} else {
									this.App.trigger('alert:error', response.msj);
									close.trigger('click');
								}
							}
						},
					});
				}
			},
		});
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
