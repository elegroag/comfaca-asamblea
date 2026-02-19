import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var langDataTable: any;
}

interface AsistenciasInscritosOptions {
	collection?: any;
	estado?: string;
	App?: any;
	[key: string]: any;
}

export default class AsistenciasInscritos extends BackboneView {
	template!: string;
	App: any;
	estado: string;

	constructor(options: AsistenciasInscritosOptions = {}) {
		super({ ...options, id: 'box_ingresados', tagName: 'div', className: 'box' });
		this.App = options.App;
		this.estado = options.estado || '';
	}

	initialize(options: AsistenciasInscritosOptions) {
		this.estado = options.estado || '';
		this.template = $('#tmp_listar_inscritos').html();
	}

	events() {
		return {};
	}

	render() {
		let _template = _.template(this.template);
		this.$el.html(
			_template({
				asistencias: this.collection.toJSON(),
				titulo: this.estado == 'P' ? 'Lista inscritos' : 'Pendientes de pre-registro',
			})
		);
		this.initTable();
		return this;
	}

	initTable() {
		this.$el.find('#tb_data_inscritos').DataTable({
			paging: true,
			pageLength: 10,
			pagingType: 'full_numbers',
			info: true,
			columns: [
				{ data: 'empleador' },
				{ data: 'cedrep' },
				{ data: 'clave_ingreso' },
				{ data: 'asamblea_id' },
				{ data: 'fecha' },
			],
			order: [[1, 'desc']],
			language: langDataTable,
		});
	}
}
