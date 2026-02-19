import { Controller } from "@/common/Controller";
import CargueMasivoCartera from "@/componentes/cartera/views/CargueMasivoCartera";
import CarteraCrear from "@/componentes/cartera/views/CarteraCrear";
import CarteraDetalle from "@/componentes/cartera/views/CarteraDetalle";
import CarterasListar from "@/componentes/cartera/views/CarterasListar";
import $App from "@/core/App";
import Cartera from "@/models/Cartera";
import type { CarteraTransfer } from "./types";

// Declaraciones para las colecciones globales
declare global {
    var EmpresasCollection: any;
    var RepresentantesCollection: any;
    var CarterasCollection: any;
    var create_url: (path: string) => string;
    var scroltop: () => void;
}

export default class CarteraController extends Controller {
    constructor(options: any) {
        super(options);
        this.__initializeCollections();
    }

    /**
     * Inicializar las colecciones necesarias
     */
    private __initializeCollections(): void {
        $App.Collections.empresas = null;
        $App.Collections.carteras = null;
        $App.Collections.representantes = null;
        $App.Collections.poderes = null;
    }

    /**
     * Mostrar vista de creación de cartera
     */
    crearCartera(): void {
        this.__createContent();
        this.__initRepresentantes();
        this.__initPoderes();
        this.__initEmpresas();

        const view = new CarteraCrear({ model: new Cartera(), isNew: true });
        $(this.region.el).html(view.render().el);
        this.listenTo(view, 'search:empresa', this.__searchEmpresaValidation);
        this.listenTo(view, 'add:cartera', this.__addCartera);
    }

    /**
     * Editar una cartera existente
     */
    editaCartera(id: string): void {
        this.__createContent();
        this.__initRepresentantes();
        this.__initPoderes();
        this.__initEmpresas();

        if (!$App.Collections.carteras || _.size($App.Collections.carteras) === 0) {
            $App.trigger('syncro', {
                url: create_url('cartera/listar'),
                data: {},
                callback: (response: any) => {
                    if (response?.success) {
                        this.__setCarteras(response.carteras);
                        const model = $App.Collections.carteras.get(id);
                        if (model) {
                            const view = new CarteraCrear({ model: model, isNew: false });
                            $(this.region.el).html(view.render().el);
                            this.listenTo(view, 'search:empresa', this.__searchEmpresaValidation);
                            this.listenTo(view, 'add:cartera', this.__addCartera);
                        } else {
                            $App.trigger('alert:error', 'Cartera no encontrada');
                        }
                    } else {
                        $App.trigger('alert:error', response?.msj || 'Error al cargar carteras');
                    }
                },
            });
        } else {
            const model = $App.Collections.carteras.get(id);
            if (model) {
                const view = new CarteraCrear({ model: model, isNew: false });
                $(this.region.el).html(view.render().el);
                this.listenTo(view, 'search:empresa', this.__searchEmpresaValidation);
                this.listenTo(view, 'add:cartera', this.__addCartera);
            } else {
                $App.trigger('alert:error', 'Cartera no encontrada');
            }
        }
    }

    /**
     * Listar todas las carteras
     */
    listaCartera(): void {
        this.__createContent();
        $App.trigger('syncro', {
            url: create_url('cartera/listar'),
            data: {},
            callback: (response: any) => {
                if (response?.success) {
                    this.__setCarteras(response.carteras);
                    const view = new CarterasListar({ collection: $App.Collections.carteras });
                    $(this.region.el).html(view.render().el);
                    this.listenTo(view, 'remove:cartera', this.__removeCartera);
                } else {
                    $App.trigger('alert:error', response?.msj || 'Error al listar carteras');
                }
            },
        });
    }

    /**
     * Mostrar detalle de una cartera
     */
    mostrarDetalle(id: string): void {
        this.__createContent();
        this.__initEmpresas();
        this.__initCarteras();

        if (!$App.Collections.carteras || _.size($App.Collections.carteras) === 0) {
            $App.trigger('syncro', {
                url: create_url('cartera/detalle/' + id),
                data: {},
                callback: (response: any) => {
                    if (response?.success) {
                        const cartera = new Cartera(response.cartera);
                        const view = new CarteraDetalle({ model: cartera });
                        $(this.region.el).html(view.render().el);
                    } else {
                        $App.trigger('alert:error', response?.msj || 'Error al cargar detalle');
                    }
                },
            });
        } else {
            const cartera = $App.Collections.carteras.get(id);
            if (cartera) {
                const view = new CarteraDetalle({ model: cartera });
                $(this.region.el).html(view.render().el);
            } else {
                $App.trigger('alert:error', 'Cartera no encontrada');
            }
        }
    }

    /**
     * Mostrar vista de cargue masivo
     */
    cargueMasivoCartera(): void {
        this.__createContent();
        this.__initCarteras();
        const view = new CargueMasivoCartera();
        $(this.region.el).html(view.render().el);
    }

    /**
     * Manejar errores
     */
    error(): void {
        $App.trigger('alert:error', 'Se ha producido un error en la aplicación');
        if (this.router) {
            this.router.navigate('listar', { trigger: true });
        }
    }

