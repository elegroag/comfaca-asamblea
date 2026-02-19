import { Controller } from '@/common/Controller';
import EmpresaListar from "@/componentes/habiles/views/EmpresaListarView";
import EmpresaCrear from "@/componentes/habiles/views/EmpresaCrearView";
import EmpresaEditar from "@/componentes/habiles/views/EmpresaEditarView";
import EmpresaDetalle from "@/componentes/habiles/views/EmpresaDetalleView";
import EmpresaMasivo from "@/componentes/habiles/views/EmpresaMasivoView";
import EmpresasHabiles from "@/componentes/habiles/views/EmpresasListarView";
import EmpresaService from "@/componentes/habiles/services/EmpresaService";
import $App from "@/core/App";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var create_url: (path: string) => string;
	var loading: {
		show: (show?: boolean) => void;
		hide: (hide?: boolean) => void;
	};
	var Empresa: any;
	var EmpresasCollection: any;
	var HabilesCollection: any;
}

interface EmpresasControllerOptions {
	region?: {
		el: HTMLElement;
		id: string;
	};
	router?: any;
	logger?: any;
	api?: any;
}

export default class EmpresasController extends Controller {
	public Collections: {
		empresas: any;
		habiles: any;
	};

	constructor(options: EmpresasControllerOptions = {}) {
		super(options);
		this.Collections = {
			empresas: null,
			habiles: null,
		};
		this.__initializeCollections();
	}

	/**
	 * Inicializar las colecciones necesarias
	 */
	private __initializeCollections(): void {
		if ($App && $App.Collections) {
			$App.Collections.empresas = null;
			$App.Collections.habiles = null;
		}
	}

	/**
	 * Listar empresas
	 */
	async listaEmpresas(): Promise<void> {
		console.log('EmpresasController.listaEmpresas() called');

		try {
			const auth = this.startController(EmpresaListar);

			if (!this.Collections.empresas || !this.Collections.empresas.length || this.Collections.empresas.length === 0) {
				const url = create_url('habiles/listar');

				if ($App && typeof $App.trigger === 'function') {
					$App.trigger('syncro', {
						url,
						data: {},
						callback: (response: any) => {
							if (response && response.success === true) {
								const empresaService = new EmpresaService();
								empresaService.__setEmpresas(response.empresas);
								auth.listaEmpresas();
							} else {
								if ($App && typeof $App.trigger === 'function') {
									$App.trigger('error', response.msj || 'Error al listar empresas');
								}
							}
						},
					});
				}
			} else {
				if (loading) loading.show(true);
				auth.listaEmpresas();
				setTimeout(() => {
					if (loading) loading.hide(true);
				}, 300);
			}
		} catch (err: any) {
			console.error('Error al listar empresas:', err);
			if ($App && typeof $App.trigger === 'function') {
				$App.trigger('error', 'Error de conexión al listar empresas');
			}
		}
	}

	/**
	 * Crear empresa
	 */
	crearEmpresa(): void {
		console.log('EmpresasController.crearEmpresa() called');

		const auth = this.startController(EmpresaCrear);
		auth.crearEmpresa();
	}

	/**
	 * Cargue masivo de empresas
	 */
	cargueMasivo(): void {
		console.log('EmpresasController.cargueMasivo() called');

		const auth = this.startController(EmpresaMasivo);
		auth.cargueMasivo();
	}

	/**
	 * Editar empresa
	 */
	async editaEmpresa(nit: string): Promise<void> {
		console.log('EmpresasController.editaEmpresa() called', nit);

		try {
			const auth = this.startController(EmpresaEditar);

			if (!this.Collections.empresas || !this.Collections.empresas.length || this.Collections.empresas.length <= 1) {
				const url = create_url('habiles/listar');

				if ($App && typeof $App.trigger === 'function') {
					$App.trigger('syncro', {
						url,
						data: {},
						callback: (response: any) => {
							if (response && response.success === true) {
								const empresaService = new EmpresaService();
								empresaService.__setEmpresas(response.empresas);
								const model = this.Collections.empresas.get(nit);
								auth.editaEmpresa(model);
							} else {
								if ($App && typeof $App.trigger === 'function') {
									$App.trigger('error', response.msj || 'Error al obtener datos de la empresa');
								}
							}
						},
					});
				}
			} else {
				const model = this.Collections.empresas.get(nit);
				auth.editaEmpresa(model);
			}
		} catch (err: any) {
			console.error('Error al editar empresa:', err);
			if ($App && typeof $App.trigger === 'function') {
				$App.trigger('error', 'Error de conexión al editar empresa');
			}
		}
	}

	/**
	 * Detalle de empresa
	 */
	async detalleEmpresa(nit: string): Promise<void> {
		console.log('EmpresasController.detalleEmpresa() called', nit);

		try {
			const auth = this.startController(EmpresaDetalle);

			if (!this.Collections.empresas || !this.Collections.empresas.length || this.Collections.empresas.length === 0) {
				const url = create_url('habiles/listar');

				if ($App && typeof $App.trigger === 'function') {
					$App.trigger('syncro', {
						url,
						data: {},
						callback: (response: any) => {
							if (response && response.success === true) {
								const empresaService = new EmpresaService();
								empresaService.__setEmpresas(response.empresas);
								const model = this.Collections.empresas.get(nit);
								auth.detalleEmpresa(model);
							} else {
								if ($App && typeof $App.trigger === 'function') {
									$App.trigger('error', response.msj || 'Error al obtener detalles de la empresa');
								}
							}
						},
					});
				}
			} else {
				const model = this.Collections.empresas.get(nit);
				auth.detalleEmpresa(model);
			}
		} catch (err: any) {
			console.error('Error al mostrar detalle de empresa:', err);
			if ($App && typeof $App.trigger === 'function') {
				$App.trigger('error', 'Error de conexión al mostrar detalles de la empresa');
			}
		}
	}

	/**
	 * Listar habiles
	 */
	async listarHabiles(): Promise<void> {
		console.log('EmpresasController.listarHabiles() called');

		try {
			const auth = this.startController(EmpresasHabiles);

			if (!this.Collections.habiles || !this.Collections.habiles.length || this.Collections.habiles.length === 0) {
				if (loading) loading.show(true);

				const url = create_url('habiles/lista_habiles');

				if ($App && typeof $App.trigger === 'function') {
					$App.trigger('syncro', {
						url,
						callback: (response: any) => {
							setTimeout(() => {
								if (loading) loading.hide(true);
							}, 300);

							if (response && response.success === true) {
								const empresaService = new EmpresaService();
								empresaService.__setHabiles(response.empresas);
								auth.listarHabiles();
							} else {
								if ($App && typeof $App.trigger === 'function') {
									$App.trigger('error', response.msj || 'Error al listar habiles');
								}
							}
						},
					});
				}
			} else {
				auth.listarHabiles();
			}
		} catch (err: any) {
			console.error('Error al listar habiles:', err);
			if (loading) loading.hide(true);
			if ($App && typeof $App.trigger === 'function') {
				$App.trigger('error', 'Error de conexión al listar habiles');
			}
		}
	}
}
