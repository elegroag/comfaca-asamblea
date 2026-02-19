import LayoutView from "@/componentes/trabajadores/views/LayoutView";
import TrabajadoresNav from "@/componentes/trabajadores/views/TrabajadoresNav";
import TrabajadorCrearView from "@/componentes/trabajadores/views/TrabajadorCrearView";
import Trabajador from "@/componentes/trabajadores/models/Trabajador";
import TrabajadorService from "@/componentes/trabajadores/services/TrabajadorService";

declare global {
	var _: any;
	var Backbone: any;
	var $App: any;
}

interface TrabajadorCrearOptions {
	[key: string]: any;
}

export default class TrabajadorCrear {
	layout: LayoutView;
	region: any;
	trabajadorService: TrabajadorService;

	constructor(options: TrabajadorCrearOptions = {}) {
		_.extend(this, Backbone.Events);
		_.extend(this, options);
		this.trabajadorService = new TrabajadorService();

		this.listenTo(this, 'add:trabajador', this.trabajadorService.__addTrabajador);
		this.listenTo(this, 'set:trabajador', this.trabajadorService.__setTrabajador);
	}

	crearTrabajador(): void {
		this.layout = new LayoutView();
		this.region.show(this.layout);
		this.layout.getRegion('subheader').show(
			new TrabajadoresNav({
				model: {
					titulo: 'Crear trabajador',
					listar: false,
					exportar: false,
					crear: false,
					editar: false,
					masivo: false,
				},
			})
		);

		const view = new TrabajadorCrearView({
			model: new Trabajador({ isNew: true }),
			collection: $App.Collections.trabajadores,
		});

		this.listenTo(view, 'remove:trabajador', this.trabajadorService.__removeTrabajador);
		this.listenTo(view, 'form:save', this.trabajadorService.__saveTrabajador);
		this.layout.getRegion('body').show(view);
		(TrabajadoresNav as any).parentView = view;
	}

	destroy(): void {
		this.region.remove();
		this.stopListening();
	}
}
