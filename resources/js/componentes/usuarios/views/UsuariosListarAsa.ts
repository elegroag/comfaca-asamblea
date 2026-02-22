import { BackboneView } from "@/common/Bone";
import UsuarioService from "@/pages/Usuarios/UsuarioService";
import usuariosAsa from "@/componentes/usuarios/templates/tmp_usuarios_asa.hbs?raw";

interface UsuariosListarAsaOptions {
	model?: any;
	collection?: any;
	App?: any;
	api?: any;
	logger?: any;
	storage?: any;
	region?: any;
	[key: string]: any;
}

export default class UsuariosListarAsa extends BackboneView {
	template: any;
	App: any;
	api: any;
	logger: any;
	storage: any;
	region: any;
	usuarioService: UsuarioService;

	constructor(options: UsuariosListarAsaOptions = {}) {
		super({ ...options, className: 'box', id: 'box_usuarios' });
		this.App = options.App;
		this.api = options.api;
		this.logger = options.logger;
		this.storage = options.storage;
		this.region = options.region;
		this.model = options.model;
		this.collection = options.collection;
		this.template = _.template(usuariosAsa);
		this.usuarioService = new UsuarioService({
			api: this.api,
			logger: this.logger,
			app: this.App
		});
	}

	initialize(): void {
		// Template ya está asignado en el constructor
	}

	render(): this {
		const template = _.template(this.template);
		const modelData = this.model ? this.model.toJSON() : {};
		const collectionData = this.collection ? this.collection.toJSON() : [];

		this.$el.html(template({
			asamblea: modelData,
			usuarios: collectionData,
		}));

		return this;
	}

	get events(): Record<string, (e: Event) => void> {
		return {
			"click button[data-toggle='detalle_poder']": this.detalle_poder,
			"click button[data-toggle='remove_usuario']": this.remove_usuario,
		};
	}

	async remove_usuario(e: Event): Promise<void> {
		e.preventDefault();

		const target = this.$el.find(e.currentTarget);
		target.attr('disabled', 'true');

		const id = target.attr('data-code') as string;

		if (!id) {
			console.error('ID de usuario no encontrado');
			target.removeAttr('disabled');
			return;
		}

		if (this.App && typeof this.App.trigger === 'function') {
			this.App.trigger('confirma', {
				message: 'Se requiere de confirmar para borrar el registro seleccionado.',
				callback: async (status: boolean) => {
					if (status) {
						try {
							const response = await this.usuarioService.__removeUsuario(id);
							target.removeAttr('disabled');

							if (!response || !response.success) {
								this.App.trigger('alert:error', {
									title: 'Notificación!',
									text: response?.msj || 'Error al eliminar usuario',
									icon: 'error',
									button: 'Continuar!'
								});
							} else {
								this.App.trigger('alert:success', {
									title: 'Notificación!',
									text: 'La operación se completó con éxito',
									icon: 'success',
									button: 'Continuar!'
								});

								setTimeout(() => {
									window.location.reload();
								}, 1000);
							}
						} catch (error: any) {
							target.removeAttr('disabled');
							this.logger?.error('Error al eliminar usuario:', error);
							this.App.trigger('alert:error', {
								title: 'Error!',
								text: error.message || 'Error de conexión',
								button: 'Continuar!'
							});
						}
					} else {
						target.removeAttr('disabled');
					}
				},
			});
		} else {
			target.removeAttr('disabled');
		}
	}

	detalle_poder(e: Event): void {
		e.preventDefault();

		const target = this.$el.find(e.currentTarget);
		const documento = target.attr('data-code') as string;

		if (!documento) {
			console.error('Documento no encontrado');
			return;
		}

		if (this.App && this.App.router) {
			this.App.router.navigate('mostrar/' + documento, { trigger: true, replace: true });
		}
	}
}
