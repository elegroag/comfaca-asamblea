import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var TrabajadorRowView: any;
	var langDataTable: any;
}

interface TrabajadoresListarViewOptions {
	[key: string]: any;
}

export default class TrabajadoresListarView extends BackboneView {
	template!: any;
	modelView: any;
	collection: any;
	$el: any;

	constructor(options: TrabajadoresListarViewOptions) {
		super(options);
		this.template = _.template($('#tmp_listar_trabajadores').html());
		this.modelView = TrabajadorRowView;
	}

	get events() {
		return {
			"click button[data-toggle='mostrar_usuario']": 'mostrarUsuario',
		};
	}

	mostrarUsuario(e: any) {
		e.preventDefault();
		var usuario = $(e.currentTarget).attr('data-code');
		$App.router.navigate('mostrar/' + usuario, { trigger: true, replace: true });
	}

	render() {
		this.$el.html(this.template());
		const filas = this.collection.map((model: any) => {
			let view = this.renderModel(model);
			return view.el;
		});

		this.$el.find('#show_data_trabajadores').append(filas);

		this.initTable();

		return this;
	}

	initTable() {
		this.$el.find('#tb_data_trabajadores').DataTable({
			paging: true,
			pageLength: 10,
			pagingType: 'full_numbers',
			info: true,
			language: langDataTable,
		});
		this.$el.find('#tb_data_trabajadores').fadeIn();
	}

	renderModel(model: any) {
		const view = new this.modelView({ model: model });
		return view;
	}
}
