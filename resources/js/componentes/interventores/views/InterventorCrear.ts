import { BackboneView } from "@/common/Bone";
import InterventorService from "@/pages/Interventores/InterventorService";
import cargar from "@/componentes/interventores/templates/cargar.hbs?raw";

interface InterventorCrearOptions {
	model?: any;
	App?: any;
	api?: any;
	logger?: any;
	storage?: any;
	region?: any;
	[key: string]: any;
}

export default class InterventorCrear extends BackboneView {
	template: any;
	App: any;
	api: any;
	logger: any;
	storage: any;
	region: any;
	interventorService: InterventorService;

	constructor(options: InterventorCrearOptions = {}) {
		super(options);
		this.App = options.App;
		this.api = options.api;
		this.logger = options.logger;
		this.storage = options.storage;
		this.region = options.region;
		this.model = options.model;
		this.template = _.template(cargar);
		this.interventorService = new InterventorService({
			api: this.api,
			logger: this.logger,
			app: this.App
		});
	}

	get events() {
		return {
			'click #btn_back_list': this.backlist,
			"click [data-toggle-file='searchfile']": this.searchFile,
			'click #bt_hacer_cargue': this.hacerCargue,
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
	async hacerCargue(e: Event): Promise<void> {
		e.preventDefault();

		const target = this.$el.find(e.currentTarget);
		target.attr('disabled', 'true');

		const cruzarPoderes = this.$el.find("[name='cruzar_poderes']:checked").length;
		const archivoInterventores = (document.getElementById('archivo_interventores') as HTMLInputElement)?.files;

		if (!archivoInterventores || archivoInterventores.length === 0) {
			target.removeAttr('disabled');
			return;
		}

		const formData = new FormData();
		formData.append('file', archivoInterventores[0]);
		formData.append('cruzar_poderes', cruzarPoderes.toString());

		try {
			// Mostrar loading (simulado con trigger)
			if (this.App && typeof this.App.trigger === 'function') {
				this.App.trigger('loading:show');
			}

			const response = await this.interventorService.__uploadMasivo(formData);

			if (this.App && typeof this.App.trigger === 'function') {
				this.App.trigger('loading:hide');
			}

			if (response && response.success) {
				if (this.App && typeof this.App.trigger === 'function') {
					this.App.trigger('alert:success', {
						title: 'Notificación!',
						text: `Ya se completo el cargue de los interventores.\nRegistrados: ${response.creados || 0}\nCantidad: ${response.filas || 0}\nFallos: ${response.fallidos || 0}`,
						button: 'Continuar!'
					});
				}

				// Resetear formulario
				this.$el.find('#archivo_interventores').val('');
				this.$el.find('#name_archivo').text('Seleccionar aquí...');
				this.$el.find('#remover_archivo').attr('disabled', 'true');
			} else {
				if (this.App && typeof this.App.trigger === 'function') {
					this.App.trigger('alert:error', {
						title: 'Error!',
						text: response.msj || 'Error en el cargue',
						button: 'Continuar!'
					});
				}

				// Resetear formulario
				this.$el.find('#archivo_interventores').val('');
				this.$el.find('#name_archivo').text('Seleccionar aquí...');
				this.$el.find('#remover_archivo').attr('disabled', 'true');
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

			// Resetear formulario
			this.$el.find('#archivo_interventores').val('');
			this.$el.find('#name_archivo').text('Seleccionar aquí...');
			this.$el.find('#remover_archivo').attr('disabled', 'true');
		} finally {
			target.removeAttr('disabled');
		}
	}

	/**
	 * Volver a la lista
	 */
	backlog(e: Event): void {
		e.preventDefault();
		this.remove();

		if (this.App && this.App.router) {
			this.App.router.navigate('listar', { trigger: true, replace: true });
		}
	}

	render(): this {
		const template = _.template(this.template);
		this.$el.html(template());
		return this;
	}
}
