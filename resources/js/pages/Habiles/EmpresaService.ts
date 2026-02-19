import EmpresasCollection from "@/componentes/habiles/collections/HabilesCollection";
import HabilModel from "@/componentes/habiles/models/HabilModel";

declare global {
    var $: any;
    var _: any;
    var $App: any;
    var create_url: (path: string) => string;
    var Empresa: any;
    var EmpresasCollection: any;
    var HabilesCollection: any;
}

interface SaveTransfer {
    model: any;
    callback: (success: boolean, data?: any) => void;
}

interface RemoveTransfer {
    model: any;
    callback: (success: boolean | any) => void;
}

interface NotifyTransfer {
    nit?: string;
    documento?: string;
}

export default class EmpresaService {
    /**
     * Inicializar colección de empresas
     */
    static initEmpresas(): void {
        if (!$App.Collections.empresas) {
            $App.Collections.empresas = new EmpresasCollection();
            $App.Collections.empresas.reset();
        }
    }

    /**
     * Inicializar colección de habiles
     */
    static initHabiles(): void {
        if (!$App.Collections.habiles) {
            $App.Collections.habiles = new HabilesCollection();
            $App.Collections.habiles.reset();
        }
    }

    /**
     * Guardar empresa
     */
    __saveEmpresa(transfer: SaveTransfer): void {
        const { model, callback } = transfer;

        if (!model.isValid()) {
            const errors = model.validationError;
            if ($App && typeof $App.trigger === 'function') {
                $App.trigger('alert:error', errors.toString());
            }
            callback(false);
        } else {
            if ($App && typeof $App.trigger === 'function') {
                $App.trigger('confirma', {
                    message: 'Se requiere de confirmar la acción a realizar para guardar los datos',
                    callback: (confirm: boolean) => {
                        if (confirm) {
                            if ($App && typeof $App.trigger === 'function') {
                                $App.trigger('syncro', {
                                    url: create_url('habiles/saveEmpresaHabil'),
                                    data: model.toJSON(),
                                    callback: (response: any) => {
                                        if (response) {
                                            if (response.success === true) {
                                                if ($App && typeof $App.trigger === 'function') {
                                                    $App.trigger('success', response.msj);
                                                }
                                                return callback(true, {
                                                    empresa: response.data,
                                                    pre_registro: response.pre_registro,
                                                });
                                            } else {
                                                if ($App && typeof $App.trigger === 'function') {
                                                    $App.trigger('error', response.msj);
                                                }
                                            }
                                        }
                                        return callback(false);
                                    },
                                });
                            }
                        } else {
                            return callback(false);
                        }
                    },
                });
            }
        }
    }

    /**
     * Eliminar empresa
     */
    __removeEmpresa(transfer: RemoveTransfer): void {
        const { model, callback } = transfer;

        if (model instanceof Empresa) {
            if ($App && typeof $App.trigger === 'function') {
                $App.trigger('confirma', {
                    message: 'Se requiere de confirmar la acción a realizar para remover el registro',
                    callback: (confirm: boolean) => {
                        if (confirm === true) {
                            if ($App && typeof $App.trigger === 'function') {
                                $App.trigger('syncro', {
                                    url: create_url(`habiles/removeEmpresa/${model.get('nit')}`),
                                    data: {},
                                    callback: (response: any) => {
                                        if (response) {
                                            if (response.success) {
                                                if ($App.Collections && $App.Collections.empresas) {
                                                    $App.Collections.empresas.remove(model);
                                                }
                                                if ($App && typeof $App.trigger === 'function') {
                                                    $App.trigger('alert:success', response.msj);
                                                }
                                                return callback(response);
                                            } else {
                                                if ($App && typeof $App.trigger === 'function') {
                                                    $App.trigger('alert:error', response.msj);
                                                }
                                            }
                                        }
                                        return callback(false);
                                    },
                                });
                            }
                        }
                        return callback(false);
                    },
                });
            }
        } else {
            return callback(false);
        }
    }

