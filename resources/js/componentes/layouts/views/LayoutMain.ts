import { Layout } from "@/common/Layout";
import type { LayoutOptions } from "@/common/Layout";
import tmp_layout from "@/componentes/layouts/templates/layout-main.hbs?raw";

class LayoutMain extends Layout {

    private template: any;

    constructor(options: LayoutOptions = {}) {
        super(options);
        this.template = _.template(tmp_layout);

        // Configurar regiones usando el método de la clase base
        this.configureRegions({
            header: '#header',
            content: '#content',
            footer: '#footer',
            sidebar: '#sidebar'
        });
    }

    /**
     * @override
     */
    // @ts-ignore
    get className() {
        return 'col-auto';
    }
}

export default LayoutMain;
