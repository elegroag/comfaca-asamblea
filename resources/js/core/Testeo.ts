//@ts-nocheck
export const Testeo = (() => {
    const es_telefono = (attr: string, target: string, out = false) => {
        let telefono = new RegExp('/^([0-9]){7,10}$/');
        if (!telefono.test(attr)) {
            let msj = `<span>El campo ${target} debe ser un valor valido.</span>`;
            if (!out) $(`[toggle-error='${target}']`).html(msj);
            return msj;
        }
        return false;
    };
    const es_numerico = (attr: string, target: string, out = false, size?: number = 20) => {
        let numerico = new RegExp('/^([0-9]+){0,' + size + '}$/', 'i');
        if (!numerico.test(attr)) {
            let msj = `<span>El campo ${target} debe ser un valor valido.</span>`;
            if (!out) $(`[toggle-error='${target}']`).html(msj);
            return msj;
        }
        return false;
    };
    const tiene_espacios = (attr: string, target: string, out = false) => {
        let espacios = new RegExp('/\s/');
        if (espacios.test(attr)) {
            let msj = `<span>El campo ${target} no puede contener espacios.</span>`;
            if (!out) $(`[toggle-error='${target}']`).html(msj);
            return msj;
        }
        return false;
    };
    const esta_vacio = (attr: string, target: string, out = false) => {
        if (attr == '' || attr == void 0 || attr == undefined || attr == null) {
            let msj = `<span>El campo ${target} no puede estar indefinido.</span>`;
            if (!out) $(`[toggle-error='${target}']`).html(msj);
            return msj;
        }
        return false;
    };
    const es_email = (attr: string, target: string, out = false) => {
        let email = new RegExp('/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/');
        if (!email.test(attr)) {
            let msj = '<span>La dirección de email no es valida.</span>';
            if (!out) $(`[toggle-error='${target}']`).html(msj);
            return msj;
        }
        return false;
    };
    const es_identificacion = (attr: string, target: string, _min = 1, _max = 100, out = false) => {
        let numerico = new RegExp('/^([0-9]+){1,' + _max + '}$/', 'i');
        if (!numerico.test(attr)) {
            let msj = `<span>El campo ${target} debe ser un valor valido.</span>`;
            if (!out) $(`[toggle-error='${target}']`).html(msj);
            return msj;
        } else {
            let express = new RegExp('/^([0-9]+){' + _min + ',' + _max + '}$/', 'i');
            if (!express.test(attr)) {
                let msj = `<span>El campo ${target} debe ser un valor entre ${_min} y ${_max} digitos.</span>`;
                if (!out) $(`[toggle-error='${target}']`).html(msj);
                return msj;
            }
        }
        return false;
    };
    return {
        espacio: tiene_espacios,
        numerico: es_numerico,
        vacio: esta_vacio,
        email: es_email,
        telefono: es_telefono,
        identi: es_identificacion,
    };
})();
