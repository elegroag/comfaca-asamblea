import { BackboneView } from "@/common/Bone";
import tmp_usuarios_asa from "../templates/tmp_usuarios_asa.hbs?raw";

declare global {
	var $: any;
	var _: any;
	var Swal: any;
	var $App: any;
	var create_url: (path: string) => string;
}

interface UsuariosListarAsaOptions {
	model?: any;
	collection?: any;
}

export default class UsuariosListarAsa extends BackboneView {
	template: string;

	constructor(options: UsuariosListarAsaOptions = {}) {
		super({ ...options, className: 'box', id: 'box_usuarios' });
		this.template = tmp_usuarios_asa;
	}

	initialize(): void {
		// Template ya está asignado en el constructor
	}

	render(): this {
		const template = _.template(this.template);
		const modelData = this.model ? this.model.toJSON() : {};
		const collectionData = this.collection ? this.collection.toJSON() : [];

		$(this.el).html(template({
			asamblea: modelData,
			usuarios: collectionData,
		}));

		return this;
	}

	get events(): Record<string, (e: Event) => void> {
		return {
			"click button[data-toggle='detalle_poder']": this.detalle_poder,
			"click button[data-toggle='remove_usuario']": this.remove_usuario,
		};
	}

	remove_usuario(e: Event): void {
		e.preventDefault();

		const target = this.$el.find(e.currentTarget as HTMLElement);
		target.attr('disabled', 'true');

		const id = $(e.currentTarget as HTMLElement).attr('data-code') as string;

		if (!id) {
			console.error('ID de usuario no encontrado');
			target.removeAttr('disabled');
			return;
		}

		if ($App && typeof $App.trigger === 'function') {
			$App.trigger('confirma', {
				message: 'Se requiere de confirmar para borrar el registro seleccionado.',
				callback: (status: boolean) => {
					if (status) {
						const url = create_url('admin/remover_usuario/' + id);

						$App.trigger('syncro', {
							url,
							data: {},
							callback: (response: any) => {
								target.removeAttr('disabled');

								if (!response.usuario) {
									Swal.fire({
										title: 'Notificación!',
										text: response.errors || 'Error al eliminar usuario',
										icon: 'error',
										confirmButtonText: 'Continuar!',
									});
								} else {
									Swal.fire({
										title: 'Notificación!',
										text: 'La operación se completó con éxito',
										icon: 'success',
										confirmButtonText: 'Continuar!',
									});
								}

								setTimeout(() => {
									window.location.reload();
								}, 1000);
							},
						});
					} else {
						target.removeAttr('disabled');
					}
				},
			});
		} else {
			target.removeAttr('disabled');
		}
	}

	detalle_poder(e: Event): void {
		e.preventDefault();

		const documento = $(e.currentTarget as HTMLElement).attr('data-code') as string;

		if (!documento) {
			console.error('Documento no encontrado');
			return;
		}

		if ($App.router) {
			$App.router.navigate('mostrar/' + documento, { trigger: true, replace: true });
		}
	}
}
