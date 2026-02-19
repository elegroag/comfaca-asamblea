import LayoutView from "@/componentes/trabajadores/views/LayoutView";
import TrabajadoresNav from "@/componentes/trabajadores/views/TrabajadoresNav";
import TrabajadorMostrarView from "@/componentes/trabajadores/views/TrabajadorMostrarView";
import TrabajadorService from "./TrabajadorService";


interface TrabajadorMostrarOptions {
    [key: string]: any;
}

export default class TrabajadorMostrar {
    layout?: LayoutView;
    region: any;
    trabajadorService: TrabajadorService;
    stopListening?: () => void;

    constructor(options: TrabajadorMostrarOptions = {}) {
        _.extend(this, Backbone.Events);
        _.extend(this, options);
        this.trabajadorService = new TrabajadorService();
    }

    mostrarTrabajador(model: any): void {
        this.layout = new LayoutView();
        this.region.show(this.layout);

        this.layout.getRegion('subheader').show(
            new TrabajadoresNav({
                model: {
                    titulo: 'Mostrar trabajador',
                    listar: false,
                    exportar: false,
                    crear: false,
                    editar: false,
                    masivo: false,
                },
                dataToggle: null,
            })
        );
        const view = new TrabajadorMostrarView({
            model: model,
        });

        this.layout.getRegion('body').show(view);
        (TrabajadoresNav as any).parentView = view;
    }

    destroy(): void {
        this.region.remove();
        if (this.stopListening) this.stopListening();
    }
}