    /**
     * Buscar todas las empresas
     */
    __findAll(): void {
        if ($App && typeof $App.trigger === 'function') {
            $App.trigger('syncro', {
                url: create_url('habiles/listar'),
                data: {},
                callback: (response: any) => {
                    if (response.success) {
                        this.__setEmpresas(response.empresas);
                    } else {
                        if ($App && typeof $App.trigger === 'function') {
                            $App.trigger('alert:error', response.msj);
                        }
                    }
                },
            });
        }
    }

    /**
     * Establecer colección de empresas
     */
    __setEmpresas(empresas: any[]): void {
        EmpresaService.initEmpresas();
        if ($App.Collections && $App.Collections.empresas) {
            $App.Collections.empresas.add(empresas, { merge: true });
        }
    }

    /**
     * Agregar empresa a la colección
     */
    __addEmpresas(empresa: any): void {
        EmpresaService.initEmpresas();
        const _empresa = empresa instanceof Empresa ? empresa : new Empresa(empresa);
        if ($App.Collections && $App.Collections.empresas) {
            $App.Collections.empresas.add(_empresa, { merge: true });
        }
    }

    /**
     * Establecer colección de habiles
     */
    __setHabiles(empresas: any[]): void {
        EmpresaService.initHabiles();
        if ($App.Collections && $App.Collections.habiles) {
            $App.Collections.habiles.add(empresas, { merge: true });
        }
    }

    /**
     * Agregar habil a la colección
     */
    __addHabiles(empresa: any): void {
        EmpresaService.initHabiles();
        const _empresa = empresa instanceof HabilModel ? empresa : new HabilModel(empresa);
        if ($App.Collections && $App.Collections.habiles) {
            $App.Collections.habiles.add(_empresa, { merge: true });
        }
    }

    /**
     * Eliminar habil
     */
    __removeHabil(transfer: RemoveTransfer): void {
        const { model, callback } = transfer;

        if (model instanceof HabilModel) {
            if ($App && typeof $App.trigger === 'function') {
                $App.trigger('confirma', {
                    message: 'Se requiere de confirmar la acción a realizar para remover el registro',
                    callback: (confirm: boolean) => {
                        if (confirm === true) {
                            if ($App && typeof $App.trigger === 'function') {
                                $App.trigger('syncro', {
                                    url: create_url('habiles/remove_habil'),
                                    data: {
                                        nit: model.get('nit'),
                                        cedrep: model.get('cedula_representa'),
                                        criterio: 26,
                                    },
                                    callback: (response: any) => {
                                        if (response) {
                                            if (response.success) {
                                                if ($App.Collections && $App.Collections.habiles) {
                                                    $App.Collections.habiles.remove(model);
                                                }
                                                if ($App && typeof $App.trigger === 'function') {
                                                    $App.trigger('alert:success', response.msj);
                                                }
                                                return callback(response);
                                            } else {
                                                if ($App && typeof $App.trigger === 'function') {
                                                    $App.trigger('alert:error', response.msj);
                                                }
                                            }
                                        }
                                        return callback(false);
                                    },
                                });
                            }
                        }
                        return callback(false);
                    },
                });
            }
        } else {
            return callback(false);
        }
    }

    /**
     * Notificar a plataforma
     */
    __notifyPlataforma(transfer: NotifyTransfer = {}): void {
        if ($App && typeof $App.trigger === 'function') {
            $App.trigger('syncro', {
                url: create_url('novedades/notyChangeHabil'),
                data: {
                    nit: transfer.nit,
                    documento: transfer.documento,
                },
                callback: (response: any) => {
                    if (response) {
                        if (response.success === true) {
                            if ($App && typeof $App.trigger === 'function') {
                                $App.trigger('alert:success', response.msj);
                            }
                        } else {
                            if ($App && typeof $App.trigger === 'function') {
                                $App.trigger('alert:error', response.msj);
                            }
                        }
                    }
                },
            });
        }
    }
}
