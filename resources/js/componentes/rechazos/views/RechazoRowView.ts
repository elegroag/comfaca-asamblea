import { ModelView } from "@/common/ModelView";
import tmp_row_rechazo from "@/componentes/rechazos/templates/row.hbs?raw";

interface RechazoRowViewOptions {
    model: any;
    [key: string]: any;
}

export default class RechazoRowView extends ModelView {
    template: string;
    model: any;

    constructor(options: RechazoRowViewOptions) {
        super(options);
        this.template = tmp_row_rechazo;
    }

    get tagName(): string {
        return 'tr';
    }

    initialize(options: RechazoRowViewOptions) {
        this.listenTo(options.model, 'change', this.render);
    }
}
