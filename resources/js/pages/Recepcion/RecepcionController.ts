import AsistenciasCollection from "@/collections/AsistenciasCollection";
import PoderesCollection from "@/collections/Poderes";
import { Controller } from "@/common/Controller";
import type { ControllerOptions } from "@/types/types";
import RecepcionService from "./RecepcionService";
import Representante from "@/models/Representante";
import Poder from "@/models/Poder";
import Empresa from "@/models/Empresa";
import Asistencia from "@/models/Asistencia";

export default class RecepcionController extends Controller {
    private identifies: any[];
    private ficha_ingreso: any;
    private resultSearchEmpleador: any;
    private service: RecepcionService;

    constructor({ region, ...options }: ControllerOptions) {
        super({ region, ...options });
        this.region = region;
        _.extend(this, Backbone.Events);

        // Usar variables globales para colecciones que no existen como módulos
        $App.Collections.empresas = new (window as any).EmpresasCollection();
        $App.Collections.asistencias = new AsistenciasCollection();
        $App.Collections.representantes = new (window as any).RepresentantesCollection();
        $App.Collections.poderes = new PoderesCollection();
        $App.Collections.inscritos = new (window as any).RepresentantesCollection();
        this.identifies = [];
        this.ficha_ingreso = null;
        this.resultSearchEmpleador = null;
        this.service = new RecepcionService(region);
    }

    listaRecepcion() {
        this.__createContent();
        $App.Collections.asistencias.reset();
        $App.trigger('syncro', {
            url: create_url('recepcion/listar'),
            data: {},
            callback: (salida) => {
                if (salida.success) {
                    $App.trigger('alert:info', salida.msj);
                    if (salida.asistencias !== -1) this.service.__setAsistencias(salida.asistencias);

                    const view = new (window as any).AsistenciasListar({
                        collection: $App.Collections.asistencias,
                    });

                    $(this.region.el).html(view.render().el);

                    $('#titulo_lista_recepcion').html('Registros De Asistencia');
                } else {
                    $App.trigger('error', salida.msj);
                }
            },
        });
    }

    showAsistente(cedrep) {
        this.__createContent();
        if (this.resultSearchEmpleador) {
            const view = new (window as any).AsistenciasMostrar({
                model: this.resultSearchEmpleador.representante,
                collection: [
                    {
                        empresas: this.resultSearchEmpleador.empresas,
                        asistencias: this.resultSearchEmpleador.asistencias,
                        poder: this.resultSearchEmpleador.poder,
                        poderes: this.resultSearchEmpleador.poderes,
                    },
                ],
            });
            $(this.region.el).html(view.render().el);
        } else {
            this.__searchCedrep({
                cedrep,
                callback: (response) => {
                    if (response) {
                        this.resultSearchEmpleador = this.service.__showItemMostrar(response);
                        const view = new (window as any).AsistenciasMostrar({
                            model: this.resultSearchEmpleador.representante,
                            collection: [
                                {
                                    empresas: this.resultSearchEmpleador.empresas,
                                    asistencias: this.resultSearchEmpleador.asistencias,
                                    poder: this.resultSearchEmpleador.poder,
                                    poderes: this.resultSearchEmpleador.poderes,
                                },
                            ],
                        });
                        $(this.region.el).html(view.render().el);
                    } else {
                        $App.router.navigate('buscar', { trigger: true, replace: true });
                    }
                },
            });
        }
    }

    mostrarValidacion(cedrep) {
        this.__createContent();

        const url = create_url('habiles/validar/' + cedrep);
        $App.trigger('syncro', {
            url: url,
            data: {},
            callback: (response) => {
                if (response) {
                    if (response.representante === false) {
                        $App.trigger('error', 'El representante no es valido para ingresar');
                        $App.router.navigate('buscar', { trigger: true });
                    } else {
                        const _representante = this.service.__addRepresentante(response.representante);
                        this.service.__setPoderes(response.poderes);

                        const view = new AsistenciasCrear({
                            model: _representante,
                            collection: [
                                {
                                    empresas: new EmpresasCollection(response.empresas),
                                    votos: response.votos,
                                    poderes: new PoderesCollection(response.poderes),
                                },
                            ],
                        });
                        $(this.region.el).html(view.render().el);
                        this.listenTo(view, 'add:asistencia', this.__addAsistencias);
                        this.listenTo(view, 'set:fichaIngreso', this.__setFichaIngreso);
                        this.listenTo(view, 'search:poder', this.__buscarEmpresPoder);
                    }
                } else {
                    $App.trigger('alert:error', response);
                }
            },
        });
    }

