import { BackboneView } from "@/common/Bone";
import SubNavUsuarios from "./SubNavUsuarios";
import tmp_listar_usuarios from "../templates/tmp_listar_usuarios.hbs?raw";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var langDataTable: any;
}

interface UsuariosListarOptions {
	collection?: any;
	model?: any;
}

export default class UsuariosListar extends BackboneView {
	template: string;
	tableModule: any;
	subNavUsuarios: SubNavUsuarios | null;

	constructor(options: UsuariosListarOptions = {}) {
		super({ ...options, className: 'box', id: 'box_usuarios' });
		this.template = tmp_listar_usuarios;
		this.tableModule = null;
		this.subNavUsuarios = null;
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

		const usuario = $(e.currentTarget as HTMLElement).attr('data-code') as string;

		if (!usuario) {
			console.error('ID de usuario no encontrado');
			return;
		}

		if ($App.router) {
			$App.router.navigate('mostrar/' + usuario, { trigger: true, replace: true });
		}
	}

	editarUsuario(e: Event): void {
		e.preventDefault();

		const usuario = $(e.currentTarget as HTMLElement).attr('data-code') as string;

		if (!usuario) {
			console.error('ID de usuario no encontrado');
			return;
		}

		if ($App.router) {
			$App.router.navigate('edita_usersisu/' + usuario, { trigger: true, replace: true });
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

		if (tableElement.length && typeof tableElement.DataTable === 'function') {
			this.tableModule = tableElement.DataTable({
				paging: true,
				pageLength: 10,
				pagingType: 'full_numbers',
				info: true,
				columnDefs: [{ targets: 0 }, { targets: 1 }, { targets: 2 }, { targets: 3, orderable: false }],
				order: [[1, 'desc']],
				language: langDataTable,
			});
		}
	}

	subNav(): void {
		this.subNavUsuarios = new SubNavUsuarios({
			model: this.model,
			dataToggle: {
				listar: false,
				crear: true,
				editar: false,
			},
		});

		const subnavElement = this.$el.find('#showSubnav');
		if (subnavElement.length && this.subNavUsuarios) {
			subnavElement.html(this.subNavUsuarios.render().$el);
		}

		// Establecer referencia a la vista padre
		(SubNavUsuarios as any).parentView = this;
	}
}
