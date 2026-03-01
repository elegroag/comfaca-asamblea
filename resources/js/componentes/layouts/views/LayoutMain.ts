import { Layout } from "@/common/Layout";
import type { LayoutOptions } from "@/common/Layout";
import tmp_layout from "@/componentes/layouts/templates/layout-main.hbs?raw";

class LayoutMain extends Layout {

    constructor(options: LayoutOptions = {}) {
        super({
            ...options,
            className: 'wrapper p-0 m-0'
        });
        this.template = _.template(tmp_layout);

        // Configurar regiones usando el método de la clase base
        this.configureRegions({
            header: '#header',
            content: '#content',
            footer: '#footer',
            sidebar: '#sidebar'
        });
    }
}

export default LayoutMain;
