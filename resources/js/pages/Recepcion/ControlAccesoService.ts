import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import Poder from '@/models/Poder';
import Representante from '@/models/Representante';
import Empresa from '@/models/Empresa';
import Asistencia from '@/models/Asistencia';

export interface ControlAccesoServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export default class ControlAccesoService {
    constructor(private readonly opts: ControlAccesoServiceOptions) {
        // SIN storage/persistencia local - solo API
    }

    private get api() { return this.opts.api; }
    private get logger() { return this.opts.logger; }
    private get app() { return this.opts.app; }
}
