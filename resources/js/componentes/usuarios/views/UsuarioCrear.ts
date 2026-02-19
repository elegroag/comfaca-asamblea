import { BackboneView } from "@/common/Bone";
import SubNavUsuarios from "./SubNavUsuarios";
import tmp_crear_usuario from "../templates/tmp_crear_usuario.hbs?raw";

declare global {
	var $: any;
	var _: any;
	var moment: any;
	var $App: any;
	var create_url: (path: string) => string;
	var Usuario: any;
}

interface UsuarioCrearOptions {
	model?: any;
	isNew?: boolean;
	isAsamblea?: boolean;
}

export default class UsuarioCrear extends BackboneView {
	template: string;
	isNew: boolean;
	isAsamblea: boolean;
	subNavUsuarios: SubNavUsuarios | null;

	constructor(options: UsuarioCrearOptions = {}) {
		super(options);
		this.template = tmp_crear_usuario;
		this.isNew = options.isNew !== false; // true por defecto
		this.isAsamblea = options.isAsamblea || false;
		this.subNavUsuarios = null;
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
		this.$el.find("[name='fecha']").val(moment().format('DD-MM-YYYY'));

		this.subNav();
		return this;
	}

	changePassword(e: Event): void {
		const target = this.$el.find(e.currentTarget as HTMLElement);

		if (target.length && target.is(':checked')) {
			$('#showChangeClave').fadeIn();
		} else {
			$('#showChangeClave').fadeOut();
		}
	}

	guardaUsuario(e: Event): boolean {
		e.preventDefault();

		const target = this.$el.find(e.currentTarget as HTMLElement);
		target.attr('disabled', 'true');

		// Validación para usuarios existentes
		if (!this.isNew) {
			const confirmaClave = this.getInput('confirma_clave');
			const clave = this.getInput('clave');

			if (confirmaClave !== clave) {
				target.removeAttr('disabled');
				if ($App && typeof $App.trigger === 'function') {
					$App.trigger('alert:error', 'La clave no es válida, no se puede confirmar el valor.');
				}
				return false;
			}
		}

		const model = new Usuario({
			cedtra: this.getInput('cedtra'),
			nombre: this.getInput('nombre'),
			clave: this.getInput('clave'),
			usuario: this.getInput('usuario'),
		});

		if (!model.isValid()) {
			const errors = model.validationError;

			setTimeout(() => {
				$('.error').html('');
			}, 3000);

			if ($App && typeof $App.trigger === 'function') {
				$App.trigger('alert:error', errors);
			}

			target.removeAttr('disabled');
		} else {
			let url: string;

			if (this.isNew) {
				url = create_url('usuarios/createUsuarioSisu');
			} else {
				if (this.model && typeof this.model.get === 'function') {
					url = create_url('usuarios/createUsuarioSisu/' + this.model.get('usuario'));
					model.set('confirma_clave', this.getInput('confirma_clave'));
				} else {
					console.error('Modelo no disponible para obtener usuario');
					target.removeAttr('disabled');
					return false;
				}
			}

			if ($App && typeof $App.trigger === 'function') {
				$App.trigger('syncro', {
					url,
					data: model.toJSON(),
					callback: (response: any) => {
						target.removeAttr('disabled');

						if (response && response.success) {
							if (response.usuario_sisu === false) {
								$App.trigger('alert:error', response.msj);
								this.$el.find('input').val('');
							} else {
								this.trigger('add:usuario_sisu', model);
								$App.trigger('success', response.msj);
								this.$el.find('input').val('');

								if (!this.isNew && $App.router) {
									$App.router.navigate('listar', { trigger: true, replace: true });
								}
							}
						}
					},
				});
			}
		}

		return false;
	}

	backlist(e: Event): boolean {
		e.preventDefault();
		this.remove();

		if ($App.router) {
			$App.router.navigate('listar', { trigger: true, replace: true });
		}

		return false;
	}

	subNav(): void {
		this.subNavUsuarios = new SubNavUsuarios({
			model: this.model,
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
