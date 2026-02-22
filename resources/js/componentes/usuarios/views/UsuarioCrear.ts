import { BackboneView } from "@/common/Bone";
import UsuarioService from "@/pages/Usuarios/UsuarioService";
import SubNavUsuarios from "./SubNavUsuarios";
import crear from "@/componentes/usuarios/templates/crear.hbs?raw";

interface UsuarioCrearOptions {
	model?: any;
	isNew?: boolean;
	isAsamblea?: boolean;
	App?: any;
	api?: any;
	logger?: any;
	storage?: any;
	region?: any;
	[key: string]: any;
}

export default class UsuarioCrear extends BackboneView {
	template: any;
	isNew: boolean;
	isAsamblea: boolean;
	subNavUsuarios: SubNavUsuarios | null;
	App: any;
	api: any;
	logger: any;
	storage: any;
	region: any;
	usuarioService: UsuarioService;

	constructor(options: UsuarioCrearOptions = {}) {
		super(options);
		this.App = options.App;
		this.api = options.api;
		this.logger = options.logger;
		this.storage = options.storage;
		this.region = options.region;
		this.model = options.model;
		this.template = _.template(crear);
		this.isNew = options.isNew !== false; // true por defecto
		this.isAsamblea = options.isAsamblea || false;
		this.subNavUsuarios = null;
		this.usuarioService = new UsuarioService({
			api: this.api,
			logger: this.logger,
			app: this.App
		});
	}

	initialize(): void {
		// Template y propiedades ya asignados en el constructor
	}

	get events(): Record<string, (e: Event) => void> {
		return {
			'click #btn_back_list': this.backlist,
			'click #bt_guardar': this.guardaUsuario,
			'change [data-toggle="switch"]': this.changePassword,
		};
	}

	render(): this {
		const template = _.template(this.template);
		const modelData = this.model ? this.model.toJSON() : {};
		this.el.innerHTML = template({ ...modelData, isNew: this.isNew });

		// Establecer fecha actual si existe el campo
		const today = new Date();
		const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
		this.$el.find("[name='fecha']").val(formattedDate);

		this.subNav();
		return this;
	}

	changePassword(e: Event): void {
		const target = this.$el.find(e.currentTarget);

		if (target.length && target.is(':checked')) {
			this.$el.find('#showChangeClave').fadeIn();
		} else {
			this.$el.find('#showChangeClave').fadeOut();
		}
	}

	async guardaUsuario(e: Event): Promise<boolean> {
		e.preventDefault();

		const target = this.$el.find(e.currentTarget);
		target.attr('disabled', 'true');

		// Validación para usuarios existentes
		if (!this.isNew) {
			const confirmaClave = this.getInput('confirma_clave');
			const clave = this.getInput('clave');

			if (confirmaClave !== clave) {
				target.removeAttr('disabled');
				if (this.App && typeof this.App.trigger === 'function') {
					this.App.trigger('alert:error', 'La clave no es válida, no se puede confirmar el valor.');
				}
				return false;
			}
		}

		const usuarioData: Record<string, any> = {
			cedtra: this.getInput('cedtra'),
			nombre: this.getInput('nombre'),
			clave: this.getInput('clave'),
			usuario: this.getInput('usuario'),
			confirmarClave: this.getInput('confirmarClave'),
		};

		// Validación básica
		if (!usuarioData.cedtra || !usuarioData.nombre || !usuarioData.usuario) {
			target.removeAttr('disabled');
			if (this.App && typeof this.App.trigger === 'function') {
				this.App.trigger('alert:error', 'Los campos cédula, nombre y usuario son requeridos');
			}
			return false;
		}

		try {
			let response;

			if (this.isNew) {
				response = await this.usuarioService.__crearUsuario(usuarioData);
			} else {
				if (this.model && typeof this.model.get === 'function') {
					const usuarioId = this.model.get('usuario');
					usuarioData.confirma_clave = this.getInput('confirma_clave');
					response = await this.usuarioService.__actualizarUsuario(usuarioId, usuarioData);
				} else {
					console.error('Modelo no disponible para obtener usuario');
					target.removeAttr('disabled');
					return false;
				}
			}

			target.removeAttr('disabled');

			if (response && response.success) {
				if (response.usuario_sisu === false) {
					this.App.trigger('alert:error', response.msj);
					this.$el.find('input').val('');
				} else {
					this.trigger('add:usuario_sisu', usuarioData);
					this.App.trigger('alert:success', response.msj);
					this.$el.find('input').val('');

					if (!this.isNew && this.App && this.App.router) {
						this.App.router.navigate('listar', { trigger: true, replace: true });
					}
				}
			} else {
				if (this.App && typeof this.App.trigger === 'function') {
					this.App.trigger('alert:error', response?.msj || 'Error al guardar el usuario');
				}
			}
		} catch (error: any) {
			target.removeAttr('disabled');
			this.logger?.error('Error al guardar usuario:', error);
			if (this.App && typeof this.App.trigger === 'function') {
				this.App.trigger('alert:error', {
					title: 'Error',
					text: error.message || 'Error de conexión',
					button: 'OK!'
				});
			}
		}

		return false;
	}

	backlist(e: Event): boolean {
		e.preventDefault();
		this.remove();

		if (this.App && this.App.router) {
			this.App.router.navigate('listar', { trigger: true, replace: true });
		}

		return false;
	}

	subNav(): void {
		this.subNavUsuarios = new SubNavUsuarios({
			model: this.model,
			App: this.App,
			api: this.api,
			logger: this.logger,
			storage: this.storage,
			region: this.region,
			dataToggle: {
				listar: true,
				exportar: false,
				crear: false,
				editar: false,
				masivo: true,
			},
		});

		const subnavElement = this.$el.find('#showSubnav');
		if (subnavElement.length && this.subNavUsuarios) {
			subnavElement.html(this.subNavUsuarios.render().$el);
		}

		// Establecer referencia a la vista padre
		(SubNavUsuarios as any).parentView = this;
	}

	getInput(selector: string): string {
		const element = this.$el.find(`[name='${selector}']`);
		return element.length ? element.val() as string : '';
	}

	setInput(selector: string, val: string): void {
		this.$el.find(`[name='${selector}']`).val(val || '');
	}

	getCheck(selector: string): number {
		return this.$el.find(`[name='${selector}']:checked`).length;
	}
}
