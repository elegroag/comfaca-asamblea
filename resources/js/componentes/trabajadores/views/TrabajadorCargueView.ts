import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var create_url: (path: string) => string;
	var loading: any;
	var Swal: any;
}

interface TrabajadorCargueViewOptions {
	[key: string]: any;
}

export default class TrabajadorCargueView extends BackboneView {
	template!: any;
	$el: any;

	constructor(options: TrabajadorCargueViewOptions) {
		super({
			...options,
			className: 'box',
		});
		this.template = _.template($('#tmp_cargar_trabajadores').html());
	}

	/**
	 * @override
	 */
	get events() {
		return {
			'click #bt_hacer_cargue': 'hacerCargue',
			"click [data-toggle-file='searchfile']": 'searchFile',
			'click #remover_archivo': 'removerArchivo',
		};
	}

	removerArchivo(e: any) {
		e.preventDefault();
		this.$el.find('#archivo_cargue').val('');
		this.$el.find('#name_archivo').text('Seleccionar aquí...');
		this.$el.find('#remover_archivo').attr('disabled', true);
		this.$el.find('#bt_hacer_cargue').attr('disabled', true);
	}

	hacerCargue(e: any) {
		e.preventDefault();
		const scope = this;
		const target = $(e.currentTarget);
		target.attr('disabled', true);
		const _cruzar_data = $("[name='cruzar_data']:checked").length;
		const archivo_cargue = (document.getElementById('archivo_cargue') as HTMLInputElement).files;

		if (archivo_cargue!.length == 0) {
			target.removeAttr('disabled');
			return false;
		}

		const form_data = new FormData();
		form_data.append('file', archivo_cargue![0]);
		form_data.append('cruzar', _cruzar_data);

		$.ajax({
			url: create_url('trabajadores/cargue_masivo'),
			method: 'POST',
			dataType: 'JSON',
			cache: false,
			data: form_data,
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
						text:
							'Ya se completo el cargue de los rechazos.\nRegistrados: ' +
							salida.creados +
							'\nCantidad: ' +
							salida.filas +
							'\nFallos: ' +
							salida.fallidos +
							'',
						button: 'Continuar!',
					});
					scope.$el.find('#archivo_cargue').val('');
					scope.$el.find('#name_archivo').text('Seleccionar aquí...');
					scope.$el.find('#remover_archivo').attr('disabled', true);
				}
			})
			.fail((err: any) => {
				loading.hide();
				Swal.fire({
					title: 'Error!',
					text: err.resposeText,
					button: 'Continuar!',
				});
				scope.$el.find('#archivo_cargue').val('');
				scope.$el.find('#name_archivo').text('Seleccionar aquí...');
				scope.$el.find('#remover_archivo').attr('disabled', true);
			});
	}

	searchFile(e: any) {
		e.preventDefault();
		this.$el.find("[name='archivo_cargue']").trigger('click');
	}
}
