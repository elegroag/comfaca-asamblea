'use strict';

import { BackboneView } from "@/common/Bone";

export default class ValidacionPoder extends BackboneView {
    constructor(options: any) {
        super({ ...options, id: 'box_validacion_poder' });
    }

    get events() {
        return {
            "click [data-toggle='modal-close']": 'modalClose',
        };
    }

    modalClose(e: any) {
        e.preventDefault();
        this.app?.trigger('hide:modal', this);
    }

    initialize() {
        this.template = this.$el.find('#tmp_validacion_poder').html();
    }

    render() {
        let _template = _.template(this.template);
        this.$el.html(_template({ errors: this.collection }));
        return this;
    }
}
