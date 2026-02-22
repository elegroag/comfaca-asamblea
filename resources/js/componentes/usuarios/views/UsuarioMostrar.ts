import { BackboneView } from "@/common/Bone";
import tmp_mostrar_usuario from "../templates/tmp_mostrar_usuario.hbs?raw";
import AsaUsuario from "@/models/AsaUsuario";
import Mesa from "@/models/Mesa";


interface UsuarioMostrarOptions {
    model?: any;
    collection?: any[];
    usuarios_disponibles?: any;
    asa_usuario?: any;
}

export default class UsuarioMostrar extends BackboneView {
    template: string;
    asamblea: any;
    asa_usuario: any;
    mesa: any;
    mesas_disponibles: any;
    roles: any;

    constructor(options: UsuarioMostrarOptions = {}) {
        super({
            ...options,
            id: 'box_mostrar_usuario',
            className: 'box',
        });

        this.template = tmp_mostrar_usuario;
        this.asamblea = null;
        this.asa_usuario = options.asa_usuario || null;
        this.mesa = null;
        this.mesas_disponibles = options.usuarios_disponibles || null;
        this.roles = null;
    }

    initialize(): void {
        // Propiedades ya inicializadas en el constructor
    }

    get events(): Record<string, (e: Event) => void> {
        return {
            'click #vincular_asamblea': this.vincularAsamblea,
            'click #vincular_mesa': this.vincularMesa,
            "switchChange.bootstrapSwitch [id='check_buscar_mesa']": this.changeOcupaMesa,
        };
    }

    render(): this {
        if (this.collection && this.collection.length > 0) {
            const { asamblea, usuarioAsa, mesa, mesasDisponibles, roles } = this.collection[0];

            this.asamblea = asamblea;
            this.asa_usuario = usuarioAsa;
            this.mesa = mesa;
            this.mesas_disponibles = mesasDisponibles;
            this.roles = roles;

            const template = _.template(this.template);
            this.$el.html(
                template({
                    asamblea: this.asamblea ? this.asamblea.toJSON() : {},
                    usuario: this.model ? this.model.toJSON() : {},
                    asa_usuario: !this.asa_usuario ? this.asa_usuario : this.asa_usuario.toJSON(),
                    mesa: !this.mesa ? false : this.mesa.toJSON(),
                    mesas_disponibles: !this.mesas_disponibles ? this.mesas_disponibles : this.mesas_disponibles.toJSON(),
                    roles: this.roles,
                })
            );

            if (this.mesas_disponibles) {
                this.$el.find("[id='check_buscar_mesa']").bootstrapSwitch();
            }
        }

        return this;
    }

    changeOcupaMesa(e: Event): void {
        const target = $(e.currentTarget as HTMLElement);

        if (target.length && target.is(':checked')) {
            this.$el.find("[data-toggle='input-crear-mesa']").fadeOut('fast', () => {
                this.$el.find("[data-toggle='input-selector-mesa']").fadeIn('fast');
            });
        } else {
            this.$el.find("[data-toggle='input-selector-mesa']").fadeOut('fast', () => {
                this.$el.find("[data-toggle='input-crear-mesa']").fadeIn('fast');
            });
        }
    }

    vincularMesa(e: Event): void {
        e.preventDefault();

        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        const user = this.model ? this.model.toJSON() : {};
        const $input = this.$el.find("[id='check_buscar_mesa']");
        let create_mesa = -1;
        let mesa: any;

        if ($input.length && $input.is(':checked')) {
            const mesaSelectCodigo = this.getInput('mesa_select_codigo');

            if (this.mesas_disponibles && typeof this.mesas_disponibles.get === 'function') {
                mesa = this.mesas_disponibles.get({
                    id: parseInt(mesaSelectCodigo) || 0,
                });
            } else {
                console.error('Mesas disponibles no disponible');
                target.removeAttr('disabled');
                return;
            }
        } else {
            mesa = new Mesa({
                codigo: this.getInput('mesa_codigo'),
                cedtra_responsable: user.cedtra,
                estado: this.getInput('mesa_estado'),
            });
            create_mesa = 1;
        }

        if (!mesa || typeof mesa.get !== 'function') {
            console.error('Mesa no válida o sin método get');
            target.removeAttr('disabled');
            return;
        }

        const url = create_url('admin/vincular_mesa');
        const token = {
            cedtra: this.asa_usuario?.get('cedtra'),
            estado: this.getInput('mesa_estado'),
            create_mesa: create_mesa,
            mesa_id: mesa.get('id'),
            mesa_codigo: mesa.get('codigo'),
        };

        if ($App && typeof $App.trigger === 'function') {
            $App.trigger('syncro', {
                url,
                data: token,
                callback: (response: any) => {
                    target.removeAttr('disabled');
                    if (response) {
                        $App.trigger('success', response.msj);
                    }
                },
            });
        }
    }

