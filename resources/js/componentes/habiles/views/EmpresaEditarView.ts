import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var Empresa: any;
}

interface EmpresaEditarViewOptions {
	model?: any;
	collection?: any;
}

export default class EmpresaEditarView extends BackboneView {
	modelUse: any;
	template: any;

	constructor(options: EmpresaEditarViewOptions = {}) {
		super({
			...options,
			className: 'box',
		});
		this.modelUse = Empresa;
		this.template = _.template(document.getElementById('tmp_edita_empresa')?.innerHTML || '');
	}

	/**
	 * @override
	 */
	get events(): Record<string, (e: Event) => void> {
		return { 'click #bt_edita_registro': this.editaRegistro };
	}

	editaRegistro(e: Event): void {
		e.preventDefault();
		const target = $(e.currentTarget as HTMLElement);
		target.attr('disabled', 'true');

		const model = new Empresa({
			nit: parseInt(this.getInput('nit') || '0'),
			cedrep: parseInt(this.getInput('cedrep') || '0'),
			repleg: this.getInput('repleg'),
			telefono: this.getInput('telefono'),
			email: this.getInput('email'),
			razsoc: this.getInput('razsoc'),
			crear_pre_registro: this.getCheck('crear_pre_registro'),
			cruzar_cartera: this.getCheck('cruzar_cartera'),
		});

		if (typeof this.trigger === 'function') {
			this.trigger('form:edit', {
				model: model,
				callback: (success: boolean, response?: any) => {
					if (success === true) {
						target.removeAttr('disabled');
						if (response?.data) {
							this.trigger('set:empresas', response.data);
						}
						this.trigger('notify', model.get('nit'));
						this.trigger('item:edit', model);
					} else {
						target.removeAttr('disabled');
					}
				},
			});
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
}
