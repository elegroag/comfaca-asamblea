import { BackboneView } from "@/common/Bone";

declare global {
	var _: any;
}

interface RechazoDetalleViewOptions {
	[key: string]: any;
}

export default class RechazoDetalleView extends BackboneView {
	subNavView: any;
	template!: any;

	constructor(options: RechazoDetalleViewOptions) {
		super(options);
		this.template = _.template($('#tmp_detalle_rechazo').html());
	}
}
