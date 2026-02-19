import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var create_url: (path: string) => string;
	var axios: any;
	var loading: any;
	var Swal: any;
	var download_file: (data: any) => void;
	var langDataTable: any;
	var Backbone: any;
}

interface AsistenciasListarOptions {
	collection?: any;
	App?: any;
	[key: string]: any;
}

export default class AsistenciasListar extends BackboneView {
	template!: string;
	App: any;

	constructor(options: AsistenciasListarOptions = {}) {
		super(options);
		this.App = options.App;
	}

	initialize() {
		this.template = $('#tmp_listar_ingreso').html();
		this.render();
	}

	events() {
		return {
			'click #bt_export_data': 'export_data',
			"click button[data-toggle='bt_registro_ingreso']": 'registroIngreso',
			"click button[data-toggle='bt_borrar_ingreso']": 'borrarIngreso',
			'click #bt_reporte_data': 'reporte_data',
		};
	}

	render() {
		let _template = _.template(this.template);
		this.$el.html(_template({ asistencias: this.collection.toJSON() }));
		this.initTable();
		return this;
	}

	borrarIngreso(e: JQuery.Event) {
		e.preventDefault();
		var target = $(e.currentTarget);
		target.attr('disabled', true);

		$App.trigger('confirma', {
			message: 'Se requiere de confirmar si desea remover la inscripción.',
			callback: (success: boolean) => {
				target.removeAttr('disabled');

				if (success) {
					const documento = target.attr('data-code');
					const url = create_url('recepcion/remover_inscripcion/' + documento);
					axios
						.get(url)
						.then((salida: any) => {
							if (salida.status == 200) {
								Backbone.history.loadUrl();
								$App.trigger('alert:success', salida.data.msj);
							}
						})
						.catch((err: any) => {
							console.log(err);
						});
				}
			},
		});
	}

	registroIngreso(event: JQuery.Event) {
		event.preventDefault();
		let nit = $(event.currentTarget).attr('data-code');
		$App.router.navigate('registro_empresa/' + nit, { trigger: true });
	}

	export_data(event: JQuery.Event) {
		event.preventDefault();
		$App.trigger('confirma', {
			message: 'Se requiere de confirmar si desea exportar la lista.',
			callback: (success: boolean) => {
				if (success) {
					loading.show();
					let url = create_url('recepcion/exportar_lista');
					axios
						.get(url)
						.then(function (response: any) {
							loading.hide();
							if (response.status == 200) {
								if (response.data.status == 200) {
									download_file(response.data);
								} else {
									Swal.fire({
										title: 'Notificación!',
										text: response.data.msj,
										icon: 'warning',
										button: 'Continuar!',
									});
								}
							} else {
								Swal.fire({
									title: 'Notificación!',
									text: 'Se detecta un error al exportar los datos. Comunicar a soporte técnico',
									icon: 'warning',
									button: 'Continuar!',
									timer: 8000,
								});
							}
						})
						.catch(function (err: any) {
							loading.hide();
							console.log(err);
						});
				}
			},
		});
	}

	reporte_data(event: JQuery.Event) {
		event.preventDefault();
		$App.trigger('confirma', {
			message: 'Se requiere de confirmar si desea generar reporte.',
			callback: (success: boolean) => {
				if (success) {
					loading.show();
					let url = create_url('recepcion/reporte_quorum');
					axios
						.get(url)
						.then(function (response: any) {
							loading.hide();
							if (response.status == 200) {
								if (response.data.status == 200) {
									download_file(response.data);
								} else {
									Swal.fire({
										title: 'Notificación!',
										text: response.data.msj,
										icon: 'warning',
										button: 'Continuar!',
									});
								}
							} else {
								Swal.fire({
									title: 'Notificación!',
									text: 'Se detecta un error al exportar los datos. Comunicar a soporte técnico',
									icon: 'warning',
									button: 'Continuar!',
									timer: 8000,
								});
							}
						})
						.catch(function (err: any) {
							loading.hide();
							console.log(err);
						});
				}
			},
		});
	}

	initTable() {
		this.$el.find('#tb_data_asistencias').DataTable({
			paging: true,
			pageLength: 10,
			pagingType: 'full_numbers',
			info: true,
			columns: [
				{ data: 'empresa' },
				{ data: 'nit' },
				{ data: 'cedrep' },
				{ data: 'hora' },
				{ data: 'fecha' },
				{ data: 'estado' },
				{ data: 'votos' },
				{ data: 'documento' },
			],
			order: [[7, 'desc']],
			language: langDataTable,
		});
	}
}
