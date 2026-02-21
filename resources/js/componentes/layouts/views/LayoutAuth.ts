import { Layout } from "@/common/Layout";
import type { LayoutOptions } from "@/common/Layout";
import tmp_layout from "@/componentes/layouts/templates/layout-auth.hbs?raw";

class LayoutAuth extends Layout {

    constructor(options: LayoutOptions = {}) {
        super(options);
        this.template = _.template(tmp_layout);

        // Configurar regiones usando el método de la clase base
        this.configureRegions({
            content: '#content',
            header: '#header'
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

export default LayoutAuth;