    vincularAsamblea(e: Event): void {
        e.preventDefault();

        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        const user = this.model ? this.model.toJSON() : {};
        const $input = this.$el.find("[id='check_buscar_mesa']");
        let create_mesa = -1;
        let mesa: any;

        if ($input.length && $input.is(':checked')) {
            const mesaSelectCodigo = this.getInput('mesa_select_codigo');

            if (this.mesas_disponibles && typeof this.mesas_disponibles.get === 'function') {
                mesa = this.mesas_disponibles.get({
                    id: parseInt(mesaSelectCodigo) || 0,
                });
            } else {
                console.error('Mesas disponibles no disponible');
                target.removeAttr('disabled');
                return;
            }
        } else {
            const mesaCodigo = this.getInput('mesa_codigo');

            if (Testeo && typeof Testeo.vacio === 'function') {
                const _erro = Testeo.vacio(mesaCodigo, 'mesa_codigo');
                if (_erro) {
                    Swal.fire({
                        title: 'Alerta!',
                        text: 'Se requiere de nombrar la mesa para poder realizar la vinculación.',
                        confirmButtonText: 'Continuar!',
                    });
                    target.removeAttr('disabled');
                    return;
                }
            }

            mesa = new Mesa({
                codigo: mesaCodigo,
                cedtra_responsable: user.cedtra,
                estado: this.getInput('mesa_estado'),
            });

            create_mesa = 1;
        }

        if (!mesa || typeof mesa.get !== 'function') {
            console.error('Mesa no válida o sin método get');
            target.removeAttr('disabled');
            return;
        }

        if ($App && typeof $App.trigger === 'function') {
            $App.trigger('confirma', {
                message: 'Se requiere de confirmar el registro de la vinculación del usuario.',
                callback: (status: boolean) => {
                    if (status) {
                        const asaUsuario = new AsaUsuario({
                            cedtra: user.cedtra,
                            create_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                            asamblea_id: this.asamblea?.get('id'),
                            rol: this.getInput('userrol'),
                        });

                        const token = {
                            cedtra: asaUsuario.get('cedtra'),
                            estado: 'A',
                            create_at: asaUsuario.get('create_at'),
                            asamblea_id: asaUsuario.get('asamblea_id'),
                            rol: asaUsuario.get('rol'),
                            create_mesa: create_mesa,
                            mesa_id: mesa.get('id'),
                            mesa_codigo: mesa.get('codigo'),
                        };

                        const url = create_url('admin/asa_usuario_create');
                        $App.trigger('syncro', {
                            url,
                            data: token,
                            callback: (response: any) => {
                                target.removeAttr('disabled');
                                if (response) {
                                    if (response.asa_usuario && response.mesa) {
                                        Swal.fire({
                                            title: 'Notificación!',
                                            text: 'La operación se ha completado con éxito',
                                            icon: 'success',
                                            confirmButtonText: 'Continuar!',
                                        });
                                    } else {
                                        Swal.fire({
                                            title: 'Notificación!',
                                            text: response.errors || 'Error en la operación',
                                            confirmButtonText: 'Continuar!',
                                        });
                                    }

                                    setTimeout(() => {
                                        this.remove();
                                        if ($App.router) {
                                            $App.router.navigate('listar', { trigger: true, replace: true });
                                        }
                                    }, 2000);
                                }
                            },
                        });
                    } else {
                        target.removeAttr('disabled');
                    }
                },
            });
        }
    }

    getInput(selector: string): string {
        const element = this.$el.find(`[name='${selector}']`);
        return element.length ? element.val() as string : '';
    }

    setInput(selector: string, val: string): void {
        this.$el.find(`[name='${selector}']`).val(val || '');
    }
}
