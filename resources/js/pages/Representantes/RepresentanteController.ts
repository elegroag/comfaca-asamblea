'use strict';

class RepresentanteController {
    constructor({ region, ...options }) {
        this.region = region;
        _.extend(this, Backbone.Events);

        $App.Collections.representantes = null;
        this.listenTo(this, 'set:representantes', this.__setRepresentantes);
        this.listenTo(this, 'add:representante', this.__addRepresentante);
    }

    listaRepresentantes() {
        this.__createContent();
        if ($App.Collections.representantes == null) {
            $App.trigger('syncro', {
                url: create_url('representantes/listar'),
                data: {},
                callback: (response) => {
                    if (response) {
                        if (response.success) {
                            this.trigger('set:representantes', response.representantes);

                            const view = new RepresentanteListar({
                                collection: $App.Collections.representantes,
                            });
                            $(this.region.el).html(view.render().el);
                            this.listenTo(view, 'remove:representante', this.__removeRepresentante);
                        }
                    } else {
                        $App.trigger('alert:error', response);
                    }
                },
            });
        } else {
            loading.show(true);

            const view = new RepresentanteListar({
                collection: $App.Collections.representantes,
            });

            $(this.region.el).html(view.render().el);
            this.listenTo(view, 'remove:representante', this.__removeRepresentante);

            setTimeout(() => loading.hide(true), 100);
        }
    }

    mostrarRepresentante(cedula) {
        this.__createContent();
        if ($App.Collections.representantes == null) {
            $App.trigger('syncro', {
                url: create_url(`representantes/buscar/${cedula}`),
                data: {},
                callback: (response) => {
                    if (response) {
                        if (response.success) {
                            if (response.isValid == false) {
                                $App.trigger('error', response.msj);
                                $App.router.navigate('listar', { trigger: true, replace: true });
                                return false;
                            }
                            const representante = new Representante(response.representante);
                            representante.set('registro_ingresos', response.registro_ingresos ?? false);

                            let view = new RepresentanteMostrar({
                                model: representante,
                            });
                            $(this.region.el).html(view.render().el);
                            this.listenTo(view, 'add:representante', this.__addRepresentante);
                        }
                    } else {
                        $App.trigger('alert:error', response);
                    }
                },
            });
        } else {
            loading.show(true);
            const representante = $App.Collections.representantes.get(cedula);
            let view = new RepresentanteMostrar({ model: representante });
            $(this.region.el).html(view.render().el);
            this.listenTo(view, 'add:representante', this.__addRepresentante);
            setTimeout(() => loading.hide(true), 100);
        }
    }

    crearRepresentante() {
        this.__createContent();
        let view = new RepresentanteCrear({ model: new Representante(), isNew: true });
        $(this.region.el).html(view.render().el);
        this.listenTo(view, 'add:representante', this.__addRepresentante);
        this.listenTo(view, 'valid:representante', this.__validRepresentante);
        this.listenTo(view, 'search:empresa', this.__empresaDisponible);
    }

    editaRepresentante(cedula) {
        this.__createContent();
        if ($App.Collections.representantes == null) {
            $App.trigger('syncro', {
                url: create_url(`representantes/buscar/${cedula}`),
                data: {},
                callback: (response) => {
                    if (response) {
                        if (response.success) {
                            if (response.isValid == false) {
                                $App.trigger('error', response.msj);
                                $App.router.navigate('listar', { trigger: true, replace: true });
                                return false;
                            }
                            const representante = new Representante(response.representante);
                            representante.set('registro_ingresos', response.registro_ingresos ?? false);

                            let view = new RepresentanteCrear({
                                model: representante,
                                isNew: false,
                            });
                            $(this.region.el).html(view.render().el);
                            this.listenTo(view, 'add:representante', this.__addRepresentante);
                        }
                    } else {
                        $App.trigger('alert:error', response);
                    }
                },
            });
        } else {
            loading.show(true);
            const representante = $App.Collections.representantes.get(cedula);
            let view = new RepresentanteCrear({ model: representante, isNew: false });
            $(this.region.el).html(view.render().el);
            this.listenTo(view, 'add:representante', this.__addRepresentante);
            setTimeout(() => loading.hide(true), 100);
        }
    }

    __removeRepresentante(transfer) {
        const { model, responseTransaction } = transfer;
        if (model instanceof Representante == false) {
            $App.trigger('alert:error', 'El modelo no corresponde a un representante');
            responseTransaction(false);
        } else {
            $App.trigger('syncro', {
                url: create_url(`representantes/removeRepresentante/${model.get('id')}`),
                data: {},
                callback: (response) => {
                    if (response) {
                        if (response.success) {
                            $App.trigger('success', response.msj);
                            responseTransaction(true);
                            $App.Collections.representantes.remove(model);
                        } else {
                            $App.trigger('alert:error', response.msj);
                            responseTransaction(false);
                        }
                    }
                },
            });
        }
        return false;
    }

    __validRepresentante(transfer) {
        const { cedrep, callback } = transfer;

        $App.trigger('syncro', {
            url: create_url(`representantes/validRepresentante/${cedrep}`),
            data: {},
            callback: (response) => {
                if (response) {
                    if (response.isValid == true) {
                        $App.trigger('alert:success', response.msj);
                        callback(true);
                    } else {
                        $App.trigger('alert:error', response.msj);
                        callback(false);
                    }
                }
            },
        });
    }

    __empresaDisponible(transfer) {
        const { nit, callback } = transfer;

        $App.trigger('syncro', {
            url: create_url(`representantes/empresaDisponible/${nit}`),
            data: {},
            callback: (response) => {
                if (response) {
                    if (response.isValid == true) {
                        callback(response);
                    } else {
                        $App.trigger('alert:error', response.msj);
                        callback(false);
                    }
                }
            },
        });
    }

    __initRepresentantes() {
        if ($App.Collections.representantes == null) {
            $App.Collections.representantes = new RepresentantesCollection();
            $App.Collections.representantes.reset();
        }
    }

    __setRepresentantes(representantes) {
        this.__initRepresentantes();
        $App.Collections.representantes.add(representantes, { merge: true });
    }

    __addRepresentante(representante) {
        let _representante = representante instanceof Representante ? representante : new Representante(representante);
        this.__initRepresentantes();
        $App.Collections.representantes.add(_representante, { merge: true });
    }

    __createContent() {
        $(this.region.el).remove();
        let _el = document.createElement('div');
        _el.setAttribute('id', this.region.id);
        document.getElementById('app').appendChild(_el);
        scroltop();
        return _el;
    }
}
