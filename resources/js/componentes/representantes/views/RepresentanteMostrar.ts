import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var SubNavRepresentantes: any;
}

interface RepresentanteMostrarOptions {
	[key: string]: any;
}

export default class RepresentanteMostrar extends BackboneView {
	template!: string;
	model: any;
	$el: any;
	subNavView: any;

	constructor(options: RepresentanteMostrarOptions) {
		super({
			...options,
			id: 'box_mostrar_representante',
		});
	}

	initialize() {
		this.template = $('#tmp_detalle').html();
	}

	events() {
		return {};
	}

	render() {
		let template = _.template(this.template);
		this.$el.html(
			template({
				representante: this.model.toJSON(),
			})
		);
		this.subNav();
		return this;
	}

	subNav() {
		this.subNavView = new SubNavRepresentantes({
			model: this.model,
			dataToggle: {
				listar: true,
				crear: true,
				editar: false,
			},
		}).render();
		this.$el.find('#showSubnav').html(this.subNavView.$el);
		(SubNavRepresentantes as any).parentView = this;
	}
}
