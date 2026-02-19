import { BackboneView } from "@/common/Bone";

declare global {
	var _: any;
	var Layout: any;
}

interface LayoutViewOptions {
	[key: string]: any;
}

export default class LayoutView extends BackboneView {
	template!: any;
	regions!: {
		subheader: string;
		body: string;
	};

	constructor(options: LayoutViewOptions = {}) {
		super(options);
		this.template = _.template(document.getElementById('tmp_layout').innerHTML);
		this.regions = {
			subheader: '#subheader',
			body: '#body',
		};
	}

	/**
	 * @override
	 */
	// @ts-ignore
	get className(): string {
		return 'col-auto';
	}
}
