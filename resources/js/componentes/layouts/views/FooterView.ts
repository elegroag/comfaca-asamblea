import { ModelView } from "@/common/ModelView";
import tmp_footer from "@/componentes/layouts/templates/footer.hbs?raw";

export default class FooterView extends ModelView {
    constructor(options: any) {
        super(options);
        this.template = _.template(tmp_footer);
        this.dataToggle = options.dataToggle;
    }
    static parentView = void 0;

    get events() {
        return {
            'click #bt_acerca_de': 'acercaDe',
        };
    }

    acercaDe(e: Event) {
        e.preventDefault();
        console.log('acercaDe');
    }

}
