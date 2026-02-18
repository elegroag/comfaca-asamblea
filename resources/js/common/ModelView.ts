// Importar la clase base BackboneView
import { BackboneView } from './Bone';

// Definir interfaces localmente para evitar problemas de importación
interface ModelViewOptions {
    modelDOM?: any;
    onRender?: ((el: JQuery) => void) | null;
    el?: HTMLElement | string;
    tagName?: string;
    id?: string;
    className?: string;
    attributes?: Record<string, any>;
    model?: Backbone.Model | null;
    collection?: Backbone.Collection | null;
    events?: Record<string, string>;
    [key: string]: any;
}

/**
 * Clase ModelView que extiende BackboneView
 * Proporciona funcionalidades adicionales para manejo de modelos y formularios
 */
export class ModelView extends BackboneView {
    constructor(options: ModelViewOptions = { modelDOM: null, onRender: null }) {
        super(options);
        // Propiedades específicas de BackboneView
        this.modelDOM = options.modelDOM || Backbone.Model;
        this.template = options.template || undefined;
        this.onRender = options.onRender ? options.onRender : null;
        this.model = options.model || null;
        this.collection = options.collection || null;
        // Extender con opciones adicionales
        _.extend(this, options);
    }

    /**
     * @override
     * Renderiza la vista usando el template y los datos del modelo
     */
    render(): this {
        const data = this.serializeData();
        let renderedHtml: string;

        if (window._.isFunction(this.template)) {
            renderedHtml = (this.template as (data: any) => string)(data);
        } else if (window._.isString(this.template)) {
            const compiledTemplate = this.compileTemplate();
            if (compiledTemplate) {
                renderedHtml = compiledTemplate(data);
            } else {
                renderedHtml = '';
            }
        } else {
            renderedHtml = '';
        }

        this.$el.html(renderedHtml);
        if (this.onRender) this.onRender(this.$el);
        return this;
    }

    /**
    * Compila un template de selector a función de Underscore
    */
    compileTemplate(): ((data: any) => string) | false {
        if (window._.isString(this.template) === true) {
            const _el = document.querySelector(this.template as string);
            if (_el) {
                return window._.template(_el.innerHTML);
            }
        }
        return false;
    }

    /**
     * Transforma el modelo en representación JSON
     */
    serializeData(): any {
        let data: any = null;

        // Only when model is available
        if (this.modelDOM !== null) {
            if (this.model instanceof this.modelDOM) {
                data = this.model ? this.model.toJSON() : null;
            } else {
                if (typeof this.model === 'object' && this.model !== null) {
                    data = this.model;
                }
            }
        } else {
            if (typeof this.model === 'object' && this.model !== null) {
                data = this.model;
            }
        }
        return data ? data : null;
    }

    /**
     * Obtiene el valor de un input por nombre
     */
    getInput(selector: string): string {
        return this.$el.find(`[name='${selector}']`).val() as string;
    }

    /**
     * Obtiene el valor de un input por ID
     */
    getInputById(id: string): string {
        return this.$el.find('#' + id).val() as string;
    }

    /**
     * Establece el valor de un input por nombre
     */
    setInput(selector: string, val: string | null): JQuery {
        return this.$el.find(`[name='${selector}']`).val(val ?? '');
    }

    /**
     * Obtiene el valor de un input por atributo
     */
    getInputByTag(tag: string, key: string): string {
        return this.$el.find(`[${tag}='${key}']`).val() as string;
    }

    /**
     * Obtiene el estado de un checkbox
     */
    getCheck(selector: string): number {
        return this.$el.find(`[name='${selector}']:checked`).length;
    }

    /**
     * Obtiene un archivo de input
     */
    getInputFile(id: string): File {
        return (this.$el.find('#' + id)[0] as HTMLInputElement).files![0];
    }
}
