<?php

namespace App\Http\Controllers;

use App\Services\AsistenciaService;
use App\Services\BuscadorService;
use App\Services\CruzarHabilesService;
use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\AsaRepresentantes;
use App\Models\AsaMesas;
use App\Models\Poderes;
use App\Models\Carteras;
use App\Models\Rechazos;
use App\Models\CriteriosRechazos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Exception;

class RecepcionController extends Controller
{
    private $idAsamblea;

    public function __construct()
    {
        $this->middleware('auth');
        $this->idAsamblea = $this->getAsambleaActiva();
    }

    /**
     * Obtener asamblea activa
     */
    private function getAsambleaActiva()
    {
        // Implementar lógica para obtener asamblea activa
        return Session::get('idAsamblea', 1);
    }

    /**
     * Verificar permisos de administrador
     */
    private function isAdmin($modulo = 'recepcion')
    {
        // Implementar lógica de verificación de permisos
        return true; // Temporal hasta implementar autenticación completa
    }

    /**
     * Mostrar página principal de recepción
     */
    public function index()
    {
        $this->isAdmin('recepcion');

        return view('recepcion.index', [
            'titulo' => 'Recepción',
            'itemMenuSidebar' => 1
        ]);
    }

    /**
     * Listar asistencias de ingresos a la asamblea
     */
    public function listar()
    {
        try {
            $asistencias = DB::select(
                "
                SELECT
                DISTINCT rgi.nit,
                documento,
                fecha,
                hora,
                usuario,
                mesa_id,
                ((SELECT COUNT(*)
                    FROM poderes
                        WHERE poderes.nit1 = rgi.nit AND
                            poderes.estado ='A' AND
                            poderes.asamblea_id='{$this->idAsamblea}') + rgi.votos) as 'votos',
                rgi.estado,
                rgi.cedula_representa,
                (CASE
                WHEN rgi.estado = 'A' THEN 'Activo'
                WHEN rgi.estado = 'I' THEN 'Inactivo'
                WHEN rgi.estado = 'U' THEN 'Actualizando'
                WHEN rgi.estado = 'F' THEN 'Finalizado'
                WHEN rgi.estado = 'P' THEN 'Pendiente'
                WHEN rgi.estado = 'C' THEN 'Cancelado'
                WHEN rgi.estado = 'R' THEN 'Rechazada'
                ELSE 'Ninguno' END) as 'detalle_estado',
                razsoc,
                repleg,
                cedrep
                FROM registro_ingresos as rgi
                INNER JOIN empresas ON empresas.nit = rgi.nit AND empresas.asamblea_id='{$this->idAsamblea}'
                WHERE rgi.asamblea_id='{$this->idAsamblea}' AND
                rgi.estado='A'"
            );

            $asistencias = (count($asistencias) === 0) ? -1 : $asistencias;

            return response()->json([
                "asistencias" => $asistencias,
                'success' => true,
                'msj' => 'Solicitud procesada con exito'
            ]);
        } catch (Exception $err) {
            return response()->json([
                "asistencias" => false,
                'success' => false,
                'msj' => $err->getMessage()
            ]);
        }
    }

