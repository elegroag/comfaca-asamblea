import LayoutView from "@/componentes/habiles/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaDetalleView from "@/componentes/habiles/views/EmpresaDetalleView";
import EmpresaService from "./EmpresaService";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var EmpresaNav: any;
}

interface EmpresaDetalleOptions {
	region?: any;
	[key: string]: any;
}

export default class EmpresaDetalle {
	public region: any;
	public layout: any;
	public empresaService: EmpresaService;

	constructor(options: EmpresaDetalleOptions = {}) {
		this.layout = null;
		_.extend(this, Backbone.Events);
		_.extend(this, options);

		this.empresaService = new EmpresaService();
		EmpresaService.initEmpresas();

		if (typeof this.listenTo === 'function') {
			this.listenTo(this, 'set:empresas', this.empresaService.__setEmpresas);
			this.listenTo(this, 'add:empresa', this.empresaService.__addEmpresas);
		}
	}

	/**
	 * Mostrar vista de detalles de empresa
	 */
	detalleEmpresa(model: any): void {
		console.log('EmpresaDetalle.detalleEmpresa() called', model);

		this.layout = new LayoutView();
		this.region.show(this.layout);

		// Configurar navegación
		const navView = new EmpresaNav({
			model: {
				titulo: 'Detalle empresa',
				listar: true,
				exportar: false,
				crear: true,
				editar: true,
				masivo: true,
			},
		});

		this.layout.getRegion('subheader').show(navView);

		// Configurar vista principal
		const detalleView = new EmpresaDetalleView({ model: model });
		this.layout.getRegion('body').show(detalleView);

		// Establecer parent view para navegación
		if (EmpresaNav) {
			EmpresaNav.parentView = detalleView;
		}
	}

	/**
	 * Destruir la vista
	 */
	destroy(): void {
		console.log('EmpresaDetalle.destroy() called');

		if (this.region && typeof this.region.remove === 'function') {
			this.region.remove();
		}

		if (typeof this.stopListening === 'function') {
			this.stopListening();
		}
	}
}
