import { BackboneModel } from "@/common/Bone";

declare global {
	var $: any;
	var _: any;
	var Testeo: any;
}

interface HabilModelAttributes {
	nit?: string | null;
	cedrep?: number | string;
	repleg?: string;
	telefono?: number | string;
	email?: string;
	razsoc?: string;
}

interface HabilModelOptions {
	parse?: boolean;
	collection?: any;
}

export default class HabilModel extends BackboneModel {
	urlRoot: string;
	idAttribute: string;
	defaults: HabilModelAttributes;

	constructor(attributes: HabilModelAttributes = {}, options: HabilModelOptions = {}) {
		super(attributes, options);
		this.urlRoot = '/habil/show';
		this.idAttribute = 'nit';
		this.defaults = {
			nit: null,
			cedrep: 0,
			repleg: '',
			telefono: 0,
			email: '',
			razsoc: '',
		};
	}

	validate(attrs: HabilModelAttributes, options: any): string[] | void {
		const errors: string[] = [];
		let out: string;

		if (Testeo) {
			if ((out = Testeo.vacio(attrs.cedrep, 'cedrep'))) {
				errors.push(out);
			} else {
				if ((out = Testeo.identi(attrs.cedrep, 'cedrep', 5, 18))) errors.push(out);
			}

			if ((out = Testeo.vacio(attrs.razsoc, 'razsoc', true))) errors.push(out);

			if ((out = Testeo.vacio(attrs.nit, 'nit'))) {
				errors.push(out);
			} else {
				if ((out = Testeo.identi(attrs.nit, 'nit', 5, 18))) errors.push(out);
			}

			if ((out = Testeo.vacio(attrs.repleg, 'repleg'))) errors.push(out);

			if (!Testeo.vacio(attrs.email, 'email', true)) {
				if ((out = Testeo.email(attrs.email, 'email'))) errors.push(out);
			}
		}

		return errors.length > 0 ? errors : void 0;
	}
}
