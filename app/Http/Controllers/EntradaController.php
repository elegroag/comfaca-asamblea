<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class EntradaController extends Controller
{
    /**
     * Vista principal de entrada
     * Redirige al login
     */
    public function index()
    {
        return redirect()->route('login.index');
    }

    /**
     * Descargar reporte
     * Descarga archivos CSV desde el directorio temp
     */
    public function download_reporte($archivo = "")
    {
        try {
            // Validar el nombre del archivo para seguridad
            if (empty($archivo) || !preg_match('/^[a-zA-Z0-9_\-\.]+$/', $archivo)) {
                Log::warning('Intento de descarga con nombre de archivo inválido: ' . $archivo);
                return redirect()->route('entrada.index');
            }

            // Construir la ruta completa del archivo
            $fichero = storage_path("app/temp/" . $archivo);
            
            // Verificar que el archivo exista
            if (!File::exists($fichero)) {
                Log::warning('Archivo no encontrado para descarga: ' . $fichero);
                return redirect()->route('entrada.index');
            }

            // Verificar que sea un archivo CSV (seguridad adicional)
            $extension = strtolower(pathinfo($fichero, PATHINFO_EXTENSION));
            if ($extension !== 'csv') {
                Log::warning('Intento de descarga de archivo no permitido: ' . $extension);
                return redirect()->route('entrada.index');
            }

            // Obtener información del archivo
            $fileSize = File::size($fichero);
            $mimeType = 'text/csv';

            // Configurar headers para la descarga
            $headers = [
                'Content-Description' => 'File Transfer',
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'attachment; filename="' . $archivo . '"',
                'Cache-Control' => 'must-revalidate',
                'Expires' => '0',
                'Pragma' => 'public',
                'Content-Length' => $fileSize,
            ];

            // Registrar la descarga para auditoría
            Log::info('Descarga de reporte', [
                'archivo' => $archivo,
                'ruta' => $fichero,
                'tamaño' => $fileSize,
                'ip' => request()->ip(),
                'usuario' => auth()->user() ? auth()->user()->id : 'anónimo'
            ]);

            // Retornar el archivo para descarga
            return Response::download($fichero, $archivo, $headers);

        } catch (\Exception $e) {
            Log::error('Error al descargar reporte: ' . $e->getMessage(), [
                'archivo' => $archivo,
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('entrada.index')
                ->with('error', 'Error al descargar el archivo. Por favor, inténtelo nuevamente.');
        }
    }

    /**
     * Verificar disponibilidad de archivos
     * Método auxiliar para verificar si existen archivos de reporte
     */
    public function verificar_archivos(): JsonResponse
    {
        try {
            $tempPath = storage_path('app/temp');
            $archivos = [];
            
            if (File::exists($tempPath)) {
                $files = File::allFiles($tempPath);
                
                foreach ($files as $file) {
                    if ($file->getExtension() === 'csv') {
                        $archivos[] = [
                            'nombre' => $file->getFilename(),
                            'tamaño' => $file->getSize(),
                            'fecha_modificacion' => $file->getMTime(),
                            'url_descarga' => route('entrada.download_reporte', $file->getFilename())
                        ];
                    }
                }
            }

            // Ordenar por fecha de modificación (más reciente primero)
            usort($archivos, function ($a, $b) {
                return $b['fecha_modificacion'] - $a['fecha_modificacion'];
            });

            return response()->json([
                'success' => true,
                'archivos' => $archivos,
                'total' => count($archivos)
            ]);

        } catch (\Exception $e) {
            Log::error('Error al verificar archivos: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'msj' => 'Error al verificar los archivos disponibles'
            ], 500);
        }
    }

    /**
     * Limpiar archivos temporales antiguos
     * Método para mantenimiento automático
     */
    public function limpiar_temporales(): JsonResponse
    {
        try {
            $tempPath = storage_path('app/temp');
            $eliminados = 0;
            $errores = [];
            
            if (File::exists($tempPath)) {
                $files = File::allFiles($tempPath);
                $cutoffTime = now()->subHours(24)->timestamp; // Eliminar archivos de más de 24 horas
                
                foreach ($files as $file) {
                    if ($file->getMTime() < $cutoffTime) {
                        try {
                            File::delete($file->getPathname());
                            $eliminados++;
                        } catch (\Exception $e) {
                            $errores[] = $file->getFilename();
                            Log::warning('No se pudo eliminar archivo temporal: ' . $file->getFilename());
                        }
                    }
                }
            }

            Log::info('Limpieza de archivos temporales', [
                'eliminados' => $eliminados,
                'errores' => count($errores),
                'archivos_con_errores' => $errores
            ]);

            return response()->json([
                'success' => true,
                'eliminados' => $eliminados,
                'errores' => count($errores),
                'msj' => "Se eliminaron {$eliminados} archivos temporales"
            ]);

        } catch (\Exception $e) {
            Log::error('Error al limpiar archivos temporales: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'msj' => 'Error al limpiar archivos temporales'
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de descargas
     * Método para monitoreo del sistema
     */
    public function estadisticas(): JsonResponse
    {
        try {
            $tempPath = storage_path('app/temp');
            $estadisticas = [
                'total_archivos' => 0,
                'total_tamaño' => 0,
                'archivos_csv' => 0,
                'otros_archivos' => 0,
                'archivos_recientes' => 0,
                'espacio_utilizado' => 0
            ];
            
            if (File::exists($tempPath)) {
                $files = File::allFiles($tempPath);
                $cutoffTime = now()->subHours(1)->timestamp; // Archivos de la última hora
                
                foreach ($files as $file) {
                    $size = $file->getSize();
                    $extension = strtolower($file->getExtension());
                    
                    $estadisticas['total_archivos']++;
                    $estadisticas['total_tamaño'] += $size;
                    
                    if ($extension === 'csv') {
                        $estadisticas['archivos_csv']++;
                    } else {
                        $estadisticas['otros_archivos']++;
                    }
                    
                    if ($file->getMTime() > $cutoffTime) {
                        $estadisticas['archivos_recientes']++;
                    }
                }
                
                // Calcular espacio utilizado en formato legible
                $estadisticas['espacio_utilizado'] = $this->formatFileSize($estadisticas['total_tamaño']);
            }

            return response()->json([
                'success' => true,
                'estadisticas' => $estadisticas
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'msj' => 'Error al obtener estadísticas'
            ], 500);
        }
    }

    /**
     * Formatear tamaño de archivo para humanos
     */
    private function formatFileSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Verificar si el directorio temporal existe y crearlo si es necesario
     */
    private function asegurarDirectorioTemporal()
    {
        $tempPath = storage_path('app/temp');
        
        if (!File::exists($tempPath)) {
            File::makeDirectory($tempPath, 0755, true);
            Log::info('Directorio temporal creado: ' . $tempPath);
        }
        
        return $tempPath;
    }

    /**
     * Validar nombre de archivo
     */
    private function validarNombreArchivo($nombre)
    {
        // Permitir solo caracteres alfanuméricos, guiones bajos, guiones y puntos
        return preg_match('/^[a-zA-Z0-9_\-\.]+$/', $nombre) === 1;
    }

    /**
     * Obtener información de un archivo específico
     */
    public function info_archivo($archivo): JsonResponse
    {
        try {
            if (!$this->validarNombreArchivo($archivo)) {
                return response()->json([
                    'success' => false,
                    'msj' => 'Nombre de archivo inválido'
                ], 400);
            }

            $fichero = storage_path("app/temp/" . $archivo);
            
            if (!File::exists($fichero)) {
                return response()->json([
                    'success' => false,
                    'msj' => 'El archivo no existe'
                ], 404);
            }

            $fileInfo = [
                'nombre' => $archivo,
                'ruta' => $fichero,
                'tamaño' => File::size($fichero),
                'tamaño_formateado' => $this->formatFileSize(File::size($fichero)),
                'fecha_creacion' => File::creationTime($fichero),
                'fecha_modificacion' => File::lastModified($fichero),
                'extension' => pathinfo($fichero, PATHINFO_EXTENSION),
                'mime_type' => mime_content_type($fichero),
                'url_descarga' => route('entrada.download_reporte', $archivo)
            ];

            return response()->json([
                'success' => true,
                'archivo' => $fileInfo
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener información del archivo: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'msj' => 'Error al obtener información del archivo'
            ], 500);
        }
    }
}
