import TrabajadoresCollection from "@/componentes/trabajadores/collections/TrabajadoresCollection";
import Trabajador from "@/componentes/trabajadores/models/Trabajador";

declare global {
	var $App: any;
	var create_url: (path: string) => string;
}

interface SaveTrabajadorTransfer {
	model: any;
	callback: (response: any) => void;
}

interface RemoveTrabajadorTransfer {
	trabajador: any;
	callback: (response: any) => void;
}

export default class TrabajadorService {
	trabajadores: any[];

	constructor() {
		this.trabajadores = [];
	}

	static initTrabajadores(): void {
		if (!$App.Collections.trabajadores) {
			$App.Collections.trabajadores = new TrabajadoresCollection();
			$App.Collections.trabajadores.reset();
		}
	}

	__findAll(): void {
		$App.trigger('syncro', {
			url: create_url('trabajadores/listar'),
			data: {},
			callback: (response: any) => {
				if (response.success === true) {
					TrabajadorService.initTrabajadores();
					$App.Collections.trabajadores.add(response.trabajadores, { merge: true });
				} else {
					$App.trigger('alert:error', response.msj);
				}
			},
		});
	}

	__setTrabajadores(trabajadores: any): void {
		TrabajadorService.initTrabajadores();
		$App.Collections.trabajadores.add(trabajadores, { merge: true });
	}

	__addTrabajadores(trabajador: any): void {
		TrabajadorService.initTrabajadores();
		const _trabajador = trabajador instanceof Trabajador ? trabajador : new Trabajador(trabajador);
		$App.Collections.trabajadores.add(_trabajador, { merge: true });
	}

	__saveTrabajador(transfer: SaveTrabajadorTransfer = {} as SaveTrabajadorTransfer): void {
		const { model, callback } = transfer;
		if (!model.isValid()) {
			const errors = model.validationError;
			$App.trigger('alert:error', errors.toString());
			callback(false);
		} else {
			$App.trigger('confirma', {
				message: 'Se requiere de confirmar la acción a realizar para guardar los datos',
				callback: (confirm: boolean) => {
					if (confirm) {
						$App.trigger('syncro', {
							url: create_url('trabajadores/saveTrabajador'),
							data: model.toJSON(),
							callback: (response: any) => {
								return callback(response);
							},
						});
					}
				},
			});
		}
	}

	__removeTrabajador(transfer: RemoveTrabajadorTransfer = {} as RemoveTrabajadorTransfer): void {
		const { trabajador, callback } = transfer;
		$App.trigger('syncro', {
			url: create_url('trabajadores/removeTrabajador'),
			data: trabajador.toJSON(),
			callback: (response: any) => {
				return callback(response);
			},
		});
	}

	removeTrabajador(trabajador: any): void {
		this.__removeTrabajador({
			trabajador, callback: (response: any) => {
				if (response && response.success) {
					$App.Collections.trabajadores.remove(trabajador);
					$App.trigger('alert:success', response.msj);
				} else {
					$App.trigger('alert:error', response.msj);
				}
			}
		});
	}
}
