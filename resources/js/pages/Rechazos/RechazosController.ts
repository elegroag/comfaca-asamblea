import { Controller } from "@/common/Controller";
import RechazoService from "./RechazoService";
import RechazoCrear from "./RechazoCrear";
import RechazosListar from "./RechazosListar";
import RechazosMasivo from "./RechazosMasivo";
import RechazoDetalle from "./RechazoDetalle";

export default class RechazosController extends Controller {

    rechazoService: RechazoService;

    constructor(options: any) {
        super(options);
        this.rechazoService = new RechazoService();
    }

    showCreate() {
        const auth = this.startController(RechazoCrear);
        auth.showCreate();
    }

    showList() {
        const auth = this.startController(RechazosListar);
        auth.listaRechazos();
    }

    showMasivo() {
        const auth = this.startController(RechazosMasivo);
        auth.cargueMasivo();
    }

    showDetalle(id: string) {
        const auth = this.startController(RechazoDetalle);
        if (!$App.Collections.rechazos || _.size($App.Collections.rechazos) == 0) {
            $App.trigger('syncro', {
                url: create_url('rechazos/detail'),
                data: {
                    id: id,
                },
                callback: (response: any) => {
                    if (response.success == true) {
                        const criterios = response.data;
                        const model = new RechazoModel({
                            ...criterios,
                            isNew: false,
                        });
                        auth.showDetalle(model);
                    } else {
                        $App.trigger('error', response.msj);
                    }
                },
            });
        } else {
            const model = $App.Collections.rechazos.get(id);
            auth.showDetalle(model);
        }
    }

    showEditar(id: string) {
        const auth = this.startController(RechazoCrear);
        if (!$App.Collections.rechazos || _.size($App.Collections.rechazos) == 0) {
            $App.trigger('syncro', {
                url: create_url('rechazos/detail'),
                data: {
                    id: id,
                },
                callback: (response: any) => {
                    if (response.success == true) {
                        const model = new RechazoModel(response.data);
                        auth.showEditar(model);
                    }
                },
            });
        } else {
            const model = $App.Collections.rechazos.get(id);
            auth.showEditar(model);
        }
    }
}
