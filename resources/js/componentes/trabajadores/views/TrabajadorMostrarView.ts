import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
}

interface TrabajadorMostrarViewOptions {
	[key: string]: any;
}

export default class TrabajadorMostrarView extends BackboneView {
	model: any;
	trabajador: any;
	el: any;

	constructor(options: TrabajadorMostrarViewOptions) {
		super({ ...options, id: 'box_mostrar_trabajadores', className: 'box', trabajador: undefined });
	}

	initialize() {
		this.render();
	}

	render() {
		var scope = this;
		let template = _.template($('#tmp_mostrar_trabajadores').html());
		scope.trabajador = scope.model;
		$(scope.el).html(template(scope.trabajador));
		return scope;
	}
}
