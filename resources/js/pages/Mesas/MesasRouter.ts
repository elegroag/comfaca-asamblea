import { Router } from "backbone";
import MesasController from "./MesasController";

declare global {
	var $App: any;
	var MesasApp: any;
}

interface MesasRouterOptions {
	el?: string;
	defaultRoute?: string;
}

export default class MesasRouter extends Router {
	private currentApp: MesasController | null;
	private defaultRoute: string;

	constructor(options: MesasRouterOptions = {}) {
		super({
			routes: {
				listar: 'listarMesas',
				crear: 'crearMesa',
				listar_comfaca: 'listarMesas',
				'editar/:id': 'editaMesa',
				'mostrar/:mesa': 'mostrarMesas',
			},
		});

		this.defaultRoute = options.defaultRoute || 'listar';
		this.currentApp = null;
		this._bindRoutes();
	}

	initialize(): void {
		this.currentApp = new MesasController({ router: this });
	}

	mostrarMesas(id: string): void {
		if (!id || id.trim() === '') {
			this.navigate(this.defaultRoute, { trigger: true });
			return;
		}

		if (this.currentApp) {
			this.currentApp.mostrarMesas(id);
		}
	}

	crearMesa(): void {
		if (this.currentApp) {
			this.currentApp.crearMesa();
		}
	}

	editaMesa(id: string): void {
		if (!id || id.trim() === '') {
			this.navigate(this.defaultRoute, { trigger: true });
			return;
		}

		if (this.currentApp) {
			this.currentApp.editaMesa(id);
		}
	}

	listarMesas(): void {
		if (this.currentApp) {
			this.currentApp.listarMesas();
		}
	}
}
