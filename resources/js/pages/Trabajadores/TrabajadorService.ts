class TrabajadorService {
	constructor() {
		this.trabajadores = [];
	}

	static initTrabajadores() {
		if (!$App.Collections.trabajadores) {
			$App.Collections.trabajadores = new TrabajadoresCollection();
			$App.Collections.trabajadores.reset();
		}
	}

	__findAll() {
		$App.trigger('syncro', {
			url: create_url('trabajadores/listar'),
			data: {},
			callback: (response) => {
				if (response.success === true) {
					TrabajadorService.initTrabajadores();
					$App.Collections.trabajadores.add(response.trabajadores, { merge: true });
				} else {
					$App.trigger('alert:error', response.msj);
				}
			},
		});
	}

	__setTrabajadores(trabajadores) {
		TrabajadorService.initTrabajadores();
		$App.Collections.trabajadores.add(trabajadores, { merge: true });
	}

	__addTrabajadores(trabajador) {
		TrabajadorService.initTrabajadores();
		const _trabajador = trabajador instanceof Trabajador ? trabajador : new Trabajador(trabajador);
		$App.Collections.trabajadores.add(_trabajador, { merge: true });
	}

	__saveTrabajador(transfer = {}) {
		const { model, callback } = transfer;
		if (!model.isValid()) {
			const errors = model.validationError;
			$App.trigger('alert:error', errors.toString());
			callback(false);
		} else {
			$App.trigger('confirma', {
				message: 'Se requiere de confirmar la acción a realizar para guardar los datos',
				callback: (confirm) => {
					if (confirm) {
						$App.trigger('syncro', {
							url: create_url('trabajadores/saveTrabajador'),
							data: model.toJSON(),
							callback: (response) => {
								return callback(response);
							},
						});
					}
				},
			});
		}
	}

	__removeTrabajador(trabajador) {
		$App.trigger('syncro', {
			url: create_url('trabajadores/removeTrabajador'),
			data: trabajador.toJSON(),
			callback: (response) => {
				return callback(response);
			},
		});
	}
}
