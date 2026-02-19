import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';
import listarInterventores from "@/componentes/interventores/templates/listarInterventores.hbs?raw";

declare global {
	var $: any;
	var _: any;
	var $App: any;
}

interface InterventoresListarOptions {
	collection?: any;
	App?: AppInstance;
	[key: string]: any;
}

export default class InterventoresListar extends BackboneView {
	App: AppInstance;

	constructor(options: InterventoresListarOptions = {}) {
		super({ ...options, className: 'box', id: 'box_interventores' });
		this.App = options.App || options.AppInstance;
	}

	initialize(): void {
		// Inicialización si es necesaria
	}

	get events() {
		return {
			"click button[data-toggle='mostrar_usuario']": 'mostrar_usuario',
		};
	}

	/**
	 * Mostrar detalle de usuario
	 */
	mostrar_usuario(e: Event): void {
		e.preventDefault();

		const usuario = $(e.currentTarget).attr('data-code');

		if ($App.router) {
			$App.router.navigate('mostrar/' + usuario, { trigger: true, replace: true });
		}
	}

	render(): this {
		const template = _.template($('#tmp_listar_interventores').html());
		this.$el.html(template({ interventores: this.collection }));
		this.init_table();
		return this;
	}

	/**
	 * Inicializar tabla DataTables
	 */
	private init_table(): void {
		this.$el.find('#tb_data_usuarios').DataTable({
			paging: true,
			pageLength: 10,
			pagingType: 'full_numbers',
			info: true,
			columnDefs: [{ targets: 0 }, { targets: 1 }, { targets: 2 }, { targets: 3 }],
			order: [[1, 'desc']],
			language: {
				processing: 'Procesando...',
				lengthMenu: 'Mostrar _MENU_ resultados por pagínas',
				zeroRecords: 'No se encontraron resultados',
				info: 'Mostrando pagína _PAGE_ de _PAGES_.\tTotal de _TOTAL_ registros.',
				infoEmpty: 'No records available',
				infoFiltered: '(filtered from _MAX_ total records)',
				emptyTable: 'Ningún dato disponible en esta tabla',
				search: 'Buscar',
				paginate: {
					next: 'siguiente',
					previous: 'anterior',
					first: 'primero',
					last: 'ultimo',
				},
				loadingRecords: 'Cargando...',
				buttons: {
					copy: 'Copiar',
					colvis: 'Visibilidad',
					collection: 'Colección',
					colvisRestore: 'Restaurar visibilidad',
					copyKeys:
						'Presione ctrl o u2318 + C para copiar los datos de la tabla al portapapeles del sistema. <br /> <br /> Para cancelar, haga clic en este mensaje o presione escape.',
					copySuccess: {
						1: 'Copiada 1 fila al portapapeles',
						_: 'Copiadas %d fila al portapapeles',
					},
				},
			},
		});
	}
}
