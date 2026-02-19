import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var RepresentanteRow: any;
	var SubNavRepresentantes: any;
	var langDataTable: any;
	var Backbone: any;
}

interface RepresentanteListarOptions {
	[key: string]: any;
}

export default class RepresentanteListar extends BackboneView {
	subNavView: any;
	children: any;
	tableModule: any;
	template!: string;
	modelView: any;
	model: any;
	collection: any;
	$el: any;

	constructor(options: RepresentanteListarOptions) {
		super({ ...options, className: 'box', id: 'box_representantes' });
		this.subNavView;
		this.children;
		this.tableModule;
	}

	initialize() {
		this.children = {};
		this.tableModule = null;
		this.subNavView = null;
		this.template = $('#tmp_listar').html();
		this.modelView = RepresentanteRow;

		this.listenTo(this.collection, 'add', this.addModel);
		this.listenTo(this.collection, 'remove', this.removeModel);
		this.listenTo(this.collection, 'reset', this.render);
	}

	render() {
		let template = _.template(this.template);
		this.$el.html(template());

		let filas = this.collection.map((model: any) => {
			let view = this.renderModel(model);
			return view.$el;
		});
		this.$el.find('#show_data_rows').append(filas);
		this.initTable();
		this.subNav();
		return this;
	}

	get events() {
		return {
			"click [data-toggle='row-like']": 'mostrarRow',
			"click [data-toggle='row-edit']": 'editarRow',
			"click [data-toggle='row-remove']": 'removeRow',
		};
	}

	mostrarRow(e: any) {
		e.preventDefault();
		let cedrep = $(e.currentTarget).attr('data-code');
		$App.router.navigate('mostrar/' + cedrep, { trigger: true, replace: true });
	}

	editarRow(e: any) {
		e.preventDefault();
		let cedrep = $(e.currentTarget).attr('data-code');
		$App.router.navigate('editar/' + cedrep, { trigger: true, replace: true });
	}

	removeRow(e: any) {
		e.preventDefault();
		var target = $(e.currentTarget);
		let cedrep = target.attr('data-code');

		const model = this.collection.get(parseInt(cedrep));
		$App.trigger('confirma', {
			message: '¡Confirma que desea borrar el registro!',
			callback: (status: boolean) => {
				if (status) {
					this.trigger('remove:representante', {
						model: model,
						responseTransaction: (response: any) => {
							if (response) {
								this.collection.remove(model);
								this.tableModule.row(target.parents('tr')).remove().draw();
							}
						},
					});
				}
			},
		});
	}

	initTable() {
		this.tableModule = this.$el.find('#tb_data_representantes').DataTable({
			paging: true,
			pageLength: 10,
			pagingType: 'full_numbers',
			info: true,
			fixedColumns: false,
			columnDefs: [
				{ targets: 0, width: '20%' },
				{ targets: 1, width: '40%' },
				{ targets: 2, width: '20%' },
				{ targets: 3, width: '10%' },
				{ targets: 4, orderable: false, width: '10%' },
			],
			order: [[1, 'desc']],
			language: langDataTable,
		});
	}

	subNav() {
		this.subNavView = new SubNavRepresentantes({
			model: this.model,
			dataToggle: {
				listar: false,
				crear: true,
				editar: false,
			},
		}).render();
		this.$el.find('#showSubnav').html(this.subNavView.$el);
		(SubNavRepresentantes as any).parentView = this;
	}

	addModel(model: any) {
		let view = this.renderModel(model);
		this.$el.find('#show_data_rows').append(view.$el);
	}

	renderModel(model: any) {
		let view: any;
		if (_.size(this.children) > 0) {
			if (_.indexOf(this.children, model.get('cid')) != -1) {
				view = this.children[model.get('cid')];
			}
		}
		if (!view) {
			view = new this.modelView({ model: model });
			this.children[model.get('cid')] = view;
		}
		view.render();
		return view;
	}

	removeModel(model: any) {
		let view = this.children[model.get('cid')];
		if (view) {
			view.remove();
			this.children[model.get('cid')] = undefined;
		}
	}

	remove() {
		Backbone.View.prototype.remove.call(this);
		if (this.subNavView) this.subNavView.remove();
		this.closeChildren();
	}

	closeChildren() {
		var children = this.children || {};
		_.each(children, (child: any) => this.closeChildView(child));
	}

	closeChildView(view: any) {
		if (!view) return;
		if (_.isFunction(view.remove)) {
			view.remove();
		}
		this.stopListening(view);
		if (view.model) {
			this.children[view.model.cid] = undefined;
		}
	}
}
