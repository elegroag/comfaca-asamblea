import { BackboneView } from "@/common/Bone";
import tmp_listar_consensos from "../templates/tmp_listar_consensos.hbs?raw";

declare global {
    var $: any;
    var _: any;
    var $App: any;
    var langDataTable: any;
}

interface ConsensosListarOptions {
    collection?: any;
    model?: any;
}

export default class ConsensosListar extends BackboneView {
    template: string;
    tableModule: any;

    constructor(options: ConsensosListarOptions = {}) {
        super({ ...options, className: 'box', id: 'box_consensos' });
        this.template = tmp_listar_consensos;
        this.tableModule = null;
    }

    initialize(): void {
        // Template ya está asignado en el constructor
    }

    get events(): Record<string, (e: Event) => void> {
        return {
            "click button[data-toggle='editar_consenso']": this.editarConsenso,
            "click button[data-toggle='detalle_consenso']": this.detalleConsenso,
        };
    }

    editarConsenso(e: Event): void {
        e.preventDefault();
        
        const consenso = $(e.currentTarget as HTMLElement).attr('data-code') as string;
        
        if (!consenso) {
            console.error('ID de consenso no encontrado');
            return;
        }
        
        if ($App.router) {
            $App.router.navigate('editar/' + consenso, { trigger: true, replace: true });
        }
    }

    detalleConsenso(e: Event): void {
        e.preventDefault();
        
        const consenso = $(e.currentTarget as HTMLElement).attr('data-code') as string;
        
        if (!consenso) {
            console.error('ID de consenso no encontrado');
            return;
        }
        
        if ($App.router) {
            $App.router.navigate('consenso_detalle/' + consenso, { trigger: true, replace: true });
        }
    }

    render(): this {
        const template = _.template(this.template);
        const consensosData = this.collection ? this.collection.toJSON() : [];
        this.$el.html(template({ consensos: consensosData }));
        
        this.initTable();
        
        return this;
    }

    initTable(): void {
        const tableElement = this.$el.find('#tb_data_consensos');
        
        if (tableElement.length && typeof tableElement.DataTable === 'function') {
            this.tableModule = tableElement.DataTable({
                paging: true,
                pageLength: 10,
                pagingType: 'full_numbers',
                info: true,
                columnDefs: [{ targets: 0 }, { targets: 1 }, { targets: 2 }, { targets: 3, orderable: false }],
                order: [[1, 'desc']],
                language: langDataTable,
            });
        }
    }
}
