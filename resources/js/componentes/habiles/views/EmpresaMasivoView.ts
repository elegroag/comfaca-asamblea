import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var create_url: (path: string) => string;
	var Empresa: any;
	var loading: {
		show: () => void;
		hide: () => void;
	};
	var Swal: any;
}

interface EmpresaMasivoViewOptions {
	model?: any;
	collection?: any;
}

export default class EmpresaMasivoView extends BackboneView {
	modelUse: any;
	id: string;
	template: any;

	constructor(options: EmpresaMasivoViewOptions = {}) {
		super({
			...options,
			className: 'box',
		});
		this.modelUse = Empresa;
		this.id = 'box_masivo_habiles';
		this.template = _.template($('#tmp_cargar_habiles').html() || '');
	}

	/**
	 * @override
	 */
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

		const cruzarCartera = $("[name='cruzar_cartera']:checked").length;
		const archivoHabiles = (document.getElementById('archivo_habiles') as HTMLInputElement)?.files;

		if (!archivoHabiles || archivoHabiles.length === 0) {
			target.removeAttr('disabled');
			return;
		}

		const formData = new FormData();
		formData.append('file', archivoHabiles[0]);
		formData.append('cruzar_cartera', cruzarCartera.toString());

		$.ajax({
			url: create_url('habiles/cargue_masivo'),
			method: 'POST',
			dataType: 'JSON',
			cache: false,
			data: formData,
			contentType: false,
			processData: false,
			beforeSend: function (xhr: any) {
				if (loading) loading.show();
			},
		})
			.done((salida: any) => {
				if (loading) loading.hide();
				if (salida) {
					if (Swal) {
						Swal.fire({
							title: 'Notificación!',
							text: `Ya se completo el cargue de los habiles.\nRegistrados: ${salida.creados}\nCantidad: ${salida.filas}\nFallos: ${salida.fallidos}`,
							button: 'Continuar!',
						});
					}
					this.$el.find('#archivo_habiles').val('');
					this.$el.find('#name_archivo').text('Seleccionar aquí...');
					this.$el.find('#remover_archivo').attr('disabled', 'true');
				}
			})
			.fail((err: any) => {
				if (loading) loading.hide();
				if (Swal) {
					Swal.fire({
						title: 'Error!',
						text: err.responseText || err.resposeText || 'Error desconocido',
						button: 'Continuar!',
					});
				}
				this.$el.find('#archivo_habiles').val('');
				this.$el.find('#name_archivo').text('Seleccionar aquí...');
				this.$el.find('#remover_archivo').attr('disabled', 'true');
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
