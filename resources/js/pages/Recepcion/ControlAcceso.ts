import LayoutView from "@/componentes/layouts/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaCrearView from "@/componentes/habiles/views/EmpresaCrearView";

import { Controller } from "@/common/Controller";
import Empresa from "@/models/Empresa";
import { getCachedCollection } from "@/componentes/CacheManager";
import EmpresasCollection from "@/collections/EmpresasCollection";
import ControlAccesoService from "./ControlAccesoService";

export default class ControlAcceso extends Controller {

    public controlAccesoService: ControlAccesoService;

    constructor(options: any) {
        super(options)
        _.extend(this, options);
        this.controlAccesoService = new ControlAccesoService(options);
    }



}
