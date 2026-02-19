import LayoutView from "@/componentes/rechazos/views/LayoutView";
import RechazoListarView from "@/componentes/rechazos/views/RechazoListarView";
import RechazosNav from "@/componentes/rechazos/views/RechazosNav";
import RechazoService from "@/pages/Rechazos/RechazoService";

declare global {
	var _: any;
	var Backbone: any;
	var $: any;
	var $App: any;
	var create_url: (path: string) => string;
	var loading: any;
}

interface RechazosListarOptions {
	[key: string]: any;
}

export default class RechazosListar {
	region: any;
	layout: LayoutView;
	rechazoService: RechazoService;

	constructor(options: RechazosListarOptions = {}) {
		_.extend(this, Backbone.Events);
		_.extend(this, options);
		$App.Collections.rechazos = null;

		this.rechazoService = new RechazoService();
		this.listenTo(this, 'set:rechazos', this.rechazoService.setRechazos);
		this.listenTo(this, 'add:rechazos', this.rechazoService.addRechazos);
	}

	listaRechazos(): void {
		this.layout = new LayoutView();
		this.region.show(this.layout);

		if (!$App.Collections.rechazos) {
			loading.show(true);
			$App.trigger('syncro', {
				url: create_url('rechazos/listar'),
				callback: (response: any) => {
					if (response) {
						setTimeout(() => loading.hide(true), 300);
						if (response.success) {
							RechazoService.initEmpresas();
							$App.Collections.rechazos.add(response.empresas, { merge: true });
							this.renderLista();
						} else {
							$App.trigger('error', response.msj);
						}
					}
				},
			});
		} else {
			this.renderLista();
		}
	}

	renderLista(): void {
		$('#minimizeSidebar').trigger('click');
		const view = new RechazoListarView({
			collection: $App.Collections.rechazos,
		});

		this.listenTo(view, 'remove:rechazos', this.rechazoService.removeRechazo);
		this.layout.getRegion('body').show(view);
		this.layout.getRegion('subheader').show(
			new RechazosNav({
				model: {
					titulo: 'Listar rechazos empresas Asamblea',
					listar: false,
					exportar: true,
					crear: true,
					editar: false,
					masivo: true,
				},
			})
		);
		$('#minimizeSidebar').trigger('click');
	}

	destroy(): void {
		this.region.remove();
		this.stopListening();
	}
}
