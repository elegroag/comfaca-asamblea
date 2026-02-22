import { BackboneView } from "@/common/Bone";
import crear from "@/componentes/consensos/templates/tmp_consenso_crear.hbs?raw";
import ConsensoService from "@/pages/Consensos/ConsensoService";

interface ConsensoCrearOptions {
    model?: any;
    id?: string;
    isNew?: boolean;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class ConsensoCrear extends BackboneView {
    template: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    isNew: boolean;
    id?: string;
    consensoService: ConsensoService;

    constructor(options: ConsensoCrearOptions = {}) {
        super({ ...options, className: 'box', id: 'box_crear_consenso' });
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.template = _.template(crear);
        this.isNew = options.isNew !== false; // true por defecto
        this.id = options.id;

        // Inicializar el servicio con las dependencias
        this.consensoService = new ConsensoService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
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
            this.app?.trigger('alert:error', 'El título del consenso es requerido.');
            return false;
        }

        try {
            // Delegar al service para guardar
            const response = await this.consensoService.__saveConsenso(consensoData);

            target.removeAttr('disabled');

            if (response?.success) {
                this.app?.trigger('alert:success', {
                    title: 'Éxito',
                    text: (response as any).msj || (this.isNew ? 'Consenso creado correctamente' : 'Consenso actualizado correctamente'),
                    button: 'OK!'
                });

                this.$el.find('input, textarea').val('');
                if (!this.isNew) {
                    if (this.app?.router) {
                        this.app.router.navigate('listar', { trigger: true, replace: true });
                    }
                }
            } else {
                this.app?.trigger('alert:error', {
                    title: 'Error',
                    text: (response as any)?.msj || 'Error al guardar consenso',
                    button: 'OK!'
                });
            }
        } catch (error: any) {
            target.removeAttr('disabled');
            this.app?.trigger('alert:error', {
                title: 'Error',
                text: error.message || 'Error de conexión',
                button: 'OK!'
            });
            this.logger?.error('Error al guardar consenso:', error);
        }

        return false;
    }

    backlist(e: Event): boolean {
        e.preventDefault();
        this.remove();

        if (this.app && this.app.router) {
            this.app.router.navigate('listar', { trigger: true, replace: true });
        }

        return false;
    }

    async loadConsensoData(): Promise<void> {
        if (!this.id) return;

        try {
            // Delegar al service para cargar datos
            const response = await this.consensoService.__findById(this.id);

            if (response?.success && (response as any).data) {
                const data = (response as any).data;
                this.$el.find('[name="titulo"]').val(data.titulo || '');
                this.$el.find('[name="descripcion"]').val(data.descripcion || '');
                this.$el.find('[name="fecha_inicio"]').val(data.fecha_inicio || '');
                this.$el.find('[name="fecha_fin"]').val(data.fecha_fin || '');
                this.$el.find('[name="estado"]').val(data.estado || 'A');
            }
        } catch (error: any) {
            this.logger?.error('Error al cargar datos del consenso:', error);
            this.app?.trigger('alert:error', {
                title: 'Error',
                text: error.message || 'Error al cargar los datos del consenso',
                button: 'OK!'
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
