import { BackboneView } from "@/common/Bone";
import tmp_consenso_detalle from "../templates/tmp_consenso_detalle.hbs?raw";

declare global {
    var $: any;
    var _: any;
    var moment: any;
    var $App: any;
    var create_url: (path: string) => string;
}

interface ConsensoDetalleOptions {
    id?: string;
    model?: any;
}

export default class ConsensoDetalle extends BackboneView {
    template: string;
    id?: string;
    consenso: any;

    constructor(options: ConsensoDetalleOptions = {}) {
        super({ ...options, className: 'box', id: 'box_detalle_consenso' });
        this.template = tmp_consenso_detalle;
        this.id = options.id;
        this.consenso = null;
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

    loadConsensoData(): void {
        if (!this.id) return;

        const url = create_url('admin/consenso_detalle/' + this.id);

        if ($App && typeof $App.trigger === 'function') {
            $App.trigger('syncro', {
                url,
                data: {},
                callback: (response: any) => {
                    if (response && response.success && response.consenso) {
                        this.consenso = response.consenso;
                        this.renderConsenso();
                    } else {
                        this.$el.html('<div class="alert alert-error">Error al cargar los datos del consenso</div>');
                    }
                },
            });
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
            console.error('ID de consenso no disponible para editar');
            return false;
        }

        if ($App.router) {
            $App.router.navigate('editar/' + this.id, { trigger: true, replace: true });
        }

        return false;
    }

    eliminarConsenso(e: Event): boolean {
        e.preventDefault();

        if (!this.id) {
            console.error('ID de consenso no disponible para eliminar');
            return false;
        }

        if ($App && typeof $App.trigger === 'function') {
            $App.trigger('confirma', {
                message: '¿Está seguro de que desea eliminar este consenso? Esta acción no se puede deshacer.',
                callback: (status: boolean) => {
                    if (status) {
                        this.performDelete();
                    }
                },
            });
        }

        return false;
    }

    performDelete(): void {
        if (!this.id) return;

        const url = create_url('admin/eliminar_consenso/' + this.id);

        if ($App && typeof $App.trigger === 'function') {
            $App.trigger('syncro', {
                url,
                data: {},
                callback: (response: any) => {
                    if (response && response.success) {
                        $App.trigger('success', response.msj || 'Consenso eliminado exitosamente');
                        if ($App.router) {
                            $App.router.navigate('listar', { trigger: true, replace: true });
                        }
                    } else {
                        $App.trigger('alert:error', response.msj || 'Error al eliminar consenso');
                    }
                },
            });
        }
    }

    backlist(e: Event): boolean {
        e.preventDefault();
        this.remove();

        if ($App.router) {
            $App.router.navigate('listar', { trigger: true, replace: true });
        }

        return false;
    }
}
