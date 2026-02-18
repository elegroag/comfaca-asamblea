// Tipos específicos para jQuery extendidos para el proyecto

declare global {
    namespace JQuery {
        interface JQueryXHR extends XMLHttpRequest {
            // Propiedades adicionales de jqXHR
            readyState: number;
            status: number;
            statusText: string;
            responseText: string;
            responseJSON: any;
            responseXML: Document;
            getAllResponseHeaders(): string;
            getResponseHeader(header: string): string | null;
            setRequestHeader(header: string, value: string): void;
            overrideMimeType(mimeType: string): void;
            abort(reason?: string): void;
        }
        // AJAX Settings extendidos
        interface AjaxSettings<TData = any, TResult = any> {
            type?: string;
            url?: string;
            data?: TData;
            dataType?: string;
            contentType?: string;
            processData?: boolean;
            cache?: boolean;
            timeout?: number;
            beforeSend?: (xhr: JQueryXHR) => void;
            success?: (data: TResult, textStatus: string, jqXHR: JQueryXHR) => void;
            error?: (xhr: JQueryXHR, textStatus: string, errorThrown: string) => void;
            complete?: (xhr: JQueryXHR, textStatus: string) => void;
            accepts?: { [key: string]: string };
            async?: boolean;
            crossDomain?: boolean;
            global?: boolean;
            ifModified?: boolean;
            isLocal?: boolean;
            jsonp?: string | boolean;
            jsonpCallback?: string | (() => string);
            password?: string;
            scriptCharset?: string;
            traditional?: boolean;
            username?: string;
            xhr?: () => XMLHttpRequest;
            xhrFields?: { [key: string]: any };
        }

        // AJAX Response Types
        interface SuccessTextStatus {
            responseText: string;
            status: number;
            statusText: string;
        }

        interface ErrorTextStatus {
            responseText: string;
            status: number;
            statusText: string;
        }

        // Event Types extendidos
        interface TriggeredEvent<TTarget = any> extends Event {
            delegateTarget: TTarget;
            currentTarget: TTarget;
            target: TTarget;
            relatedTarget: TTarget;
            which: number;
            pageX: number;
            pageY: number;
            result: any;
        }

        // Element manipulation
        interface JQuery<TElement = HTMLElement> {
            // Métodos comunes del proyecto
            find(selector: string): JQuery;
            closest(selector: string): JQuery;
            parent(selector?: string): JQuery;
            parents(selector?: string): JQuery;
            children(selector?: string): JQuery;
            siblings(selector?: string): JQuery;
            next(selector?: string): JQuery;
            prev(selector?: string): JQuery;

            // Manipulación de contenido
            html(): string;
            html(htmlString: string): JQuery;
            text(): string;
            text(textString: string): JQuery;
            val(): any;
            val(value: any): JQuery;

            // CSS y clases
            css(propertyName: string): any;
            css(propertyName: string, value: any): JQuery;
            css(properties: Object): JQuery;
            addClass(className: string): JQuery;
            removeClass(className?: string): JQuery;
            toggleClass(className: string, add?: boolean): JQuery;
            hasClass(className: string): boolean;

            // Atributos
            attr(attributeName: string): string;
            attr(attributeName: string, value: string): JQuery;
            attr(attributes: Object): JQuery;
            removeAttr(attributeName: string): JQuery;
            prop(propertyName: string): any;
            prop(propertyName: string, value: any): JQuery;
            removeProp(propertyName: string): JQuery;

            // Datos
            data(key: string): any;
            data(key: string, value: any): JQuery;
            data(obj: Object): JQuery;
            removeData(key?: string): JQuery;

            // Eventos
            on(events: string, handler: (eventObject: TriggeredEvent) => void): JQuery;
            on(events: string, selector: string, handler: (eventObject: TriggeredEvent) => void): JQuery;
            on(events: Object): JQuery;
            off(events?: string, handler?: Function): JQuery;
            off(events: string, selector: string, handler?: Function): JQuery;
            trigger(eventType: string, data?: any): JQuery;
            triggerHandler(eventType: string, data?: any): any;

            // Formularios
            serialize(): string;
            serializeArray(): JQuerySerializeArrayElement[];

            // Animaciones
            show(duration?: number, complete?: Function): JQuery;
            hide(duration?: number, complete?: Function): JQuery;
            toggle(duration?: number, complete?: Function): JQuery;
            fadeIn(duration?: number, complete?: Function): JQuery;
            fadeOut(duration?: number, complete?: Function): JQuery;
            fadeToggle(duration?: number, complete?: Function): JQuery;
            slideDown(duration?: number, complete?: Function): JQuery;
            slideUp(duration?: number, complete?: Function): JQuery;
            slideToggle(duration?: number, complete?: Function): JQuery;

            // Manipulación DOM
            append(content: string | Element | JQuery): JQuery;
            prepend(content: string | Element | JQuery): JQuery;
            after(content: string | Element | JQuery): JQuery;
            before(content: string | Element | JQuery): JQuery;
            remove(selector?: string): JQuery;
            empty(): JQuery;
            clone(withDataAndEvents?: boolean, deepWithDataAndEvents?: boolean): JQuery;

            // Dimensiones
            width(): number;
            width(value: number | string): JQuery;
            height(): number;
            height(value: number | string): JQuery;
            innerWidth(): number;
            innerHeight(): number;
            outerWidth(includeMargin?: boolean): number;
            outerHeight(includeMargin?: boolean): number;

            // Posición
            offset(): Coordinates;
            offset(coordinates: Coordinates): JQuery;
            position(): Coordinates;
            scrollTop(): number;
            scrollTop(value: number): JQuery;
            scrollLeft(): number;
            scrollLeft(value: number): JQuery;

            // Iteración
            each(callback: (index: number, element: Element) => boolean | void): JQuery;
            map(callback: (index: number, element: Element) => any): JQuery;

            // Filtrado
            filter(selector: string | Element | JQuery | Function): JQuery;
            not(selector: string | Element | JQuery | Function): JQuery;
            is(selector: string | Element | JQuery | Function): boolean;
            has(selector: string | Element): JQuery;
            eq(index: number): JQuery;
            first(): JQuery;
            last(): JQuery;
            slice(start: number, end?: number): JQuery;

            // Traversing
            add(selector: string | Element | JQuery): JQuery;
            andSelf(): JQuery;
            contents(): JQuery;
            end(): JQuery;
        }

        // Static methods
        interface JQueryStatic {
            // AJAX
            ajax(settings: AjaxSettings): JQueryXHR;
            ajax(url: string, settings: AjaxSettings): JQueryXHR;
            get(url: string, data?: any, success?: Function, dataType?: string): JQueryXHR;
            getJSON(url: string, data?: any, success?: Function): JQueryXHR;
            post(url: string, data?: any, success?: Function, dataType?: string): JQueryXHR;

            // Utilities
            each(collection: any[], callback: (index: number, value: any) => boolean | void): any;
            each(collection: Object, callback: (key: string, value: any) => boolean | void): any;
            extend(deep: boolean, target: any, ...objects: any[]): any;
            extend(target: any, ...objects: any[]): any;
            grep(array: any[], callback: Function, invert?: boolean): any[];
            map(array: any[], callback: Function): any[];
            merge(first: any[], second: any[]): any[];
            inArray(value: any, array: any[], fromIndex?: number): number;
            isArray(obj: any): boolean;
            isEmptyObject(obj: any): boolean;
            isFunction(obj: any): boolean;
            isPlainObject(obj: any): boolean;
            isNumeric(value: any): boolean;
            isWindow(obj: any): boolean;
            isXMLDoc(node: Node): boolean;
            type(obj: any): string;
            makeArray(obj: any): any[];
            now(): number;
            parseJSON(json: string): any;
            parseXML(data: string): XMLDocument;
            proxy(fn: Function, context: any): Function;
            trim(str: string): string;
            fadeIn(str: number, callback: Function);
            fadeOut(str: number, callback: Function);
            serializeArray(): any[];
            serialize(): string;

            // Element creation
            parseHTML(data: string, context?: Document, keepScripts?: boolean): any[];

            // Event helpers
            holdReady(hold: boolean): void;
            ready(handler: Function): JQuery;

            // Deferred
            Deferred(beforeStart?: Function): Deferred<any>;
            when(...deferreds: any[]): Deferred<any>;

            // Callbacks
            Callbacks(flags?: string): Callbacks;

            // Data
            data(element: Element, key: string, value?: any): any;
            removeData(element: Element, key?: string): void;

            // Queue
            queue(element: Element, queueName: string, newQueue?: any[]): any;
            dequeue(element: Element, queueName?: string): void;
            delay(duration: number, queueName?: string): JQuery;

            // Effects
            fx: {
                off: boolean;
                speeds: { [key: string]: number };
                step: { [key: string]: Function };
            };

            // Support
            support: {
                ajax: boolean;
                boxModel: boolean;
                changeBubbles: boolean;
                checkClone: boolean;
                checkOn: boolean;
                cors: boolean;
                cssFloat: boolean;
                hrefNormalized: boolean;
                htmlSerialize: boolean;
                leadingWhitespace: boolean;
                noCloneEvent: boolean;
                noCloneChecked: boolean;
                opacity: boolean;
                optDisabled: boolean;
                optSelected: boolean;
                scriptEval: boolean;
                style: boolean;
                submitBubbles: boolean;
                tbody: boolean;
                html5Clone: boolean;
            };
        }

        // Deferred
        interface Deferred<T> {
            done(callback: Function): Deferred<T>;
            fail(callback: Function): Deferred<T>;
            progress(callback: Function): Deferred<T>;
            then(doneCallback: Function, failCallback?: Function, progressCallback?: Function): Deferred<T>;
            always(callback: Function): Deferred<T>;
            reject(args?: any[]): Deferred<T>;
            rejectWith(context: any, args?: any[]): Deferred<T>;
            resolve(args?: any[]): Deferred<T>;
            resolveWith(context: any, args?: any[]): Deferred<T>;
            notify(args?: any[]): Deferred<T>;
            notifyWith(context: any, args?: any[]): Deferred<T>;
            state(): string;
            promise(): Promise<T>;
        }

        // Callbacks
        interface Callbacks {
            add(callback: Function): Callbacks;
            disable(): Callbacks;
            disabled(): boolean;
            empty(): Callbacks;
            fire(...args: any[]): Callbacks;
            fired(): boolean;
            fireWith(context: any, args?: any[]): Callbacks;
            has(callback: Function): boolean;
            lock(): Callbacks;
            locked(): boolean;
            remove(callback: Function): Callbacks;
        }

        // Coordinates
        interface Coordinates {
            top: number;
            left: number;
        }

        // Serialize Array Element
        interface JQuerySerializeArrayElement {
            name: string;
            value: string;
        }

        // XHR
        interface JQueryXHR extends XMLHttpRequest {
            abort(statusText?: string): JQueryXHR;
            done(callback: Function): JQueryXHR;
            fail(callback: Function): JQueryXHR;
            always(callback: Function): JQueryXHR;
            then(doneCallback: Function, failCallback?: Function, progressCallback?: Function): JQueryXHR;
            promise(): Promise<any>;
            overrideMimeType(mimeType: string): JQueryXHR;
            statusCode(map: Object): JQueryXHR;
        }
    }

    // Constructor type
    const $: JQuery;
    const jQuery: JQueryStatic;
    type JQueryStatic = JQuery.JQueryStatic;
}

export { };
