<?php

namespace App\Http\Controllers;

use App\Models\AsaAsamblea;
use App\Models\Empresas;
use App\Models\Poderes;
use App\Models\RegistroIngresos;
use App\Models\UsuarioSisu;
use App\Models\AsaMesas;
use App\Models\AsaUsuarios;
use App\Models\AsaConsenso;
use App\Models\AsaRepresentantes;
use App\Models\Carteras;
use App\Models\Rechazos;
use App\Models\CriteriosRechazos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Exception;

class InicioController extends Controller
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
     * Mostrar página principal de inicio con dashboard
     */
    public function index()
    {
        try {
            // Obtener asamblea activa
            $asamblea_activa = AsaAsamblea::where('estado', 'A')->first();
            if (!$asamblea_activa) {
                throw new Exception("No hay asamblea activa", 404);
            }
            $asamblea_id = $asamblea_activa->id;

            // Estadísticas principales
            $estadisticas = $this->getEstadisticasPrincipales($asamblea_id);
            
            // Estadísticas detalladas
            $estadisticas_detalladas = $this->getEstadisticasDetalladas($asamblea_id);

            // Datos adicionales
            $datos_adicionales = $this->getDatosAdicionales($asamblea_id);

            return view('inicio.index', [
                'titulo' => 'Inicio',
                'asamblea_activa' => $asamblea_activa->toArray(),
                'estadisticas' => $estadisticas,
                'estadisticas_detalladas' => $estadisticas_detalladas,
                'datos_adicionales' => $datos_adicionales
            ]);
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Error al cargar el dashboard: ' . $e->getMessage());
        }
    }

    /**
     * Obtener estadísticas principales del dashboard
     */
    private function getEstadisticasPrincipales($asamblea_id)
    {
        return [
            'cont_empresas' => Empresas::where('asamblea_id', $asamblea_id)->count(),
            'cont_poderes' => Poderes::where('asamblea_id', $asamblea_id)->where('estado', 'A')->count(),
            'cont_ingresos' => RegistroIngresos::where('asamblea_id', $asamblea_id)
                ->whereIn('estado', ['P', 'A'])->count(),
            'cont_usuarios' => UsuarioSisu::count(),
            'cont_asambleas' => AsaAsamblea::where('estado', 'A')->count(),
        ];
    }

    /**
     * Obtener estadísticas detalladas
     */
    private function getEstadisticasDetalladas($asamblea_id)
    {
        return [
            'poderes_rechazados' => Poderes::where('asamblea_id', $asamblea_id)
                ->where('estado', '<>', 'A')->count(),
            'poderes_qurom' => DB::table('poderes')
                ->where('asamblea_id', $asamblea_id)
                ->where('estado', 'A')
                ->whereIn('nit1', function($query) use ($asamblea_id) {
                    $query->select('nit')
                        ->from('registro_ingresos')
                        ->where('asamblea_id', $asamblea_id)
                        ->where('estado', 'A');
                })
                ->count(),
            'ingreso_qurum' => RegistroIngresos::where('asamblea_id', $asamblea_id)
                ->where('estado', 'A')->count(),
            'asa_representantes' => AsaRepresentantes::where('asamblea_id', $asamblea_id)->count(),
            'cont_cartera' => Carteras::where('asamblea_id', $asamblea_id)->count(),
            'cont_rechazos' => Rechazos::whereIn('criterio_id', function($query) {
                    $query->select('id')
                        ->from('criterios_rechazos')
                        ->where('tipo', 'HAB');
                })->count(),
        ];
    }

    /**
     * Obtener datos adicionales del dashboard
     */
    private function getDatosAdicionales($asamblea_id)
    {
        // Usuarios de la asamblea
        $usuarios_asa = AsaUsuarios::where('asamblea_id', $asamblea_id)->count();

        // Consensos activos
        $consenso_asa = AsaConsenso::where('asamblea_id', $asamblea_id)
            ->where('estado', 'A')
            ->count();

        // Mesas con consenso
        $mesas = AsaMesas::whereHas('consenso', function($query) use ($asamblea_id) {
                $query->where('asamblea_id', $asamblea_id);
            })->count();

        // Detalles del consenso y mesas
        $consenso_detalle = '0';
        $mesas_asa = 0;
        
        if ($consenso_asa > 0) {
            $masaconsenso = AsaConsenso::where('asamblea_id', $asamblea_id)
                ->where('estado', 'A')
                ->first();
            
            if ($masaconsenso) {
                $consenso_detalle = $masaconsenso->detalle;
                $mesas_asa = AsaMesas::where('consenso_id', $masaconsenso->id)->count();
            }
        }

        return [
            'cont_usuarios_asa' => $usuarios_asa,
            'cont_consensos' => $consenso_asa,
            'cont_mesas' => $mesas,
            'consenso_asa_detalle' => $consenso_detalle,
            'cont_mesas_asa' => $mesas_asa,
        ];
    }

    /**
     * Obtener datos del dashboard en formato JSON (para AJAX)
     */
    public function dashboardData()
    {
        try {
            $asamblea_activa = AsaAsamblea::where('estado', 'A')->first();
            if (!$asamblea_activa) {
                throw new Exception("No hay asamblea activa", 404);
            }
            $asamblea_id = $asamblea_activa->id;

            $estadisticas = $this->getEstadisticasPrincipales($asamblea_id);
            $estadisticas_detalladas = $this->getEstadisticasDetalladas($asamblea_id);
            $datos_adicionales = $this->getDatosAdicionales($asamblea_id);

            return response()->json([
                'success' => true,
                'asamblea_activa' => $asamblea_activa->toArray(),
                'estadisticas' => $estadisticas,
                'estadisticas_detalladas' => $estadisticas_detalladas,
                'datos_adicionales' => $datos_adicionales,
                'ultima_actualizacion' => now()->format('Y-m-d H:i:s')
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener gráfico de progreso de quorum
     */
    public function graficoQuorum()
    {
        try {
            $asamblea_activa = AsaAsamblea::where('estado', 'A')->first();
            if (!$asamblea_activa) {
                throw new Exception("No hay asamblea activa", 404);
            }
            $asamblea_id = $asamblea_activa->id;

            // Datos para gráfico de quorum
            $total_empresas = Empresas::where('asamblea_id', $asamblea_id)->count();
            $empresas_con_ingreso = RegistroIngresos::where('asamblea_id', $asamblea_id)
                ->where('estado', 'A')->count();
            $empresas_pendientes = RegistroIngresos::where('asamblea_id', $asamblea_id)
                ->where('estado', 'P')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_empresas' => $total_empresas,
                    'con_ingreso' => $empresas_con_ingreso,
                    'pendientes' => $empresas_pendientes,
                    'porcentaje_quorum' => $total_empresas > 0 ? 
                        round(($empresas_con_ingreso / $total_empresas) * 100, 2) : 0
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener gráfico de poderes
     */
    public function graficoPoderes()
    {
        try {
            $asamblea_activa = AsaAsamblea::where('estado', 'A')->first();
            if (!$asamblea_activa) {
                throw new Exception("No hay asamblea activa", 404);
            }
            $asamblea_id = $asamblea_activa->id;

            $poderes_activos = Poderes::where('asamblea_id', $asamblea_id)
                ->where('estado', 'A')->count();
            $poderes_rechazados = Poderes::where('asamblea_id', $asamblea_id)
                ->where('estado', '<>', 'A')->count();
            $poderes_quorum = DB::table('poderes')
                ->where('asamblea_id', $asamblea_id)
                ->where('estado', 'A')
                ->whereIn('nit1', function($query) use ($asamblea_id) {
                    $query->select('nit')
                        ->from('registro_ingresos')
                        ->where('asamblea_id', $asamblea_id)
                        ->where('estado', 'A');
                })
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'activos' => $poderes_activos,
                    'rechazados' => $poderes_rechazados,
                    'quorum' => $poderes_quorum,
                    'sin_quorum' => $poderes_activos - $poderes_quorum
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener actividades recientes
     */
    public function actividadesRecientes()
    {
        try {
            $asamblea_activa = AsaAsamblea::where('estado', 'A')->first();
            if (!$asamblea_activa) {
                throw new Exception("No hay asamblea activa", 404);
            }
            $asamblea_id = $asamblea_activa->id;

            // Últimos ingresos registrados
            $ultimos_ingresos = DB::table('registro_ingresos as rgi')
                ->join('empresas as e', 'e.nit', '=', 'rgi.nit')
                ->where('rgi.asamblea_id', $asamblea_id)
                ->orderBy('rgi.created_at', 'desc')
                ->limit(5)
                ->select([
                    'rgi.fecha',
                    'rgi.hora',
                    'e.razsoc',
                    'rgi.estado',
                    'rgi.cedula_representa'
                ])
                ->get();

            // Últimos representantes creados
            $ultimos_representantes = AsaRepresentantes::where('asamblea_id', $asamblea_id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(['nombre', 'cedrep', 'created_at']);

            return response()->json([
                'success' => true,
                'ultimos_ingresos' => $ultimos_ingresos,
                'ultimos_representantes' => $ultimos_representantes
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener resumen de estados
     */
    public function resumenEstados()
    {
        try {
            $asamblea_activa = AsaAsamblea::where('estado', 'A')->first();
            if (!$asamblea_activa) {
                throw new Exception("No hay asamblea activa", 404);
            }
            $asamblea_id = $asamblea_activa->id;

            // Resumen de estados de ingresos
            $estados_ingresos = DB::table('registro_ingresos')
                ->where('asamblea_id', $asamblea_id)
                ->selectRaw('estado, COUNT(*) as cantidad')
                ->groupBy('estado')
                ->get();

            // Resumen de estados de poderes
            $estados_poderes = DB::table('poderes')
                ->where('asamblea_id', $asamblea_id)
                ->selectRaw('estado, COUNT(*) as cantidad')
                ->groupBy('estado')
                ->get();

            return response()->json([
                'success' => true,
                'estados_ingresos' => $estados_ingresos,
                'estados_poderes' => $estados_poderes
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
}
