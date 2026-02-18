// Tipos específicos para Backbone.js

declare global {
    namespace Backbone {

        var emulateHTTP: boolean;
        var emulateJSON: boolean;
        // Events
        interface Events {
            on(eventName: string, callback: Function, context?: any): any;
            off(eventName?: string, callback?: Function, context?: any): any;
            trigger(eventName: string, ...args: any[]): any;
            listenTo(object: Events, eventName: string, callback: Function): any;
            stopListening(object?: Events, eventName?: string, callback?: Function): any;
        }

        // Model
        interface Model extends Events {
            constructor(attributes?: any, options?: any): Model;
            id?: string | number;
            cid: string;
            attributes: any;
            changed: any;
            defaults: any;
            validation: any;
            urlRoot?: string;

            get(attribute: string): any;
            set(attributes: any, options?: any): Model;
            unset(attribute: string, options?: any): Model;
            clear(options?: any): Model;
            has(attribute: string): boolean;
            changedAttributes(diff?: any): any;
            previous(attribute?: string): any;
            previousAttributes(): any;
            fetch(options?: any): Promise<Model>;
            save(attributes?: any, options?: any): Promise<Model>;
            destroy(options?: any): Promise<Model>;
            isValid(): boolean;
            validate(attributes: any, options?: any): any;
            url(): string;
            escape(attribute: string): string;
            hasChanged(attribute?: string): boolean;
            toJSON(options?: any): any;
            clone(): Model;
            isNew(): boolean;
            sync(method: string, model: Model, options?: any): any;
        }

        // Collection
        interface Collection extends Events {
            constructor(models?: Model[], options?: any): Collection;
            models: Model[];
            length: number;
            comparator: any;
            model: typeof Model;

            add(models: Model | Model[], options?: any): Collection;
            remove(models: Model | Model[], options?: any): Collection;
            reset(models?: Model[], options?: any): Collection;
            set(models: Model | Model[], options?: any): Collection;
            get(id: string | number): Model | undefined;
            at(index: number): Model | undefined;
            push(model: Model, options?: any): Model;
            pop(options?: any): Model;
            unshift(model: Model, options?: any): Model;
            shift(options?: any): Model;
            slice(begin?: number, end?: number): Model[];
            sort(options?: any): Collection;
            pluck(attribute: string): any[];
            where(properties: any): Model[];
            findWhere(properties: any): Model | undefined;
            first(): Model | undefined;
            last(): Model | undefined;
            size(): number;
            isEmpty(): boolean;
            fetch(options?: any): Promise<Collection>;
            create(attributes: any, options?: any): Model;
            sync(method: string, collection: Collection, options?: any): any;
            parse(response: any, options?: any): any[];
            toJSON(options?: any): any[];
        }

        // View
        interface View extends Events {
            constructor(options?: any): View;
            el: HTMLElement | string;
            $el: JQuery;
            cid: string;
            model?: Model;
            collection?: Collection;
            template?: string | ((data: any) => string);
            events: any;
            render(): View;
            remove(): View;
            make(tagName: string, attributes?: any, content?: string): HTMLElement;
            setElement(element: HTMLElement | string, delegate?: boolean): View;
            delegate(events: string, selector: string, handler: Function): View;
            undelegate(events?: string, selector?: string, handler?: Function): View;
            delegateEvents(events?: any): View;
            undelegateEvents(): View;
        }

        // Router
        interface Router extends Events {
            constructor(options?: any): Router;
            routes: any;

            route(route: string, name: string, callback?: Function): Router;
            navigate(fragment: string, options?: any): Router;
            execute(callback: Function, args: string[], name: string): Router;
            startHistory(options?: any): boolean;
        }

        // History
        interface History {
            start(options?: any): boolean;
            stop(): void;
            navigate(fragment: string, options?: any): boolean;
            getFragment(fragment?: string): string;
        }

        // Sync
        interface SyncOptions {
            method?: string;
            model?: Model | Collection;
            data?: any;
            url?: string;
            success?: (response: any, textStatus: string, xhr: JQuery.jqXHR) => void;
            error?: (xhr: any, textStatus: string, error: any) => void;
            complete?: (xhr: any, textStatus: string) => void;
            timeout?: number;
            beforeSend?: (xhr: any) => void;
            cache?: boolean;
            processData?: boolean;
            dataType?: string;
            emulateHTTP?: boolean;
            emulateJSON?: boolean;
            type?: string;
            contentType?: boolean | string;
        }

        function ajax(options: SyncOptions): any;
        function sync(method: string, model: Model | Collection, options?: SyncOptions): any;

        const history: History;
    }

    // Constructor types
    const Backbone: {
        Model: new (attributes?: any, options?: any) => Backbone.Model;
        Collection: new (models?: Backbone.Model[], options?: any) => Backbone.Collection;
        View: new (options?: any) => Backbone.View;
        Router: new (options?: any) => Backbone.Router;
        Events: Backbone.Events;
        ajax: (options: Backbone.SyncOptions) => any;
        sync: (method: string, model: Backbone.Model | Backbone.Collection, options?: Backbone.SyncOptions) => any;
        history: Backbone.History;
    };

    type BackboneStatic = typeof Backbone;
}

export { };
