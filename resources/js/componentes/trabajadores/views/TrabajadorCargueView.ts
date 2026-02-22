import { BackboneView } from "@/common/Bone";
import TrabajadorService from "@/pages/Trabajadores/TrabajadorService";
import cargue from "@/componentes/trabajadores/templates/tmp_cargar_trabajadores.hbs?raw";

interface TrabajadorCargueViewOptions {
	App?: any;
	api?: any;
	logger?: any;
	storage?: any;
	region?: any;
	[key: string]: any;
}

export default class TrabajadorCargueView extends BackboneView {
	template: any;
	App: any;
	api: any;
	logger: any;
	storage: any;
	region: any;
	trabajadorService: TrabajadorService;

	constructor(options: TrabajadorCargueViewOptions) {
		super({
			...options,
			className: 'box',
		});
		this.App = options.App;
		this.api = options.api;
		this.logger = options.logger;
		this.storage = options.storage;
		this.region = options.region;
		this.template = _.template(cargue);
		this.trabajadorService = new TrabajadorService({
			api: this.api,
			logger: this.logger,
			app: this.App
		});
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

	removerArchivo(e: Event) {
		e.preventDefault();
		this.$el.find('#archivo_cargue').val('');
		this.$el.find('#name_archivo').text('Seleccionar aquí...');
		this.$el.find('#remover_archivo').attr('disabled', 'true');
		this.$el.find('#bt_hacer_cargue').attr('disabled', 'true');
	}

	async hacerCargue(e: Event) {
		e.preventDefault();
		const target = this.$el.find(e.currentTarget);
		target.attr('disabled', 'true');

		const cruzarData = this.$el.find("[name='cruzar_data']:checked").length;
		const archivoCargue = (document.getElementById('archivo_cargue') as HTMLInputElement).files;

		if (!archivoCargue || archivoCargue.length === 0) {
			target.removeAttr('disabled');
			return false;
		}

		const formData = new FormData();
		formData.append('file', archivoCargue[0]);
		formData.append('cruzar', cruzarData.toString());

		try {
			// Mostrar loading (simulado con trigger)
			if (this.App && typeof this.App.trigger === 'function') {
				this.App.trigger('loading:show');
			}

			const response = await this.trabajadorService.__uploadMasivo(formData);

			if (this.App && typeof this.App.trigger === 'function') {
				this.App.trigger('loading:hide');
			}

			if (response && response.success) {
				if (this.App && typeof this.App.trigger === 'function') {
					this.App.trigger('alert:success', {
						title: 'Notificación!',
						text: `Ya se completo el cargue de los trabajadores.\nRegistrados: ${response.creados}\nCantidad: ${response.filas}\nFallos: ${response.fallidos}`,
						button: 'Continuar!'
					});
				}
				this.limpiarFormulario();
			} else {
				if (this.App && typeof this.App.trigger === 'function') {
					this.App.trigger('alert:error', {
						title: 'Error!',
						text: response.msj || 'Error en el cargue masivo',
						button: 'Continuar!'
					});
				}
				this.limpiarFormulario();
			}
		} catch (error: any) {
			if (this.App && typeof this.App.trigger === 'function') {
				this.App.trigger('loading:hide');
				this.App.trigger('alert:error', {
					title: 'Error!',
					text: error.message || 'Error de conexión',
					button: 'Continuar!'
				});
			}
			this.logger?.error('Error en cargue masivo:', error);
			this.limpiarFormulario();
		} finally {
			target.removeAttr('disabled');
		}
	}

	private limpiarFormulario() {
		this.$el.find('#archivo_cargue').val('');
		this.$el.find('#name_archivo').text('Seleccionar aquí...');
		this.$el.find('#remover_archivo').attr('disabled', 'true');
	}

	searchFile(e: Event) {
		e.preventDefault();
		this.$el.find("[name='archivo_cargue']").trigger('click');
	}
}
