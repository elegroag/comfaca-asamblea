import { Region } from '@/common/Region';
import { Controller } from '@/common/Controller';
import NovedadesListar from '@/componentes/novedades/views/NovedadesListar';
import NovedadDetalle from '@/componentes/novedades/views/NovedadDetalle';
import Novedad from '@/componentes/novedades/models/Novedad';
import NovedadesCollection from '@/componentes/novedades/models/NovedadesCollection';

import {
	NovedadResponse,
	NovedadesListResponse
} from './types';

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var create_url: (path: string) => string;
	var scroltop: () => void;
}

interface NovedadesControllerOptions {
	region?: Region;
	[key: string]: any;
}

export default class NovedadesController extends Controller {
	currentView: any;

	constructor(options: NovedadesControllerOptions = {}) {
		super(options);

		// Inicializar colección de novedades
		if (!$App.Collections) {
			$App.Collections = {};
		}
		$App.Collections.novedades = null;

		// Configurar listeners
		this.listenTo(this, 'set:novedades', this.__setNovedades);
		this.listenTo(this, 'add:novedad', this.__addNovedad);
	}

	/**
	 * Listar novedades
	 */
	async listarNovedades(): Promise<void> {
		try {
			console.log('NovedadesController.listarNovedades() called');

			this.__createContent();
			this.__initNovedades();

			if (!this.api) return;

			const response = await this.api.get('/novedades/listar/');

			if (response && response.success) {
				this.trigger('set:novedades', response.novedades);

				const view = new NovedadesListar({
					collection: $App.Collections.novedades,
					App: this
				});

				this.currentView = view;
				this.showView(view);

				this.listenTo(view, 'remove:row', this.__removeNovedad);
				this.listenTo(view, 'item:procesar', this.__procesarNovedad);
				this.listenTo(view, 'all:procesar', this.__procesarAll);
				this.listenTo(view, 'all:update', this.__updateAll);
			} else {
				this.trigger('alert:error', { message: response.msj || 'Error al cargar novedades' });
			}
		} catch (error: any) {
			this.logger.error(error);
			this.trigger('alert:error', { message: error.message || 'Error al cargar las novedades' });
		}
	}

	/**
	 * Mostrar detalle de novedad
	 */
	async detalleNovedad(id: string): Promise<void> {
		try {
			console.log('NovedadesController.detalleNovedad() called', id);

			this.__createContent();
			this.__initNovedades();

			if (!$App.Collections.novedades || _.size($App.Collections.novedades) === 0) {
				if (!this.api) return;

				const response = await this.api.get('/novedades/listar/');

				if (response && response.success) {
					this.trigger('set:novedades', response.novedades);
					const model = $App.Collections.novedades.get(id);

					if (model) {
						const view = new NovedadDetalle({
							model: model,
							App: this
						});

						this.currentView = view;
						this.showView(view);
						this.listenTo(view, 'item:procesar', this.__procesarNovedad);
					}
				} else {
					this.trigger('alert:error', { message: response.msj || 'Error al cargar novedades' });
				}
			} else {
				const model = $App.Collections.novedades.get(id);

				if (model) {
					const view = new NovedadDetalle({
						model: model,
						App: this
					});

					this.currentView = view;
					this.showView(view);
					this.listenTo(view, 'item:procesar', this.__procesarNovedad);
				}
			}
		} catch (error: any) {
			this.logger.error(error);
			this.trigger('alert:error', { message: error.message || 'Error al cargar el detalle de la novedad' });
		}
	}

	/**
	 * Eliminar novedad
	 */
	private __removeNovedad(transfer: { model: any; callback: (response: any) => void }): void {
		const { model, callback } = transfer;

		if (!this.api) {
			callback(false);
			return;
		}

		this.api.delete('/novedades/remove/' + model.get('id'))
			.then((response: any) => {
				if (response && response.success) {
					callback(response);
				} else {
					callback(false);
				}
			})
			.catch((error: any) => {
				this.logger.error(error);
				callback(false);
			});
	}

	/**
	 * Procesar novedad
	 */
	private __procesarNovedad(transfer: { model: any; callback: (response: any) => void }): void {
		const { model, callback } = transfer;

		if (!this.api) {
			callback(false);
			return;
		}

		this.api.post('/novedades/procesar/' + model.get('id'), model.toJSON())
			.then((response: any) => {
				if (response) {
					callback(response);
				} else {
					callback(false);
				}
			})
			.catch((error: any) => {
				this.logger.error(error);
				callback(false);
			});
	}

	/**
	 * Actualizar todos
	 */
	private __updateAll(transfer: { estado: any; callback: (response: any) => void }): void {
		const { estado, callback } = transfer;

		if (!this.api) {
			callback(false);
			return;
		}

		this.api.post('/novedades/updateHabiles', { estado })
			.then((response: any) => {
				if (response) {
					callback(response);
				} else {
					callback(false);
				}
			})
			.catch((error: any) => {
				this.logger.error(error);
				callback(false);
			});
	}

	/**
	 * Procesar todos
	 */
	private __procesarAll(transfer: { estado: any; callback: (response: any) => void }): void {
		const { estado, callback } = transfer;

		if (!this.api) {
			callback(false);
			return;
		}

		this.api.post('/novedades/procesaActivar', { estado })
			.then((response: any) => {
				if (response) {
					callback(response);
				} else {
					callback(false);
				}
			})
			.catch((error: any) => {
				this.logger.error(error);
				callback(false);
			});
	}

	/**
	 * Establecer novedades
	 */
	private __setNovedades(novedades: any[]): void {
		this.__initNovedades();
		$App.Collections.novedades.add(novedades, { merge: true });
	}

	/**
	 * Agregar novedad
	 */
	private __addNovedad(novedad: any): void {
		this.__initNovedades();
		const _novedad = novedad instanceof Novedad ? novedad : new Novedad(novedad);
		$App.Collections.novedades.add(_novedad, { merge: true });
	}

	/**
	 * Inicializar novedades
	 */
	private __initNovedades(): void {
		if (!$App.Collections.novedades) {
			$App.Collections.novedades = new NovedadesCollection();
			$App.Collections.novedades.reset();
		}
	}

	/**
	 * Crear contenido
	 */
	private __createContent(): void {
		if (this.region && this.region.el) {
			$(this.region.el).remove();
		}

		const _el = document.createElement('div');
		_el.setAttribute('id', this.region.id);

		const appElement = document.getElementById('app');
		if (appElement) {
			appElement.appendChild(_el);
		}

		if (typeof scroltop === 'function') {
			scroltop();
		}
	}

	/**
	 * Mostrar vista
	 */
	private showView(view: any): void {
		if (this.region && this.region.el) {
			$(this.region.el).html(view.render().el);
		}
	}
}
