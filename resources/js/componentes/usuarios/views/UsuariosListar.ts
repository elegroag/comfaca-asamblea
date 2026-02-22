import { BackboneView } from "@/common/Bone";
import UsuarioService from "@/pages/Usuarios/UsuarioService";
import SubNavUsuarios from "./SubNavUsuarios";
import listar from "@/componentes/usuarios/templates/tmp_listar_usuarios.hbs?raw";
import DataTable from "datatables.net-bs5";

interface UsuariosListarOptions {
	collection?: any;
	model?: any;
	App?: any;
	api?: any;
	logger?: any;
	storage?: any;
	region?: any;
	[key: string]: any;
}

export default class UsuariosListar extends BackboneView {
	template: any;
	tableModule: any;
	subNavUsuarios: SubNavUsuarios | null;
	App: any;
	api: any;
	logger: any;
	storage: any;
	region: any;
	usuarioService: UsuarioService;

	constructor(options: UsuariosListarOptions = {}) {
		super({ ...options, className: 'box', id: 'box_usuarios' });
		this.app = options.app;
		this.api = options.api;
		this.logger = options.logger;
		this.storage = options.storage;
		this.region = options.region;
		this.collection = options.collection;
		this.model = options.model;
		this.template = _.template(listar);
		this.tableModule = null;
		this.subNavUsuarios = null;
		this.usuarioService = new UsuarioService({
			api: this.api,
			logger: this.logger,
			app: this.app
		});
	}

	initialize(): void {
		// Template ya está asignado en el constructor
	}

	get events(): Record<string, (e: Event) => void> {
		return {
			"click button[data-toggle='mostrar_usuario']": this.mostrarUsuario,
			"click button[data-toggle='editar_usuario']": this.editarUsuario,
		};
	}

	mostrarUsuario(e: Event): void {
		e.preventDefault();

		const target = this.$el.find(e.currentTarget);
		const usuario = target.attr('data-code') as string;

		if (!usuario) {
			console.error('ID de usuario no encontrado');
			return;
		}

		if (this.app && this.app.router) {
			this.app.router.navigate('mostrar/' + usuario, { trigger: true, replace: true });
		}
	}

	editarUsuario(e: Event): void {
		e.preventDefault();

		const target = this.$el.find(e.currentTarget);
		const usuario = target.attr('data-code') as string;

		if (!usuario) {
			console.error('ID de usuario no encontrado');
			return;
		}

		if (this.app && this.app.router) {
			this.app.router.navigate('edita_usuarios/' + usuario, { trigger: true, replace: true });
		}
	}

	render(): this {
		const template = _.template(this.template);
		const usuariosData = this.collection ? this.collection.toJSON() : [];
		this.$el.html(template({ usuarios: usuariosData }));

		this.initTable();
		this.subNav();

		return this;
	}

	initTable(): void {
		const tableElement = this.$el.find('#tb_data_usuarios');

		// Destruir tabla existente si hay una
		if (this.tableModule) {
			this.tableModule.destroy();
		}

		if (tableElement.length) {
			this.tableModule = new DataTable(tableElement, {
				paging: true,
				pageLength: 10,
				pagingType: 'full_numbers',
				info: true,
				columnDefs: [{ targets: 0 }, { targets: 1 }, { targets: 2 }, { targets: 3, orderable: false }],
				order: [[1, 'desc']],
				language: {
					lengthMenu: 'Mostrar _MENU_ registros',
					zeroRecords: 'No se encontraron resultados',
					info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
					infoEmpty: 'Mostrando 0 a 0 de 0 registros',
					infoFiltered: '(filtrado de _MAX_ registros totales)',
					search: 'Buscar:',
					paginate: {
						first: 'Primero',
						last: 'Último',
						next: 'Siguiente',
						previous: 'Anterior'
					}
				},
				destroy: true
			});
		}
	}

	subNav(): void {
		// Implementación básica de subNav sin dependencias externas
		this.subNavUsuarios = new SubNavUsuarios({
			model: this.model,
			app: this.app,
			api: this.api,
			logger: this.logger,
			storage: this.storage,
			region: this.region,
			dataToggle: {
				listar: false,
				crear: true,
				editar: false,
			},
		});

		const subnavElement = this.$el.find('#showSubnavnav');
		if (subnavElement.length && this.subNavUsuarios) {
			subnavElement.html(this.subNavUsuarios.render().$el);
		}

		// Establecer referencia a la vista padre
		(SubNavUsuarios as any).parentView = this;
	}
}
