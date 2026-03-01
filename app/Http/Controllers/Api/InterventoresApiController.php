<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AsaInterventores;
use App\Models\Empresas;
use App\Models\Poderes;
use App\Services\Asamblea\AsambleaService;
use App\Services\Reportes\InterventoresReporte;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class InterventoresApiController extends Controller
{
    protected ?int $idAsamblea;

    public function __construct()
    {
        $this->idAsamblea = AsambleaService::getAsambleaActiva();
    }


    /**
     * Listar todos los interventores en formato JSON
     */
    public function listar(): JsonResponse
    {
        $interventores = DB::select("
            SELECT
                nit,
                cedrep,
                razsoc,
                repleg,
                IF(puede_votar > 0, 'SI', 'NO') as 'puedevotar',
                (CASE
                    WHEN tipo_representacion='I' THEN 'Interventor'
                    WHEN tipo_representacion='S' THEN 'Suplente'
                    WHEN tipo_representacion='A' THEN 'Asambleista'
                    WHEN tipo_representacion='C' THEN 'Concejero'
                    ELSE 'Ninguno'
                END) as 'tipo',
                create_at,
                IF(email <> '', email, (SELECT empresas.email FROM empresas WHERE empresas.cedrep = asa_interventores.cedrep LIMIT 1)) as 'correo'
            FROM asa_interventores
        ");

        return response()->json([
            'interventores' => $this->encodeUtf8($interventores)
        ]);
    }

    /**
     * Cargue masivo de interventores desde archivo CSV
     */
    public function cargueMasivo(Request $request): JsonResponse
    {
        try {
            $cruzarPoderes = $request->input('cruzar_poderes', 0);
            $file = $request->file('file');

            if (!$file) {
                throw new \Exception('No se ha proporcionado ningún archivo');
            }

            $filepath = $file->storeAs('uploads', $file->getClientOriginalName(), 'public');
            $fullPath = storage_path('app/public/' . $filepath);

            $headers = [];
            $filas = 0;
            $creados = 0;
            $fallidos = [];
            $cruzados = [];
            $duplicados = [];

            if (($fdata = fopen($fullPath, "r")) !== false) {
                $ai = 0;

                while (($line = fgets($fdata)) !== false) {
                    $line = str_replace(["\n", "\t"], ["", " "], $line);

                    if ($ai == 0) {
                        $headers = explode(";", $line);
                    } else {
                        $fila = explode(";", $line);
                        $cedula = trim($fila[0] ?? '');

                        if ($cedula === "") {
                            $fallidos[] = $ai + 1;
                            continue;
                        }

                        if (is_numeric($cedula) && $cedula > 0) {
                            $filas++;

                            $empresa = Empresas::where('cedrep', $cedula)->first();

                            if ($empresa && $cruzarPoderes == 1) {
                                $poder = Poderes::where('cedrep1', $cedula)->first();
                                if ($poder) {
                                    $poder->update(['estado' => 'I']);
                                    $cruzados[] = $cedula;
                                }
                            }

                            $interventor = AsaInterventores::where('cedula', $cedula)->first();

                            if ($interventor) {
                                $duplicados[] = $cedula;
                            } else {
                                $nuevoInterventor = AsaInterventores::create([
                                    'nit' => $fila[1] ?? '',
                                    'cedrep' => $cedula,
                                    'razsoc' => $fila[2] ?? '',
                                    'repleg' => $fila[3] ?? '',
                                    'puede_votar' => $fila[4] ?? 0,
                                    'tipo_representacion' => $fila[5] ?? '',
                                    'create_at' => now(),
                                    'update_at' => now()
                                ]);

                                if ($nuevoInterventor) {
                                    $creados++;
                                } else {
                                    $fallidos[] = $cedula;
                                }
                            }
                        }
                    }
                    $ai++;
                }
                fclose($fdata);
            }

            $salida = [
                "cruzar_poderes" => $cruzarPoderes,
                "headers" => $headers,
                "creados" => $creados,
                "duplicados" => !empty($duplicados) ? implode(",", $duplicados) : '0',
                "filas" => $filas,
                "cruzados" => !empty($cruzados) ? implode(",", $cruzados) : '0',
                "fallidos" => !empty($fallidos) ? implode(",", $fallidos) : '0'
            ];

            // Guardar log del proceso
            $logPath = 'public/temp/log_interventores_' . time() . '.txt';
            Storage::put($logPath, var_export($salida, true));

            // Eliminar archivo temporal
            Storage::delete($filepath);

            return response()->json($salida);
        } catch (\Exception $e) {
            Log::error('Error en cargue masivo de interventores: ' . $e->getMessage());

            return response()->json([
                'error' => 'Error no es posible el cargue del archivo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exportar lista de interventores
     */
    public function exportarLista(): JsonResponse
    {
        try {
            $interventoresReporte = new InterventoresReporte();
            $result = $interventoresReporte->main($this->idAsamblea);

            return response()->json([
                'status' => 200,
                ...$result
            ]);
        } catch (\Exception $e) {
            Log::error('Error exportando lista de interventores: ' . $e->getMessage());

            return response()->json([
                'status' => 500,
                'error' => 'Error al exportar la lista de interventores'
            ], 500);
        }
    }
}
