import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var Empresa: any;
}

interface EmpresaDetalleViewOptions {
	model?: any;
	collection?: any;
}

export default class EmpresaDetalleView extends BackboneView {
	modelUse: any;
	template: any;

	constructor(options: EmpresaDetalleViewOptions = {}) {
		super({
			...options,
			className: 'box',
		});
		this.modelUse = Empresa;
		this.template = _.template(document.getElementById('tmp_detalle_empresa')?.innerHTML || '');
	}
}
