import { BackboneView } from "@/common/Bone";
import SubNavMesas from "./SubNavMesas";
import tmp_listar_mesas from "../templates/tmp_listar_mesas.hbs?raw";

declare global {
	var $: any;
	var _: any;
	var Swal: any;
	var create_url: (path: string) => string;
	var axios: {
		get: (url: string) => Promise<any>;
	};
	var langDataTable: any;
	var $App: any;
}

interface MesasListarOptions {
	collection?: any;
	model?: any;
}

export default class MesasListar extends BackboneView {
	template: string;
	subNavMesas: SubNavMesas | null;

	constructor(options: MesasListarOptions = {}) {
		super({ ...options, className: 'box', id: 'box_usuarios' });
		this.template = tmp_listar_mesas;
		this.subNavMesas = null;
	}

	initialize(): void {
		// Template ya está asignado en el constructor
	}

	get events(): Record<string, (e: Event) => void> {
		return {
			"click button[data-toggle='mostrar_mesa']": this.mostrarMesa,
			"click button[data-toggle='borrar_mesa']": this.borrarMesa,
		};
	}

	borrarMesa(e: Event): void {
		e.preventDefault();

		const target = $(e.currentTarget as HTMLElement);
		target.attr('disabled', 'true');
		const mesaId = target.attr('data-code') as string;

		if (!mesaId) {
			console.error('ID de mesa no encontrado');
			target.removeAttr('disabled');
			return;
		}

		$App.trigger('confirma', {
			message: 'Se requiere de confirmar para borrar el registro seleccionado.',
			callback: (status: boolean) => {
				if (status) {
					const url = create_url('admin/remover_mesa/' + mesaId);

					axios.get(url)
						.then((salida: any) => {
							target.removeAttr('disabled');

							if (salida) {
								if (!salida.data.mesas) {
									Swal.fire({
										title: 'Notificación!',
										text: salida.data.errors || 'Error al eliminar mesa',
										icon: 'error',
										confirmButtonText: 'Continuar!',
									});
								} else {
									Swal.fire({
										title: 'Notificación!',
										text: 'La operación se completó con éxito',
										icon: 'success',
										confirmButtonText: 'Continuar!',
									});
								}

								setTimeout(() => {
									window.location.reload();
								}, 1000);
							}
						})
						.catch((err: any) => {
							target.removeAttr('disabled');
							console.error('Error al eliminar mesa:', err);
							Swal.fire({
								title: 'Error!',
								text: 'Ocurrió un error al eliminar la mesa',
								icon: 'error',
								confirmButtonText: 'Continuar!',
							});
						});
				} else {
					target.removeAttr('disabled');
				}
			},
		});
	}

	mostrarMesa(e: Event): void {
		e.preventDefault();

		const mesa = $(e.currentTarget as HTMLElement).attr('data-code') as string;

		if (!mesa) {
			console.error('ID de mesa no encontrado');
			return;
		}

		if ($App.router) {
			$App.router.navigate('mostrar/' + mesa, { trigger: true, replace: true });
		}
	}

	render(): this {
		const template = _.template(this.template);
		const mesasData = this.collection ? this.collection.toJSON() : [];
		this.$el.html(template({ mesas: mesasData }));

		this.initTable();
		this.subNav();

		return this;
	}

	initTable(): void {
		const tableElement = this.$el.find('#tb_data_mesas');

		if (tableElement.length && typeof tableElement.DataTable === 'function') {
			tableElement.DataTable({
				paging: true,
				pageLength: 10,
				pagingType: 'full_numbers',
				info: true,
				columnDefs: [
					{ targets: 0 },
					{ targets: 1 },
					{ targets: 2 },
					{ targets: 3 },
					{ targets: 4, orderable: false },
				],
				order: [[1, 'desc']],
				language: langDataTable,
			});
		}
	}

	subNav(): void {
		this.subNavMesas = new SubNavMesas({
			model: this.model,
			dataToggle: {
				listar: false,
				crear: true,
				editar: false,
			},
		});

		const subnavElement = this.$el.find('#showSubnav');
		if (subnavElement.length && this.subNavMesas) {
			subnavElement.html(this.subNavMesas.render().$el);
		}

		// Establecer referencia a la vista padre
		(SubNavMesas as any).parentView = this;
	}
}
