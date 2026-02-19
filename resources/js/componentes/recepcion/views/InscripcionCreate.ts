import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var create_url: (path: string) => string;
}

interface InscripcionCreateOptions {
	model?: any;
	App?: any;
	[key: string]: any;
}

export default class InscripcionCreate extends BackboneView {
	template!: string;
	App: any;

	constructor(options: InscripcionCreateOptions = {}) {
		super(options);
		this.App = options.App;
	}

	initialize() {
		this.template = $('#tmp_create_ingreso').html();
	}

	events() {
		return {
			'click #bt_registrar_inscripcion': 'registrarInscripcion',
			"click [name='crear_empresa']": 'crearEmpresa',
		};
	}

	render() {
		let template = _.template(this.template);
		this.$el.html(template());
		return this;
	}

	crearEmpresa(e: JQuery.Event) {
		let input = $(e.currentTarget);
		if (input.is(':checked')) {
			$('.sh-crear_empresa').fadeIn('slow');
		} else {
			$('.sh-crear_empresa').fadeOut('fast');
		}
	}

	registrarInscripcion(e: JQuery.Event) {
		e.preventDefault();
		var target = $(e.currentTarget);
		target.attr('disabled', true);

		$App.trigger('confirma', {
			message: 'Se requiere de confirmar si desea realizar el ingreso.',
			callback: (success: boolean) => {
				if (success) {
					const nit = this.getInput('nit');
					const cedrep = this.getInput('cedrep');
					const nombres = this.getInput('nombres');
					const apellidos = this.getInput('apellidos');
					const telefono = this.getInput('telefono');
					const email = this.getInput('email');
					const razsoc = this.getInput('razsoc');
					const is_habil = this.getCheck('is_habil');
					const omit_estado = this.getCheck('omit_estado');
					const crear_empresa = this.getCheck('crear_empresa');

					let token = {
						cedrep,
						nombres,
						nit,
						apellidos,
						telefono,
						email,
						razsoc,
						is_habil,
						omit_estado,
						crear_empresa,
					};

					const url = create_url('recepcion/salvar_inscripcion');
					$App.trigger('syncro', {
						url,
						data: token,
						callback: (response: any) => {
							target.removeAttr('disabled');
							if (response) {
								if (_.size(response.errors) > 0) {
									$App.trigger('warning', response.errors.join('\n'));
								} else {
									$App.trigger('success', response.msj);
								}
							}
						},
					});
				}
			},
		});
	}

	getInput(selector: string): string {
		return this.$el.find(`[name='${selector}']`).val();
	}

	setInput(selector: string, val: string | undefined) {
		return this.$el.find(`[name='${selector}']`).val(val ?? '');
	}

	getCheck(selector: string): number {
		return this.$el.find(`[name='${selector}']:checked`).length;
	}
}
