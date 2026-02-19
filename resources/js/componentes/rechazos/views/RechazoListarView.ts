import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var RechazoRowView: any;
	var langDataTable: any;
}

interface RechazoListarViewOptions {
	[key: string]: any;
}

export default class RechazoListarView extends BackboneView {
	tableModule: any;
	children: any;
	modelView: any;
	template!: any;
	collection: any;
	$el: any;

	constructor(options: RechazoListarViewOptions) {
		super({
			...options,
			events: {
				"click a[data-toggle='row-like']": 'likeRow',
				"click a[data-toggle='row-edit']": 'editRow',
				"click a[data-toggle='row-remove']": 'removeRow',
			},
			className: 'box',
		});
		this.modelView = RechazoRowView;
		this.template = _.template(document.getElementById('tmp_listar_rechazos').innerHTML);
	}

	initialize() {
		this.children = {};
		this.listenTo(this.collection, 'add', this.addModel);
		this.listenTo(this.collection, 'remove', this.modelRemoved);
		this.listenTo(this.collection, 'reset', this.render);
	}

	render() {
		this.$el.html(this.template());
		const filas = this.collection.map((model: any) => {
			let view = this.renderModel(model);
			return view.el;
		});
		this.$el.find('#show_data_rechazos').append(filas);
		this.init_table();
		return this;
	}

	likeRow(e: any) {
		e.preventDefault();
		let nit = $(e.currentTarget).attr('data-cid');
		this.remove();
		$App.router.navigate('detalle/' + nit, { trigger: true, replace: true });
	}

	editRow(e: any) {
		e.preventDefault();
		let nit = $(e.currentTarget).attr('data-cid');
		this.remove();
		$App.router.navigate('edita/' + nit, { trigger: true });
	}

	removeRow(e: any) {
		e.preventDefault();
		const target = this.$el.find(e.currentTarget);
		const nit = target.attr('data-cid');
		const model = this.collection.get(parseInt(nit));

		this.trigger('remove:rechazos', {
			model: model,
			callback: (response: any) => {
				if (response) {
					this.collection.remove(model);
					this.tableModule.row(target.parents('tr')).remove().draw();
				}
			},
		});
	}

	init_table() {
		this.tableModule = this.$el.find('#tb_data_rechazos').DataTable({
			paging: true,
			pageLength: 10,
			pagingType: 'full_numbers',
			info: true,
			columnDefs: [
				{ targets: 0, width: '5%' },
				{ targets: 1, width: '30%' },
				{ targets: 2, width: '5%' },
				{ targets: 3, width: '20%' },
				{ targets: 4, width: '30%' },
				{ targets: 5, width: '5%' },
				{ targets: 6, searchable: false, width: '5%' },
			],
			language: langDataTable,
		});
		this.$el.find('#tb_data_rechazos').fadeIn();
	}

	addModel(model: any) {
		const view = this.renderModel(model);
		this.$el.find('#show_data_rechazos').append(view.$el);
	}

	modelRemoved() {
		// Método para manejar la eliminación de modelos
	}

	renderModel(model: any) {
		const view = new this.modelView({ model: model });
		return view;
	}
}
