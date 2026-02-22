import { BackboneView } from "@/common/Bone";
import tmp_consenso_detalle from "@/componentes/consensos/templates/tmp_consenso_detalle.hbs?raw";
import ConsensoService from "@/pages/Consensos/ConsensoService";

interface ConsensoDetalleOptions {
    id?: string;
    model?: any;
    api?: any;
    logger?: any;
    app?: any;
    region?: any;
}

export default class ConsensoDetalle extends BackboneView {
    template: string;
    id?: string;
    consenso: any;
    api: any;
    logger: any;
    app: any;
    region: any;
    consensoService: ConsensoService;

    constructor(options: ConsensoDetalleOptions = {}) {
        super({ ...options, className: 'box', id: 'box_detalle_consenso' });
        this.template = tmp_consenso_detalle;
        this.id = options.id;
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.region = options.region;
        this.consenso = null;

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
            'click #btn_editar': this.editarConsenso,
            'click #btn_eliminar': this.eliminarConsenso,
        };
    }

    render(): this {
        if (!this.id) {
            this.$el.html('<div class="alert alert-error">ID de consenso no especificado</div>');
            return this;
        }

        const template = _.template(this.template);
        this.$el.html(template({ consenso: null, loading: true }));

        this.loadConsensoData();

        return this;
    }

    async loadConsensoData(): Promise<void> {
        if (!this.id) return;

        try {
            // Delegar al service para cargar datos
            const response = await this.consensoService.__findById(this.id);

            if (response?.success && (response as any).data) {
                this.consenso = (response as any).data;
                this.renderConsenso();
            } else {
                this.$el.html('<div class="alert alert-error">Error al cargar los datos del consenso</div>');
            }
        } catch (error: any) {
            this.logger?.error('Error al cargar datos del consenso:', error);
            this.$el.html('<div class="alert alert-error">Error al cargar los datos del consenso</div>');
        }
    }

    renderConsenso(): void {
        if (!this.consenso) return;

        const template = _.template(this.template);
        this.$el.html(template({
            consenso: this.consenso,
            loading: false,
            formattedFechaInicio: moment(this.consenso.fecha_inicio).format('DD-MM-YYYY'),
            formattedFechaFin: moment(this.consenso.fecha_fin).format('DD-MM-YYYY'),
            estadoText: this.consenso.estado === 'A' ? 'Activo' : 'Inactivo'
        }));
    }

    editarConsenso(e: Event): boolean {
        e.preventDefault();

        if (!this.id) {
            this.logger?.error('ID de consenso no disponible para editar');
            return false;
        }

        if (this.app?.router) {
            this.app.router.navigate('editar/' + this.id, { trigger: true, replace: true });
        }

        return false;
    }

    async eliminarConsenso(e: Event): Promise<boolean> {
        e.preventDefault();

        if (!this.id) {
            this.logger?.error('ID de consenso no disponible para eliminar');
            return false;
        }

        try {
            // Confirmación con SweetAlert
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: '¿Está seguro de que desea eliminar este consenso? Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6'
            });

            if (result.isConfirmed) {
                await this.performDelete();
            }
        } catch (error: any) {
            this.logger?.error('Error al eliminar consenso:', error);
            this.app?.trigger('alert:error', {
                title: 'Error',
                text: error.message || 'Error al eliminar consenso',
                button: 'OK!'
            });
        }

        return false;
    }

    async performDelete(): Promise<void> {
        if (!this.id) return;

        try {
            // Delegar al service para eliminar
            const response = await this.consensoService.__removeConsenso({ id: this.id });

            if (response?.success) {
                this.app?.trigger('success', (response as any).msj || 'Consenso eliminado exitosamente');
                if (this.app?.router) {
                    this.app.router.navigate('listar', { trigger: true, replace: true });
                }
            } else {
                this.app?.trigger('alert:error', (response as any)?.msj || 'Error al eliminar consenso');
            }
        } catch (error: any) {
            this.logger?.error('Error al eliminar consenso:', error);
            this.app?.trigger('alert:error', {
                title: 'Error',
                text: error.message || 'Error al eliminar consenso',
                button: 'OK!'
            });
        }
    }

    backlist(e: Event): boolean {
        e.preventDefault();
        this.remove();

        if (this.app?.router) {
            this.app.router.navigate('listar', { trigger: true, replace: true });
        }

        return false;
    }
}
