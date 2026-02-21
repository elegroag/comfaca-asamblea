<?php

namespace App\Http\Controllers;

use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\Rechazos;
use App\Models\CriteriosRechazos;
use App\Models\Carteras;
use App\Services\Carteras\CarteraReportarService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Exception;

class RechazosApiController extends Controller
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
     * Listar los rechazos de las empresas para Asamblea
     */
    public function listar()
    {
        try {
            $empresas = DB::select(
                "
                SELECT
                rechazos.*,
                rgi.estado,
                rgi.nit,
                rgi.cedula_representa,
                rgi.nombre_representa,
                empresas.razsoc,
                crr.detalle as criterio,
                crr.tipo as tipo_criterio
                FROM rechazos
                INNER JOIN registro_ingresos rgi ON rgi.documento = rechazos.regingre_id
                INNER JOIN criterios_rechazos crr ON crr.id = rechazos.criterio_id
                INNER JOIN empresas ON empresas.nit = rgi.nit
                WHERE
                rgi.asamblea_id='{$this->idAsamblea}' AND
                empresas.asamblea_id='{$this->idAsamblea}' AND
                rgi.estado='R' AND
                crr.tipo='HAB'"
            );

            return response()->json([
                'success' => true,
                'empresas' => $empresas,
                'msj' => 'Consulta ok'
            ]);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ]);
        }
    }

    /**
     * Cargue masivo de empresas y rechazos
     */
    public function cargue_masivo(Request $request)
    {
        try {
            if (!Session::get("SuperAdmin")) {
                throw new Exception("No dispone de permisos para un cargue masivo.", 1);
            }

            $cruzar = $request->input('cruzar');
            $file = $request->file('file');

            if (!$file) {
                throw new Exception("No se ha proporcionado ningún archivo", 1);
            }

            $name = $file->getClientOriginalName();
            $filepath = $file->storeAs('uploads', $name, 'public');
            $fullPath = storage_path('app/public/' . $filepath);

            $headers = [];
            $filas = 0;
            $creados = 0;
            $no_validas = [];
            $fallidos = [];
            $cruzados = [];
            $duplicados = [];

            $fdata = fopen($fullPath, "rb");
            if ($fdata) {
                $ai = 0;
                while (!feof($fdata)) {
                    $line = fgets($fdata);
                    $line = str_replace("\n", "", $line);
                    $line = str_replace("\t", " ", $line);
                    if ($ai == 0) {
                        $headers = explode(";", $line);
                    } else {
                        $fila = explode(";", $line);

                        $nit = trim($fila[0]);
                        if (strlen($nit) > 0) {
                            $nit = intval($nit);
                            $razsoc = trim($fila[1]);
                            $cedrep = trim($fila[2]);
                            $repleg = trim($fila[3]);
                            $telefono = trim($fila[4]);
                            $email = trim($fila[5]);
                            $tipo_ingreso = trim($fila[6]);
                            $criterio = trim($fila[7]);
                            $motivo = trim($fila[8]);

                            if ($razsoc == '' || $cedrep == '' || $repleg == '') {
                                $no_validas[] = "'{$nit}'";
                                continue;
                            }

                            if (!$criterio) continue;

                            $filas++;
                            $empresa = Empresas::where('nit', $nit)->first();
                            $registroIngreso = RegistroIngresos::where('nit', $nit)
                                ->where('asamblea_id', $this->idAsamblea)
                                ->where('cedula_representa', $cedrep)
                                ->first();

                            if ($empresa) {
                                Empresas::where('nit', $nit)
                                    ->where('asamblea_id', $this->idAsamblea)
                                    ->update([
                                        'razsoc' => $razsoc,
                                        'cedrep' => $cedrep,
                                        'telefono' => $telefono,
                                        'email' => $email,
                                        'repleg' => $repleg
                                    ]);
                                $duplicados[] = "'{$nit}'";
                            } else {
                                $empresa = new Empresas();
                                $empresa->nit = intval($nit);
                                $empresa->razsoc = trim($razsoc);
                                $empresa->cedrep = intval($cedrep);
                                $empresa->repleg = trim($repleg);
                                $empresa->email = trim($email);
                                $empresa->telefono = intval($telefono);
                                $empresa->asamblea_id = $this->idAsamblea;

                                $res = $empresa->save();
                                $creados = ($res) ? $creados + 1 : $creados;
                                if (!$res) {
                                    $fallidos[] = "'{$nit}'";
                                }
                            }

                            if (!$registroIngreso) {
                                $documento = RegistroIngresos::max('documento') ?? 0;
                                $documento += 1;

                                $registroIngreso = new RegistroIngresos();
                                $registroIngreso->documento = $documento;
                                $registroIngreso->fecha = date('Y-m-d');
                                $registroIngreso->hora = date('H:i:s');
                                $registroIngreso->nit = intval($nit);
                                $registroIngreso->usuario = 1;
                                $registroIngreso->estado = 'P';
                                $registroIngreso->votos = 1;
                                $registroIngreso->tipo_ingreso = $tipo_ingreso;
                                $registroIngreso->asamblea_id = $this->idAsamblea;
                                $registroIngreso->cedula_representa = $cedrep;
                                $registroIngreso->nombre_representa = $repleg;

                                $res = $registroIngreso->save();
                                if (!$res) {
                                    throw new Exception("Error al guardar el registro de ingreso nit:{$nit} cedula:{$cedrep}", 501);
                                }
                            }

                            if ($cruzar == 1) {
                                $cruzados[] = "'{$nit}'";

                                RegistroIngresos::where('documento', $registroIngreso->documento)
                                    ->where('asamblea_id', $this->idAsamblea)
                                    ->update([
                                        'estado' => 'R',
                                        'votos' => 0
                                    ]);

                                $rechazo = Rechazos::where('regingre_id', $registroIngreso->documento)
                                    ->where('criterio_id', $criterio)
                                    ->first();

                                // Si no hay se crea el rechazo
                                if (!$rechazo) {
                                    $rechazo = new Rechazos();
                                    $rechazo->criterio_id = $criterio;
                                    $rechazo->regingre_id = $registroIngreso->documento;
                                    $rechazo->dia = date('Y-m-d');
                                    $rechazo->hora = date('H:i:s');
                                    $rechazo->save();
                                }
                            }

                            $criterioRechazos = CriteriosRechazos::find($criterio);
                            if ($criterioRechazos && $criterioRechazos->tipo == 'CAR') {
                                // Implementar lógica para cartera de rechazos
                                // $carteraService = new CarteraReportarService($this->idAsamblea);
                                // $carteraService->createCarteraRechazo($empresa, $criterio, $motivo);
                            }
                        }
                    }
                    $ai++;
                }
            }
            fclose($fdata);

            // Eliminar archivo temporal
            Storage::disk('public')->delete($filepath);

            return response()->json([
                "no_validas" => (count($no_validas) > 0) ? implode(",", $no_validas) : '0',
                "duplicados" => (count($duplicados) > 0) ? implode(",", $duplicados) : '0',
                "cruzar" => $cruzar,
                "headers" => $headers,
                "creados" => $creados,
                "filas" => $filas,
                "inactivos" => 0,
                "cruzados" => (count($cruzados) > 0) ? implode(",", $cruzados) : '0',
                "fallidos" => (count($fallidos) > 0) ? implode(",", $fallidos) : '0',
                'success' => true,
            ]);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ]);
        }
    }

    /**
     * Eliminar registro de rechazos
     */
    public function removeRechazo(Request $request)
    {
        try {
            if (!Session::get("SuperAdmin")) {
                throw new Exception("No dispone de permisos para eliminar rechazos.", 1);
            }

            $nit = $request->input("nit");
            $id = $request->input("id");
            $cedrep = $request->input("cedrep");
            $criterio = $request->input("criterio");

            $rechazo = Rechazos::find($id);
            if (!$rechazo) {
                throw new Exception("No se encontro el rechazo", 1);
            }

            $preIngreso = RegistroIngresos::where('documento', $rechazo->regingre_id)
                ->where('asamblea_id', $this->idAsamblea)
                ->first();

            if ($preIngreso) {
                $rechazo->delete();

                /*
                @description solo se habilita si no hay otros criterios de rechazo para el mismo registro de ingreso
                */
                $otherRechazos = Rechazos::where('regingre_id', $preIngreso->documento)
                    ->where('criterio_id', '<>', $criterio)
                    ->count();

                if ($otherRechazos == 0) {
                    RegistroIngresos::where('documento', $preIngreso->documento)
                        ->update(['estado' => 'P', 'votos' => '1']);
                }
            } else {
                $rechazo->delete();
            }

            return response()->json([
                'success' => true,
                'msj' => 'Rechazo eliminado'
            ]);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ]);
        }
    }

    /**
     * Listar los criterios de rechazo
     */
    public function buscarCriterios()
    {
        try {
            $criterios = [];
            $mcriterios = CriteriosRechazos::where('tipo', 'HAB')->get();

            foreach ($mcriterios as $criterio) {
                $criterios[$criterio->id] = $criterio->detalle;
            }

            return response()->json([
                'success' => true,
                'data' => $criterios
            ]);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ]);
        }
    }

    /**
     * Guardar rechazo
     */
    public function saveRechazo(Request $request)
    {
        try {
            $id = $request->input("id");
            $nit = $request->input("nit");
            $cedrep = $request->input("cedula_representa");
            $criterio = $request->input("criterio");
            $razsoc = $request->input("razsoc");
            $email = $request->input("email");
            $telefono = $request->input("telefono");
            $repleg = $request->input("nombre_representa");

            /**
             * @description Se verifica si la empresa existe, si no se crea
             */
            $empresa = Empresas::where('nit', $nit)->first();
            if (!$empresa) {
                $empresa = new Empresas();
                $empresa->nit = intval($nit);
                $empresa->razsoc = trim($razsoc);
                $empresa->cedrep = intval($cedrep);
                $empresa->repleg = trim($repleg);
                $empresa->email = trim($email);
                $empresa->telefono = intval($telefono);
                $empresa->asamblea_id = $this->idAsamblea;
                $empresa->save();
            } else {
                Empresas::where('nit', $nit)
                    ->where('asamblea_id', $this->idAsamblea)
                    ->update([
                        'razsoc' => $razsoc,
                        'cedrep' => $cedrep,
                        'telefono' => $telefono,
                        'email' => $email,
                        'repleg' => $repleg
                    ]);
            }

            /**
             * @description Se verifica si el registro de ingreso existe, si no se crea
             */
            $registroIngreso = RegistroIngresos::where('nit', $nit)
                ->where('asamblea_id', $this->idAsamblea)
                ->where('cedula_representa', $cedrep)
                ->first();

            if (!$registroIngreso) {
                $documento = RegistroIngresos::max('documento') ?? 0;
                $documento += 1;

                $registroIngreso = new RegistroIngresos();
                $registroIngreso->documento = $documento;
                $registroIngreso->fecha = date('Y-m-d');
                $registroIngreso->hora = date('H:i:s');
                $registroIngreso->nit = intval($nit);
                $registroIngreso->usuario = 1;
                $registroIngreso->estado = 'R';
                $registroIngreso->votos = 0;
                $registroIngreso->tipo_ingreso = 'P';
                $registroIngreso->asamblea_id = $this->idAsamblea;
                $registroIngreso->cedula_representa = $cedrep;
                $registroIngreso->nombre_representa = $repleg;

                $res = $registroIngreso->save();
                if (!$res) {
                    throw new Exception("Error al guardar el registro de ingreso nit:{$nit} cedula:{$cedrep}", 501);
                }
            } else {
                RegistroIngresos::where('documento', $registroIngreso->documento)
                    ->where('asamblea_id', $this->idAsamblea)
                    ->update(['estado' => 'R', 'votos' => 0]);
            }

            /**
             * @description Se verifica si el rechazo existe, si no se crea
             */
            if ($id) {
                $rechazo = Rechazos::find($id);
                $rechazo->criterio_id = $criterio;
                $rechazo->save();
            } else {
                $rechazo = Rechazos::where('regingre_id', $registroIngreso->documento)
                    ->where('criterio_id', $criterio)
                    ->first();

                if (!$rechazo) {
                    $rechazo = new Rechazos();
                    $rechazo->criterio_id = $criterio;
                    $rechazo->regingre_id = $registroIngreso->documento;
                    $rechazo->dia = date('Y-m-d');
                    $rechazo->hora = date('H:i:s');
                    $rechazo->save();
                }
            }

            return response()->json([
                'success' => true,
                'msj' => 'Rechazo guardado con éxito',
                'data' => $rechazo->toArray()
            ]);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ]);
        }
    }

    /**
     * Obtener detalles de un rechazo
     */
    public function detail(Request $request)
    {
        try {
            $id = $request->input("id");
            $rechazo = DB::selectOne(
                "
                SELECT
                rechazos.*,
                rgi.estado,
                rgi.nit,
                rgi.cedula_representa,
                rgi.nombre_representa,
                empresas.razsoc,
                crr.detalle as criterio,
                crr.tipo as tipo_criterio
                FROM rechazos
                INNER JOIN registro_ingresos rgi ON rgi.documento = rechazos.regingre_id
                INNER JOIN criterios_rechazos crr ON crr.id = rechazos.criterio_id
                INNER JOIN empresas ON empresas.nit = rgi.nit
                WHERE
                rgi.asamblea_id='{$this->idAsamblea}' AND
                empresas.asamblea_id='{$this->idAsamblea}' AND
                rgi.estado='R' AND
                crr.tipo='HAB' AND
                rechazos.id ='{$id}'
                LIMIT 1"
            );

            return response()->json([
                'success' => true,
                'data' => $rechazo
            ]);
        } catch (Exception $err) {
            return response()->json([
                'success' => false,
                'msj' => $err->getMessage()
            ]);
        }
    }
}
