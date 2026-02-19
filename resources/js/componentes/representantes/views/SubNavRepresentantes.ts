import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var $App: any;
}

interface SubNavRepresentantesOptions {
	dataToggle: any;
	model?: any;
	[key: string]: any;
}

export default class SubNavRepresentantes extends BackboneView {
	template!: string;
	dataToggle: any;
	model: any;
	$el: any;
	static parentView: any;

	constructor(options: SubNavRepresentantesOptions) {
		super(options);
		this.template = $('#tmp_sub_navbar').html();
		this.dataToggle = options.dataToggle;
	}

	get className(): string {
		return 'nav justify-content-end';
	}

	get tagName(): string {
		return 'nav';
	}

	render() {
		let _template = _.template(this.template);
		this.$el.html(_template(this.dataToggle));
		return this;
	}

	get events() {
		return {
			'click #bt_listar': 'listarData',
			'click #bt_nuevo_registro': 'nuevoRegistro',
			'click #bt_edita_nav_registro': 'editaRegistro',
		};
	}

	nuevoRegistro(e: any) {
		e.preventDefault();
		if (SubNavRepresentantes.parentView) SubNavRepresentantes.parentView.remove();
		$App.router.navigate('crear', { trigger: true });
	}

	listarData(e: any) {
		e.preventDefault();
		if (SubNavRepresentantes.parentView) SubNavRepresentantes.parentView.remove();
		$App.router.navigate('listar', { trigger: true, replace: true });
	}

	editaRegistro(e: any) {
		e.preventDefault();
		let nit = this.model.get('nit');
		if (SubNavRepresentantes.parentView) SubNavRepresentantes.parentView.remove();
		$App.router.navigate('edita/' + nit, { trigger: true });
	}
}
