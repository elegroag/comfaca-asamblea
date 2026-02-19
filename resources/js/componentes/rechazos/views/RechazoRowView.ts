import { BackboneView } from "@/common/Bone";

interface RechazoRowViewOptions {
	model: any;
	[key: string]: any;
}

export default class RechazoRowView extends BackboneView {
	template: string;
	model: any;

	constructor(options: RechazoRowViewOptions) {
		super(options);
		this.template = '#tmp_row_rechazo';
	}

	get tagName(): string {
		return 'tr';
	}

	initialize(options: RechazoRowViewOptions) {
		this.listenTo(options.model, 'change', this.render);
	}
}
