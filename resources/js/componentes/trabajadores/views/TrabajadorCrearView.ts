import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var Trabajador: any;
}

interface TrabajadorCrearViewOptions {
	[key: string]: any;
}

export default class TrabajadorCrearView extends BackboneView {
	template!: any;
	$el: any;

	constructor(options: TrabajadorCrearViewOptions) {
		super(options);
		this.template = _.template($('#tmp_trabajador_crear').html());
	}

	get events() {
		return {
			'click #btn_back_list': 'backlist',
			"click [data-toggle-file='searchfile']": 'searchFile',
			'click #bt_guardar': 'guardarTrabajador',
		};
	}

	searchFile(e: any) {
		e.preventDefault();
		this.$el.find("[name='archivo_trabajadores']").trigger('click');
	}

	guardarTrabajador(e: any) {
		e.preventDefault();
		const target = this.$el.find(e.currentTarget);
		target.attr('disabled', true);

		const model = new Trabajador({
			cedula: parseInt(this.getInput('cedula')),
			nombre: this.getInput('nombre'),
			nittra: this.getInput('nittra'),
			razontra: this.getInput('razontra'),
		});

		if (this.getInput('cedula') == '' || this.getInput('nombre') == '') {
			$App.trigger('alert:error', 'El cedula es un valor requerido');
			target.removeAttr('disabled');
			return false;
		}

		this.trigger('form:save', {
			model: model,
			callback: (response: any) => {
				target.removeAttr('disabled');
				if (response.success) {
					this.trigger('add:trabajador', response.data);
					this.$el.find('input').val('');
				}
			},
		});
	}

	backlist(e: any) {
		e.preventDefault();
		this.remove();
		$App.router.navigate('listar', { trigger: true, replace: true });
		return false;
	}
}
