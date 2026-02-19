import LayoutView from "@/componentes/rechazos/views/LayoutView";
import RechazoMasivoView from "@/componentes/rechazos/views/RechazoMasivoView";
import RechazosNav from "@/componentes/rechazos/views/RechazosNav";
import RechazoService from "@/pages/Rechazos/RechazoService";

declare global {
	var _: any;
	var Backbone: any;
	var $App: any;
}

interface RechazosMasivoOptions {
	[key: string]: any;
}

export default class RechazosMasivo {
	region: any;
	layout: LayoutView;
	rechazoService: RechazoService;

	constructor(options: RechazosMasivoOptions = {}) {
		_.extend(this, Backbone.Events);
		_.extend(this, options);
		$App.Collections.rechazos = null;
		this.rechazoService = new RechazoService();
		this.listenTo(this, 'set:rechazos', this.rechazoService.setRechazos);
		this.listenTo(this, 'add:rechazos', this.rechazoService.addRechazos);
	}

	cargueMasivo(): void {
		if (!$App.Collections.rechazos) this.rechazoService.findAll();
		this.layout = new LayoutView();
		this.region.show(this.layout);
		this.layout.getRegion('body').show(new RechazoMasivoView());
		this.layout.getRegion('subheader').show(
			new RechazosNav({
				model: {
					titulo: 'Cargue de rechazos Asamblea',
					listar: true,
					exportar: true,
					crear: true,
					editar: false,
					masivo: false,
				},
			})
		);
	}

	destroy(): void {
		this.region.remove();
		this.stopListening();
	}
}
