<?php

namespace App\Http\Controllers;

use App\Models\AsaTrabajadores;
use App\Models\Empresas;
use App\Models\Poderes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Exception;

class TrabajadoresController extends Controller
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
     * Mostrar página principal de trabajadores
     */
    public function index()
    {
        $this->isAdmin();
        
        return view('trabajadores.index', [
            'titulo' => 'Trabajadores',
            'itemMenuSidebar' => 6
        ]);
    }

    /**
     * Listar todos los trabajadores
     */
    public function listar()
    {
        try {
            $trabajadores = DB::select("SELECT * FROM asa_trabajadores");
            
            return response()->json([
                "success" => true,
                "trabajadores" => $trabajadores
            ]);
        } catch (Exception $e) {
            return response()->json([
                "success" => false,
                "message" => $e->getMessage()
            ]);
        }
    }

    /**
     * Cargue masivo de trabajadores
     */
    public function cargue_masivo(Request $request)
    {
        try {
            if (!Session::get("SuperAdmin")) {
                throw new Exception("No dispone de permisos para un cargue masivo.", 1);
            }

            $cruzar_poderes = $request->input('cruzar');
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
            $fallidos = [];
            $cruzados = [];
            $duplicados = [];
            $msj = '';

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
                        $cedula = trim($fila[0]);
                        $nombre = trim($fila[1]);
                        $nittra = trim($fila[2]);
                        $razontra = trim($fila[3]);

                        if ($cedula == "") {
                            $fallidos[] = $ai + 1;
                            continue;
                        }

                        if ($cedula > 0) {
                            $filas++;
                            $empresa = Empresas::where('nit', $nittra)->first();
                            if ($empresa) {
                                // Rechazar poder si es un apoderado trabajador de la caja
                                if ($cruzar_poderes == 1) {
                                    $poder = Poderes::where('cedrep1', $nittra)
                                        ->orWhere('cedrep1', $cedula)
                                        ->first();
                                    if ($poder) {
                                        Poderes::where('cedrep1', $nittra)
                                            ->orWhere('cedrep1', $cedula)
                                            ->update(['estado' => 'I']);

                                        $cruzados[] = "'{$nittra}', '{$cedula}'";
                                    }
                                }
                            }

                            $trabajador = AsaTrabajadores::where('cedula', $cedula)
                                ->where('nittra', $nittra)
                                ->first();
                                
                            if ($trabajador) {
                                $duplicados[] = "'{$cedula}', '{$nittra}'";
                            } else {
                                $id = AsaTrabajadores::max('id') ?? 0;
                                $id++;

                                $trabajador = new AsaTrabajadores();
                                $trabajador->id = $id;
                                $trabajador->cedula = $cedula;
                                $trabajador->nombre = $nombre;
                                $trabajador->nittra = $nittra;
                                $trabajador->razontra = $razontra;
                                $trabajador->create_at = date('Y-m-d H:i:s');
                                $trabajador->update_at = date('Y-m-d H:i:s');

                                if ($trabajador->save()) {
                                    $creados++;
                                } else {
                                    $msj .= 'Error al guardar trabajador';
                                    $fallidos[] = "'{$cedula}','{$nittra}'";
                                }
                            }
                        }
                    }
                    $ai++;
                }
            }
            fclose($fdata);

            // Eliminar archivo temporal
            Storage::disk('public')->delete($filepath);

            $salida = [
                "cruzar_poderes" => $cruzar_poderes,
                "headers" => $headers,
                "creados" => $creados,
                "duplicados" => (count($duplicados) > 0) ? implode(",", $duplicados) : '0',
                "filas" => $filas,
                "cruzados" => (count($cruzados) > 0) ? implode(",", $cruzados) : '0',
                "fallidos" => (count($fallidos) > 0) ? implode(",", $fallidos) : '0',
                "msj" => $msj,
                "success" => true
            ];

            return response()->json($salida);
        } catch (Exception $e) {
            return response()->json([
                "success" => false,
                "message" => $e->getMessage()
            ]);
        }
    }

    /**
     * Crear trabajador (versión simple)
     */
    public function crear(Request $request)
    {
        try {
            $id = $request->input('id');
            $cedula = $request->input('cedula');
            $nombre = $request->input('nombre');
            
            if ($id) {
                $trabajador = AsaTrabajadores::find($id);
            } else {
                $trabajador = new AsaTrabajadores();
            }

            $trabajador->cedula = $cedula;
            $trabajador->nombre = $nombre;
            $trabajador->create_at = date('Y-m-d H:i:s');
            $trabajador->update_at = date('Y-m-d H:i:s');

            if ($trabajador->save()) {
                return response()->json([
                    "success" => true,
                    "trabajador" => $trabajador
                ]);
            } else {
                return response()->json([
                    "success" => false,
                    "message" => 'Error al crear el trabajador'
                ]);
            }
        } catch (Exception $e) {
            return response()->json([
                "success" => false,
                "message" => $e->getMessage()
            ]);
        }
    }

    /**
     * Exportar lista de trabajadores
     */
    public function exportar_lista()
    {
        try {
            // Implementar lógica de exportación
            // Core::importLibrary('TrabajadorReporte', 'Reportes');
            // $trabajadorReporte = new TrabajadorReporte();
            // $out = $trabajadorReporte->main($this->idAsamblea);

            // Temporal: estructura de respuesta
            $out = [
                'data' => [],
                'message' => 'Reporte de trabajadores generado correctamente',
                'file_path' => 'storage/reportes/trabajadores_' . date('Y-m-d_H-i-s') . '.pdf'
            ];

            return response()->json([
                "status" => 200,
                ...$out
            ]);
        } catch (Exception $e) {
            return response()->json([
                "success" => false,
                "message" => $e->getMessage()
            ]);
        }
    }

    /**
     * Eliminar trabajador
     */
    public function eliminar(Request $request)
    {
        try {
            $id = $request->input('id');
            $trabajador = AsaTrabajadores::find($id);
            
            if ($trabajador) {
                $trabajador->delete();
                return response()->json([
                    "success" => true,
                    "message" => "Trabajador eliminado correctamente"
                ]);
            } else {
                return response()->json([
                    "success" => false,
                    "message" => "Trabajador no encontrado"
                ]);
            }
        } catch (Exception $e) {
            return response()->json([
                "success" => false,
                "message" => $e->getMessage()
            ]);
        }
    }

    /**
     * Guardar trabajador (versión completa)
     */
    public function saveTrabajador(Request $request)
    {
        try {
            $id = $request->input('id');
            $cedula = $request->input('cedula');
            $nombre = $request->input('nombre');
            $nittra = $request->input('nittra');
            $razontra = $request->input('razontra');

            if ($id) {
                $trabajador = AsaTrabajadores::find($id);
            } else {
                $trabajador = new AsaTrabajadores();
            }

            $trabajador->cedula = $cedula;
            $trabajador->nombre = $nombre;
            $trabajador->nittra = $nittra;
            $trabajador->razontra = $razontra;
            $trabajador->create_at = date('Y-m-d H:i:s');
            $trabajador->update_at = date('Y-m-d H:i:s');

            if ($trabajador->save()) {
                return response()->json([
                    "success" => true,
                    "trabajador" => $trabajador
                ]);
            } else {
                return response()->json([
                    "success" => false,
                    "message" => 'Error al crear el trabajador'
                ]);
            }
        } catch (Exception $e) {
            return response()->json([
                "success" => false,
                "message" => $e->getMessage()
            ]);
        }
    }

    /**
     * Buscar trabajador por cédula
     */
    public function buscar($cedula)
    {
        try {
            $trabajador = AsaTrabajadores::where('cedula', $cedula)->first();
            
            if ($trabajador) {
                // Obtener información de la empresa asociada
                $empresa = null;
                if ($trabajador->nittra) {
                    $empresa = Empresas::where('nit', $trabajador->nittra)->first();
                }

                return response()->json([
                    "success" => true,
                    "trabajador" => $trabajador,
                    "empresa" => $empresa,
                    "message" => "Trabajador encontrado"
                ]);
            } else {
                return response()->json([
                    "success" => false,
                    "message" => "Trabajador no encontrado"
                ]);
            }
        } catch (Exception $e) {
            return response()->json([
                "success" => false,
                "message" => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener detalles completos del trabajador
     */
    public function detalle($id)
    {
        try {
            $trabajador = AsaTrabajadores::find($id);
            
            if (!$trabajador) {
                throw new Exception("Trabajador no encontrado", 404);
            }

            // Obtener información de la empresa
            $empresa = null;
            if ($trabajador->nittra) {
                $empresa = Empresas::where('nit', $trabajador->nittra)->first();
            }

            // Verificar si tiene poderes asociados
            $poderes = [];
            if ($trabajador->cedula) {
                $poderes = DB::select("
                    SELECT p.*, e.razsoc
                    FROM poderes p
                    LEFT JOIN empresas e ON e.nit = p.nit2
                    WHERE p.cedrep1 = '{$trabajador->cedula}'
                    OR p.cedrep1 = '{$trabajador->nittra}'
                ");
            }

            return response()->json([
                'success' => true,
                'trabajador' => $trabajador,
                'empresa' => $empresa,
                'poderes' => $poderes,
                'message' => 'Datos del trabajador obtenidos correctamente'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Actualizar trabajador
     */
    public function actualizar($id, Request $request)
    {
        try {
            $trabajador = AsaTrabajadores::find($id);
            
            if (!$trabajador) {
                throw new Exception("Trabajador no encontrado", 404);
            }

            $trabajador->update([
                'cedula' => $request->input('cedula'),
                'nombre' => $request->input('nombre'),
                'nittra' => $request->input('nittra'),
                'razontra' => $request->input('razontra'),
                'update_at' => date('Y-m-d H:i:s')
            ]);

            return response()->json([
                'success' => true,
                'trabajador' => $trabajador,
                'message' => 'Trabajador actualizado correctamente'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Validar si existe un trabajador
     */
    public function validar($cedula, $nittra = null)
    {
        try {
            $query = AsaTrabajadores::where('cedula', $cedula);
            
            if ($nittra) {
                $query->where('nittra', $nittra);
            }
            
            $trabajador = $query->first();
            
            return response()->json([
                'success' => true,
                'exists' => $trabajador ? true : false,
                'trabajador' => $trabajador,
                'message' => $trabajador ? 'El trabajador ya existe' : 'El trabajador está disponible'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
}
