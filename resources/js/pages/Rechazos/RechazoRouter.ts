import RechazosController from "./RechazosController";

declare global {
	var Backbone: any;
	var $App: any;
}

interface RechazoRouterOptions {
	[key: string]: any;
}

export default class RechazoRouter extends Backbone.Router {
	constructor(options: RechazoRouterOptions = {}) {
		super({
			...options,
			routes: {
				listar: 'listaRechazos',
				cargue: 'masivoRechazo',
				crear: 'crearRechazo',
				'detalle/:id': 'detailRechazo',
				'edita/:id': 'editaRechazo',
			},
		});
		this._bindRoutes();
	}

	masivoRechazo(): void {
		const app = this.main();
		app.showMasivo();
	}

	listaRechazos(): void {
		const app = this.main();
		app.showList();
	}

	crearRechazo(): void {
		const app = this.main();
		app.showCreate();
	}

	detailRechazo(id: string): void {
		const app = this.main();
		app.showDetalle(id);
	}

	editaRechazo(id: string): void {
		const app = this.main();
		app.showEditar(id);
	}

	main(): any {
		return $App.startSubApplication(RechazosController);
	}
}
