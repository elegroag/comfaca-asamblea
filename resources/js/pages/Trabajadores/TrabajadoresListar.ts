import LayoutView from "@/componentes/trabajadores/views/LayoutView";
import TrabajadoresNav from "@/componentes/trabajadores/views/TrabajadoresNav";
import TrabajadoresListarView from "@/componentes/trabajadores/views/TrabajadoresListarView";
import TrabajadorService from "@/componentes/trabajadores/services/TrabajadorService";

declare global {
	var _: any;
	var Backbone: any;
	var $App: any;
}

interface TrabajadoresListarOptions {
	[key: string]: any;
}

export default class TrabajadoresListar {
	layout: LayoutView;
	region: any;
	trabajadorService: TrabajadorService;

	constructor(options: TrabajadoresListarOptions = {}) {
		_.extend(this, Backbone.Events);
		_.extend(this, options);
		this.trabajadorService = new TrabajadorService();
	}

	listarTrabajadores(): void {
		this.layout = new LayoutView();
		this.region.show(this.layout);
		this.layout.getRegion('subheader').show(
			new TrabajadoresNav({
				model: {
					titulo: 'Listar trabajadores',
					listar: false,
					exportar: true,
					crear: true,
					editar: false,
					masivo: true,
				},
			})
		);

		const view = new TrabajadoresListarView({
			collection: $App.Collections.trabajadores,
		});

		this.listenTo(view, 'remove:trabajador', this.trabajadorService.removeTrabajador);
		this.layout.getRegion('body').show(view);
	}

	destroy(): void {
		this.region.remove();
		this.stopListening();
	}
}
