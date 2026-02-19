import { BackboneModel } from "@/common/Bone";

declare global {
	var create_url: (path: string) => string;
}

interface TrabajadorAttributes {
	id?: number | null;
	cedula?: number;
	nombre?: string;
	razontra?: string;
	nittra?: string;
	created_at?: string;
	updated_at?: string;
	[key: string]: any;
}

interface TrabajadorOptions {
	[key: string]: any;
}

export default class Trabajador extends BackboneModel {
	constructor(attributes?: TrabajadorAttributes, options?: TrabajadorOptions) {
		super(attributes, options);
	}

	get url(): string {
		return create_url('trabajadores/trabajador');
	}

	get idAttribute(): string {
		return 'id';
	}

	get defaults(): TrabajadorAttributes {
		return {
			id: null,
			cedula: 0,
			nombre: '',
			razontra: '',
			nittra: '',
			created_at: '',
			updated_at: '',
		};
	}
}