    /**
     * Validar empresa por NIT
     */
    private __searchEmpresaValidation(transfer: CarteraTransfer): void {
        const { nit, callback } = transfer;

        if (!nit || !callback) {
            $App.trigger('alert:error', 'Datos inválidos para búsqueda de empresa');
            return;
        }

        $App.trigger('syncro', {
            url: create_url('cartera/buscar_empresa/' + nit),
            data: {},
            callback: (response: any) => {
                if (response?.success === false) {
                    $App.trigger('alert:error', response.msj || 'Empresa no encontrada');
                    callback(false);
                } else {
                    callback(response);
                }
            },
        });
    }

    /**
     * Eliminar una cartera
     */
    private __removeCartera(transfer: CarteraTransfer): void {
        const { model, callback } = transfer;

        if (!model || !callback) {
            $App.trigger('alert:error', 'Datos inválidos para eliminar cartera');
            callback?.(false);
            return;
        }

        $App.trigger('syncro', {
            url: create_url('cartera/removeCartera/' + model.get('id')),
            data: {
                nit: model.get('nit'),
                cedrep: model.get('cedrep'),
                id: model.get('id'),
            },
            callback: (response: any) => {
                if (response?.success) {
                    this.__notifyPlataforma(model.get('nit'));
                    callback(response);
                } else {
                    $App.trigger('alert:error', response?.msj || 'Error al eliminar cartera');
                    callback(false);
                }
            },
        });
    }

    /**
     * Inicializar colección de empresas
     */
    private __initEmpresas(): void {
        if (!$App.Collections.empresas) {
            if (typeof EmpresasCollection !== 'undefined') {
                $App.Collections.empresas = new EmpresasCollection();
            } else {
                // Fallback si EmpresasCollection no está disponible
                $App.Collections.empresas = new ($App as any).Collection();
            }
            $App.Collections.empresas.reset();
        }
    }

    /**
     * Inicializar colección de representantes
     */
    private __initRepresentantes(): void {
        if (!$App.Collections.representantes) {
            if (typeof RepresentantesCollection !== 'undefined') {
                $App.Collections.representantes = new RepresentantesCollection();
            } else {
                // Fallback si RepresentantesCollection no está disponible
                $App.Collections.representantes = new ($App as any).Collection();
            }
            $App.Collections.representantes.reset();
        }
    }

    /**
     * Inicializar colección de poderes
     */
    private __initPoderes(): void {
        if (!$App.Collections.poderes) {
            if (typeof RepresentantesCollection !== 'undefined') {
                $App.Collections.poderes = new RepresentantesCollection();
            } else {
                // Fallback si RepresentantesCollection no está disponible
                $App.Collections.poderes = new ($App as any).Collection();
            }
            $App.Collections.poderes.reset();
        }
    }

    /**
     * Inicializar colección de carteras
     */
    private __initCarteras(): void {
        if (!$App.Collections.carteras) {
            if (typeof CarterasCollection !== 'undefined') {
                $App.Collections.carteras = new CarterasCollection();
            } else {
                // Fallback si CarterasCollection no está disponible
                $App.Collections.carteras = new ($App as any).Collection();
            }
            $App.Collections.carteras.reset();
        }
    }

    /**
     * Crear elemento de contenido
     */
    private __createContent(): HTMLElement {
        if (this.region?.el) {
            $(this.region.el).remove();
        }
        const el = document.createElement('div');
        el.setAttribute('id', this.region.id || 'content');
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.appendChild(el);
        }
        if (typeof scroltop === 'function') {
            scroltop();
        }
        return el;
    }

    /**
     * Establecer empresas en la colección
     */
    private __setEmpresas(empresas: any[]): void {
        this.__initEmpresas();
        if ($App.Collections.empresas && empresas) {
            $App.Collections.empresas.add(empresas, { merge: true });
        }
    }

    /**
     * Establecer carteras en la colección
     */
    private __setCarteras(carteras: any[]): void {
        this.__initCarteras();
        if ($App.Collections.carteras && carteras) {
            $App.Collections.carteras.add(carteras, { merge: true });
        }
    }

    /**
     * Agregar una cartera a la colección
     */
    private __addCartera(cartera: any): Cartera {
        this.__initCarteras();
        if (!$App.Collections.carteras) {
            return cartera instanceof Cartera ? cartera : new Cartera(cartera);
        }
        const carteraModel = cartera instanceof Cartera ? cartera : new Cartera(cartera);
        $App.Collections.carteras.add(carteraModel, { merge: true });
        return carteraModel;
    }

    /**
     * Notificar a la plataforma sobre eliminación de cartera
     */
    private __notifyPlataforma(nit: string): void {
        if (!nit) {
            $App.trigger('alert:error', 'NIT requerido para notificación');
            return;
        }

        $App.trigger('syncro', {
            url: create_url('novedades/notyRemoveCartera'),
            data: { nit },
            callback: (response: any) => {
                if (response?.success) {
                    $App.trigger('alert:success', response.msj);
                } else {
                    $App.trigger('alert:error', response?.msj || 'Error en notificación');
                }
            },
        });
    }
}
