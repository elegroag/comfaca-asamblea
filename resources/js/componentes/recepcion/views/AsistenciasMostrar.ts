import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var create_url: (path: string) => string;
	var RouterRecepcion: any;
	var Poder: any;
	var EmpresasCollection: any;
	var Empresa: any;
	var RechazoEmpresaView: any;
}

interface AsistenciasMostrarOptions {
	model?: any;
	collection?: any[];
	App?: any;
	[key: string]: any;
}

export default class AsistenciasMostrar extends BackboneView {
	template!: string;
	App: any;
	tieneIncripcion: boolean | null;
	modalView: any;
	empresas: any[];

	constructor(options: AsistenciasMostrarOptions = {}) {
		super(options);
		this.App = options.App;
		this.tieneIncripcion = null;
		this.modalView = null;
	}

	initialize() {
		this.template = $('#tmp_mostrar_datos').html();
	}

	fichaIngreso(e: JQuery.Event) {
		e.preventDefault();
		const cedrep = this.model.get('cedrep');
		$App.trigger('confirma', {
			message: '¡Confirmar la acción de registro de ingreso a la Asamblea!',
			callback: (success: boolean) => {
				if (success) {
					$App.trigger('syncro', {
						url: create_url('recepcion/crearAsistencia'),
						data: {
							cedrep: cedrep,
						},
						callback: (response: any) => {
							if (response.success) {
								this.trigger('add:representante', this.model);
								$App.trigger('success', response.msj);
								$App.router.navigate('ficha/' + cedrep, { trigger: true });
							} else {
								$App.trigger('warning', response.msj);
							}
						},
					});
				}
			},
		});
		return false;
	}

	crearIngreso(e: JQuery.Event) {
		e.preventDefault();
		var cedrep = this.model.get('cedrep');
		RouterRecepcion.setRepresentante(this.model.toJSON());
		$App.router.navigate('validacion/' + cedrep, { trigger: true });
		return false;
	}

	events() {
		return {
			'click #bt_ficha_ingreso': 'fichaIngreso',
			'click #bt_crear_ingreso': 'crearIngreso',
			"click [data-toggle='bt_rechazo']": 'mostrarRechazo',
		};
	}

	render() {
		const _template = _.template(this.template);
		const { empresas, asistencias, poder, poderes } = this.collection[0];

		const habiles = _.filter(empresas.toJSON(), (empresa: any) => {
			return empresa.estado == 'A' || empresa.estado == 'P' ? empresa : null;
		});

		this.empresas = _.sortBy(empresas.toJSON(), 'inscripcion_estado');

		const inscripciones = _.where(this.empresas, { tiene_incripcion: 1 });

		this.tieneIncripcion = _.size(inscripciones) > 0 && _.size(habiles) > 0 ? true : false;

		this.$el.html(
			_template({
				representante: this.model.toJSON(),
				empresas: this.empresas,
				tiene_incripcion: this.tieneIncripcion,
				poder: poder instanceof Poder ? poder.toJSON() : poder,
				poderes: poderes instanceof EmpresasCollection ? poderes.toJSON() : poderes,
			})
		);
		return this;
	}

	mostrarRechazo(e: JQuery.Event) {
		e.preventDefault();
		const nit = this.$el.find(e.currentTarget).attr('data-cid');
		const cedrep = this.model.get('cedrep');

		$App.trigger('syncro', {
			url: create_url('recepcion/rechazo'),
			data: {
				cedrep,
				nit,
			},
			callback: (response: any) => {
				if (response) {
					const empresa = new Empresa(response.empresa);
					this.modalView = new RechazoEmpresaView({ model: empresa, collection: response.rechazos });
					$App.trigger('show:modal', 'Detalle Rechazo Emprea', this.modalView, { bootstrapSize: 'modal-md' });
				} else {
				}
			},
		});
	}
}

class RechazoEmpresaView extends BackboneView {
	template!: string;

	constructor(options: any) {
		super(options);
	}

	initialize(options: any) {
		this.template = $('#tmp_rechazo_detalle').html();
	}

	events() {
		return {
			'click #bt_close': 'closeModal',
		};
	}

	render() {
		const _template = _.template(this.template);
		this.$el.html(
			_template({
				empresa: this.model.toJSON(),
				rechazos: this.collection,
			})
		);
		return this;
	}

	closeModal(e: JQuery.Event) {
		e.preventDefault();
		$App.trigger('hide:modal', this);
	}
}
