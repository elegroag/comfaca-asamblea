import { BackboneView } from "@/common/Bone";

interface TrabajadorRowViewOptions {
	model: any;
	[key: string]: any;
}

export default class TrabajadorRowView extends BackboneView {
	template: string;
	model: any;

	constructor(options: TrabajadorRowViewOptions) {
		super(options);
		this.template = '#tmp_row_trabajador';
	}

	get tagName(): string {
		return 'tr';
	}

	initialize(options: TrabajadorRowViewOptions) {
		this.listenTo(options.model, 'change', this.render);
	}
}
