import { BackboneView } from "@/common/Bone";
import TrabajadorService from "@/pages/Trabajadores/TrabajadorService";
import crear from "@/componentes/trabajadores/templates/crear.hbs?raw";

interface TrabajadorCrearViewOptions {
	App?: any;
	api?: any;
	logger?: any;
	storage?: any;
	region?: any;
	[key: string]: any;
}

export default class TrabajadorCrearView extends BackboneView {
	template: any;
	App: any;
	api: any;
	logger: any;
	storage: any;
	region: any;
	trabajadorService: TrabajadorService;

	constructor(options: TrabajadorCrearViewOptions) {
		super(options);
		this.App = options.App;
		this.api = options.api;
		this.logger = options.logger;
		this.storage = options.storage;
		this.region = options.region;
		this.template = _.template(crear);
		this.trabajadorService = new TrabajadorService({
			api: this.api,
			logger: this.logger,
			app: this.App
		});
	}

	get events() {
		return {
			'click #btn_back_list': 'backlist',
			"click [data-toggle-file='searchfile']": 'searchFile',
			'click #bt_guardar': 'guardarTrabajador',
		};
	}

	searchFile(e: Event) {
		e.preventDefault();
		this.$el.find("[name='archivo_trabajadores']").trigger('click');
	}

	async guardarTrabajador(e: Event) {
		e.preventDefault();
		const target = this.$el.find(e.currentTarget);
		target.attr('disabled', 'true');

		const trabajadorData = {
			cedula: parseInt(this.getInput('cedula')),
			nombre: this.getInput('nombre'),
			nittra: this.getInput('nittra'),
			razontra: this.getInput('razontra'),
		};

		// Validación básica
		if (!this.getInput('cedula') || !this.getInput('nombre')) {
			if (this.App && typeof this.App.trigger === 'function') {
				this.App.trigger('alert:error', 'El cedula es un valor requerido');
			}
			target.removeAttr('disabled');
			return false;
		}

		try {
			const response = await this.trabajadorService.__crearTrabajador(trabajadorData);

			target.removeAttr('disabled');

			if (response && response.success) {
				this.trigger('add:trabajador', response.data);
				this.$el.find('input').val('');
				if (this.App && typeof this.App.trigger === 'function') {
					this.App.trigger('alert:success', {
						title: 'Éxito',
						text: 'Trabajador guardado correctamente',
						button: 'OK!'
					});
				}
				this.backlist();
			} else {
				if (this.App && typeof this.App.trigger === 'function') {
					this.App.trigger('alert:error', {
						title: 'Error',
						text: response.msj || 'Error al guardar el trabajador',
						button: 'OK!'
					});
				}
			}
		} catch (error: any) {
			target.removeAttr('disabled');
			this.logger?.error('Error al guardar trabajador:', error);
			if (this.App && typeof this.App.trigger === 'function') {
				this.App.trigger('alert:error', {
					title: 'Error',
					text: 'Ocurrió un error al guardar el trabajador',
					button: 'OK!'
				});
			}
		}
	}

	backlist(e: Event) {
		e.preventDefault();
		this.remove();
		if (this.App && this.App.router) {
			this.App.router.navigate('listar', { trigger: true, replace: true });
		}
		return false;
	}

	getInput(selector: string): string {
		return this.$el.find(`[name='${selector}']`).val();
	}
}