    /**
     * Lista de rechazados para ingreso a la Asamblea
     */
    public function buscar_rechazados()
    {
        $asistencias = DB::select(
            "
            SELECT
            rgi.documento,
            rgi.fecha,
            rgi.hora,
            rgi.usuario,
            rgi.mesa_id,
            ((SELECT COUNT(poderes.documento)
                FROM poderes
                    WHERE poderes.nit1 = rgi.nit AND poderes.estado ='A' AND poderes.asamblea_id='{$this->idAsamblea}') + rgi.votos) as 'votos',
            rgi.estado,
            rgi.nit,
            (CASE
                WHEN rgi.estado = 'A' THEN 'Activo'
                WHEN rgi.estado = 'I' THEN 'Inactivo'
                WHEN rgi.estado = 'U' THEN 'Actualizando'
                WHEN rgi.estado = 'F' THEN 'Finalizado'
                WHEN rgi.estado = 'P' THEN 'Pendiente'
                WHEN rgi.estado = 'C' THEN 'Cancelado'
                WHEN rgi.estado = 'R' THEN 'Rechazada'
                ELSE 'Ninguno'
            END) as 'detalle_estado',
            razsoc,
            repleg,
            cedrep,
            rechazos.criterio_id,
            IF(ctr.id IS NULL,'No disponible', ctr.detalle) as 'detalle_rechazo'
            FROM registro_ingresos as rgi
            INNER JOIN empresas ON empresas.nit = rgi.nit
                LEFT JOIN rechazos ON rechazos.regingre_id = rgi.documento
                LEFT JOIN criterios_rechazos ctr ON ctr.id = rechazos.criterio_id
                WHERE rgi.asamblea_id = '{$this->idAsamblea}' AND
                rgi.estado NOT IN('A','P')"
        );

        $asistencias = (count($asistencias) === 0) ? -1 : $asistencias;

        return response()->json([
            "success" => true,
            "asistencias" => $asistencias
        ]);
    }

    /**
     * Mostrar datos de validación para la asamblea
     */
    public function buscar(Request $request)
    {
        try {
            $cedrep = $request->input('cedrep');
            $buscadorService = new BuscadorService($this->idAsamblea, $cedrep);
            $out = $buscadorService->findByCedtraValidation();

            return response()->json([
                ...$out,
                'success' => true
            ]);
        } catch (Exception $err) {
            return response()->json([
                'msj' => $err->getMessage(),
                'success' => false
            ]);
        }
    }

    /**
     * Buscar empresas por cédula de representante
     */
    public function buscar_empresas($cedrep = 0)
    {
        $empresas = DB::select("SELECT * FROM empresas WHERE cedrep={$cedrep}");
        return response()->json($empresas);
    }

    /**
     * Mostrar página de búsqueda
     */
    public function buscando()
    {
        return view('recepcion.buscando', [
            'titulo' => 'Recepción'
        ]);
    }

    /**
     * Procesar datos del scanner
     */
    public function scanner(Request $request)
    {
        $cedrep_scanner = $request->input('cedrep_scanner');
        $params = preg_split('/[^0-9]/', $cedrep_scanner);
        $cedrep = (count($params) > 0) ? $params[0] : "";

        return response()->json([
            "cedrep" => $cedrep
        ]);
    }

    /**
     * Exportar lista de asistencias
     */
    public function exportar_lista()
    {
        try {
            // Implementar lógica de exportación
            // Core::importLibrary('RecepcionReporte', 'Reportes');
            // $recepcionReporte = new RecepcionReporte();
            // $out = $recepcionReporte->main($this->idAsamblea);

            return response()->json([
                "status" => 200,
                "success" => true,
                "msj" => "Función de exportación por implementar"
            ]);
        } catch (Exception $err) {
            return response()->json([
                "status" => 301,
                "success" => false,
                "msj" => $err->getMessage()
            ]);
        }
    }