    buscarAsistencia() {
        this.__createContent();
        this.resultSearchEmpleador = null;

        $App.trigger('syncro', {
            url: create_url('recepcion/identifyAsistentes'),
            data: {},
            callback: (salida) => {
                if (salida) {
                    if (salida.success) {
                        this.identifies = salida.identifies;

                        const view = new AsistenciasBuscar({ collection: this.identifies });
                        $(this.region.el).html(view.render().el);

                        this.listenTo(view, 'add:representante', this.__addRepresentante);
                        this.listenTo(view, 'set:asistencias', this.__setAsistencias);
                        this.listenTo(view, 'set:empresas', this.__setEmpresas);
                        this.listenTo(view, 'show:item', this.__showItemMostrar);
                        this.listenTo(view, 'search:cedrep', this.__searchCedrep);

                        document.getElementById('cedrep').focus();
                    } else {
                        $App.trigger(
                            'warning',
                            'Error al consultar la lista de representantes pre-inscritos para Asamblea'
                        );
                        return false;
                    }
                }
            },
        });
    }

    mostrarFicha(cedrep) {
        this.__createContent();
        $App.trigger('syncro', {
            url: create_url('recepcion/ficha'),
            data: {
                cedrep,
            },
            callback: (response) => {
                if (response) {
                    if (response.success) {
                        if (response.representante === false) {
                            $App.trigger('alert:error', 'Se ha generado un error de procesamiento.');
                            $App.router.navigate('buscar', { trigger: true });
                        } else {
                            const representante = new Representante(response.representante);
                            const empresas = new EmpresasCollection(response.empresas);
                            const poder = response.poder ? new Poder(response.poder) : false;

                            const view = new AsistenciasFicha({
                                model: representante,
                                collection: [
                                    {
                                        empresas,
                                        poder,
                                        votos: response.votos,
                                    },
                                ],
                            });
                            $(this.region.el).html(view.render().el);
                            this.listenTo(view, 'add:representante', this.service.__addRepresentante);
                        }
                    } else {
                        $App.trigger('error', response.msj);
                    }
                } else {
                    $App.trigger('warning', 'Se ha generado un error de procesamiento. ');
                }
            },
        });
    }

    listarRechazados() {
        this.__createContent();

        loading.show(true);
        axios
            .get(create_url('recepcion/buscar_rechazados'))
            .then((salida) => {
                loading.hide(true);
                if (salida.status == 200) {
                    let _asistencias =
                        salida.data.asistencias !== -1
                            ? new AsistenciasCollection(salida.data.asistencias)
                            : new AsistenciasCollection();

                    let view = new AsistenciasListar({
                        collection: _asistencias,
                    });

                    $(this.region.el).html(view.render().el);
                    $('#titulo_lista_recepcion').html('Rechazados No Habiles');
                }
            })
            .catch((err) => {
                loading.hide(true);
                console.log(err);
            });
    }

    registroEmpresa(nit) {
        this.__createContent();
        $(this.region.el).html('<p>Procesando la busqueda...</p>');
        if (!this.ficha_ingreso) loading.show(true);

        axios
            .get(create_url('recepcion/activo/' + nit))
            .then((salida) => {
                if (!this.ficha_ingreso) loading.hide(true);
                if (salida.status == 200) {
                    if (salida.data.empresa === false) {
                        $App.trigger(
                            'alert:error',
                            'La empresa no es correcta para continuar. \n' + salida.data.errors
                        );
                        $App.router.navigate('buscar', { trigger: true });
                    } else {
                        const empresa = salida.data.empresa ? new Empresa(salida.data.empresa) : false;
                        const representante = salida.data.repres ? new Representante(salida.data.repres) : false;
                        const poder = salida.data.poder ? new Poder(salida.data.poder) : false;

                        let view = new AsistenciasEmpresa({
                            model: empresa,
                            collection: [representante, poder],
                        });
                        $(this.region.el).html(view.render().el);
                    }
                } else {
                    $App.trigger('alert:error', 'Se ha generado un error de procesamiento.');
                    $App.router.navigate('buscar', { trigger: true });
                }
            })
            .catch((err) => {
                if (!this.ficha_ingreso) loading.hide(true);
                console.log(err);
            });
    }

