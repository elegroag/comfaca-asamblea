import { Controller } from '@/common/Controller';
import ConsensosListar from "@/componentes/consensos/views/ConsensosListar";
import ConsensoCrear from "@/componentes/consensos/views/ConsensoCrear";
import ConsensoDetalle from "@/componentes/consensos/views/ConsensoDetalle";
import $App from "@/core/App";

// Declaraciones para las colecciones globales
declare global {
	var $: any;
	var _: any;
	var $App: any;
	var create_url: (path: string) => string;
	var scroltop: () => void;
	var ConsensosCollection: any;
}

interface ConsensoControllerOptions {
	region?: {
		el: HTMLElement;
		id: string;
	};
	router?: any;
	logger?: any;
	api?: any;
}

export default class ConsensoController extends Controller {
	public currentView: any;
	public Collections: any;

	constructor(options: ConsensoControllerOptions = {}) {
		super(options);
		this.currentView = null;
		this.Collections = {
			asambleas: null,
			consensos: null,
		};
		this.__initializeCollections();
	}

	/**
	 * Inicializar las colecciones necesarias
	 */
	private __initializeCollections(): void {
		if ($App && $App.Collections) {
			$App.Collections.asambleas = null;
			$App.Collections.consensos = null;
		}
	}

	/**
	 * Listar consensos
	 */
	async listarConsensos(): Promise<void> {
		console.log('ConsensoController.listarConsensos() called');

		try {
			this.__createContent();

			if (!this.Collections.consensos || this.Collections.consensos.length === 0) {
				const url = create_url('admin/listar_consensos');

				if ($App && typeof $App.trigger === 'function') {
					$App.trigger('syncro', {
						url,
						data: {},
						callback: (response: any) => {
							if (response && response.success) {
								this.__setConsensos(response.consenso);

								const view = new ConsensosListar({
									collection: this.Collections.consensos,
								});

								this.currentView = view;
								$(this.region.el).html(view.render().el);

								if (typeof this.listenTo === 'function') {
									this.listenTo(view, 'set:consensos', this.__setConsensos);
								}
							}
						},
					});
				}
			} else {
				const view = new ConsensosListar({
					collection: this.Collections.consensos,
				});

				this.currentView = view;
				$(this.region.el).html(view.render().el);
			}
		} catch (err: any) {
			console.error('Error al listar consensos:', err);
			this.trigger('alert:error', { message: 'Error de conexión al listar consensos' });
		}
	}

	/**
	 * Formulario crear consenso
	 */
	formCrearConsenso(): void {
		console.log('ConsensoController.formCrearConsenso() called');

		this.__createContent();
		const view = new ConsensoCrear();

		this.currentView = view;
		$(this.region.el).html(view.render().el);
	}

	/**
	 * Formulario editar consenso
	 */
	formEditConsenso(id: string): void {
		console.log('ConsensoController.formEditConsenso() called', id);

		this.__createContent();
		const view = new ConsensoCrear({ id: id });

		this.currentView = view;
		$(this.region.el).html(view.render().el);
	}

	/**
	 * Detalle del consenso
	 */
	consensoDetalle(id: string): void {
		console.log('ConsensoController.consensoDetalle() called', id);

		this.__createContent();
		const view = new ConsensoDetalle({ id: id });

		this.currentView = view;
		$(this.region.el).html(view.render().el);
	}

	/**
	 * Establecer consensos
	 */
	private __setConsensos(_consensos: any): void {
		if (!this.Collections.consensos && typeof ConsensosCollection !== 'undefined') {
			this.Collections.consensos = new ConsensosCollection();
			if (typeof this.Collections.consensos.reset === 'function') {
				this.Collections.consensos.reset();
			}
		}

		if (this.Collections.consensos && typeof this.Collections.consensos.add === 'function') {
			this.Collections.consensos.add(_consensos, { merge: true });
		}
	}

	/**
	 * Crear el contenido principal
	 */
	private __createContent(): HTMLElement {
		$(this.region.el).remove();
		const _el = document.createElement('div');
		_el.setAttribute('id', this.region.id);

		const appElement = document.getElementById('app');
		if (appElement) {
			appElement.appendChild(_el);
		}

		if (scroltop) {
			scroltop();
		}

		return _el;
	}
}