    /**
     * Verificar si un documento está activo
     */
    public function activo($documento)
    {
        $registro_ingresos = RegistroIngresos::where('documento', $documento)->first();

        if (!$registro_ingresos) {
            return response()->json([
                "poder" => false,
                "success" => false,
                "empresa" => false,
                "repres" => false,
                "errors" => "La empresa no es correcta para buscar en el sistema."
            ]);
        }

        $voto = $registro_ingresos->votos;
        $nit = $registro_ingresos->nit;
        $estado_detalle = $this->getEstadoDetalle($registro_ingresos->estado);
        $fecha = $registro_ingresos->fecha;
        $hora = $registro_ingresos->hora;

        $empresa = DB::selectOne(
            "
            SELECT
            empresas.telefono,
            empresas.cedrep,
            empresas.repleg,
            empresas.email,
            empresas.nit,
            '{$estado_detalle}' as estado_detalle,
            ((SELECT COUNT(poderes.documento) FROM poderes WHERE poderes.nit1 = empresas.nit AND poderes.estado='A' AND poderes.asamblea_id='{$this->idAsamblea}') + {$voto}) as 'votos',
            empresas.razsoc,
            '{$fecha}' as 'registro_ingresos_fecha',
            '{$hora}' as 'registro_ingresos_hora',
            (SELECT count(poderes.documento) FROM poderes WHERE poderes.nit2 = empresas.nit AND poderes.estado='A' AND poderes.asamblea_id='{$this->idAsamblea}') as 'is_poderdante',
            (SELECT count(poderes.documento) FROM poderes WHERE poderes.nit1 = empresas.nit AND poderes.estado='A' AND poderes.asamblea_id='{$this->idAsamblea}') as 'is_apoderado'
            FROM empresas
            WHERE empresas.nit='{$nit}'"
        );

        if (!$empresa) {
            return response()->json([
                "poder" => false,
                "success" => false,
                "empresa" => false,
                "repres" => false,
                "errors" => "La empresa no es correcta para buscar en el sistema."
            ]);
        }

        $poder = false;
        if ($empresa->is_apoderado > 0) {
            $poder = Poderes::where('nit1', $nit)
                ->where('estado', 'A')
                ->where('asamblea_id', $this->idAsamblea)
                ->first();
        }

        $cedrep = $empresa->cedrep;
        $representante = AsaRepresentantes::where('cedrep', $cedrep)
            ->where('asamblea_id', $this->idAsamblea)
            ->first();

        return response()->json([
            "poder" => $poder,
            "empresa" => $empresa,
            "repres" => $representante,
            "success" => true
        ]);
    }

    /**
     * Obtener detalle del estado
     */
    private function getEstadoDetalle($estado)
    {
        $estados = [
            'A' => 'Activo',
            'I' => 'Inactivo',
            'U' => 'Actualizando',
            'F' => 'Finalizado',
            'P' => 'Pendiente',
            'C' => 'Cancelado',
            'R' => 'Rechazada'
        ];

        return $estados[$estado] ?? 'Ninguno';
    }

