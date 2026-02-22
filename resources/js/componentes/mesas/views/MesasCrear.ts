import { BackboneView } from "@/common/Bone";
import MesasService from "@/pages/Mesas/MesasService";
import tmp_mesas_crear from "@/componentes/mesas/templates/tmp_mesas_crear.hbs?raw";

interface MesasCrearOptions {
    model?: any;
    isNew?: boolean;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class MesasCrear extends BackboneView {
    template: any;
    isNew: boolean;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    mesasService: MesasService;

    constructor(options: MesasCrearOptions) {
        super({ ...options, id: 'box_crear_mesas' });
        this.template = _.template(tmp_mesas_crear);
        this.isNew = options.isNew !== false; // true por defecto
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.mesasService = new MesasService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    initialize(): void {
        // Template ya está asignado en el constructor
    }

    render(): this {
        const template = _.template(this.template);
        this.$el.html(template({ isNew: this.isNew }));

        // Establecer fecha actual si existe el campo - sin dependencia global moment
        const today = new Date();
        const formattedDate = today.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
        this.$el.find("[name='fecha']").val(formattedDate);

        return this;
    }

    get events(): Record<string, (e: Event) => void> {
        return {
            'click #btn_back_list': this.closeForm,
            'click #btn_validar_poder': this.crearUsuario,
        };
    }

    async crearUsuario(e: Event): Promise<boolean> {
        e.preventDefault();

        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        try {
            const apoderado_nit = $("[name='apoderado_nit']").val() as string;
            const apoderado_cedula = $("[name='apoderado_cedula']").val() as string;
            const poderdante_nit = $("[name='poderdante_nit']").val() as string;
            const poderdante_cedula = $("[name='poderdante_cedula']").val() as string;
            const radicado = $("[name='radicado']").val() as string;

            // Crear modelo básico sin dependencia global _model
            const model = {
                get: (key: string) => {
                    const data: any = {
                        nit1: apoderado_nit,
                        cedrep1: apoderado_cedula,
                        nit2: poderdante_nit,
                        cedrep2: poderdante_cedula,
                        radicado: radicado,
                    };
                    return data[key];
                },
                isValid: () => {
                    // Validación básica
                    return apoderado_nit && poderdante_nit && apoderado_cedula && poderdante_cedula && radicado;
                },
                validationError: null,
                toJSON: () => ({
                    nit1: apoderado_nit,
                    cedrep1: apoderado_cedula,
                    nit2: poderdante_nit,
                    cedrep2: poderdante_cedula,
                    radicado: radicado,
                })
            };

            if (apoderado_nit === poderdante_nit) {
                if (this.app && typeof this.app.trigger === 'function') {
                    this.app.trigger('alert:error', {
                        message: 'La empresa poderdante no puede ser la misma empresa apoderada.'
                    });
                }
                target.removeAttr('disabled');
                return false;
            }

            if (!model.isValid()) {
                const errors = model.validationError;
                this.logger?.error('Errores de validación:', errors);

                setTimeout(() => {
                    $('.error').html('');
                }, 3000);

                target.removeAttr('disabled');
                return false;
            }

            // Enviar datos directamente como JSON
            const data = {
                nit1: apoderado_nit,
                cedrep1: apoderado_cedula,
                nit2: poderdante_nit,
                cedrep2: poderdante_cedula,
                radicado: radicado
            };

            // Mostrar loading usando trigger
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('loading:show');
            }

            // Delegar al servicio MesasService con datos JSON
            const response = await this.mesasService.__validarPoder(data);

            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('loading:hide');
            }

            target.removeAttr('disabled');

            if (response?.success) {
                if ((response as any).data.poder === false) {
                    this.$el.find('input').val('');
                    if (this.app && typeof this.app.trigger === 'function') {
                        this.app.trigger('alert:error', { message: (response as any).data.errors });
                    }
                } else {
                    // Crear modelo básico sin dependencia global _model
                    const poderModel = {
                        get: (key: string) => (response as any).data.poder[key],
                        toJSON: () => (response as any).data.poder
                    };

                    if (this.app && this.app.router) {
                        this.app.router.set_poderes(poderModel);
                    }

                    if (this.app && typeof this.app.trigger === 'function') {
                        this.app.trigger('alert:success', { message: (response as any).data.msj });
                    }
                    this.$el.find('input').val('');
                }
            } else {
                if (this.app && typeof this.app.trigger === 'function') {
                    this.app.trigger('alert:error', { message: response?.msj || 'Error en validación' });
                }
            }
        } catch (error: any) {
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('loading:hide');
            }
            target.removeAttr('disabled');
            this.logger?.error('Error en validación previa:', error);
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('alert:error', { message: 'Ocurrió un error al procesar la solicitud' });
            }
        }

        return false;
    }

    closeForm(e: Event): boolean {
        e.preventDefault();
        this.remove();

        if (this.app && this.app.router) {
            this.app.router.navigate('listar', { trigger: true, replace: true });
        }

        return false;
    }
}
