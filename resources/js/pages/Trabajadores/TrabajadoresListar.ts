import LayoutView from "@/componentes/trabajadores/views/LayoutView";
import TrabajadoresNav from "@/componentes/trabajadores/views/TrabajadoresNav";
import TrabajadoresListarView from "@/componentes/trabajadores/views/TrabajadoresListarView";
import TrabajadorService from "./TrabajadorService";
import { Controller } from "@/common/Controller";
import { CommonDeps } from "@/types/CommonDeps";

interface TrabajadoresListarOptions extends CommonDeps {
	[key: string]: any;
}

export default class TrabajadoresListar extends Controller {
	private trabajadorService: TrabajadorService;

	constructor(options: TrabajadoresListarOptions) {
		super(options);
		this.trabajadorService = new TrabajadorService({
			api: options.api,
			logger: options.logger,
			app: options.app
		});
	}

	listarTrabajadores(): void {
		try {
			const layout = new LayoutView();
			this.region.show(layout);

			const subheaderRegion = layout.getRegion('subheader');
			if (subheaderRegion) {
				subheaderRegion.show(
					new TrabajadoresNav({
						model: {
							titulo: 'Listar trabajadores',
							listar: false,
							exportar: false,
							crear: false,
							editar: false,
							masivo: false,
							dataToggle: 'dropdown'
						},
					})
				);
			}

			const bodyRegion = layout.getRegion('body');
			if (bodyRegion) {
				const view = new TrabajadoresListarView({
					collection: (this.App as any).Collections.trabajadores,
					App: this.App,
					api: this.api,
					logger: this.logger,
					region: this.region,
				});
				bodyRegion.show(view);

				// Conectar eventos con el servicio
				this.listenTo(view, 'remove:trabajador', this.trabajadorService.__removeTrabajador.bind(this.trabajadorService));
			}

		} catch (error: any) {
			this.logger?.error('Error al listar trabajadores:', error);
			this.App?.trigger('alert:error', error.message || 'Error al listar trabajadores');
		}
	}

	destroy(): void {
		this.region.remove();
		this.stopListening();
	}
}
