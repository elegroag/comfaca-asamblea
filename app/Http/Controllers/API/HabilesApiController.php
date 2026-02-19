<?php

namespace App\Http\Controllers;

use App\Models\AsaAsamblea;
use App\Models\AsaMesas;
use App\Models\AsaRepresentantes;
use App\Models\Carteras;
use App\Models\Empresas;
use App\Models\Poderes;
use App\Models\RegistroIngresos;
use App\Models\Rechazos;
use App\Services\Asamblea\AsambleaService;
use App\Services\AsistenciaService;
use App\Services\Carteras\CarteraReportarService;
use App\Services\Empresas\BuscarEmpresaService;
use App\Services\Empresas\HabilEmpresaService;
use App\Services\RepresentanteService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class HabilesApiController extends Controller
{
    private int $idAsamblea = 0;
    private int $itemMenuSidebar = 3;

    public function __construct(private readonly AsambleaService $asambleaService)
    {
        $this->middleware('api.auth');
        $this->middleware(function ($request, $next) {
            $this->idAsamblea = (int) $this->asambleaService->getAsambleaActiva();
            return $next($request);
        });
    }


    public function saveEmpresaHabil(Request $request): JsonResponse
    {
        try {
            $cedrep = trim((string) $request->input('cedrep'));
            $nit = trim((string) $request->input('nit'));
            $razsoc = trim((string) $request->input('razsoc'));
            $telefono = trim((string) $request->input('telefono', ''));
            $email = trim((string) $request->input('email', ''));
            $repleg = trim((string) $request->input('repleg'));
            $cruzarCartera = (int) $request->input('cruzar_cartera', 0);

            if ($razsoc === '' || $cedrep === '' || $repleg === '' || $nit === '') {
                throw new Exception('Error campos requeridos para continuar', 501);
            }

            $tipoIngreso = 'P';
            $usuario = (string) (Auth::user()->usuario ?? Auth::id() ?? 1);

            $representanteService = new RepresentanteService();
            $clave = $representanteService->claveAleatoria();

            $empresaActual = Empresas::where('nit', $nit)->first();
            if ($empresaActual && (string) $empresaActual->cedrep !== $cedrep) {
                $claveExistente = DB::table('asa_representantes')
                    ->where('asamblea_id', $this->idAsamblea)
                    ->where('cedrep', (string) $empresaActual->cedrep)
                    ->max('clave_ingreso');

                if ($claveExistente) {
                    $clave = (string) $claveExistente;
                }
            }

            $representanteService->createConIngreso([
                'nombre' => $repleg,
                'cedrep' => $cedrep,
                'clave' => $clave,
                'asamblea_id' => $this->idAsamblea,
                'acepta_politicas' => 1,
                'create_at' => now()->format('Y-m-d'),
            ], [
                'representa_existente' => 0,
                'nit' => null,
                'tiene_soportes' => 0,
            ]);

            $habilEmpresaService = new HabilEmpresaService();
            $habilEmpresaService->previosCreateEmpresa([
                'cedrep' => $cedrep,
                'nit' => $nit,
                'razsoc' => $razsoc,
                'telefono' => $telefono,
                'email' => $email,
                'repleg' => $repleg,
                'usuario' => $usuario,
                'asamblea_id' => $this->idAsamblea,
            ], $cruzarCartera, 1, $tipoIngreso);

            $empresa = $habilEmpresaService->findEmpresaByNit($nit);

            $preRegistro = RegistroIngresos::where('nit', $nit)
                ->where('cedula_representa', '<>', $cedrep)
                ->first();

            if ($preRegistro) {
                $preRegistro->update([
                    'estado' => 'R',
                    'votos' => 0,
                ]);

                $rechazo = Rechazos::where('regingre_id', $preRegistro->documento)
                    ->where('criterio_id', 26)
                    ->first();

                if (!$rechazo) {
                    Rechazos::create([
                        'criterio_id' => 26,
                        'regingre_id' => $preRegistro->documento,
                        'dia' => now()->format('Y-m-d'),
                        'hora' => now()->format('H:i:s'),
                    ]);
                }
            } else {
                $preRegistro = RegistroIngresos::where('nit', $nit)
                    ->where('cedula_representa', $cedrep)
                    ->first();
            }

            return response()->json([
                'success' => true,
                'msj' => 'El registro se completo con éxito',
                'data' => $empresa ? $empresa->toArray() : null,
                'pre_registro' => $preRegistro ? $preRegistro->toArray() : null,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage(),
            ], 500);
        }
    }

    public function removeEmpresa(string $nit): JsonResponse
    {
        try {
            if ($nit === '') {
                throw new Exception('Error no hay nit de la empresa a borrar');
            }

            $habilEmpresaService = new HabilEmpresaService();
            $habilEmpresaService->removeEmpresa($nit, $this->idAsamblea);

            return response()->json([
                'success' => true,
                'msj' => 'El registro se borro con éxito',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage(),
            ], 500);
        }
    }

    public function validar(string $cedrep): JsonResponse
    {
        try {
            $empresas = DB::table('empresas')
                ->where('cedrep', $cedrep)
                ->where('asamblea_id', $this->idAsamblea)
                ->get();

            $representante = $empresas->count() > 0 ? (array) $empresas->first() : false;

            $nits = [];
            $votos = 0;
            $empresasList = [];

            foreach ($empresas as $empresa) {
                $hasAsistencia = DB::table('registro_ingresos')
                    ->where('nit', $empresa->nit)
                    ->where('asamblea_id', $this->idAsamblea)
                    ->count();

                $estadoAsistencia = DB::table('registro_ingresos')
                    ->where('nit', $empresa->nit)
                    ->where('asamblea_id', $this->idAsamblea)
                    ->value('estado');

                $item = (array) $empresa;
                $item['estado_asistencia'] = $estadoAsistencia;
                $item['has_asistencia'] = $hasAsistencia;
                $item['empresas'] = '1';

                if (($item['estado'] ?? 'A') === 'A' || ($item['estado'] ?? 'A') === 'D') {
                    if ((int) $hasAsistencia === 0) {
                        $nits[] = $empresa->nit;
                    }
                    $votos++;
                }

                $empresasList[] = $item;
            }

            $poderes = [];
            if (!empty($nits)) {
                $poderes = DB::table('poderes')
                    ->whereIn('nit1', $nits)
                    ->get()
                    ->map(fn($row) => (array) $row)
                    ->toArray();

                if (count($poderes) === 1) {
                    $votos += 1;
                }
            }

            return response()->json([
                'habiles' => count($empresasList) > 0 ? $empresasList : false,
                'representante' => $representante,
                'empresas' => $empresasList,
                'votos' => $votos,
                'poderes' => count($poderes) > 0 ? $poderes : false,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage(),
            ], 500);
        }
    }

    public function crear_ingreso(Request $request): JsonResponse
    {
        try {
            $fecha = now()->format('Y-m-d');
            $hora = now()->format('H:i:s');
            $cedrep = trim((string) $request->input('cedrep'));
            $hasPoderes = (int) $request->input('has_poderes', 0);
            $nitPoder = trim((string) $request->input('nit_poder', ''));
            $nitApoderado = trim((string) $request->input('apoderado', ''));
            $radicado = trim((string) $request->input('radicado', ''));

            [$mesaDisponible, $codigoMesaDisponible] = $this->mesaDisponible($this->idAsamblea);
            $usuario = (string) (Auth::user()->usuario ?? Auth::id() ?? 1);

            $empresas = DB::table('empresas')
                ->where('cedrep', $cedrep)
                ->where('asamblea_id', $this->idAsamblea)
                ->get()
                ->map(fn($row) => (array) $row)
                ->toArray();

            $empresasIngreso = $empresas;
            $asistentes = [];
            $intentoDuplicados = [];
            $errors = [];
            $poderCreado = false;
            $apoderado = false;

            if (!empty($empresas) && $nitApoderado !== '') {
                foreach ($empresas as $empresa) {
                    if ((string) $empresa['nit'] === $nitApoderado) {
                        $apoderado = $empresa;
                        break;
                    }
                }
            }

            $poderPrevius = DB::selectOne(
                "SELECT poderes.*,
                (SELECT count(registro_ingresos.documento) FROM registro_ingresos WHERE registro_ingresos.nit = poderes.nit2) as posee_ya_registro
                FROM poderes
                WHERE cedrep1=? AND poderes.asamblea_id=? LIMIT 1",
                [$cedrep, $this->idAsamblea]
            );

            if ($poderPrevius && isset($poderPrevius->nit2)) {
                if ((int) $poderPrevius->posee_ya_registro === 0) {
                    $poderEmpresa = DB::table('empresas')->where('nit', $poderPrevius->nit2)->first();
                    if ($poderEmpresa) {
                        $empresasIngreso[] = (array) $poderEmpresa;
                    }
                } else {
                    $errors[] = "El poder {$poderPrevius->nit2} ya se encuentra ingresado en el consenso.";
                }
            }

            if ($hasPoderes === 1 && $apoderado !== false && $nitPoder !== '') {
                $poderdante = DB::selectOne(
                    "SELECT empresas.*, (SELECT count(*) FROM poderes WHERE poderes.nit2=?) as poder_ya_ocupado
                     FROM empresas WHERE empresas.nit=? LIMIT 1",
                    [$nitPoder, $nitPoder]
                );

                if ($poderdante && (int) $poderdante->poder_ya_ocupado === 0) {
                    $empresasIngreso[] = (array) $poderdante;

                    $lastDoc = (int) (DB::table('poderes')->max('documento') ?? 0);
                    $poderInsert = [
                        'documento' => (string) ($lastDoc + 1),
                        'fecha' => $fecha,
                        'nit1' => $apoderado['nit'],
                        'nit2' => $poderdante->nit,
                        'razsoc1' => $apoderado['razsoc'] ?? '',
                        'razsoc2' => $poderdante->razsoc ?? '',
                        'estado' => 'A',
                        'radicado' => $radicado,
                        'cedrep1' => $apoderado['cedrep'] ?? '',
                        'cedrep2' => $poderdante->cedrep ?? '',
                        'repleg1' => $apoderado['repleg'] ?? '',
                        'repleg2' => $poderdante->repleg ?? '',
                        'asamblea_id' => $this->idAsamblea,
                    ];

                    DB::table('poderes')->insert($poderInsert);
                    $poderCreado = $poderInsert;
                } else {
                    $errors[] = "El poder no se puede aplicar {$nitPoder}. No cumple con las condiciones requeridas.";
                }
            }

            $votosMesaNuevos = 0;
            foreach ($empresasIngreso as $empresa) {
                $nit = (string) ($empresa['nit'] ?? '');
                $cedEmpresa = (string) ($empresa['cedrep'] ?? '');
                $repEmpresa = (string) ($empresa['repleg'] ?? '');
                if ($nit === '') {
                    continue;
                }

                $existeRegistro = DB::table('registro_ingresos')
                    ->where('nit', $nit)
                    ->where('asamblea_id', $this->idAsamblea)
                    ->count();

                $documento = (int) (DB::table('registro_ingresos')->max('documento') ?? 0) + 1;
                $asistente = [
                    'fecha' => $fecha,
                    'hora' => $hora,
                    'nit' => $nit,
                    'usuario' => $usuario,
                    'asamblea_id' => $this->idAsamblea,
                    'estado' => 'A',
                    'votos' => 1,
                    'mesa_id' => $mesaDisponible,
                    'documento' => (string) $documento,
                    'cedula_representa' => $cedEmpresa,
                    'nombre_representa' => $repEmpresa,
                ];

                if ((int) $existeRegistro === 0) {
                    DB::table('registro_ingresos')->insert($asistente);
                    $asistentes[] = $asistente;
                    $votosMesaNuevos++;
                } else {
                    $intentoDuplicados[] = $asistente;
                    $errors[] = "La empresa con nit {$nit} ya fue ingresada a la asamblea.";
                }
            }

            if ($mesaDisponible > 0) {
                $mesa = AsaMesas::find($mesaDisponible);
                if ($mesa) {
                    $mesa->cantidad_votantes = (int) $mesa->cantidad_votantes + $votosMesaNuevos;
                    $mesa->save();
                }
            }

            return response()->json([
                'mesa' => $codigoMesaDisponible,
                'empresasles' => $empresasIngreso,
                'asistentes' => $asistentes,
                'poder' => $poderCreado,
                'apoderado' => $apoderado,
                'intento_duplicados' => $intentoDuplicados,
                'errors' => $errors,
                'msj' => count($errors) === 0
                    ? 'El proceso de ingreso se completo con éxito.'
                    : "El proceso se completo. Pero se generaron novedades de error. Requiere de validar los datos de las empresas.",
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 500,
                'msj' => $e->getMessage(),
            ], 500);
        }
    }

    public function empresas_apoderadas(string $cedrep): JsonResponse
    {
        try {
            $empresas = DB::table('empresas')
                ->select([
                    'nit',
                    'direccion',
                    'email',
                    'razsoc',
                    'repleg',
                    DB::raw("(SELECT COUNT(registro_ingresos.documento) FROM registro_ingresos WHERE registro_ingresos.nit=empresas.nit AND registro_ingresos.asamblea_id='{$this->idAsamblea}' LIMIT 1) as has_asitenecia"),
                ])
                ->where('cedrep', '<>', $cedrep)
                ->get();

            $empresasHabiles = DB::table('empresas')
                ->where('asamblea_id', $this->idAsamblea)
                ->pluck('nit')
                ->toArray();

            $out = [];
            foreach ($empresas as $empresa) {
                if (in_array($empresa->nit, $empresasHabiles, true) && (int) $empresa->has_asitenecia === 0) {
                    $out[] = (array) $empresa;
                }
            }

            return response()->json($out);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage(),
            ], 500);
        }
    }

    public function ficha(Request $request): JsonResponse
    {
        try {
            $cedrep = (string) $request->input('cedrep');
            $asistenciaService = new AsistenciaService($this->idAsamblea, $cedrep);
            $salida = $asistenciaService->fichaData();

            $cedtraTrabajador = (string) (Auth::user()->cedtra ?? '');

            foreach ($salida['empresas'] as $i => $row) {
                if ((string) ($row['mesa_id'] ?? '0') === '0' && $cedtraTrabajador !== '') {
                    $mesa = DB::table('asa_mesas')
                        ->where('cedtra_responsable', $cedtraTrabajador)
                        ->first();

                    if ($mesa) {
                        DB::table('registro_ingresos')
                            ->where('nit', $row['nit'])
                            ->where('cedula_representa', $cedrep)
                            ->update(['mesa_id' => $mesa->id]);

                        $salida['empresas'][$i]['mesa_id'] = $mesa->id;
                    }
                }

                $salida['empresas'][$i]['asistente_estado'] = $row['asistente_estado'] ?? 'R';
            }

            return response()->json($salida);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage(),
            ], 500);
        }
    }

    public function buscar_empresa(string $nit): JsonResponse
    {
        try {
            $service = new BuscarEmpresaService($this->idAsamblea, $nit);
            $data = $service->findByNit();

            return response()->json([
                ...$data,
                'success' => true,
                'msj' => 'Consulta Ok',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage(),
            ], 500);
        }
    }

    public function listar(): JsonResponse
    {
        try {
            $empresas = DB::table('empresas')
                ->select('*', DB::raw("'A' as detalle_estado"))
                ->where('asamblea_id', $this->idAsamblea)
                ->get();

            return response()->json([
                'success' => true,
                'empresas' => $empresas,
                'msj' => 'Consulta ok',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage(),
            ], 500);
        }
    }

    public function imprimir2_ficha(string $cedrep)
    {
        try {
            $asistenciaService = new AsistenciaService($this->idAsamblea, $cedrep);
            $salida = $asistenciaService->fichaData();
            return view('recepcion.imprimir', $salida);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage(),
            ], 500);
        }
    }

    public function cargue_masivo(Request $request): JsonResponse
    {
        try {
            $cruzarCartera = (int) $request->input('cruzar_cartera', 0);
            $file = $request->file('file');

            if (!$file) {
                throw new Exception('No se ha proporcionado un archivo');
            }

            $path = $file->storeAs('temp', $file->getClientOriginalName());
            $absolutePath = storage_path('app/' . $path);

            $headers = [];
            $filas = 0;
            $creados = 0;
            $noValidas = [];
            $fallidos = [];
            $cruzados = [];
            $duplicados = [];

            $fdata = fopen($absolutePath, 'rb');
            if ($fdata) {
                $ai = 0;
                while (!feof($fdata)) {
                    $line = fgets($fdata);
                    $line = str_replace(["\n", "\t"], ['', ' '], (string) $line);

                    if ($ai === 0) {
                        $headers = explode(';', $line);
                        $ai++;
                        continue;
                    }

                    $fila = explode(';', $line);
                    $nit = trim((string) ($fila[0] ?? ''));
                    if ($nit === '') {
                        $ai++;
                        continue;
                    }

                    $nit = (string) intval($nit);
                    $razsoc = trim((string) ($fila[1] ?? ''));
                    $cedrep = trim((string) ($fila[2] ?? ''));
                    $repleg = trim((string) ($fila[3] ?? ''));
                    $telefono = trim((string) ($fila[4] ?? ''));
                    $email = trim((string) ($fila[5] ?? ''));
                    $tipoIngreso = trim((string) ($fila[6] ?? 'P'));

                    if ($razsoc === '' || $cedrep === '' || $repleg === '') {
                        $noValidas[] = "'{$nit}'";
                        $ai++;
                        continue;
                    }

                    $filas++;

                    $empresa = Empresas::where('nit', $nit)->first();
                    $registroIngreso = RegistroIngresos::where('nit', $nit)
                        ->where('asamblea_id', $this->idAsamblea)
                        ->where('cedula_representa', $cedrep)
                        ->first();

                    $cartera = Carteras::where('nit', $nit)->first();

                    if ($empresa) {
                        if (!$registroIngreso) {
                            $documento = (int) (RegistroIngresos::max('documento') ?? 0) + 1;
                            $registroIngreso = RegistroIngresos::create([
                                'documento' => (string) $documento,
                                'fecha' => now()->format('Y-m-d'),
                                'hora' => now()->format('H:i:s'),
                                'nit' => $nit,
                                'usuario' => 1,
                                'estado' => 'P',
                                'votos' => 1,
                                'tipo_ingreso' => $tipoIngreso,
                                'asamblea_id' => $this->idAsamblea,
                                'cedula_representa' => $cedrep,
                                'nombre_representa' => $repleg,
                            ]);
                        }

                        if ($cruzarCartera === 1 && $cartera && $registroIngreso) {
                            $cruzados[] = "'{$nit}'";
                            $registroIngreso->update(['estado' => 'R', 'votos' => 0]);

                            $criterio = 18;
                            $carteraReportarService = new CarteraReportarService($this->idAsamblea);
                            $carteraReportarService->creaRechazoByRegister($registroIngreso, $criterio);
                        }

                        $empresa->update([
                            'razsoc' => $razsoc,
                            'cedrep' => $cedrep,
                            'telefono' => $telefono,
                            'email' => $email,
                            'repleg' => $repleg,
                            'asamblea_id' => $this->idAsamblea,
                        ]);

                        $duplicados[] = "'{$nit}'";
                    } else {
                        $empresaNueva = Empresas::create([
                            'nit' => $nit,
                            'razsoc' => $razsoc,
                            'cedrep' => $cedrep,
                            'repleg' => $repleg,
                            'email' => $email,
                            'telefono' => $telefono,
                            'asamblea_id' => $this->idAsamblea,
                        ]);

                        if ($empresaNueva) {
                            $creados++;
                        } else {
                            $fallidos[] = "'{$nit}'";
                        }

                        if (!$registroIngreso) {
                            $documento = (int) (RegistroIngresos::max('documento') ?? 0) + 1;
                            $registroIngreso = RegistroIngresos::create([
                                'documento' => (string) $documento,
                                'fecha' => now()->format('Y-m-d'),
                                'hora' => now()->format('H:i:s'),
                                'nit' => $nit,
                                'usuario' => 1,
                                'estado' => 'P',
                                'votos' => 1,
                                'tipo_ingreso' => $tipoIngreso,
                                'asamblea_id' => $this->idAsamblea,
                                'cedula_representa' => $cedrep,
                                'nombre_representa' => $repleg,
                            ]);
                        }

                        if ($cruzarCartera === 1 && $cartera && $registroIngreso) {
                            $cruzados[] = "'{$nit}'";
                            $registroIngreso->update(['estado' => 'R', 'votos' => 0]);

                            $criterio = 18;
                            $carteraReportarService = new CarteraReportarService($this->idAsamblea);
                            $carteraReportarService->creaRechazoByRegister($registroIngreso, $criterio);
                        }
                    }

                    $ai++;
                }

                fclose($fdata);
            }

            @unlink($absolutePath);

            return response()->json([
                'no_validas' => count($noValidas) > 0 ? implode(',', $noValidas) : '0',
                'duplicados' => count($duplicados) > 0 ? implode(',', $duplicados) : '0',
                'cruzados_en_cartera' => $cruzarCartera,
                'headers' => $headers,
                'creados' => $creados,
                'filas' => $filas,
                'inactivos' => 0,
                'cruzados' => count($cruzados) > 0 ? implode(',', $cruzados) : '0',
                'fallidos' => count($fallidos) > 0 ? implode(',', $fallidos) : '0',
                'success' => true,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage(),
            ], 500);
        }
    }

    public function exportar_lista(): JsonResponse
    {
        return response()->json([
            'status' => 200,
            'success' => true,
            'file_path' => 'temp/habiles_export_' . now()->format('Y-m-d_H-i-s') . '.csv',
            'msj' => 'Exportación pendiente de integración con librería de reportes.',
        ]);
    }

    public function exportar_pdf(): JsonResponse
    {
        return response()->json([
            'status' => 200,
            'success' => true,
            'file_path' => 'temp/habiles_export_' . now()->format('Y-m-d_H-i-s') . '.pdf',
            'msj' => 'Exportación PDF pendiente de integración con librería de reportes.',
        ]);
    }

    public function lista_habiles(): JsonResponse
    {
        try {
            $empresas = DB::table('empresas')
                ->join('registro_ingresos as rgi', function ($join) {
                    $join->on('rgi.nit', '=', 'empresas.nit')
                        ->on('empresas.cedrep', '=', 'rgi.cedula_representa');
                })
                ->where('empresas.asamblea_id', $this->idAsamblea)
                ->where('rgi.asamblea_id', $this->idAsamblea)
                ->whereIn('rgi.estado', ['P', 'A'])
                ->select([
                    'empresas.*',
                    DB::raw("'A' as detalle_estado"),
                    'rgi.cedula_representa',
                    'rgi.nombre_representa',
                    DB::raw('rgi.estado as reg_ingreso_estado'),
                ])
                ->get();

            return response()->json([
                'success' => true,
                'empresas' => $empresas,
                'msj' => 'Consulta ok',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage(),
            ], 500);
        }
    }

    public function remove_habil(Request $request): JsonResponse
    {
        try {
            $nit = trim((string) $request->input('nit'));
            $cedrep = trim((string) $request->input('cedrep'));
            $criterio = (int) $request->input('criterio');

            $empresa = Empresas::where('nit', $nit)->first();
            if ($empresa) {
                $registroIngreso = RegistroIngresos::where('nit', $nit)
                    ->where('cedula_representa', $cedrep)
                    ->first();

                if ($registroIngreso) {
                    RegistroIngresos::where('nit', $nit)->update(['estado' => 'R']);

                    $rechazos = Rechazos::where('nit', $nit)->count();
                    if ($rechazos === 0) {
                        DB::table('rechazos')->insert([
                            'nit' => $nit,
                            'regingre_id' => $registroIngreso->documento,
                            'criterio_id' => $criterio,
                            'usuario' => 1,
                            'dia' => now()->format('Y-m-d'),
                            'hora' => now()->format('H:i:s'),
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'msj' => 'Empresa habil eliminada correctamente',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage(),
            ], 500);
        }
    }

    public function exportar_habiles(): JsonResponse
    {
        try {
            $name = time() . '_exportar_empresas_habiles';
            $empresas = DB::table('empresas')
                ->join('registro_ingresos as rgi', function ($join) {
                    $join->on('rgi.nit', '=', 'empresas.nit')
                        ->on('empresas.cedrep', '=', 'rgi.cedula_representa');
                })
                ->where('empresas.asamblea_id', $this->idAsamblea)
                ->where('rgi.asamblea_id', $this->idAsamblea)
                ->select([
                    'empresas.nit',
                    'empresas.razsoc',
                    'empresas.cedrep',
                    'empresas.repleg',
                    'empresas.email',
                    'empresas.telefono',
                    'rgi.cedula_representa',
                    'rgi.nombre_representa',
                    DB::raw('rgi.estado as reg_ingreso_estado'),
                ])
                ->get();

            return response()->json([
                'success' => true,
                'filename' => $name . '.csv',
                'url' => 'entrada/download_reporte/' . $name . '.csv',
                'data' => $empresas,
                'msj' => 'Consulta ok',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'msj' => $e->getMessage(),
            ], 500);
        }
    }

    private function mesaDisponible(int $asambleaId = 0): array
    {
        if ($asambleaId === 0) {
            $asambleaId = (int) (AsaAsamblea::where('estado', 'A')->value('id') ?? 0);
        }

        $mesa = DB::selectOne(
            "SELECT asa_mesas.id as mesa_id, asa_mesas.codigo as codigo
            FROM asa_mesas
            LEFT JOIN asa_consenso ON asa_consenso.id = asa_mesas.consenso_id
            WHERE asa_consenso.asamblea_id = ?
            AND asa_mesas.estado IN ('A','P')
            AND asa_consenso.estado = 'A'
            ORDER BY cantidad_votantes ASC
            LIMIT 1",
            [$asambleaId]
        );

        if (!$mesa) {
            return [0, 'N/A'];
        }

        return [(int) $mesa->mesa_id, (string) $mesa->codigo];
    }
}
