'use strict';

class TrabajadorMostrar {
	constructor(options = {}) {
		_.extend(this, Backbone.Events);
		_.extend(this, options);
		this.trabajadorService = new TrabajadorService();
	}

	mostrarTrabajador(model) {
		this.layout = new LayoutView();
		this.region.show(this.layout);

		this.layout.getRegion('subheader').show(
			new TrabajadoresNav({
				model: {
					titulo: 'Mostrar trabajador',
					listar: false,
					exportar: false,
					crear: false,
					editar: false,
					masivo: false,
				},
			})
		);
		const view = new TrabajadorMostrarView({
			model: model,
		});

		this.layout.getRegion('body').show(view);
		TrabajadoresNav.parentView = view;
	}

	destroy() {
		this.region.remove();
		this.stopListening();
	}
}
