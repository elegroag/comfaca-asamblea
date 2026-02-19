'use strict';

class TrabajadoresController extends Controller {
	constructor(options = {}) {
		super(options);
		this.trabajadorService = new TrabajadorService();
	}

	listarTrabajadores() {
		const controller = this.startController(TrabajadoresListar);
		if (!$App.Collections.trabajadores) {
			$App.trigger('syncro', {
				url: create_url('trabajadores/listar'),
				callback: (response) => {
					if (response.success === true) {
						TrabajadorService.initTrabajadores();
						this.trabajadorService.__setTrabajadores(response.trabajadores);
						controller.listarTrabajadores();
					} else {
						$App.trigger('alert:error', response.msj);
					}
				},
			});
		} else {
			controller.listarTrabajadores();
		}
	}

	crearTrabajador() {
		const controller = this.startController(TrabajadorCrear);
		controller.crearTrabajador();
	}

	mostrarTrabajador(cedtra) {
		const controller = this.startController(TrabajadorMostrar);
		controller.mostrarTrabajador(cedtra);
	}

	cargueTrabajador() {
		const controller = this.startController(TrabajadorCargue);
		controller.cargueTrabajador();
	}
}
