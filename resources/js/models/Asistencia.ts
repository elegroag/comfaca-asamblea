'use strict';

import { BackboneModel } from "@/common/Bone";

class Asistencia extends BackboneModel {
    constructor(options: any) {
        super(options);
    }

    initialize() { }

    get idAttribute() {
        return 'documento';
    }

    get defaults() {
        return {
            documento: void 0,
            fecha: '',
            hora: '',
            nit: void 0,
            usuario: void 0,
            estado: 'I',
            votos: 0,
            asamblea_id: void 0,
        };
    }

    toJSON() {
        var result = BackboneModel.prototype.toJSON.call(this);
        if (result.phones && result.phones.length > 0) {
            result.phone = result.phones[0].phone;
        }
        if (result.emails && result.emails.length > 0) {
            result.email = result.emails[0].email;
        }
        return result;
    }

    validate(attrs: any) {
        const errors: { [key: string]: any }[] = [];
        if (attrs.documento == '') {
            return 'El documento es valor requerido';
        }
        if (attrs.fecha == '') {
            return 'La fecha es valor requerido';
        }
        if (attrs.hora == '') {
            return 'La hora es valor requerido';
        }
        if (attrs.nit == '') {
            return 'La nit es valor requerido';
        }
        return errors.length ? errors : null;
    }

    invalid(model: any) {
        var errors: string[] = [];
        if (!model.isValid()) {
            errors = model.validationError;
            _.each(errors, function (error) {
                console.log(error);
            });
        }
    }
}

export default Asistencia;
