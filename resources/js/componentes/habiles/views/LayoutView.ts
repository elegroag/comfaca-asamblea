import { BackboneView } from "@/common/Bone";

declare global {
    var $: any;
    var _: any;
    var $App: any;
    var Layout: any;
}

interface LayoutViewOptions {
    template?: any;
    regions?: Record<string, string>;
    [key: string]: any;
}

export default class LayoutView extends Layout {
    template: any;
    regions: Record<string, string>;

    constructor(options: LayoutViewOptions = {}) {
        super(options);
        this.template = _.template(document.getElementById('tmp_layout')?.innerHTML || '');
        this.regions = {
            subheader: '#subheader',
            body: '#body',
        };
    }

    /**
     * @override
     */
    get className(): string {
        return 'col-auto';
    }
}
