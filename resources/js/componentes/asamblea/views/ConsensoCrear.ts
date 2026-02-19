import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';
import { Utils } from "@/core/Utils";
import nuevoConsenso from "@/componentes/asamblea/templates/nuevoConsenso.hbs?raw";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var create_url: (path: string) => string;
}

interface ConsensoCrearOptions {
	model?: any;
	App?: AppInstance;
	[key: string]: any;
}

export default class ConsensoCrear extends BackboneView {
	App: AppInstance;

	constructor(options: ConsensoCrearOptions = {}) {
		super({ ...options, className: 'box', id: 'box_nuevo_consenso' });
		this.App = options.App || options.AppInstance;
	}

	render(): this {
		const template = _.template($('#tmp_nuevo_consenso').html());
		this.$el.html(template());
		return this;
	}

	get events() {
		return {
			'click #bt_crear_consenso': 'crear_consenso',
		};
	}

	/**
	 * Crear nuevo consenso
	 */
	crear_consenso(e: Event): void {
		e.preventDefault();

		const close = $('#notice_modal').find('.close');

		this.App.trigger('confirma', {
			message: 'Se requiere de confirmar si desea registrar el consenso.',
			callback: (status: boolean) => {
				if (status) {
					const detalle = this.$el.find('[name="detalle"]').val();
					const estado = this.$el.find('[name="estado"]').val();
					const url = Utils.getURL('admin/crear_consenso');
					const token = { detalle, estado };

					this.App.trigger('syncro', {
						url: url,
						data: token,
						callback: (response: any) => {
							if (response) {
								if (response.success) {
									// Actualizar consensos en el router
									if ($App.router && typeof $App.router.set_consensos === 'function') {
										$App.router.set_consensos(response.asa_consenso);
									}

									// Actualizar contador
									$('#num_consensos').text(_.size($App.router.consensos));

									// Agregar nueva fila a la tabla
									this.addConsensosRow(response.asa_consenso);

									this.App.trigger('alert:success', 'El registro se completo con éxito.');
								}
								close.trigger('click');
							} else {
								close.trigger('click');
							}
						},
					});
				}
			},
		});
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

		$('#tb_data_consensos').append(tmp(consenso));
	}
}
