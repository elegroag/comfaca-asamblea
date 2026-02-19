import { BackboneView } from "@/common/Bone";
import tmp_cargar_usuarios from "../templates/tmp_cargar_usuarios.hbs?raw";

declare global {
	var $: any;
	var _: any;
	var Swal: any;
	var create_url: (path: string) => string;
	var loading: {
		show: () => void;
		hide: () => void;
	};
}

interface UsuariosCargueOptions {
	model?: any;
	collection?: any;
}

export default class UsuariosCargue extends BackboneView {
	template: string;

	constructor(options: UsuariosCargueOptions = {}) {
		super({ ...options, className: 'box', id: 'box_cargue_usuarios' });
		this.template = tmp_cargar_usuarios;
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

	hacerCargue(e: Event): void {
		e.preventDefault();

		const target = $(e.currentTarget as HTMLElement);
		target.attr('disabled', 'true');

		const archivoUploadElement = document.getElementById('archivo_usuarios') as HTMLInputElement;
		const archivoUpload = archivoUploadElement?.files;

		if (!archivoUpload || archivoUpload.length === 0) {
			target.removeAttr('disabled');
			return;
		}

		const formData = new FormData();
		formData.append('file', archivoUpload[0]);

		const url = create_url('usuarios/cargueMasivo');

		$.ajax({
			url: url,
			method: 'POST',
			dataType: 'JSON',
			cache: false,
			data: formData,
			contentType: false,
			processData: false,
			beforeSend: (xhr: any) => {
				loading.show();
			},
		})
			.done((salida: any) => {
				loading.hide();

				if (salida) {
					Swal.fire({
						title: 'Notificación!',
						text: `Ya se completó el cargue de los usuarios.\nRegistrados: ${salida.creados || 0}\nCantidad: ${salida.filas || 0}\nFallos: ${salida.fallidos || 0}`,
						confirmButtonText: 'Continuar!',
					});

					this.$el.find('#archivo_habiles').val('');
					this.$el.find('#name_archivo').text('Seleccionar aquí...');
					this.$el.find('#remover_archivo').attr('disabled', 'true');
				}
			})
			.fail((err: any) => {
				loading.hide();
				Swal.fire({
					title: 'Error!',
					text: err.responseText || 'Ocurrió un error durante el cargue',
					confirmButtonText: 'Continuar!',
				});

				this.$el.find('#archivo_habiles').val('');
				this.$el.find('#name_archivo').text('Seleccionar aquí...');
				this.$el.find('#remover_archivo').attr('disabled', 'true');
			})
			.always(() => {
				target.removeAttr('disabled');
			});
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
