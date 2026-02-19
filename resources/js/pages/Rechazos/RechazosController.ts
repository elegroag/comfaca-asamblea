'use strict';
class RechazosController extends Controller {
	constructor(options) {
		super(options);
		this.rechazoService = new RechazoService();
	}

	showCreate() {
		const auth = this.startController(RechazoCrear);
		auth.showCreate();
	}

	showList() {
		const auth = this.startController(RechazosListar);
		auth.listaRechazos();
	}

	showMasivo() {
		const auth = this.startController(RechazosMasivo);
		auth.cargueMasivo();
	}

	showDetalle(id) {
		const auth = this.startController(RechazoDetalle);
		if (!$App.Collections.rechazos || _.size($App.Collections.rechazos) == 0) {
			$App.trigger('syncro', {
				url: create_url('rechazos/detail'),
				data: {
					id: id,
				},
				callback: (response) => {
					if (response.success == true) {
						const criterios = response.data;
						const model = new RechazoModel({
							...criterios,
							isNew: false,
						});
						auth.showDetalle(model);
					} else {
						$App.trigger('error', response.msj);
					}
				},
			});
		} else {
			const model = $App.Collections.rechazos.get(id);
			auth.showDetalle(model);
		}
	}

	showEditar(id) {
		const auth = this.startController(RechazoCrear);
		if (!$App.Collections.rechazos || _.size($App.Collections.rechazos) == 0) {
			$App.trigger('syncro', {
				url: create_url('rechazos/detail'),
				data: {
					id: id,
				},
				callback: (response) => {
					if (response.success == true) {
						const model = new RechazoModel(response.data);
						auth.showEditar(model);
					}
				},
			});
		} else {
			const model = $App.Collections.rechazos.get(id);
			auth.showEditar(model);
		}
	}
}
