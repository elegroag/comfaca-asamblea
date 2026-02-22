import RechazoDetalleView from "@/componentes/rechazos/views/RechazoDetalleView";
import RechazosNav from "@/componentes/rechazos/views/RechazosNav";
import RechazoService from "./RechazoService";
import LayoutView from "@/componentes/layouts/views/LayoutView";

interface RechazoDetalleOptions {
    [key: string]: any;
}

export default class RechazoDetalle {

    region: any;
    rechazoService: RechazoService;

    constructor(options: RechazoDetalleOptions = {}) {
        _.extend(this, Backbone.Events);
        _.extend(this, options);
        $App.Collections.rechazos = null;

        this.rechazoService = new RechazoService();
        this.listenTo(this, 'set:rechazos', this.rechazoService.setRechazos);
        this.listenTo(this, 'add:rechazos', this.rechazoService.addRechazos);
        if (!$App.Collections.empresas) this.rechazoService.findAll();
    }

    showDetalle(model: any): void {
        this.layout = new LayoutView();
        this.region.show(this.layout);

        this.layout.getRegion('subheader').show(
            new RechazosNav({
                model: {
                    titulo: 'Detalle Rechazo',
                    listar: true,
                    exportar: false,
                    crear: true,
                    editar: true,
                    masivo: true,
                },
            })
        );

        const view = new RechazoDetalleView({
            collection: $App.Collections.rechazos,
            model: model,
        });

        this.listenTo(view, 'form:save', this.rechazoService.saveRechazo);
        this.listenTo(view, 'add:notify', this.rechazoService.notifyPlataforma);
        this.layout.getRegion('body').show(view);
        (RechazosNav as any).parentView = view;
    }

    destroy(): void {
        this.region.remove();
        this.stopListening();
    }
}
