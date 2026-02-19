import { BackboneView } from "@/common/Bone";

declare global {
	var _: any;
	var $App: any;
	var RechazoModel: any;
}

interface RechazoCrearViewOptions {
	[key: string]: any;
}

export default class RechazoCrearView extends BackboneView {
	region: any;
	modelUse: any;
	template!: any;
	$el: any;

	constructor(options: RechazoCrearViewOptions) {
		super({
			...options,
			className: 'box',
		});
		this.modelUse = RechazoModel;
		this.template = _.template($('#tmp_crear_rechazo').html());
	}

	get events() {
		return {
			'click #bt_registrar': 'guardarDatos',
			"focusout input[name='nit']": 'enableBoton',
			"focusout input[name='cedrep']": 'enableBoton',
		};
	}

	guardarDatos(e: any) {
		e.preventDefault();
		const target = this.$el.find(e.currentTarget);
		target.attr('disabled', true);

		const nit = this.getInput('nit');
		const model = new RechazoModel({
			nit: parseInt(nit),
			cedula_representa: parseInt(this.getInput('cedula_representa')),
			nombre_representa: this.getInput('nombre_representa'),
			telefono: this.getInput('telefono'),
			email: this.getInput('email'),
			razsoc: this.getInput('razsoc'),
			cruzar: this.getCheck('cruzar'),
			criterio: parseInt(this.getInput('criterio')),
		});

		if (nit == '') {
			$App.trigger('alert:error', 'El nit de la empresa es un valor requerido');
			target.removeAttr('disabled');
			return false;
		}

		this.trigger('form:save', {
			model: model,
			callback: (response: any) => {
				target.removeAttr('disabled');
				if (response.success) {
					this.trigger('add:rechazo', response.data);
					this.trigger('add:notify', model.get('nit'));
					this.$el.find('input').val('');
				}
			},
		});

		return false;
	}

	getInput(selector: string): string {
		return this.$el.find(`[name='${selector}']`).val();
	}

	setInput(selector: string, val: string): void {
		this.$el.find(`[name='${selector}']`).val(val ?? '');
	}

	getCheck(selector: string): number {
		return this.$el.find(`[name='${selector}']:checked`).length;
	}

	enableBoton(e: any): void {
		e.preventDefault();
		if ((this.getInput('nit') == '' || this.getInput('cedrep') == '') == false) {
			this.$el.find('#bt_guardar').removeAttr('disabled');
		} else {
			this.$el.find('#bt_guardar').attr('disabled', true);
		}
	}
}
