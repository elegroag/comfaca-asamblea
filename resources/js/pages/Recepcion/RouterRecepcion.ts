import { BackboneRouter } from "@/common/Bone";
import RecepcionController from "./RecepcionController";
import $App from "@/core/App";

declare global {
    var $App: any;
}

interface RouterRecepcionOptions {
    [key: string]: any;
}

export default class RouterRecepcion extends BackboneRouter {
    controller: RecepcionController;

    constructor(options: RouterRecepcionOptions = {}) {
        super({
            routes: {
                '': 'listaRecepcion',
                listar: 'listaRecepcion',
                'mostrar/:cedrep': 'mostrarAsistente',
                'validacion/:cedrep': 'mostrarValidacion',
                buscar: 'buscarAsistencia',
                rechazados: 'listarRechazados',
                'ficha/:cedrep': 'mostrarFicha',
                errors: 'mostrarError',
                'registro_empresa/:nit': 'registroEmpresa',
                crear: 'crearRegistro',
                listar_inscritos: 'listarInscritos',
                registros_pendientes: 'registrosPendientes',
                preregistro_presencial: 'preregistroPresencial',
            },
            ...options,
        });

        this.controller = $App.startSubApplication(RecepcionController, this);
        this._bindRoutes();
    }

    /**
     * Listar recepción
     */
    listaRecepcion(): void {
        console.log('RouterRecepcion.listaRecepcion() called');

        if (this.controller && typeof this.controller.listaRecepcion === 'function') {
            this.controller.listaRecepcion();
        }
    }

    /**
     * Mostrar asistente
     */
    mostrarAsistente(cedrep: string): void {
        console.log('RouterRecepcion.mostrarAsistente() called', cedrep);

        if (cedrep === '' || cedrep === undefined || cedrep === null) {
            if (this.App) {
                this.App.trigger('alert:warning', { message: 'El documento no es valido para mostrar los datos del representante.' });
            }
            this.navigate('buscar', { trigger: true });
            return;
        }

        if (this.controller && typeof this.controller.showAsistente === 'function') {
            this.controller.showAsistente(cedrep);
        }
    }

    /**
     * Mostrar validación
     */
    mostrarValidacion(cedrep: string): void {
        console.log('RouterRecepcion.mostrarValidacion() called', cedrep);

        if (cedrep === '' || cedrep === undefined || cedrep === null) {
            if (this.App) {
                this.App.trigger('alert:warning', { message: 'La cedula no es valida para continuar.' });
            }
            this.navigate('buscar', { trigger: true });
            return;
        }

        if (this.controller && typeof this.controller.mostrarValidacion === 'function') {
            this.controller.mostrarValidacion(cedrep);
        }
    }

    /**
     * Buscar asistencia
     */
    buscarAsistencia(): void {
        console.log('RouterRecepcion.buscarAsistencia() called');

        if (this.controller && typeof this.controller.buscarAsistencia === 'function') {
            this.controller.buscarAsistencia();
        }
    }

    /**
     * Mostrar ficha
     */
    mostrarFicha(cedrep: string): void {
        console.log('RouterRecepcion.mostrarFicha() called', cedrep);

        if (cedrep === '' || cedrep === undefined || cedrep === null) {
            if (this.App) {
                this.App.trigger('alert:warning', { message: 'La cedula no es valida para continuar.' });
            }
            this.navigate('buscar', { trigger: true });
            return;
        }

        if (this.controller && typeof this.controller.mostrarFicha === 'function') {
            this.controller.mostrarFicha(cedrep);
        }
    }

    /**
     * Listar rechazados
     */
    listarRechazados(): void {
        console.log('RouterRecepcion.listarRechazados() called');

        if (this.controller && typeof this.controller.listarRechazados === 'function') {
            this.controller.listarRechazados();
        }
    }

    /**
     * Mostrar error
     */
    mostrarError(): void {
        console.log('RouterRecepcion.mostrarError() called');

        if (this.controller && typeof this.controller.mostrarError === 'function') {
            this.controller.mostrarError();
        }
    }

    /**
     * Registro empresa
     */
    registroEmpresa(nit: string): void {
        console.log('RouterRecepcion.registroEmpresa() called', nit);

        if (nit === '' || nit === undefined || nit === null) {
            if (this.App) {
                this.App.trigger('alert:warning', { message: 'El nit no es valida para continuar.' });
            }
            this.navigate('buscar', { trigger: true });
            return;
        }

        if (this.controller && typeof this.controller.registroEmpresa === 'function') {
            this.controller.registroEmpresa(nit);
        }
    }

    /**
     * Crear registro
     */
    crearRegistro(): void {
        console.log('RouterRecepcion.crearRegistro() called');

        if (this.controller && typeof this.controller.crearRegistro === 'function') {
            this.controller.crearRegistro();
        }
    }

    /**
     * Listar inscritos
     */
    listarInscritos(): void {
        console.log('RouterRecepcion.listarInscritos() called');

        if (this.controller && typeof this.controller.listarInscritos === 'function') {
            this.controller.listarInscritos();
        }
    }

    /**
     * Registros pendientes
     */
    registrosPendientes(): void {
        console.log('RouterRecepcion.registrosPendientes() called');

        if (this.controller && typeof this.controller.registrosPendientes === 'function') {
            this.controller.registrosPendientes();
        }
    }

    /**
     * Preregistro presencial
     */
    preregistroPresencial(): void {
        console.log('RouterRecepcion.preregistroPresencial() called');

        if (this.controller && typeof this.controller.preregistroPresencial === 'function') {
            this.controller.preregistroPresencial();
        }
    }
}
