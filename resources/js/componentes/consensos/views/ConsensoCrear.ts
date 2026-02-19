import { BackboneView } from "@/common/Bone";
import tmp_consenso_crear from "../templates/tmp_consenso_crear.hbs?raw";

declare global {
    var $: any;
    var _: any;
    var moment: any;
    var $App: any;
    var create_url: (path: string) => string;
}

interface ConsensoCrearOptions {
    model?: any;
    id?: string;
    isNew?: boolean;
}

export default class ConsensoCrear extends BackboneView {
    template: string;
    isNew: boolean;
    id?: string;

    constructor(options: ConsensoCrearOptions = {}) {
        super({ ...options, className: 'box', id: 'box_crear_consenso' });
        this.template = tmp_consenso_crear;
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

    guardaConsenso(e: Event): boolean {
        e.preventDefault();

        const target = $(e.currentTarget as HTMLElement);
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
            if ($App && typeof $App.trigger === 'function') {
                $App.trigger('alert:error', 'El título del consenso es requerido.');
            }
            return false;
        }

        let url: string;
        if (this.isNew) {
            url = create_url('admin/crear_consenso');
        } else {
            url = create_url('admin/editar_consenso/' + this.id);
        }

        if ($App && typeof $App.trigger === 'function') {
            $App.trigger('syncro', {
                url,
                data: consensoData,
                callback: (response: any) => {
                    target.removeAttr('disabled');
                    if (response && response.success) {
                        $App.trigger('success', response.msj);
                        this.$el.find('input, textarea').val('');
                        if (!this.isNew) {
                            if ($App.router) {
                                $App.router.navigate('listar', { trigger: true, replace: true });
                            }
                        }
                    } else {
                        $App.trigger('alert:error', response.msj || 'Error al guardar consenso');
                    }
                },
            });
        }

        return false;
    }

    backlist(e: Event): boolean {
        e.preventDefault();
        this.remove();

        if ($App.router) {
            $App.router.navigate('listar', { trigger: true, replace: true });
        }

        return false;
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
                        this.$el.find('[name="titulo"]').val(response.consenso.titulo || '');
                        this.$el.find('[name="descripcion"]').val(response.consenso.descripcion || '');
                        this.$el.find('[name="fecha_inicio"]').val(response.consenso.fecha_inicio || '');
                        this.$el.find('[name="fecha_fin"]').val(response.consenso.fecha_fin || '');
                        this.$el.find('[name="estado"]').val(response.consenso.estado || 'A');
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
