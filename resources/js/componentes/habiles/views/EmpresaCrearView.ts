import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var Empresa: any;
}

interface EmpresaCrearViewOptions {
	model?: any;
	collection?: any;
}

export default class EmpresaCrearView extends BackboneView {
	modelUse: any;
	template: any;

	constructor(options: EmpresaCrearViewOptions = {}) {
		super({
			...options,
			className: 'box',
		});
		this.modelUse = Empresa;
		this.template = _.template(document.getElementById('tmp_crear_habiles')?.innerHTML || '');
	}

	/**
	 * @override
	 */
	get events(): Record<string, (e: Event) => void> {
		return {
			'click #bt_guardar': this.guardarDatos,
			"focusout input[name='nit']": this.enableBoton,
			"focusout input[name='cedrep']": this.enableBoton,
		};
	}

	guardarDatos(e: Event): boolean {
		e.preventDefault();
		const target = this.$el.find(e.currentTarget as HTMLElement);
		target.attr('disabled', 'true');

		const nit = this.getInput('nit');
		const model = new Empresa({
			nit: parseInt(nit || '0'),
			cedrep: parseInt(this.getInput('cedrep') || '0'),
			repleg: this.getInput('repleg'),
			telefono: this.getInput('telefono'),
			email: this.getInput('email'),
			razsoc: this.getInput('razsoc'),
			crear_pre_registro: this.getCheck('crear_pre_registro'),
			cruzar_cartera: this.getCheck('cruzar_cartera'),
		});

		if (!nit || nit.trim() === '') {
			if ($App && typeof $App.trigger === 'function') {
				$App.trigger('alert:error', 'El nit de la empresa es un valor requerido');
			}
			target.removeAttr('disabled');
			return false;
		}

		if (typeof this.trigger === 'function') {
			this.trigger('form:save', {
				model: model,
				callback: (success: boolean, data?: any) => {
					target.removeAttr('disabled');
					if (success === true) {
						if (data?.empresa) {
							this.trigger('add:empresas', data.empresa);
						}
						if (data?.pre_registro?.documento) {
							this.trigger('notify', { nit: model.get('nit'), documento: data.pre_registro.documento });
						}

						this.$el.find('input').val('');
						this.setInput('razsoc', 'razón social');
						this.setInput('repleg', 'representante legal');
					}
				},
			});
		}

		return false;
	}

	enableBoton(e: Event): void {
		e.preventDefault();
		const nit = this.getInput('nit');
		const cedrep = this.getInput('cedrep');

		if ((nit === '' || cedrep === '') === false) {
			this.$el.find('#bt_guardar').removeAttr('disabled');
		} else {
			this.$el.find('#bt_guardar').attr('disabled', 'true');
		}
	}

	getInput(selector: string): string {
		const element = this.$el.find(`[name='${selector}']`);
		return element.length ? element.val() as string : '';
	}

	getCheck(selector: string): boolean {
		const element = this.$el.find(`[name='${selector}']`);
		return element.length ? element.is(':checked') : false;
	}

	setInput(selector: string, value: string): void {
		this.$el.find(`[name='${selector}']`).val(value || '');
	}
}
