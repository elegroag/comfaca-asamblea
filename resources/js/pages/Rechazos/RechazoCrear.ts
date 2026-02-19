import LayoutView from "@/componentes/rechazos/views/LayoutView";
import RechazoCrearView from "@/componentes/rechazos/views/RechazoCrearView";
import RechazosNav from "@/componentes/rechazos/views/RechazosNav";
import RechazoService from "@/componentes/rechazos/services/RechazoService";
import RechazoModel from "@/componentes/rechazos/models/RechazoModel";

declare global {
	var _: any;
	var Backbone: any;
	var $App: any;
	var create_url: (path: string) => string;
}

interface RechazoCrearOptions {
	[key: string]: any;
}

export default class RechazoCrear {
	layout: LayoutView;
	region: any;
	rechazoService: RechazoService;

	constructor(options: RechazoCrearOptions = {}) {
		_.extend(this, Backbone.Events);
		_.extend(this, options);
		$App.Collections.rechazos = null;

		this.rechazoService = new RechazoService();
		this.listenTo(this, 'set:rechazos', this.rechazoService.setRechazos);
		this.listenTo(this, 'add:rechazos', this.rechazoService.addRechazos);

		if (!$App.Collections.empresas) this.rechazoService.findAll();
	}

	showCreate(): void {
		this.layout = new LayoutView();
		this.region.show(this.layout);

		$App.trigger('syncro', {
			url: create_url('rechazos/buscarCriterios'),
			callback: (response: any) => {
				if (response) {
					const criterios = response.data;
					const model = new RechazoModel({
						isNew: true,
						criterios: criterios,
					});

					const view = new RechazoCrearView({
						collection: $App.Collections.rechazos,
						model: model,
					});
					this.listenTo(view, 'form:save', this.rechazoService.saveRechazo);
					this.listenTo(view, 'add:notify', this.rechazoService.notifyPlataforma);
					this.layout.getRegion('body').show(view);
				}
			},
		});

		this.layout.getRegion('subheader').show(
			new RechazosNav({
				model: {
					titulo: 'Crear rechazo',
					listar: true,
					exportar: false,
					crear: false,
					editar: false,
					masivo: true,
				},
			})
		);
	}

	showEditar(model: any): void {
		this.layout = new LayoutView();
		this.region.show(this.layout);

		$App.trigger('syncro', {
			url: create_url('rechazos/buscarCriterios'),
			callback: (response: any) => {
				if (response) {
					const criterios = response.data;
					model.set('criterios', criterios);
					model.set('isNew', false);

					const view = new RechazoCrearView({
						collection: $App.Collections.rechazos,
						model: model,
					});
					this.listenTo(view, 'form:editar', this.rechazoService.saveRechazo);
					this.listenTo(view, 'add:notify', this.rechazoService.notifyPlataforma);
					this.layout.getRegion('body').show(view);
				}
			},
		});

		this.layout.getRegion('subheader').show(
			new RechazosNav({
				model: {
					titulo: 'Editar rechazo',
					listar: true,
					exportar: false,
					crear: false,
					editar: false,
					masivo: true,
				},
			})
		);
	}

	destroy(): void {
		this.region.remove();
		this.stopListening();
	}
}
