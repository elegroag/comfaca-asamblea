'use strict';

class TrabajadoresListar {
	constructor(options = {}) {
		_.extend(this, Backbone.Events);
		_.extend(this, options);
		this.trabajadorService = new TrabajadorService();
	}

	listarTrabajadores() {
		this.layout = new LayoutView();
		this.region.show(this.layout);
		this.layout.getRegion('subheader').show(
			new TrabajadoresNav({
				model: {
					titulo: 'Listar trabajadores',
					listar: false,
					exportar: true,
					crear: true,
					editar: false,
					masivo: true,
				},
			})
		);

		const view = new TrabajadoresListarView({
			collection: $App.Collections.trabajadores,
		});

		this.listenTo(view, 'remove:trabajador', this.trabajadorService.removeTrabajador);
		this.layout.getRegion('body').show(view);
	}

	destroy() {
		this.region.remove();
		this.stopListening();
	}
}
