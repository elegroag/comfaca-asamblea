
interface SyncOptions extends JQuery.AjaxSettings {
    emulateJSON?: boolean;
    emulateHTTP?: boolean;
    [key: string]: any;
}

// Override Backbone.sync con tipos compatibles
(Backbone as any).sync = (
    method: string,
    model: Backbone.Model | Backbone.Collection,
    options?: SyncOptions
): JQuery.jqXHR<any> => {

    const methodMap: Record<string, string> = {
        'create': 'POST',
        'update': 'PUT',
        'patch': 'PATCH',
        'delete': 'DELETE',
        'read': 'GET'
    };
    const type = methodMap[method];

    function urlError(): never {
        throw new Error('A "url" property or function must be specified');
    }

    const params: JQuery.AjaxSettings = _.extend(
        {
            type: type,
            dataType: 'json',
            processData: false,
        },
        options,
    );

    if (!params.url) {
        params.url = (model as any).url || urlError();
    }

    if (!params.data && model && (method === 'create' || method === 'update')) {
        params.contentType = 'application/json';
        params.data = JSON.stringify(model.toJSON());
    }

    // Handle Backbone emulation options
    if (!(Backbone as any).emulateJSON && !(Backbone as any).emulateHTTP) {
        // Default behavior
    }

    if ((Backbone as any).emulateJSON) {
        params.contentType = 'application/x-www-form-urlencoded';
        params.processData = true;
        params.data = params.data ? { model: params.data } : {};
        //@ts-ignore
        params.beforeSend = function (xhr: JQuery.jqXHR<any>) {
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        };
    }

    if ((Backbone as any).emulateHTTP) {
        if (type === 'PUT' || type === 'DELETE') {
            if ((Backbone as any).emulateJSON && params.data) {
                (params.data as any)._method = type;
            }
            params.type = 'POST';

            //@ts-ignore
            params.beforeSend = (xhr: JQuery.jqXHR<any>) => {
                xhr.setRequestHeader('X-HTTP-Method-Override', type);
            };
        }
    }

    return $.ajax(params);
};
