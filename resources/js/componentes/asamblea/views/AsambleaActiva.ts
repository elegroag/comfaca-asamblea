import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';
import ConsensoCrear from "./ConsensoCrear";
import ConsensoDetalle from "./ConsensoDetalle";
import asambleaActiva from "@/componentes/asamblea/templates/asambleaActiva.hbs?raw";

declare global {
	var $: any;
	var _: any;
	var $App: any;
}

interface AsambleaActivaOptions {
	model?: any;
	collection?: any;
	App?: AppInstance;
	[key: string]: any;
}

export default class AsambleaActiva extends BackboneView {
	App: AppInstance;
	template: string;
	consensos: any;
	asambleas: any;
	modal: any;

	constructor(options: AsambleaActivaOptions = {}) {
		super(options);
		this.App = options.App || options.AppInstance;
	}

	initialize(): void {
		this.template = $('#tmp_asamblea').html();
		this.consensos = undefined;
		this.asambleas = undefined;
		this.modal = undefined;
	}

	render(): this {
		const template = _.template(this.template);
		this.consensos = this.collection;
		this.$el.html(
			template({
				asamblea: this.model.toJSON(),
				consensos: this.consensos.toJSON(),
			})
		);
		return this;
	}

	get events() {
		return {
			'click #bt_listar_asambleas': 'listar_asambleas',
			'click #bt_nuevo_consenso': 'nuevo_consenso',
			"click [data-toggle='consenso']": 'detalle_consenso',
		};
	}

	/**
	 * Crear nuevo consenso
	 */
	nuevo_consenso(e: Event): void {
		e.preventDefault();

		if (!this.modal) this.modal = $('#notice_modal');
		this.modal.find('#mdl_set_title').text('Crear Consenso');
		this.modal.find('#mdl_set_footer').css('display', 'none');

		const view = new ConsensoCrear({ App: this.App });

		this.modal.find('#mdl_set_body').html(view.render().$el);
		this.modal.modal({ backdrop: 'static', keyboard: true });
		this.modal.show();

		this.modal.on('hidden.bs.modal', (event: Event) => {
			this.modal.find('#mdl_set_title').text('');
			this.modal.find('#mdl_set_footer').css('display', 'initial');
			this.modal.find('#box_nuevo_consenso').remove();
		});
	}

	/**
	 * Mostrar detalle de consenso
	 */
	detalle_consenso(e: Event): void {
		e.preventDefault();

		const _id = $(e.currentTarget).attr('data-code');
		const consenso = this.consensos.get(parseInt(_id || '0'));

		if (!this.modal) this.modal = $('#notice_modal');
		this.modal.find('#mdl_set_title').text('Detalle Consenso');
		this.modal.find('#mdl_set_footer').css('display', 'none');

		const view = new ConsensoDetalle({ model: consenso, App: this.App });

		this.modal.find('#mdl_set_body').html(view.render().$el);
		this.modal.modal({ backdrop: 'initial', keyboard: true });
		this.modal.show();

		this.modal.on('hidden.bs.modal', (event: Event) => {
			this.modal.find('#mdl_set_title').text('');
			this.modal.find('#mdl_set_footer').css('display', 'initial');
			this.modal.find('#box_detalle_consenso').remove();
		});
	}

	/**
	 * Listar asambleas
	 */
	listar_asambleas(e: Event): void {
		e.preventDefault();
		this.remove();

		if ($App.router) {
			$App.router.navigate('listar_asambleas', { trigger: true, replace: true });
		}
	}
}
