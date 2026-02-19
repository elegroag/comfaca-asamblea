import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';
import mostrarInterventores from "@/componentes/interventores/templates/mostrarInterventores.hbs?raw";

declare global {
	var $: any;
	var _: any;
}

interface InterventorMostrarOptions {
	model?: any;
	App?: AppInstance;
	[key: string]: any;
}

export default class InterventorMostrar extends BackboneView {
	App: AppInstance;
	interventor: any;

	constructor(options: InterventorMostrarOptions = {}) {
		super({
			...options,
			tagName: 'div',
			id: 'box_mostrar_interventores',
			className: 'box',
			interventor: undefined
		});
		this.App = options.App || options.AppInstance;
	}

	initialize(): void {
		this.render();
	}

	get events() {
		return {};
	}

	render(): this {
		const template = _.template($('#tmp_mostrar_interventores').html());
		this.interventor = this.model;
		this.$el.html(template(this.interventor));
		return this;
	}
}
