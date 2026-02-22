import { BackboneView } from "@/common/Bone";
import tmp_mostrar_usuario from "../templates/tmp_mostrar_usuario.hbs?raw";
import AsaUsuario from "@/models/AsaUsuario";
import Mesa from "@/models/Mesa";
import UsuarioService from "@/pages/Usuarios/UsuarioService";
import Loading from "@/common/Loading";


interface UsuarioMostrarOptions {
    model?: any;
    collection?: any[];
    usuarios_disponibles?: any;
    asa_usuario?: any;
    api?: any;
    logger?: any;
    app?: any;
}

export default class UsuarioMostrar extends BackboneView {
    template: string;
    asamblea: any;
    asa_usuario: any;
    mesa: any;
    mesas_disponibles: any;
    roles: any;
    api: any;
    logger: any;
    app: any;
    usuarioService: UsuarioService;

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
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;

        // Inicializar el servicio con las dependencias
        this.usuarioService = new UsuarioService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
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

    async vincularMesa(e: Event): Promise<void> {
        e.preventDefault();

        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        try {
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
                    throw new Error('Mesas disponibles no disponible');
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
                throw new Error('Mesa no válida o sin método get');
            }

            const data = {
                cedtra: this.asa_usuario?.get('cedtra'),
                estado: this.getInput('mesa_estado'),
                create_mesa: create_mesa,
                mesa_id: mesa.get('id'),
                mesa_codigo: mesa.get('codigo'),
            };

            Loading.show();

            // Delegar al service para la vinculación
            await this.usuarioService.vincularMesaApi(data);

            Loading.hide();

        } catch (error: any) {
            Loading.hide();
            this.logger?.error('Error al vincular mesa:', error);
        } finally {
            target.removeAttr('disabled');
        }
    }

    async vincularAsamblea(e: Event): Promise<void> {
        e.preventDefault();

        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        try {
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
                    throw new Error('Mesas disponibles no disponible');
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
                throw new Error('Mesa no válida o sin método get');
            }

            // Confirmación con Swal
            const result = await Swal.fire({
                title: 'Confirmar',
                text: 'Se requiere de confirmar el registro de la vinculación del usuario.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, vincular',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                const asaUsuario = new AsaUsuario({
                    cedtra: user.cedtra,
                    create_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    asamblea_id: this.asamblea?.get('id'),
                    rol: this.getInput('userrol'),
                });

                const data = {
                    cedtra: asaUsuario.get('cedtra'),
                    estado: 'A',
                    create_at: asaUsuario.get('create_at'),
                    asamblea_id: asaUsuario.get('asamblea_id'),
                    rol: asaUsuario.get('rol'),
                    create_mesa: create_mesa,
                    mesa_id: mesa.get('id'),
                    mesa_codigo: mesa.get('codigo'),
                };

                Loading.show();

                // Delegar al service para la vinculación
                const response = await this.usuarioService.vincularAsambleaApi(data);

                Loading.hide();

                if (response && (response as any).asa_usuario && (response as any).mesa) {
                    Swal.fire({
                        title: 'Notificación!',
                        text: 'La operación se ha completado con éxito',
                        icon: 'success',
                        confirmButtonText: 'Continuar!',
                    });

                    setTimeout(() => {
                        this.remove();
                        if (this.app?.router) {
                            this.app.router.navigate('listar', { trigger: true, replace: true });
                        }
                    }, 2000);
                } else {
                    Swal.fire({
                        title: 'Notificación!',
                        text: (response as any).errors || 'Error en la operación',
                        confirmButtonText: 'Continuar!',
                    });
                }
            }

        } catch (error: any) {
            Loading.hide();
            this.logger?.error('Error al vincular asamblea:', error);
            Swal.fire({
                title: 'Error!',
                text: error.message || 'Ocurrió un error durante la vinculación',
                confirmButtonText: 'Continuar!',
            });
        } finally {
            target.removeAttr('disabled');
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
