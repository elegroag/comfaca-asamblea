// Importar Backbone para evitar errores de UMD global
// @ts-nocheck
import '@/core/Core';

class BackboneView extends (Backbone.View as any) {
    constructor(options: any) {
        super(options);
    }
}

class BackboneModel extends (Backbone.Model as any) {
    constructor(options: any) {
        super(options);
    }
}


class BackboneCollection extends (Backbone.Collection as any) {
    constructor(options: any) {
        super(options);
    }
}


class BackboneRouter extends (Backbone.Router as any) {
    constructor(options: any) {
        super(options);
    }
}


class BackboneHistory extends (Backbone.History as any) {
    constructor(options: any) {
        super(options);
    }
}

export {
    BackboneView,
    BackboneModel,
    BackboneCollection,
    BackboneRouter,
    BackboneHistory
}
