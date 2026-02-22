import { BackboneView } from "@/common/Bone";
import crear from "../templates/crear.hbs?raw";

interface ConsensoCrearOptions {
    model?: any;
    id?: string;
    isNew?: boolean;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class ConsensoCrear extends BackboneView {
    template: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    isNew: boolean;
    id?: string;

    constructor(options: ConsensoCrearOptions = {}) {
        super({ ...options, className: 'box', id: 'box_crear_consenso' });
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.template = _.template(crear);
        this.isNew = options.isNew !== false; // true por defecto
        this.id = options.id;
    }

    initialize(): void {
        // Template ya está asignado en el constructor
    }

    get events(): Record<string, (e: Event) => void> {
        return {
            'click #btn_back_list': this.backlist,
            'click #bt_guardar': this.guardaConsenso,
        };
    }

    render(): this {
        const template = _.template(this.template);
        const modelData = this.model ? this.model.toJSON() : {};

        this.$el.html(template({
            ...modelData,
            isNew: this.isNew,
            id: this.id
        }));

        if (!this.isNew && this.id) {
            this.loadConsensoData();
        }

        return this;
    }

    async guardaConsenso(e: Event): Promise<boolean> {
        e.preventDefault();

        const target = this.$el.find(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');

        const consensoData = {
            titulo: this.getInput('titulo'),
            descripcion: this.getInput('descripcion'),
            fecha_inicio: this.getInput('fecha_inicio'),
            fecha_fin: this.getInput('fecha_fin'),
            estado: this.getInput('estado') || 'A',
        };

        if (!consensoData.titulo || consensoData.titulo.trim() === '') {
            target.removeAttr('disabled');
            if (this.App && typeof this.App.trigger === 'function') {
                this.App.trigger('alert:error', 'El título del consenso es requerido.');
            }
            return false;
        }

        try {
            // Simulación de respuesta mientras se implementan los métodos del service
            const response = {
                success: true,
                msj: this.isNew ? 'Consenso creado correctamente' : 'Consenso actualizado correctamente',
                data: {
                    id: this.id || Date.now(),
                    ...consensoData
                }
            };

            target.removeAttr('disabled');

            if (response && response.success) {
                if (this.App && typeof this.App.trigger === 'function') {
                    this.App.trigger('alert:success', {
                        title: 'Éxito',
                        text: response.msj,
                        button: 'OK!'
                    });
                }

                this.$el.find('input, textarea').val('');
                if (!this.isNew) {
                    if (this.App && this.App.router) {
                        this.App.router.navigate('listar', { trigger: true, replace: true });
                    }
                }
            } else {
                if (this.App && typeof this.App.trigger === 'function') {
                    this.App.trigger('alert:error', {
                        title: 'Error',
                        text: response.msj || 'Error al guardar consenso',
                        button: 'OK!'
                    });
                }
            }
        } catch (error: any) {
            target.removeAttr('disabled');
            if (this.App && typeof this.App.trigger === 'function') {
                this.App.trigger('alert:error', {
                    title: 'Error',
                    text: error.message || 'Error de conexión',
                    button: 'OK!'
                });
            }
            this.logger?.error('Error al guardar consenso:', error);
        }

        return false;
    }

    backlist(e: Event): boolean {
        e.preventDefault();
        this.remove();

        if (this.App && this.App.router) {
            this.App.router.navigate('listar', { trigger: true, replace: true });
        }

        return false;
    }

    async loadConsensoData(): Promise<void> {
        if (!this.id) return;

        try {
            // Simulación de respuesta mientras se implementa el método del service
            const response = {
                success: true,
                data: {
                    titulo: 'Título de ejemplo',
                    descripcion: 'Descripción de ejemplo',
                    fecha_inicio: '2024-01-01',
                    fecha_fin: '2024-12-31',
                    estado: 'A'
                }
            };

            if (response && response.success && response.data) {
                this.$el.find('[name="titulo"]').val(response.data.titulo || '');
                this.$el.find('[name="descripcion"]').val(response.data.descripcion || '');
                this.$el.find('[name="fecha_inicio"]').val(response.data.fecha_inicio || '');
                this.$el.find('[name="fecha_fin"]').val(response.data.fecha_fin || '');
                this.$el.find('[name="estado"]').val(response.data.estado || 'A');
            }
        } catch (error: any) {
            this.logger?.error('Error al cargar datos del consenso:', error);
            if (this.App && typeof this.App.trigger === 'function') {
                this.App.trigger('alert:error', {
                    title: 'Error',
                    text: error.message || 'Error al cargar los datos del consenso',
                    button: 'OK!'
                });
            }
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
