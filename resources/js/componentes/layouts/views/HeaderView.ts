import { ModelView } from "@/common/ModelView";
import tmp_header from "@/componentes/layouts/templates/header.hbs?raw";

export default class HeaderView extends ModelView {
    constructor(options: any) {
        super(options);
        this.template = _.template(tmp_header);
        this.dataToggle = options.dataToggle;

        // Guardar las props para usarlas en el template
        if (options.props) {
            this.props = options.props;
        }
    }
    static parentView = void 0;

    get events() {
        return {
            'click #bt_salir': 'salir',
            'click #minimizeSidebar': 'toggleSidebar',
        };
    }

    salir(e: Event) {
        e.preventDefault();
        console.log('salir');
    }

    toggleSidebar(e: Event) {
        e.preventDefault();

        // Usar la clase sidebar-mini del Paper Dashboard
        document.body.classList.toggle('sidebar-mini');
    }

    /**
     * @override
     * Sobrescribir serializeData para incluir las props
     */
    serializeData(): any {
        const baseData = super.serializeData();
        return {
            ...baseData,
            props: this.props || {}
        };
    }

}
