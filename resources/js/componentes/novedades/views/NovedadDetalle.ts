import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';
import detalle from "@/componentes/novedades/templates/detalle.hbs?raw";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var download_file: (response: any) => void;
}

interface NovedadDetalleOptions {
	model?: any;
	App?: AppInstance;
	[key: string]: any;
}

export default class NovedadDetalle extends BackboneView {
	App: AppInstance;
	template: string;

	constructor(options: NovedadDetalleOptions = {}) {
		super(options);
		this.App = options.App || options.AppInstance;
	}

	initialize(): void {
		this.template = $('#tmp_detalle').html();
	}

	get events() {
		return {
			'click #btn_back_list': 'backList',
			'click #bt_procesar': 'procesarNovedad',
		};
	}

	/**
	 * Volver a la lista
	 */
	backList(e: Event): void {
		e.preventDefault();
		this.remove();

		if ($App.router) {
			$App.router.navigate('listar', { trigger: true, replace: true });
		}
	}

	render(): this {
		const template = _.template(this.template);
		this.$el.html(template({ novedad: this.model.toJSON() }));
		return this;
	}

	/**
	 * Procesar novedad
	 */
	procesarNovedad(e: Event): void {
		e.preventDefault();

		if (this.App) {
			this.App.trigger('confirma', {
				message: 'Confirma que desea procesar el registro',
				callback: (status: boolean) => {
					if (status) {
						this.trigger('item:procesar', {
							model: this.model,
							callback: (response: any) => {
								if (response) {
									if (response.success) {
										this.App.trigger('alert:success', response.msj);

										if (typeof download_file === 'function') {
											download_file(response);
										}
									} else {
										this.App.trigger('alert:error', response.msj);
									}
								}
							},
						});
					}
				},
			});
		}
	}
}