    /**
     * Remover inscripción (cambiar estado a rechazado)
     */
    public function remover_inscripcion($documento)
    {
        try {
            $registroIngreso = RegistroIngresos::where('documento', $documento)
                ->where('estado', 'A')
                ->first();

            if (!$registroIngreso) {
                throw new Exception("Error no registro activo con ingreso que mostrar", 301);
            }

            $success = DB::update("UPDATE registro_ingresos SET estado='P', votos='1' WHERE documento={$documento}");

            return response()->json([
                "success" => $success,
                "msj" => "El registro se ha borrado con éxito."
            ]);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ]);
        }
    }

    /**
     * Salvar inscripción
     */
    public function salvar_inscripcion(Request $request)
    {
        try {
            if (!Session::get("SuperAdmin")) {
                throw new Exception("No dispone de permisos para inscribir empresas.", 1);
            }

            $cedrep = $request->input('cedrep');
            $nombres = $request->input('nombres');
            $apellidos = $request->input('apellidos');
            $nit = $request->input('nit');
            $omit_estado = $request->input('omit_estado');
            $crear_empresa = $request->input('crear_empresa');

            $empresa = Empresas::where('nit', $nit)
                ->where('asamblea_id', $this->idAsamblea)
                ->first();

            if ($crear_empresa == '1') {
                if (!$empresa) {
                    $razsoc = $request->input('razsoc');
                    $email = $request->input('email');
                    $telefono = $request->input('telefono');

                    $empresa = new Empresas();
                    $empresa->nit = $nit;
                    $empresa->razsoc = $razsoc;
                    $empresa->cedrep = $cedrep;
                    $empresa->telefono = $telefono;
                    $empresa->repleg = $nombres . ' ' . $apellidos;
                    $empresa->email = $email;
                    $empresa->asamblea_id = $this->idAsamblea;

                    if (!$empresa->save()) {
                        throw new Exception("No se puede crear la empresa.", 1);
                    }
                } else {
                    if (trim($cedrep) != trim($empresa->cedrep)) {
                        throw new Exception("El representante $cedrep, no es igual al de la empresa que fue reportada previamente, {$empresa->cedrep}", 1);
                    }
                }
            } else {
                if (!$empresa) {
                    throw new Exception("La empresa está en el cargue de habiles para su ingreso. De usar la opción de crear", 1);
                }
            }

            if ($omit_estado != '1') {
                $cartera = Carteras::where('nit', $nit)
                    ->where('asamblea_id', $this->idAsamblea)
                    ->first();
                if ($cartera) {
                    throw new Exception("La empresa está reportada en cartera no se puede registrar para ingreso.", 1);
                }
            }

            if (!$cedrep) {
                $cedrep = $empresa->cedrep;
            }

            $inscrito = RegistroIngresos::where('nit', $nit)
                ->where('asamblea_id', $this->idAsamblea)
                ->where('cedula_representa', $cedrep)
                ->first();

            if (!$inscrito) {
                // Crear nuevo registro
                $ultimoRegistro = DB::selectOne("SELECT max(documento) as last FROM registro_ingresos");
                $documento = ($ultimoRegistro) ? $ultimoRegistro->last + 1 : 1;

                $registro_ingresos = new RegistroIngresos();
                $registro_ingresos->documento = $documento;
                $registro_ingresos->asamblea_id = $this->idAsamblea;
                $registro_ingresos->fecha = date('Y-m-d');
                $registro_ingresos->hora = date('H:i:s');
                $registro_ingresos->nit = $nit;
                $registro_ingresos->usuario = 1;
                $registro_ingresos->estado = 'P';
                $registro_ingresos->votos = 1;
                $registro_ingresos->mesa_id = 0;
                $registro_ingresos->tipo_ingreso = 'P';
                $registro_ingresos->cedula_representa = $cedrep;
                $registro_ingresos->nombre_representa = $nombres . ' ' . $apellidos;

                if (!$registro_ingresos->save()) {
                    throw new Exception("No es posible el registro de inscripción.", 1);
                }
            } else {
                // Actualizar registro existente
                $res = RegistroIngresos::where('nit', $nit)
                    ->where('asamblea_id', $this->idAsamblea)
                    ->where('cedula_representa', $cedrep)
                    ->update(['estado' => 'P', 'votos' => '1']);

                if (!$res) {
                    throw new Exception("No es posible actualizar la inscripción del nit {$nit}.", 1);
                }
            }

            $asaRepresentante = AsaRepresentantes::where('cedrep', $cedrep)
                ->where('asamblea_id', $this->idAsamblea)
                ->first();

            if (!$asaRepresentante) {
                // Crear o actualizar empresa
                $empresaData = [
                    "nit" => $nit,
                    "razsoc" => $empresa->razsoc,
                    "cedrep" => $empresa->cedrep,
                    "repleg" => $empresa->repleg,
                    "asamblea_id" => $this->idAsamblea
                ];

                Empresas::updateOrCreate(['nit' => $nit, 'asamblea_id' => $this->idAsamblea], $empresaData);
            }

            return response()->json([
                "success" => true,
                "msj" => "El registro se completo con éxito."
            ]);
        } catch (\Exception $err) {
            return response()->json([
                "success" => false,
                "msj" => $err->getMessage() . " " . $err->getLine()
            ]);
        }
    }

    /**
     * Buscar representantes inscritos
     */
    public function buscar_inscritos()
    {
        try {
            $inscritos = DB::select("
                SELECT
                DISTINCT asa_representantes.cedrep,
                asa_representantes.id,
                asa_representantes.nombre as empleador,
                asa_representantes.clave_ingreso,
                asa_representantes.acepta_politicas,
                asa_representantes.asamblea_id,
                asa_representantes.create_at as fecha,
                asa_representantes.update_at,
                (SELECT COUNT(*) FROM registro_ingresos as rgi WHERE rgi.cedula_representa = asa_representantes.cedrep) as votos
                FROM asa_representantes
                INNER JOIN empresas ON empresas.cedrep = asa_representantes.cedrep
                WHERE 1 HAVING votos > 0
            ");

            $inscritos = (count($inscritos) === 0) ? -1 : $inscritos;

            return response()->json([
                "success" => true,
                "inscritos" => $inscritos
            ]);
        } catch (Exception $err) {
            return response()->json([
                "success" => false,
                "inscritos" => false,
                'msj' => $err->getMessage()
            ]);
        }
    }

    /**
     * Reporte de quorum
     */
    public function reporte_quorum()
    {
        // Implementar lógica de reporte de quorum
        // Core::importLibrary('QuorumReporte', 'Reportes');

        $data = DB::select(
            "
            SELECT
            registro_ingresos.nit,
            registro_ingresos.fecha,
            registro_ingresos.fecha_asistencia,
            registro_ingresos.hora,
            empresas.cedrep as 'cedula',
            empresas.repleg as 'representante',
            empresas.razsoc ,
            ((SELECT COUNT(poderes.documento)
                FROM poderes
                    WHERE poderes.nit1 = registro_ingresos.nit AND poderes.estado='A' AND poderes.asamblea_id='{$this->idAsamblea}') +  registro_ingresos.votos) as 'votos'
            FROM registro_ingresos
            INNER JOIN empresas ON empresas.nit = registro_ingresos.nit AND empresas.asamblea_id=registro_ingresos.asamblea_id
            WHERE empresas.nit = registro_ingresos.nit AND
            registro_ingresos.asamblea_id='{$this->idAsamblea}' AND
            registro_ingresos.estado='A'
            ORDER BY registro_ingresos.fecha_asistencia ASC"
        );

        $ingresos = DB::select("
            SELECT empresas.cedrep
            FROM registro_ingresos
            INNER JOIN empresas on empresas.nit= registro_ingresos.nit
            where registro_ingresos.estado='A'
            GROUP BY 1
        ");

        $cantidad_ingresos = count($ingresos);

        $cantidad_poderes = DB::selectOne("
            SELECT count(*) as cantidad
            FROM poderes
            WHERE nit1 in(select nit from registro_ingresos where estado='A') and estado='A'
        ");

        $cantidad_empresas = DB::selectOne("
            SELECT count(*) as 'cantidad'
            FROM registro_ingresos
            WHERE registro_ingresos.estado='A'
        ");

        return response()->json([
            "status" => 200,
            "data" => $data,
            "cantidad_poderes" => $cantidad_poderes->cantidad,
            "cantidad_empresas" => $cantidad_empresas->cantidad,
            "cantidad_ingresos" => $cantidad_ingresos,
            "msj" => "Reporte de quorum generado"
        ]);
    }

    /**
     * Buscar registros pendientes de pre-ingreso
     */
    public function buscar_registros_pendientes()
    {
        try {
            $inscritos = DB::select("
                SELECT
                DISTINCT asa_representantes.cedrep,
                id,
                nombre as 'empleador',
                asa_representantes.cedrep,
                clave_ingreso,
                acepta_politicas,
                asa_representantes.asamblea_id,
                asa_representantes.create_at as fecha,
                asa_representantes.update_at,
                (SELECT COUNT(*)  FROM registro_ingresos as rgi WHERE rgi.cedula_representa = asa_representantes.cedrep) as votos
                FROM asa_representantes
                INNER JOIN empresas ON empresas.cedrep = asa_representantes.cedrep
                WHERE 1  HAVING votos = 0
            ");

            return response()->json([
                "inscritos" => $inscritos,
                "success" => true,
                'msj' => 'Proceso de consulta OK'
            ]);
        } catch (Exception $err) {
            return response()->json([
                "inscritos" => false,
                "success" => false,
                "msj" => $err->getMessage()
            ]);
        }
    }

    /**
     * Obtener todos los criterios de rechazos
     */
    public function all_criterios_rechazos()
    {
        $criterio_rechazos = DB::select("SELECT * FROM asa_criteriorechazos WHERE 1=1");
        return response()->json($criterio_rechazos);
    }

    /**
     * Cruzar habiles con preregistro presencial
     */
    public function cruzarHabilPreregistroPresencial()
    {
        ini_set('memory_limit', '6300M');

        try {
            $cruzarHabilesService = new CruzarHabilesService($this->idAsamblea);
            $out = $cruzarHabilesService->main();

            return response()->json([
                ...$out,
                "msj" => "Los registro se cruzaron de forma exitosa.",
                'success' => true,
                'status' => 200,
            ]);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'status' => 501,
                'msj' => $err->getMessage()
            ]);
        }
    }

    /**
     * Crear asistencia
     */
    public function crearAsistencia(Request $request)
    {
        try {
            $cedrep = $request->input('cedrep');
            $cedtra = Session::get("cedtra");
            $mesa = AsaMesas::where('cedtra_responsable', $cedtra)->first();

            if (!$mesa) {
                throw new Exception("Error funcionario no dispone de mesa de recepción", 1);
            }

            $fecha = date('Y-m-d H:i:s');

            $asistenciaService = new AsistenciaService($this->idAsamblea, $cedrep);
            $salida = $asistenciaService->fichaData();

            if (!$salida['empresas']) {
                throw new Exception("Error no hay empresas para este ingreso", 1);
            }

            // Agregar mesa en caso de que no posea una
            foreach ($salida['empresas'] as $ai => $row) {
                $nit = $salida['empresas'][$ai]['nit'];

                if ($salida['empresas'][$ai]['mesa_id'] == "0") {
                    RegistroIngresos::where('nit', $nit)
                        ->where('cedula_representa', $cedrep)
                        ->where('estado', '<>', 'R')
                        ->update([
                            'mesa_id' => $mesa->id,
                            'estado' => 'A',
                            'fecha_asistencia' => $fecha
                        ]);

                    $salida['empresas'][$ai]['mesa_id'] = $mesa->id;
                } else {
                    if ($salida['empresas'][$ai]['asistente_estado'] == 'P') {
                        RegistroIngresos::where('nit', $nit)
                            ->where('cedula_representa', $cedrep)
                            ->where('estado', '<>', 'R')
                            ->update([
                                'estado' => 'A',
                                'fecha_asistencia' => $fecha
                            ]);
                    }
                }

                $salida['empresas'][$ai]['funcionario_cedtra'] = $cedtra;
                $salida['empresas'][$ai]['asistente_estado'] = ($row['asistente_estado'] == null) ? 'R' : $row['asistente_estado'];
            }

            return response()->json([
                'success' => true,
                'msj' => 'Proceso de registro completado con éxito',
                'data' => $salida
            ]);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage() . ' ' . $err->getLine()
            ]);
        }
    }

    /**
     * Obtener información de rechazos
     */
    public function rechazo(Request $request)
    {
        try {
            $cedrep = $request->input('cedrep');
            $nit = $request->input('nit');

            $buscarEmpresaService = new BuscadorService($this->idAsamblea, $cedrep);
            $out = $buscarEmpresaService->findByCedtraValidation();
            $rechazos = [];

            $preIngreso = RegistroIngresos::where('nit', $nit)
                ->where('cedula_representa', $cedrep)
                ->first();

            if ($preIngreso) {
                $rechazos = DB::select("
                    SELECT rechazos.*,
                    ctr.detalle, ctr.estatutos, ctr.tipo
                    FROM rechazos
                    INNER JOIN criterios_rechazos as ctr ON ctr.id = rechazos.criterio_id
                    WHERE regingre_id='{$preIngreso->documento}'
                ");
            }

            return response()->json([
                ...$out,
                "success" => true,
                "msj" => 'Consulta realizada con éxito',
                "rechazos" => $rechazos
            ]);
        } catch (Exception $err) {
            return response()->json([
                "success" => false,
                "msj" => $err->getMessage()
            ]);
        }
    }

    /**
     * Revocar poder
     */
    public function revocarPoder(Request $request)
    {
        try {
            if (!(Session::get("RD") == 'SuperAdmin')) {
                throw new Exception("Error no dispone de permisos", 401);
            }

            $cedrep_apoderado = $request->input('cedrep');
            $nit_poderdante = $request->input('nit');

            $poderEntity = Poderes::where('nit2', $nit_poderdante)
                ->where('cedrep1', $cedrep_apoderado)
                ->where('asamblea_id', $this->idAsamblea)
                ->first();

            if (!$poderEntity) {
                throw new Exception("Error el poder no es valido", 301);
            }

            $documento = $poderEntity->documento;

            $registroIngreso = RegistroIngresos::where('nit', $poderEntity->nit2)
                ->where('asamblea_id', $this->idAsamblea)
                ->where('cedula_representa', $poderEntity->cedrep2)
                ->first();

            if ($registroIngreso) {
                $rechazo = Rechazos::where('regingre_id', $registroIngreso->documento)
                    ->where('criterio_id', '18')
                    ->first();

                if ($rechazo) {
                    $rechazo->delete();

                    $otherRechazos = Rechazos::where('regingre_id', $registroIngreso->documento)
                        ->where('criterio_id', '<>', '18')
                        ->first();

                    if (!$otherRechazos) {
                        RegistroIngresos::where('documento', $registroIngreso->documento)
                            ->update(['estado' => 'P', 'votos' => '1']);
                    }
                }
            }

            Poderes::where('documento', $documento)
                ->where('asamblea_id', $this->idAsamblea)
                ->delete();

            $poder = Poderes::where('documento', $documento)->first();

            return response()->json([
                "success" => true,
                "msj" => "Registro borrado con éxito",
                "poder" => ($poder) ? $poder->toArray() : false
            ]);
        } catch (Exception $err) {
            return response()->json([
                "success" => false,
                "msj" => $err->getMessage()
            ]);
        }
    }

    /**
     * Imprimir ficha
     */
    public function imprimir_ficha($cedrep)
    {
        // Implementar lógica de impresión de ficha
        // Core::importLibrary('HabilesPdfPrint', 'Reportes');

        $asistenciaService = new AsistenciaService($this->idAsamblea, $cedrep);
        $data = $asistenciaService->fichaData();

        // $habilesPdfPrint = new HabilesPdfPrint();
        // $habilesPdfPrint->main($cedrep, $data);

        return view('recepcion.imprimir_ficha', [
            'cedrep' => $cedrep,
            'data' => $data
        ]);
    }

    /**
     * Obtener ficha de datos
     */
    public function ficha(Request $request)
    {
        try {
            $cedrep = $request->input('cedrep');
            $asistenciaService = new AsistenciaService($this->idAsamblea, $cedrep);
            $out = $asistenciaService->fichaData();
            $trabajador = Session::get("cedtra");
            $mesa = AsaMesas::where('cedtra_responsable', $trabajador)->first();

            // Agregar mesa en caso de que no posea una
            foreach ($out['empresas'] as $ai => $row) {
                if ($row['mesa_id'] == "0" || !$row['mesa_id']) {
                    RegistroIngresos::where('nit', $row['nit'])
                        ->where('cedula_representa', $cedrep)
                        ->update(['mesa_id' => $mesa->id]);

                    $out['empresas'][$ai]['mesa_id'] = $mesa;
                }
                $out['empresas'][$ai]['asistente_estado'] = ($row['asistente_estado'] == null) ? 'R' : $row['asistente_estado'];
            }

            return response()->json([
                ...$out,
                'success' => true,
                'msj' => 'Proceso completado con éxito',
            ]);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ]);
        }
    }

    /**
     * Identificar asistentes pendientes
     */
    public function identifyAsistentes()
    {
        $identifies = DB::select("
            SELECT
            DISTINCT aar.cedrep, aar.nombre as empleador, mvoto.votos
            FROM asa_representantes as aar
            INNER JOIN (
                SELECT rgi.votos, rgi.cedula_representa FROM registro_ingresos as rgi WHERE rgi.estado IN('A','P')
            ) as mvoto ON mvoto.cedula_representa = aar.cedrep
            WHERE aar.asamblea_id='{$this->idAsamblea}'
        ");

        $identifies = (count($identifies) === 0) ? -1 : $identifies;

        return response()->json([
            "success" => true,
            "identifies" => $identifies,
            'msj' => 'Proceso de consulta ok'
        ]);
    }
}
