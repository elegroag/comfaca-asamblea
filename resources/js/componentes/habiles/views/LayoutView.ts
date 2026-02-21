
import { Layout, LayoutOptions } from '@/common/Layout';
import tmp_layout from '../templates/layout.hbs?raw';

export default class LayoutView extends Layout {

    constructor(options?: LayoutOptions) {
        super(options);
        this.template = _.template(tmp_layout);

        this.configureRegions({
            subheader: '#subheader',
            body: '#body',
        });
    }

    /**
     * @override
     */
    get className(): string {
        return 'col-auto';
    }
}
