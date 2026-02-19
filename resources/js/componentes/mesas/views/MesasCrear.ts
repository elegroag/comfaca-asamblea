import { BackboneView } from "@/common/Bone";
import tmp_mesas_crear from "../templates/tmp_mesas_crear.hbs?raw";

declare global {
	var $: any;
	var _: any;
	var moment: any;
	var Swal: any;
	var create_url: (path: string) => string;
	var loading: {
		show: () => void;
		hide: () => void;
	};
	var axios: {
		get: (url: string) => Promise<any>;
		post: (url: string, data: any) => Promise<any>;
	};
	var _model: {
		poder: any;
	};
	var $App: any;
}

interface MesasCrearOptions {
	model?: any;
	isNew?: boolean;
}

export default class MesasCrear extends BackboneView {
	template: string;
	isNew: boolean;

	constructor(options: MesasCrearOptions = {}) {
		super({ ...options, id: 'box_crear_mesas' });
		this.template = tmp_mesas_crear;
		this.isNew = options.isNew !== false; // true por defecto
	}

	initialize(): void {
		// Template ya está asignado en el constructor
	}

	render(): this {
		const template = _.template(this.template);
		this.$el.html(template({ isNew: this.isNew }));

		// Establecer fecha actual si existe el campo
		this.$el.find("[name='fecha']").val(moment().format('DD-MM-YYYY'));

		return this;
	}

	get events(): Record<string, (e: Event) => void> {
		return {
			'click #btn_back_list': this.closeForm,
			'click #btn_validar_poder': this.crearUsuario,
		};
	}

	crearUsuario(e: Event): boolean {
		e.preventDefault();

		const target = $(e.currentTarget as HTMLElement);
		target.attr('disabled', 'true');

		const apoderado_nit = $("[name='apoderado_nit']").val() as string;
		const apoderado_cedula = $("[name='apoderado_cedula']").val() as string;
		const poderdante_nit = $("[name='poderdante_nit']").val() as string;
		const poderdante_cedula = $("[name='poderdante_cedula']").val() as string;
		const radicado = $("[name='radicado']").val() as string;

		const model = new _model.poder({
			nit1: apoderado_nit,
			cedrep1: apoderado_cedula,
			nit2: poderdante_nit,
			cedrep2: poderdante_cedula,
			radicado: radicado,
		});

		if (apoderado_nit === poderdante_nit) {
			Swal.fire({
				title: 'Alerta!',
				text: 'La empresa poderdante no puede ser la misma empresa apoderada.',
				icon: 'error',
				confirmButtonText: 'Continuar!',
			});
			target.removeAttr('disabled');
			return false;
		}

		if (!model.isValid()) {
			const errors = model.validationError;
			console.error('Errores de validación:', errors);

			setTimeout(() => {
				$('.error').html('');
			}, 3000);

			target.removeAttr('disabled');
		} else {
			const token = `nit1=${apoderado_nit}&cedrep1=${apoderado_cedula}&nit2=${poderdante_nit}&cedrep2=${poderdante_cedula}&radicado=${radicado}`;
			const url = create_url('poderes/validacion_previa');

			loading.show();

			axios.post(url, token)
				.then((salida: any) => {
					loading.hide();
					target.removeAttr('disabled');

					if (salida.status === 200) {
						if (salida.data.poder === false) {
							this.$el.find('input').val('');
							Swal.fire({
								title: 'Notificación!',
								text: salida.data.errors,
								icon: 'error',
								confirmButtonText: 'Continuar!',
							});
						} else {
							const poderModel = new _model.poder(salida.data.poder);
							$App.router.set_poderes(poderModel);
							Swal.fire({
								title: 'Notificación!',
								text: salida.data.msj,
								icon: 'success',
								confirmButtonText: 'Continuar!',
							});
							this.$el.find('input').val('');
						}
					}
				})
				.catch((err: any) => {
					loading.hide();
					target.removeAttr('disabled');
					console.error('Error en validación previa:', err);
					Swal.fire({
						title: 'Error!',
						text: 'Ocurrió un error al procesar la solicitud',
						icon: 'error',
						confirmButtonText: 'Continuar!',
					});
				});
		}

		return false;
	}

	closeForm(e: Event): boolean {
		e.preventDefault();
		this.remove();

		if ($App.router) {
			$App.router.navigate('listar', { trigger: true, replace: true });
		}

		return false;
	}
}