    crearRegistro() {
        this.__createContent();
        let view = new (window as any).InscripcionCreate();
        $(this.region.el).html(view.render().el);
    }

    listarInscritos() {
        this.__createContent();
        $App.Collections.inscritos.reset();
        $App.trigger('syncro', {
            url: create_url('recepcion/buscar_inscritos'),
            data: {},
            callback: (salida) => {
                if (salida) {
                    if (salida.success) {
                        if (salida.inscritos !== -1) {
                            this.__setInscritos(salida.inscritos);
                        }
                        const view = new AsistenciasInscritos({
                            collection: $App.Collections.inscritos,
                            estado: 'P',
                        });
                        $(this.region.el).html(view.render().el);
                    } else {
                        $App.trigger(
                            'warning',
                            'Error al consultar la lista de representantes pre-inscritos para Asamblea'
                        );
                        return false;
                    }
                }
            },
        });
    }

    registrosPendientes() {
        this.__createContent();
        $App.Collections.inscritos.reset();

        $App.trigger('syncro', {
            url: create_url('recepcion/buscar_registros_pendientes'),
            data: {},
            callback: (response) => {
                if (response) {
                    if (response.success) {
                        if (response.inscritos) this.__setInscritos(response.inscritos);

                        const view = new AsistenciasInscritos({
                            collection: $App.Collections.inscritos,
                            estado: 'X',
                        });

                        $(this.region.el).html(view.render().el);
                    } else {
                        $App.trigger(
                            'warning',
                            'Error al consultar la lista de representantes pendientes de ingreso a la Asamblea'
                        );
                        return false;
                    }
                }
            },
        });
    }

    preregistroPresencial() {
        this.__createContent();
        let view = new (window as any).PreregistroPresencial();
        $(this.region.el).html(view.render().el);
    }

    __buscarEmpresPoder(transaction) {
        const { nit_poder, callback } = transaction;

        $App.trigger('syncro', {
            url: create_url(`habiles/buscar_empresa/${nit_poder}`),
            data: { nit: nit_poder },
            callback: (response) => {
                if (response) {
                    return callback(response);
                }
                return callback(false);
            },
        });
    }

    __searchCedrep(transaction) {
        const { cedrep, callback } = transaction;

        $App.trigger('syncro', {
            url: create_url('recepcion/buscar'),
            data: {
                cedrep,
            },
            callback: (response) => {
                if (response) {
                    if (response.success) {
                        if (response.representante === false) {
                            $App.trigger('error', 'El representante no está habil para ingreso.');
                            return callback(false);
                        }

                        if (response.empresas === false) {
                            $App.trigger('error', 'No dispone de empresas habiles para el ingreso.');
                            return callback(false);
                        }

                        if (response.tipo_ingreso === 'V') {
                            $App.trigger(
                                'warning',
                                'Su participación en la asamblea se registró en el modo Virtual. ' +
                                'No se admite su ingreso, ya que no hay cupos disponibles. ' +
                                'Se recomienda que valide el mensaje emitido al correo respectivo para corroborar la información de inscripción.'
                            );
                            return callback(false);
                        }
                        return callback(response);
                    } else {
                        $App.trigger('error', response.msj);
                        return callback(false);
                    }
                } else {
                    $App.trigger('error', 'No se puede identificar el error, reportar a soporte técnico.');
                    return callback(false);
                }
            },
        });
    }

    __createContent() {
        if (this.region && this.region.el) {
            $(this.region.el).remove();
        }
        const _el = document.createElement('div');
        _el.setAttribute('id', this.region.id);
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.appendChild(_el);
        }
        if (typeof scroltop === 'function') {
            scroltop();
        }
        return _el;
    }

    __addAsistencias(asistencia) {
        return this.service.__addAsistencias(asistencia);
    }

    __setAsistencias(asistencias) {
        this.service.__setAsistencias(asistencias);
    }

    __setFichaIngreso(estado) {
        this.service.__setFichaIngreso(estado);
    }

    __setInscritos(inscritos) {
        this.service.__setInscritos(inscritos);
    }

    destroy() {
        this.stopListening();
        $(this.region.el).remove();
        this.region.remove();
    }
}
