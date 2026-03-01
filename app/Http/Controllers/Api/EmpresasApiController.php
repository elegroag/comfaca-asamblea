<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empresas;
use App\Models\RegistroIngresos;
use App\Models\Poderes;
use App\Models\AsaRepresentantes;
use App\Models\AsaCorreos;
use App\Services\Asamblea\AsambleaService;
use App\Services\Novedades\RevocarPoderService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EmpresasApiController extends Controller
{
    protected $production = false;
    protected $disponibilidad = false;
    protected $linea_atencion = "3502899183 - 3208000595";
    protected $email_atencion = "actualizacion@comfaca.com";
    protected $direccion_atencion = "";
    protected $detalle_asamblea = "Asamblea del día 24 de Febrero de 2023";
    protected $soporte_sistemas = "soporte_sistemas@comfaca.com";
    protected $asistencias = 100;
    protected $email_pruebas = "maxedwwin@gmail.com";

    private $email_asamblea;
    private $email_asamblea_clave;
    protected $idAsamblea;

    public function __construct()
    {
        $this->idAsamblea = AsambleaService::getAsambleaActiva();
    }

    /**
     * Verificar si el usuario está autenticado
     */
    protected function verificarAutenticacion()
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'msj' => 'Usuario no autenticado'
            ], 401);
        }
        return null;
    }


    /**
     * Editar empresa (AJAX)
     */
    public function editar(Request $request, $nit): JsonResponse
    {
        $autenticacionCheck = $this->verificarAutenticacion();
        if ($autenticacionCheck) return $autenticacionCheck;

        $cedrep = Auth::user()->cedtra ?? null;
        if (!$cedrep) {
            return response()->json([
                'success' => false,
                'msj' => 'Usuario no autenticado'
            ], 401);
        }

        try {
            $error = 0;
            $empresa = Empresas::where('nit', $nit)
                ->where('cedrep', $cedrep)
                ->first();

            if (!$empresa) {
                return response()->json([
                    'success' => false,
                    'msj' => "No es posible hacer la inscripción a la {$this->detalle_asamblea}.\n La empresa no está disponible para su inscripción. Gracias",
                    'table' => $this->loadTable($this->idAsamblea, $cedrep)
                ]);
            }

            $razsoc = Str::title($empresa->razsoc);
            $cedrep = $empresa->cedrep;
            $repleg = Str::title($empresa->repleg);

            $email = $request->input('email');
            $telefono = $request->input('telefono');
            $confirmar = $request->input('confirmar');
            $ingreso = $request->input('ingreso');

            $rqs = DB::table('registro_ingresos')
                ->select(DB::raw('DISTINCT cedrep, count(*) as cantidad'))
                ->join('empresas', 'empresas.nit', '=', 'registro_ingresos.nit')
                ->where('registro_ingresos.nit', '!=', $nit)
                ->where('tipo_ingreso', 'P')
                ->where('asamblea_id', $this->idAsamblea)
                ->first();

            $tipo_ingreso = "V";
            $tipo_asistencia = "Virtual";

            if ($rqs->cantidad < 100) {
                if ($ingreso == '1') {
                    $tipo_asistencia = "Presencial";
                    $tipo_ingreso = "P";
                }
            }

            $empresasl = Empresas::where('nit', $nit)
                ->where('asamblea_id', $this->idAsamblea)
                ->first();

            if (!$empresasl) {
                return response()->json([
                    'success' => false,
                    'msj' => "No es posible hacer la inscripción a la {$this->detalle_asamblea}.\n La empresa no está disponible para su inscripción. Gracias",
                    'table' => $this->loadTable($this->idAsamblea, $cedrep)
                ]);
            }

            $registro_ingresos = RegistroIngresos::where('nit', $nit)
                ->where('asamblea_id', $this->idAsamblea)
                ->first();

            $estado = ($confirmar == 1) ? "P" : "C";

            // Validar empresa no activa
            if ($empresa->estado == "I") {
                return response()->json([
                    'success' => false,
                    'msj' => "La empresa {$razsoc} no está disponible para la {$this->detalle_asamblea}.",
                    'table' => $this->loadTable($this->idAsamblea, $cedrep)
                ]);
            }

            // Si ya está registrada, actualiza los datos
            if ($registro_ingresos) {
                if ($this->production) {
                    $empresa->update([
                        'email' => $email,
                        'telefono' => $telefono
                    ]);
                }
                $voto = ($estado == 'C') ? '0' : '1';

                $res = $registro_ingresos->update([
                    'estado' => $estado,
                    'votos' => $voto,
                    'tipo_ingreso' => $tipo_ingreso
                ]);

                if ($res) {
                    $msj = $this->generarMensajeInscripcion($estado, $email, $tipo_asistencia, $razsoc);

                    $this->enviarNotificacionInscripcion($estado, $razsoc, $nit, $repleg, $email);
                }

                $table = $this->loadTable($this->idAsamblea, $cedrep);
                return response()->json([
                    'success' => ($error == 0),
                    'msj' => $msj,
                    'table' => $table
                ]);
            } else {
                // Nueva inscripción
                if ($this->production) {
                    $empresa->update([
                        'email' => $email,
                        'telefono' => $telefono
                    ]);
                }

                $last_registro_ingresos = DB::table('registro_ingresos')
                    ->max('documento') ?? 0;
                $voto = ($estado == 'C') ? '0' : '1';

                $registro_ingresos = RegistroIngresos::create([
                    'documento' => $last_registro_ingresos + 1,
                    'nit' => $nit,
                    'estado' => $estado,
                    'fecha' => now()->format('Y-m-d'),
                    'hora' => now()->format('H:i:s'),
                    'usuario' => 1,
                    'votos' => $voto,
                    'mesa_id' => 0,
                    'asamblea_id' => $this->idAsamblea,
                    'tipo_ingreso' => $tipo_ingreso
                ]);

                if ($registro_ingresos) {
                    $msj = $this->generarMensajeInscripcion($estado, $email, $tipo_asistencia, $razsoc, true);

                    $this->enviarNotificacionInscripcion($estado, $razsoc, $nit, $repleg, $email);
                } else {
                    $error++;
                    $msj = "No es posible hacer el ingreso.\nComuníquese con soporte_sistemas@comfaca.com para más información. Gracias";
                }

                $table = $this->loadTable($this->idAsamblea, $cedrep);
                return response()->json([
                    'success' => ($error == 0),
                    'msj' => $msj,
                    'table' => $table
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error al editar empresa: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al procesar la solicitud'
            ], 500);
        }
    }

    /**
     * Generar mensaje de inscripción
     */
    private function generarMensajeInscripcion($estado, $email, $tipo_asistencia, $razsoc, $nueva = false)
    {
        if ($estado == 'C') {
            $base_msg = $nueva
                ? "Los datos se actualizaron de forma correcta para la empresa {$razsoc}. Por parte del representante."
                : "La inscripción a la {$this->detalle_asamblea}. Se cancela por parte del representante de forma correcta.";

            return $base_msg .
                "\nEl sistema ha emitido un mensaje email a la dirección {$email}. Para confirmar su acción." .
                "\nGracias por su participación.";
        } else {
            $base_msg = $nueva
                ? "La inscripción a la {$this->detalle_asamblea}. Se realizó de forma correcta para la empresa {$razsoc}."
                : "La inscripción a la {$this->detalle_asamblea}. Se activa de forma correcta.";

            return $base_msg .
                "\nEl sistema ha emitido un mensaje email a la dirección {$email}. Para confirmar su registro." .
                "\nSu asistencia se establece {$tipo_asistencia}, en consideración de los cupos disponibles." .
                "\nLa inscripción queda sujeta de verificación por validación de aportes." .
                "\nGracias por su participación.";
        }
    }

    /**
     * Enviar notificación de inscripción
     */
    private function enviarNotificacionInscripcion($estado, $razsoc, $nit, $repleg, $email)
    {
        try {
            $this->buscarCorreoDisponible();

            $notify = $this->generarMensajeNotificacion($estado, $razsoc, $nit);

            $mensaje = View::make('empresas.tmp.mail_invitacion', [
                'repleg' => $repleg,
                'assets' => "https://comfacaenlinea.com/public/",
                'mode' => "inline",
                'msj' => $notify
            ])->render();

            $empresa = [
                'email' => $email,
                'repleg' => $repleg,
                'nombre' => $repleg
            ];

            $nota = $this->generarAsuntoNotificacion($estado);
            $this->sendEmail($nota, $mensaje, [$empresa]);
        } catch (\Exception $e) {
            Log::error('Error al enviar notificación: ' . $e->getMessage());
        }
    }

    /**
     * Generar mensaje de notificación
     */
    private function generarMensajeNotificacion($estado, $razsoc, $nit)
    {
        if ($estado == 'A') {
            return "El Sistema Asamblea de la Caja de Compensación Familiar COMFACA. Informa que la empresa " .
                Str::title($razsoc) . " con NIT. {$nit} ha completado el proceso de inscripción para el ingreso a la {$this->detalle_asamblea}.";
        } elseif ($estado == 'P') {
            return "El Sistema Asamblea de la Caja de Compensación Familiar COMFACA. Informa que la empresa " .
                Str::title($razsoc) . " con NIT. {$nit} ha completado el proceso de inscripción para el ingreso a la {$this->detalle_asamblea}.\n" .
                " La inscripción queda sujeta de verificación por validación de aportes.";
        } elseif ($estado == 'C') {
            return "El Sistema Asamblea de la Caja de Compensación Familiar COMFACA. Informa que la empresa " .
                Str::title($razsoc) . " con NIT. {$nit} ha completado la solicitud de actualización de datos. Y ha cancelado la inscripción a la {$this->detalle_asamblea}";
        } else {
            return "El Sistema Asamblea de la Caja de Compensación Familiar COMFACA. Informa que la empresa " .
                Str::title($razsoc) . " con NIT. {$nit} ha completado la solicitud de actualización de datos.";
        }
    }

    /**
     * Generar asunto de notificación
     */
    private function generarAsuntoNotificacion($estado)
    {
        if ($estado == 'A' || $estado == 'P') {
            return "Inscripción exitosa para la {$this->detalle_asamblea}";
        } elseif ($estado == 'C') {
            return "Cancelación de inscripción para la {$this->detalle_asamblea}";
        } else {
            return "Inscripción confirmada para la {$this->detalle_asamblea}";
        }
    }

    /**
     * Enviar email
     */
    private function sendEmail($asunto, $mensaje, $destinatarios)
    {
        try {
            $this->buscarCorreoDisponible();

            // Configuración de correo (usando Laravel Mail)
            foreach ($destinatarios as $destinatario) {
                $emailDestino = $this->production ? $destinatario['email'] : $this->email_pruebas;

                Mail::raw($mensaje, function ($message) use ($asunto, $emailDestino, $destinatario) {
                    $message->to($emailDestino, $destinatario['repleg'])
                        ->subject($asunto)
                        ->from($this->email_asamblea, 'Sistema Asamblea COMFACA');
                });
            }

            $this->agregarEnvio($this->email_asamblea);
        } catch (\Exception $e) {
            Log::error('Error al enviar email: ' . $e->getMessage());
        }
    }

    /**
     * Cargar tabla de empresas
     */
    private function loadTable($asamblea_id, $cedrep)
    {
        $empresas = DB::table('empresas')
            ->select(
                'telefono',
                'cedrep',
                'repleg',
                DB::raw("'A' as estado"),
                'email',
                'nit',
                'razsoc',
                DB::raw("1 as 'empresasl'"),
                DB::raw("'Activo' as 'estado_detalle'"),
                DB::raw("(SELECT count(registro_ingresos.nit)
                    FROM registro_ingresos WHERE registro_ingresos.nit = empresas.nit AND registro_ingresos.asamblea_id='{$asamblea_id}') as 'has_asistencia'"),
                DB::raw("(SELECT registro_ingresos.estado
                    FROM registro_ingresos WHERE registro_ingresos.nit = empresas.nit AND registro_ingresos.asamblea_id='{$asamblea_id}') as 'estado_asistencia'"),
                DB::raw("(SELECT count(poderes.documento) FROM poderes
                    WHERE poderes.nit2 = empresas.nit AND poderes.estado='A' AND poderes.asamblea_id='{$asamblea_id}') as 'is_poderdante'")
            )
            ->where('empresas.cedrep', $cedrep)
            ->get();

        return View::make('empresas.tmp.table', ['empresas' => $empresas])->render();
    }

    /**
     * Cargar poderes como poderdante
     */
    private function loadPoderesPoderdante($cedrep)
    {
        $poderesPoderdante = DB::table('poderes')
            ->select(
                'poderes.*',
                DB::raw("(CASE WHEN estado = 'A' THEN 'Aprobado' WHEN estado = 'R' THEN 'Revocado' ELSE 'Rechazado' END) as 'estado_detalle'")
            )
            ->where('cedrep2', $cedrep)
            ->where('poderes.asamblea_id', $this->idAsamblea)
            ->get();

        return View::make('empresas.tmp.poderes_poderdante', ['poderes_poderdante' => $poderesPoderdante])->render();
    }

    /**
     * Cargar poderes como apoderado
     */
    private function loadPoderesApoderado($cedrep)
    {
        $poderesApoderado = DB::table('poderes')
            ->select(
                'poderes.*',
                DB::raw("(CASE WHEN estado = 'A' THEN 'Aprobado' WHEN estado = 'R' THEN 'Revocado' ELSE 'Rechazado' END) as 'estado_detalle'")
            )
            ->where('cedrep1', $cedrep)
            ->where('estado', 'A')
            ->where('poderes.asamblea_id', $this->idAsamblea)
            ->get();

        return View::make('empresas.tmp.poderes_apoderado', ['poderes_apoderado' => $poderesApoderado])->render();
    }

    /**
     * Revocar poder (AJAX)
     */
    public function revocar(Request $request, $documento): JsonResponse
    {
        $autenticacionCheck = $this->verificarAutenticacion();
        if ($autenticacionCheck) return $autenticacionCheck;

        $cedrep = Auth::user()->cedtra ?? null;
        if (!$cedrep) {
            return response()->json([
                'success' => false,
                'msj' => 'Usuario no autenticado'
            ], 401);
        }

        try {
            $motivo = $request->input('motivo');
            $poderPoderdante = DB::table('poderes')
                ->where('estado', 'A')
                ->where('cedrep2', $cedrep)
                ->where('documento', $documento)
                ->where('asamblea_id', $this->idAsamblea)
                ->first();

            $error = "";
            if (!$poderPoderdante) {
                $error = "No se encuentra el poder con los criterios dados.";
            } else {
                // Revocar el poder directamente
                $resultado = DB::table('poderes')
                    ->where('documento', $documento)
                    ->where('asamblea_id', $this->idAsamblea)
                    ->update([
                        'estado' => 'R',
                        'notificacion' => $motivo
                    ]);

                if (!$resultado) {
                    $error = "No se pudo revocar el poder";
                } else {
                    // Enviar correo al apoderado
                    $nit = $poderPoderdante->nit1;
                    $empresa = Empresas::where('nit', $nit)->first();

                    if ($empresa) {
                        $empresaData = [
                            'nit' => $empresa->nit,
                            'email' => $empresa->email,
                            'repleg' => $empresa->repleg,
                            'nombre' => $empresa->repleg,
                            'razsoc' => $empresa->razsoc,
                            'assets' => "https://comfacaenlinea.com/public/",
                            'mode' => "inline"
                        ];

                        $mensaje = View::make('empresas.tmp.mail_revoca_poderdante', $empresaData)->render();
                        $this->sendEmail("Notificación Caja de Compensación Familiar COMFACA", $mensaje, [$empresaData]);
                    }
                }
            }

            $table = $this->loadTable($this->idAsamblea, $cedrep);
            $tablePoderesPoderdante = $this->loadPoderesPoderdante($cedrep);

            return response()->json([
                'success' => ($error == ''),
                'msj' => ($error == '') ? "El proceso de revocación se completó con éxito." : $error,
                'tb_empresas' => $table,
                'tb_poderes_poderdante' => $tablePoderesPoderdante
            ]);
        } catch (\Exception $e) {
            Log::error('Error al revocar poder: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al procesar la revocación'
            ], 500);
        }
    }

    /**
     * Obtener detalle de poder (AJAX)
     */
    public function poder($documento): JsonResponse
    {
        $autenticacionCheck = $this->verificarAutenticacion();
        if ($autenticacionCheck) return $autenticacionCheck;

        $cedrep = Auth::user()->cedtra ?? null;
        if (!$cedrep) {
            return response()->json([
                'success' => false,
                'msj' => 'Usuario no autenticado'
            ], 401);
        }

        try {
            $poder = DB::table('poderes')
                ->select(
                    'poderes.*',
                    DB::raw("(CASE WHEN estado = 'A' THEN 'Aprobado' WHEN estado = 'R' THEN 'Revocado' ELSE 'Rechazado' END) as 'estado_detalle'")
                )
                ->where('cedrep2', $cedrep)
                ->where('documento', $documento)
                ->where('poderes.asamblea_id', $this->idAsamblea)
                ->first();

            return response()->json(['poder' => $poder]);
        } catch (\Exception $e) {
            Log::error('Error al obtener poder: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al obtener el poder'
            ], 500);
        }
    }


    /**
     * Revocar poder como apoderado (AJAX)
     */
    public function revoca_apoderado(Request $request, $documento): JsonResponse
    {
        $autenticacionCheck = $this->verificarAutenticacion();
        if ($autenticacionCheck) return $autenticacionCheck;

        $cedrep = Auth::user()->cedtra ?? null;
        if (!$cedrep) {
            return response()->json([
                'success' => false,
                'msj' => 'Usuario no autenticado'
            ], 401);
        }

        try {
            $poderApoderado = DB::table('poderes')
                ->where('estado', 'A')
                ->where('cedrep1', $cedrep)
                ->where('documento', $documento)
                ->where('asamblea_id', $this->idAsamblea)
                ->first();

            $error = "";
            if (!$poderApoderado) {
                $error = "No se encuentra el poder con los criterios dados.";
            } else {
                $motivo = "El poder ha sido revocado por gestión del mismo apoderado responsable.";

                // Revocar el poder directamente
                $resultado = DB::table('poderes')
                    ->where('documento', $documento)
                    ->where('asamblea_id', $this->idAsamblea)
                    ->update([
                        'estado' => 'R',
                        'notificacion' => $motivo
                    ]);

                if (!$resultado) {
                    $error = "No se pudo revocar el poder";
                } else {
                    // Enviar correo al poderdante
                    $nit = $poderApoderado->nit2;
                    $empresa = Empresas::where('nit', $nit)->first();

                    if ($empresa) {
                        $empresaData = [
                            'nit' => $empresa->nit,
                            'email' => $empresa->email,
                            'repleg' => $empresa->repleg,
                            'nombre' => $empresa->repleg,
                            'razsoc' => $empresa->razsoc,
                            'assets' => "https://comfacaenlinea.com/public/",
                            'mode' => "inline"
                        ];

                        $mensaje = View::make('empresas.tmp.mail_revoca_apoderado', $empresaData)->render();
                        $this->sendEmail("Notificación Caja de Compensación Familiar COMFACA", $mensaje, [$empresaData]);
                    }
                }
            }

            $table = $this->loadTable($this->idAsamblea, $cedrep);
            $tablePoderesApoderado = $this->loadPoderesApoderado($cedrep);

            return response()->json([
                'success' => ($error == ''),
                'msj' => ($error == '') ? "El proceso de revocación se completó con éxito." : $error,
                'tb_empresas' => $table,
                'tb_poderes_apoderado' => $tablePoderesApoderado
            ]);
        } catch (\Exception $e) {
            Log::error('Error al revocar poder como apoderado: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al procesar la revocación'
            ], 500);
        }
    }

    /**
     * Buscar correo disponible
     */
    private function buscarCorreoDisponible()
    {
        $correo = AsaCorreos::where('estado', 'A')
            ->where('asamblea_id', $this->idAsamblea)
            ->orderBy('envios', 'asc')
            ->first();

        if ($correo) {
            $this->email_asamblea = $correo->email;
            $this->email_asamblea_clave = $correo->clave;
        }
    }

    /**
     * Agregar envío al contador
     */
    private function agregarEnvio($email)
    {
        $correo = AsaCorreos::where('email', $email)->first();
        if ($correo) {
            $correo->update(['envios' => $correo->envios + 1]);
        }
    }

    /**
     * Obtener resumen de empresas del representante
     */
    public function resumen(): JsonResponse
    {
        $autenticacionCheck = $this->verificarAutenticacion();
        if ($autenticacionCheck) return $autenticacionCheck;

        $cedrep = Auth::user()->cedtra ?? null;
        if (!$cedrep) {
            return response()->json([
                'success' => false,
                'msj' => 'Usuario no autenticado'
            ], 401);
        }

        try {
            $empresas = DB::table('empresas')
                ->where('cedrep', $cedrep)
                ->count();

            $inscripciones = DB::table('registro_ingresos')
                ->join('empresas', 'empresas.nit', '=', 'registro_ingresos.nit')
                ->where('empresas.cedrep', $cedrep)
                ->where('registro_ingresos.asamblea_id', $this->idAsamblea)
                ->count();

            $poderesPoderdante = DB::table('poderes')
                ->where('cedrep2', $cedrep)
                ->where('asamblea_id', $this->idAsamblea)
                ->count();

            $poderesApoderado = DB::table('poderes')
                ->where('cedrep1', $cedrep)
                ->where('estado', 'A')
                ->where('asamblea_id', $this->idAsamblea)
                ->count();

            return response()->json([
                'success' => true,
                'empresas' => $empresas,
                'inscripciones' => $inscripciones,
                'poderes_poderdante' => $poderesPoderdante,
                'poderes_apoderado' => $poderesApoderado
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener resumen: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'msj' => 'Error al obtener el resumen'
            ], 500);
        }
    }

    /**
     * Validar disponibilidad del sistema
     */
    public function verificar_disponibilidad(): JsonResponse
    {
        return response()->json([
            'disponible' => $this->disponibilidad,
            'linea_atencion' => $this->linea_atencion,
            'email_atencion' => $this->email_atencion,
            'soporte_sistemas' => $this->soporte_sistemas
        ]);
    }
}
