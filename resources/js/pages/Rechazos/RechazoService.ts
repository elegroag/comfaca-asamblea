import RechazosCollection from "@/componentes/rechazos/collections/RechazosCollection";
import RechazoModel from "@/componentes/rechazos/models/RechazoModel";

declare global {
	var $App: any;
	var create_url: (path: string) => string;
}

interface SaveRechazoTransfer {
	model: any;
	callback: (response: any) => void;
}

interface RemoveRechazoTransfer {
	model: any;
	callback: (response: any) => void;
}

export default class RechazoService {
	static initEmpresas(): void {
		if (!$App.Collections.rechazos) {
			$App.Collections.rechazos = new RechazosCollection();
			$App.Collections.rechazos.reset();
		}
	}

	findAll(): void {
		$App.trigger('syncro', {
			url: create_url('rechazos/listar'),
			data: {},
			callback: (response: any) => {
				if (response.success === true) {
					RechazoService.initEmpresas();
					$App.Collections.rechazos.add(response.empresas, { merge: true });
				} else {
					$App.trigger('alert:error', response.msj);
				}
			},
		});
	}

	setRechazos(rechazos: any): void {
		RechazoService.initEmpresas();
		$App.Collections.rechazos.add(rechazos, { merge: true });
	}

	addRechazos(rechazos: any): void {
		RechazoService.initEmpresas();
		const _empresa = rechazos instanceof RechazoModel ? rechazos : new RechazoModel(rechazos);
		$App.Collections.rechazos.add(_empresa, { merge: true });
	}

	saveRechazo(transfer: SaveRechazoTransfer = {} as SaveRechazoTransfer): void {
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
							url: create_url('rechazos/saveRechazo'),
							data: model.toJSON(),
							callback: (response: any) => {
								if (response) {
									if (response.success) {
										$App.trigger('success', response.msj);
										return callback(response);
									} else {
										$App.trigger('error', response.msj);
									}
								}
								return callback(false);
							},
						});
					} else {
						return callback(false);
					}
				},
			});
		}
	}

	removeRechazo(transfer: RemoveRechazoTransfer = {} as RemoveRechazoTransfer): void {
		const { model, callback } = transfer;

		if (model instanceof RechazoModel) {
			$App.trigger('confirma', {
				message: 'Se requiere de confirmar la acción a realizar para remover el registro',
				callback: (confirm: boolean) => {
					if (confirm == true) {
						$App.trigger('syncro', {
							url: create_url(`rechazos/removeRechazo`),
							data: {
								id: model.get('id'),
								cedrep: model.get('cedula_representa'),
								nit: model.get('nit'),
								criterio: model.get('criterio'),
							},
							callback: (response: any) => {
								if (response) {
									if (response.success) {
										$App.Collections.rechazos.remove(model);
										$App.trigger('alert:success', response.msj);
										return callback(response);
									} else {
										$App.trigger('alert:error', response.msj);
									}
								}
								return callback(false);
							},
						});
					}
					return callback(false);
				},
			});
		} else {
			return callback(false);
		}
	}

	notifyPlataforma(nit: string): void {
		$App.trigger('syncro', {
			url: create_url('novedades/notyNuevoHabil'),
			data: {
				nit,
			},
			callback: (response: any) => {
				if (response) {
					if (response.success) {
						$App.trigger('alert:success', response.msj);
					} else {
						$App.trigger('alert:error', response.msj);
					}
				}
			},
		});
	}
}
