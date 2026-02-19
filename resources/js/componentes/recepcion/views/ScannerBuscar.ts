'use strict';

import { BackboneView } from "@/common/Bone";

class ScannerBuscar extends BackboneView {
    constructor(options?: any) {
        super(options);
    }

    initialize() { }

    get events() {
        return {
            'click #bt_buscar_asistente': 'buscar_asistente',
        };
    }

    noevent(e) {
        e.preventDefault();
        return false;
    }

    key_buscar_cedrep(e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            $('#bt_buscar_asistente').trigger('click');
        }
    }

    buscar_asistente(e) {
        e.preventDefault();
        var cedrep = $('#cedrep').val();
        if (cedrep == '' || cedrep == undefined || cedrep.trim() == '') {
            Swal.fire({
                title: 'Notificación!',
                text: 'El documento no es valido para mostrar los datos del representante.',
                icon: 'warning',
                button: 'OK!',
            });
            return false;
        }
        if (!/^([0-9]+){5,20}(.*)?/.test(cedrep)) {
            Swal.fire({
                title: 'Notificación!',
                text: 'El documento no es valido para mostrar los datos del representante.',
                icon: 'warning',
                button: 'OK!',
            });
            return false;
        }

        $(e.target).attr('disabled', true);
        var url = create_url('recepcion/buscar');
        var token = 'cedrep=' + cedrep;
        loading.show();
        axios
            .post(url, token)
            .then(function (salida) {
                $(e.target).removeAttr('disabled');
                loading.hide();
                if (salida.status == 200) {
                    if (salida.data.representante !== false) {
                        var representante = salida.data.representante;
                        representante.asistente = salida.data.asistente;
                        RouterRecepcion.setRepresentante(representante);

                        if (salida.data.asistente !== false) {
                            RouterRecepcion.addAsistencias(salida.data.asistente);
                        }
                    } else {
                        //mostrar notificacion representante no valido
                        Swal.fire({
                            title: 'Notificación!',
                            text: 'El representante no está habil para ingreso.',
                            icon: 'warning',
                            button: 'OK!',
                        });
                        return false;
                    }
                    if (salida.data.empresas !== false) {
                        RouterRecepcion.setEmpresas(salida.data.empresas);
                    } else {
                        //mostrar notificacion empresas no valido
                        Swal.fire({
                            title: 'Notificación!',
                            text: 'No dispone de empresas habiles para el ingreso.',
                            icon: 'warning',
                            button: 'OK!',
                        });
                        return false;
                    }
                    if (salida.data.tipo_ingreso === 'V') {
                        Swal.fire({
                            title: 'Notificación!',
                            text: 'Su participación en la asamblea se registro en el modo Virtual. No se admite su ingreso.',
                            icon: 'warning',
                            button: 'OK!',
                        });
                        return false;
                    }
                    window.location.href = create_url('recepcion/index#mostrar/' + cedrep);
                }
            })
            .catch(function (err) {
                console.log(err);
                $(e.target).removeAttr('disabled');
                loading.hide();
            });
    }

    render() {
        let template = _.template($('#tmp_asistencias_buscar').html());
        this.el.innerHTML = template();
        return this;
    }
}
