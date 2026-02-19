import LayoutView from "@/componentes/trabajadores/views/LayoutView";
import TrabajadoresNav from "@/componentes/trabajadores/views/TrabajadoresNav";
import TrabajadorCargueView from "@/componentes/trabajadores/views/TrabajadorCargueView";
import TrabajadorService from "@/componentes/trabajadores/services/TrabajadorService";

declare global {
	var _: any;
	var Backbone: any;
	var $App: any;
}

interface TrabajadorCargueOptions {
	[key: string]: any;
}

export default class TrabajadorCargue {
	layout: LayoutView;
	region: any;
	trabajadorService: TrabajadorService;

	constructor(options: TrabajadorCargueOptions = {}) {
		_.extend(this, Backbone.Events);
		_.extend(this, options);
		this.trabajadorService = new TrabajadorService();
	}

	cargueTrabajador(): void {
		this.layout = new LayoutView();
		this.region.show(this.layout);
		this.layout.getRegion('subheader').show(
			new TrabajadoresNav({
				model: {
					titulo: 'Cargue de trabajadores',
					listar: false,
					exportar: false,
					crear: false,
					editar: false,
					masivo: false,
				},
			})
		);
		const view = new TrabajadorCargueView({
			collection: $App.Collections.trabajadores,
		});
		this.layout.getRegion('body').show(view);
	}

	destroy(): void {
		this.region.remove();
		this.stopListening();
	}
}
