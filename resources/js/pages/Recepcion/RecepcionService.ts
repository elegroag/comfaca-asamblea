import AsistenciasCollection from "@/collections/AsistenciasCollection";
import Poder from "@/models/Poder";
import Representante from "@/models/Representante";
import Empresa from "@/models/Empresa";
import Asistencia from "@/models/Asistencia";

export default class RecepcionService {

    private region: any;

    constructor(region?: any) {
        this.region = region;
    }

    __createContent() {
        if (this.region && this.region.el) {
            $(this.region.el).remove();
        }
        const _el = document.createElement('div');
        _el.setAttribute('id', this.region.id);
        document.getElementById('app').appendChild(_el);
        if (typeof scroltop === 'function') {
            scroltop();
        }
        return _el;
    }

    __addAsistencias(asistencia) {
        let _asistencia = asistencia instanceof Asistencia ? asistencia : new Asistencia(asistencia);
        $App.Collections.asistencias.add(_asistencia, { merge: true });
        return _asistencia;
    }

    __addRepresentante(representante) {
        let _representante = representante instanceof Representante ? representante : new Representante(representante);
        $App.Collections.representantes.add(_representante, { merge: true });
        return _representante;
    }

    __setInscritos(inscritos) {
        if (!inscritos) return false;
        $App.Collections.inscritos.add(inscritos, { merge: true });
    }

    __setEmpresas(empresas) {
        if (!empresas) return false;
        $App.Collections.empresas.add(empresas, { merge: true });
    }

    __setAsistencias(asistencias) {
        if (!asistencias) return false;
        $App.Collections.asistencias.add(asistencias, { merge: true });
    }

    __addEmpresa(empresa) {
        const _empresa = empresa instanceof Empresa ? empresa : new Empresa(empresa);
        $App.Collections.empresas.add(_empresa, { merge: true });
        return _empresa;
    }

    __setRepresentantes(representantes) {
        $App.Collections.representantes.add(representantes, { merge: true });
    }

    __setPoderes(poderes) {
        $App.Collections.poderes.add(poderes, { merge: true });
    }

    __addPoder(poder) {
        const _poder = poder instanceof Poder ? poder : new Poder(poder);
        $App.Collections.poderes.add(_poder, { merge: true });
        return _poder;
    }

    __setFichaIngreso(estado) {
        $App.Collections.ficha_ingreso = estado;
    }

    __showItemMostrar(response) {
        const asistencias = new AsistenciasCollection(response.asistente);
        const representante = new Representante(response.representante);
        const empresas = new (window as any).EmpresasCollection(response.empresas);
        const poderes = response.poderes ? new (window as any).EmpresasCollection(response.poderes) : false;
        const poder = response.poder ? new Poder(response.poder) : false;

        return {
            asistencias,
            representante,
            empresas,
            poderes,
            poder,
        };
    }
}
