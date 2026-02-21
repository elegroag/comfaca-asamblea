<?php

namespace App\Http\Controllers;

use App\Services\RepresentanteService;
use App\Models\AsaRepresentantes;
use App\Models\Empresas;
use App\Models\Poderes;
use App\Models\Carteras;
use App\Models\RegistroIngresos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Exception;

class RepresentantesController extends Controller
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
    private function isAdmin()
    {
        // Implementar lógica de verificación de permisos
        return true; // Temporal hasta implementar autenticación completa
    }

    /**
     * Listar todos los representantes
     */
    public function listar()
    {
        try {
            $data = DB::select("SELECT id,
            nombre,
            cedrep,
            clave_ingreso,
            acepta_politicas,
            asamblea_id,
            create_at
            FROM asa_representantes");

            return response()->json([
                'representantes' => $data,
                "success" => true
            ]);
        } catch (Exception $err) {
            return response()->json([
                'msj' => $err->getMessage(),
                'success' => false
            ]);
        }
    }

    /**
     * Crear nuevo representante
     */
    public function crear(Request $request)
    {
        try {
            $this->isAdmin();

            $representa_existente = $request->input("representa_existente");
            $tiene_soportes = $request->input("tiene_soportes");
            $nit = $request->input("nit");

            $representanteService = new RepresentanteService();
            $representante = $representanteService->createConIngreso(
                [
                    'cedrep' => $request->input("cedrep"),
                    'nombre' => $request->input("nombre"),
                    'clave' => $request->input("clave"),
                    'acepta_politicas' => $request->input("acepta_politicas"),
                    'asamblea_id' => $this->idAsamblea,
                    'create_at' => date('Y-m-d H:i:s')
                ],
                [
                    'representa_existente' => $representa_existente,
                    'nit' => $nit,
                    'tiene_soportes' => $tiene_soportes
                ]
            );

            return response()->json([
                'msj' => 'El registro se completo con éxito',
                'representante' => $representante,
                "success" => true
            ]);
        } catch (Exception $err) {
            return response()->json([
                'msj' => $err->getMessage(),
                "success" => false
            ]);
        }
    }

    /**
     * Eliminar representante
     */
    public function removeRepresentante($id)
    {
        try {
            $this->isAdmin();

            $asaRepresentantes = AsaRepresentantes::find($id);
            if (!$asaRepresentantes) {
                throw new Exception("No se encontró el representante con ID: {$id}", 404);
            }

            $representanteService = new RepresentanteService();
            $representanteService->removerConRegister($asaRepresentantes);

            return response()->json([
                'msj' => 'El registro se borro con éxito',
                "success" => true
            ]);
        } catch (Exception $err) {
            return response()->json([
                'msj' => $err->getMessage(),
                "success" => false
            ]);
        }
    }

    /**
     * Validar si existe un representante por cédula
     */
    public function validRepresentante($cedrep)
    {
        try {
            $asaRepresentante = AsaRepresentantes::where('cedrep', $cedrep)->first();

            return response()->json([
                'msj' => ($asaRepresentante) ? 'Ya existe el registro del representante en la base de datos' : 'Ok cedula del representante está disponible',
                "success" => true,
                "isValid" => ($asaRepresentante) ? false : true
            ]);
        } catch (Exception $err) {
            return response()->json([
                'msj' => $err->getMessage(),
                "success" => false
            ]);
        }
    }

    /**
     * Verificar si una empresa está disponible para cambio de representante
     */
    public function empresaDisponible($nit)
    {
        try {
            // Empresa no existe registrada
            $empresa = Empresas::where('nit', $nit)->first();
            if (!$empresa) {
                throw new Exception('La empresa no está disponible en base de datos', 501);
            }

            // Poder aprobado
            $poderdante = Poderes::where('nit2', $nit)->where('estado', 'A')->first();
            if ($poderdante) {
                throw new Exception('No está disponible para realizar el cambio, ya existe un poder relacionado a la empresa', 501);
            }

            // Está en cartera
            $cartera = Carteras::where('nit', $nit)->first();
            if ($cartera) {
                throw new Exception('No está disponible para realizar el cambio, la empresa se encuentra reportada en cartera', 501);
            }

            return response()->json([
                'msj' => 'Empresa Ok',
                "success" => true,
                "empresa" => $empresa->toArray(),
                "isValid" => true
            ]);
        } catch (Exception $err) {
            return response()->json([
                'msj' => $err->getMessage(),
                "success" => false,
                "isValid" => false
            ]);
        }
    }

    /**
     * Buscar representante por cédula
     */
    public function buscar($cedrep)
    {
        try {
            $registroIngresos = null;
            $asaRepresentante = AsaRepresentantes::where('cedrep', $cedrep)->first();

            if ($asaRepresentante) {
                $registroIngresos = DB::select("
                    SELECT
                    rgi.nit,
                    empresas.razsoc,
                    empresas.cedrep,
                    empresas.repleg
                    FROM registro_ingresos rgi
                    INNER JOIN empresas ON empresas.nit = rgi.nit
                    WHERE rgi.cedula_representa='{$asaRepresentante->cedrep}'
                ");
            }

            return response()->json([
                'msj' => ($asaRepresentante) ? "Representante encontrado" : "El representante con identificación {$cedrep} no está disponible en base de datos",
                'representante' => ($asaRepresentante) ? $asaRepresentante->toArray() : false,
                'isValid' => $asaRepresentante ? true : false,
                'registro_ingresos' => $registroIngresos ?? false,
                "success" => true
            ]);
        } catch (Exception $err) {
            return response()->json([
                'msj' => $err->getMessage(),
                "success" => false
            ]);
        }
    }

    /**
     * Editar representante
     */
    public function editar($cedrep, Request $request)
    {
        try {
            $this->isAdmin();

            // Obtener parámetros del POST
            $nombre = $request->input("nombre");
            $clave = $request->input("clave");

            // Buscar el representante por cédula
            $asaRepresentante = AsaRepresentantes::where('cedrep', $cedrep)->first();
            if (!$asaRepresentante) {
                throw new Exception("No existe representante con cédula {$cedrep}", 404);
            }

            // Actualizar únicamente los campos solicitados
            $asaRepresentante->update([
                'nombre' => $nombre,
                'clave_ingreso' => $clave,
                'update_at' => date('Y-m-d H:i:s')
            ]);

            return response()->json([
                'msj' => 'El registro se actualizó con éxito',
                'representante' => $asaRepresentante->toArray(),
                "success" => true
            ]);
        } catch (Exception $err) {
            return response()->json([
                'msj' => $err->getMessage(),
                "success" => false
            ]);
        }
    }

    /**
     * Obtener detalles completos de un representante
     */
    public function detalle($cedrep)
    {
        try {
            $representante = AsaRepresentantes::where('cedrep', $cedrep)->first();

            if (!$representante) {
                throw new Exception("Representante no encontrado", 404);
            }

            // Obtener empresas asociadas
            $empresas = DB::select("
                SELECT
                e.nit,
                e.razsoc,
                e.repleg,
                e.telefono,
                e.email,
                rgi.estado as estado_registro,
                rgi.fecha as fecha_registro,
                rgi.votos
                FROM empresas e
                LEFT JOIN registro_ingresos rgi ON rgi.nit = e.nit AND rgi.cedula_representa = '{$cedrep}'
                WHERE e.cedrep = '{$cedrep}' AND e.asamblea_id = '{$this->idAsamblea}'
            ");

            // Obtener poderes como apoderado
            $poderes_apoderado = DB::select("
                SELECT
                p.documento,
                p.nit2 as nit_poderdante,
                e.razsoc as empresa_poderdante,
                p.estado,
                p.fecha_poder
                FROM poderes p
                INNER JOIN empresas e ON e.nit = p.nit2
                WHERE p.cedrep1 = '{$cedrep}' AND p.asamblea_id = '{$this->idAsamblea}'
            ");

            // Obtener poderes como poderdante
            $poderes_poderdante = DB::select("
                SELECT
                p.documento,
                p.cedrep1 as cedrep_apoderado,
                ar.nombre as nombre_apoderado,
                p.estado,
                p.fecha_poder
                FROM poderes p
                INNER JOIN asa_representantes ar ON ar.cedrep = p.cedrep1
                WHERE p.nit1 IN (SELECT nit FROM empresas WHERE cedrep = '{$cedrep}')
                AND p.asamblea_id = '{$this->idAsamblea}'
            ");

            return response()->json([
                'success' => true,
                'representante' => $representante->toArray(),
                'empresas' => $empresas,
                'poderes_apoderado' => $poderes_apoderado,
                'poderes_poderdante' => $poderes_poderdante,
                'msj' => 'Datos del representante obtenidos correctamente'
            ]);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ]);
        }
    }

    /**
     * Cambiar clave de acceso
     */
    public function cambiarClave($cedrep, Request $request)
    {
        try {
            $clave_actual = $request->input('clave_actual');
            $clave_nueva = $request->input('clave_nueva');

            $representante = AsaRepresentantes::where('cedrep', $cedrep)->first();
            if (!$representante) {
                throw new Exception("Representante no encontrado", 404);
            }

            // Verificar clave actual (implementar lógica de verificación)
            if ($representante->clave_ingreso !== $clave_actual) {
                throw new Exception("La clave actual no es correcta", 401);
            }

            // Actualizar clave
            $representante->update([
                'clave_ingreso' => $clave_nueva,
                'update_at' => date('Y-m-d H:i:s')
            ]);

            return response()->json([
                'success' => true,
                'msj' => 'Clave actualizada correctamente'
            ]);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ]);
        }
    }

    /**
     * Activar/desactivar representante
     */
    public function cambiarEstado($cedrep, Request $request)
    {
        try {
            $this->isAdmin();

            $estado = $request->input('estado'); // 'A' o 'I'

            $representante = AsaRepresentantes::where('cedrep', $cedrep)->first();
            if (!$representante) {
                throw new Exception("Representante no encontrado", 404);
            }

            $representante->update([
                'estado' => $estado,
                'update_at' => date('Y-m-d H:i:s')
            ]);

            return response()->json([
                'success' => true,
                'msj' => "Representante " . ($estado == 'A' ? 'activado' : 'desactivado') . " correctamente"
            ]);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ]);
        }
    }
}
