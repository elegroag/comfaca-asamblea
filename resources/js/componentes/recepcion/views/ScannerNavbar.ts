import { BackboneView } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var create_url: (path: string) => string;
}

interface ScannerNavbarOptions {
	model?: any;
	App?: any;
	[key: string]: any;
}

export default class ScannerNavbar extends BackboneView {
	template!: string;
	App: any;

	constructor(options: ScannerNavbarOptions = {}) {
		super({
			...options,
			className: 'nav',
			id: 'ul_sidebar',
			tagName: 'ul',
		});
		this.App = options.App;
	}

	events() {
		return {
			'click a': 'module_navegation',
		};
	}

	module_navegation(e: JQuery.Event) {
		e.preventDefault();
		var href = $(e.currentTarget).attr('data-href');
		if (href) {
			window.location.href = create_url(href);
		}
	}

	inload(scope: ScannerNavbar) {
		$('.sidebar-wrapper .nav li').removeClass('active');
		$(`li[data-toggle-nav='${scope.model.item}'] a`).trigger('click');
	}

	render() {
		let template = _.template($('#tmp_sub_navbar').html());
		this.$el.html(template());
		this.inload(this);
		return this;
	}
}
