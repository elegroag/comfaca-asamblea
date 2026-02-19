import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';
import { Utils } from "@/core/Utils";
import cargarInterventores from "@/componentes/interventores/templates/cargarInterventores.hbs?raw";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var loading: any;
	var create_url: (path: string) => string;
	var Swal: any;
}

interface InterventorCrearOptions {
	model?: any;
	App?: AppInstance;
	[key: string]: any;
}

export default class InterventorCrear extends BackboneView {
	App: AppInstance;

	constructor(options: InterventorCrearOptions = {}) {
		super(options);
		this.App = options.App || options.AppInstance;
	}

	get events() {
		return {
			'click #btn_back_list': 'backlist',
			"click [data-toggle-file='searchfile']": 'searchFile',
			'click #bt_hacer_cargue': 'hacerCargue',
		};
	}

	/**
	 * Buscar archivo
	 */
	searchFile(e: Event): void {
		e.preventDefault();
		this.$el.find("[name='archivo_interventores']").trigger('click');
	}

	/**
	 * Hacer cargue masivo
	 */
	hacerCargue(e: Event): void {
		e.preventDefault();

		const target = $(e.currentTarget);
		target.attr('disabled', true);

		const _cruzar_poderes = $("[name='cruzar_poderes']:checked").length;
		const archivo_interventores = document.getElementById('archivo_interventores')?.files;

		if (!archivo_interventores || archivo_interventores.length === 0) {
			target.removeAttr('disabled');
			return;
		}

		const form_data = new FormData();
		form_data.append('file', archivo_interventores[0]);
		form_data.append('cruzar_poderes', _cruzar_poderes.toString());

		// Mostrar loading
		if (loading && typeof loading.show === 'function') {
			loading.show();
		}

		$.ajax({
			url: Utils.getURL('interventores/cargue_masivo'),
			method: 'POST',
			dataType: 'JSON',
			cache: false,
			data: form_data,
			contentType: false,
			processData: false,
			beforeSend: (xhr: any) => {
				if (loading && typeof loading.show === 'function') {
					loading.show();
				}
			},
		})
			.done((salida: any) => {
				if (loading && typeof loading.hide === 'function') {
					loading.hide();
				}

				if (salida) {
					if (Swal && typeof Swal.fire === 'function') {
						Swal.fire({
							title: 'Notificación!',
							text: `Ya se completo el cargue de los habiles.\nRegistrados: ${salida.creados || 0}\nCantidad: ${salida.filas || 0}\nFallos: ${salida.fallidos || 0}`,
							button: 'Continuar!',
						});
					}

					// Resetear formulario
					this.$el.find('#archivo_interventores').val('');
					this.$el.find('#name_archivo').text('Seleccionar aquí...');
					this.$el.find('#remover_archivo').attr('disabled', true);
				}
			})
			.fail((err: any) => {
				if (loading && typeof loading.hide === 'function') {
					loading.hide();
				}

				if (Swal && typeof Swal.fire === 'function') {
					Swal.fire({
						title: 'Error!',
						text: err.responseText || 'Error en el cargue',
						button: 'Continuar!',
					});
				}

				// Resetear formulario
				this.$el.find('#archivo_interventores').val('');
				this.$el.find('#name_archivo').text('Seleccionar aquí...');
				this.$el.find('#remover_archivo').attr('disabled', true);
			});
	}

	/**
	 * Volver a la lista
	 */
	backlog(e: Event): void {
		e.preventDefault();
		this.remove();

		if ($App.router) {
			$App.router.navigate('listar', { trigger: true, replace: true });
		}
	}

	render(): this {
		const template = _.template($('#tmp_cargar_interventores').html());
		this.$el.html(template());
		return this;
	}
}
