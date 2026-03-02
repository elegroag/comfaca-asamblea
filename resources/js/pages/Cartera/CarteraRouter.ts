import { BackboneRouter } from "@/common/Bone";
import CarteraController from "./CarteraController";
import { RouterOptions } from "@/types/CommonDeps";

export default class CarteraRouter extends BackboneRouter {

    constructor(options: RouterOptions) {
        super({
            ...options,
            routes: {
                '': 'listarCarteras',
                listar: 'listarCarteras',
                crear: 'crearCartera',
                cargue: 'cargarCarteras',
                'detalle/:id': 'detalleCartera',
                'editar/:id': 'editarCartera',
                error: 'errorCartera'
            },
        });

        this.app = options.app;
        this._bindRoutes();
    }

    init(): CarteraController {
        return this.app.startSubApplication(CarteraController);
    }

    /**
     * Manejar ruta para listar carteras
     */
    listarCarteras(): void {
        const controller = this.init();
        controller.listaCartera();
    }

    /**
     * Manejar ruta para crear nueva cartera
     */
    crearCartera(): void {
        const controller = this.init();
        controller.crearCartera();
    }

    /**
     * Manejar ruta para cargue masivo de carteras
     */
    cargarCarteras(): void {
        const controller = this.init();
        controller.cargueMasivoCartera();
    }

    /**
     * Manejar ruta para ver detalles de cartera
     */
    detalleCartera(id: string): void {
        const controller = this.init();
        if (!id || id.trim() === '') {
            this.navigate('listar', { trigger: true });
            return;
        }

        controller.mostrarDetalle(id);
    }

    /**
     * Manejar ruta para editar cartera
     */
    editarCartera(id: string): void {
        const controller = this.init();
        if (!id || id.trim() === '') {
            this.app?.trigger('warning', 'El id de la cartera es requerido.');
            this.navigate('listar', { trigger: true });
            return;
        }

        controller.editaCartera(id);
    }

    /**
     * Manejar ruta de error
     */
    errorCartera(): void {
        const controller = this.init();
        controller.error();
    }
}
