import { BackboneView } from "@/common/Bone";

interface RepresentanteRowOptions {
	model: any;
	[key: string]: any;
}

export default class RepresentanteRow extends BackboneView {
	template: string;
	model: any;

	constructor(options: RepresentanteRowOptions) {
		super(options);
		this.template = '#tmp_row';
	}

	get tagName(): string {
		return 'tr';
	}

	initialize(options: RepresentanteRowOptions) {
		this.listenTo(options.model, 'change', this.render);
	}
}
