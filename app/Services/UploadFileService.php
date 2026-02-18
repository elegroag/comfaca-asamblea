<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class UploadFileService
{
    private $file;
    private $filepath;
    private $filename;
    private $path;
    private $disk;

    /**
     * Constructor del servicio
     */
    public function __construct($path = null, $disk = 'public')
    {
        $this->disk = $disk;
        $this->path = $path ?? 'uploads';
        $this->setPath($this->path);
    }

    /**
     * Establecer ruta de almacenamiento
     */
    public function setPath($path)
    {
        if (is_null($path) || $path == '') {
            throw new \Exception("Error ruta no está definida, para alojar los archivos", 301);
        }

        $this->path = $path;

        // Crear directorio si no existe
        if (!Storage::disk($this->disk)->exists($this->path)) {
            Storage::disk($this->disk)->makeDirectory($this->path);
        }
    }

    /**
     * Método principal para subir archivo
     */
    public function main($file = null)
    {
        if (is_null($this->path) || $this->path == '') {
            throw new \Exception("Error ruta no está definida, para alojar los archivos", 301);
        }

        $this->file = $file ?? request()->file('file');

        if (!$this->file) {
            throw new \Exception("No se ha proporcionado ningún archivo", 400);
        }

        if (!$this->file instanceof UploadedFile) {
            throw new \Exception("El archivo proporcionado no es válido", 400);
        }

        // Validar archivo
        $this->validateFile();

        // Generar nombre único
        $this->filename = $this->generateUniqueFilename();
        $this->filepath = $this->path . '/' . $this->filename;

        // Subir archivo
        $stored = $this->file->storeAs($this->path, $this->filename, $this->disk);

        if (!$stored) {
            throw new \Exception("Error no es posible el cargue del archivo", 1);
        }

        return $this->getFileData();
    }

    /**
     * Validar archivo
     */
    private function validateFile()
    {
        // Validar que no esté corrupto
        if (!$this->file->isValid()) {
            throw new \Exception("El archivo está corrupto o es demasiado grande", 400);
        }

        // Validar tamaño máximo (10MB por defecto)
        $maxSize = config('filesystems.max_upload_size', 10 * 1024 * 1024); // 10MB
        if ($this->file->getSize() > $maxSize) {
            throw new \Exception("El archivo excede el tamaño máximo permitido", 400);
        }

        // Validar tipo MIME permitido
        $allowedMimes = config('filesystems.allowed_mimes', [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv'
        ]);

        if (!in_array($this->file->getMimeType(), $allowedMimes)) {
            throw new \Exception("Tipo de archivo no permitido", 400);
        }
    }

    /**
     * Generar nombre único para el archivo
     */
    private function generateUniqueFilename()
    {
        $extension = $this->file->getClientOriginalExtension();
        $originalName = pathinfo($this->file->getClientOriginalName(), PATHINFO_FILENAME);

        // Limpiar nombre original
        $cleanName = Str::slug($originalName, '_');

        // Generar nombre único con timestamp
        $timestamp = now()->format('Y-m-d_H-i-s');
        $random = Str::random(6);

        return "{$cleanName}_{$timestamp}_{$random}.{$extension}";
    }

    /**
     * Obtener datos del archivo subido
     */
    public function getFileData()
    {
        return [
            'filename' => $this->filename,
            'filepath' => $this->filepath,
            'original_name' => $this->file->getClientOriginalName(),
            'mime_type' => $this->file->getMimeType(),
            'size' => $this->file->getSize(),
            'size_human' => $this->formatFileSize($this->file->getSize()),
            'extension' => $this->file->getClientOriginalExtension(),
            'url' => Storage::url($this->filepath),
            'disk' => $this->disk,
            'path' => $this->path
        ];
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
     * Eliminar archivo
     */
    public function deleteFile($filepath)
    {
        if (Storage::disk($this->disk)->exists($filepath)) {
            return Storage::disk($this->disk)->delete($filepath);
        }

        return false;
    }

    /**
     * Verificar si existe archivo
     */
    public function fileExists($filepath)
    {
        return Storage::disk($this->disk)->exists($filepath);
    }

    /**
     * Obtener URL del archivo
     */
    public function getFileUrl($filepath)
    {
        if ($this->fileExists($filepath)) {
            return Storage::url($filepath);
        }

        return null;
    }

    /**
     * Subir múltiples archivos
     */
    public function uploadMultiple($files)
    {
        $uploadedFiles = [];
        $errors = [];

        foreach ($files as $index => $file) {
            try {
                $result = $this->main($file);
                $uploadedFiles[] = $result;
            } catch (\Exception $e) {
                $errors[] = [
                    'index' => $index,
                    'filename' => $file->getClientOriginalName() ?? 'unknown',
                    'error' => $e->getMessage()
                ];
            }
        }

        return [
            'uploaded' => $uploadedFiles,
            'errors' => $errors,
            'total' => count($files),
            'success_count' => count($uploadedFiles),
            'error_count' => count($errors)
        ];
    }

    /**
     * Subir archivo desde base64
     */
    public function uploadFromBase64($base64Data, $filename, $extension = null)
    {
        try {
            // Decodificar base64
            $decodedData = base64_decode($base64Data);

            if ($decodedData === false) {
                throw new \Exception("Datos base64 inválidos", 400);
            }

            // Determinar extensión si no se proporciona
            if (!$extension) {
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_buffer($finfo, $decodedData);
                finfo_close($finfo);

                $extension = $this->getExtensionFromMimeType($mimeType);
            }

            // Crear archivo temporal
            $tempPath = tempnam(sys_get_temp_dir(), 'upload_');
            file_put_contents($tempPath, $decodedData);

            // Crear UploadedFile desde archivo temporal
            $uploadedFile = new \Illuminate\Http\UploadedFile(
                $tempPath,
                $filename . '.' . $extension,
                $this->getMimeTypeFromExtension($extension),
                null,
                true
            );

            // Subir archivo
            $result = $this->main($uploadedFile);

            // Limpiar archivo temporal
            unlink($tempPath);

            return $result;
        } catch (\Exception $e) {
            // Limpiar archivo temporal si existe
            if (isset($tempPath) && file_exists($tempPath)) {
                unlink($tempPath);
            }

            throw $e;
        }
    }

    /**
     * Obtener extensión desde MIME type
     */
    private function getExtensionFromMimeType($mimeType)
    {
        $mimeTypes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'application/pdf' => 'pdf',
            'text/plain' => 'txt',
            'text/csv' => 'csv'
        ];

        return $mimeTypes[$mimeType] ?? 'bin';
    }

    /**
     * Obtener MIME type desde extensión
     */
    private function getMimeTypeFromExtension($extension)
    {
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'pdf' => 'application/pdf',
            'txt' => 'text/plain',
            'csv' => 'text/csv'
        ];

        return $mimeTypes[strtolower($extension)] ?? 'application/octet-stream';
    }

    /**
     * Obtener información de archivo
     */
    public function getFileInfo($filepath)
    {
        if (!$this->fileExists($filepath)) {
            throw new \Exception("El archivo no existe", 404);
        }

        $fullPath = storage_path('app/' . $filepath);
        if (!file_exists($fullPath)) {
            throw new \Exception("El archivo físico no existe", 404);
        }

        $fileInfo = stat($fullPath);

        return [
            'filepath' => $filepath,
            'size' => $fileInfo['size'],
            'size_human' => $this->formatFileSize($fileInfo['size']),
            'modified' => date('Y-m-d H:i:s', $fileInfo['mtime']),
            'url' => $this->getFileUrl($filepath),
            'extension' => pathinfo($filepath, PATHINFO_EXTENSION),
            'filename' => pathinfo($filepath, PATHINFO_FILENAME)
        ];
    }

    /**
     * Listar archivos en directorio
     */
    public function listFiles($path = null)
    {
        $searchPath = $path ?? $this->path;

        if (!Storage::disk($this->disk)->exists($searchPath)) {
            return [];
        }

        $files = Storage::disk($this->disk)->files($searchPath);
        $fileList = [];

        foreach ($files as $file) {
            try {
                $fileList[] = $this->getFileInfo($file);
            } catch (\Exception $e) {
                // Ignorar archivos que no se puedan leer
                continue;
            }
        }

        return $fileList;
    }

    /**
     * Crear directorio
     */
    public function createDirectory($path)
    {
        if (Storage::disk($this->disk)->exists($path)) {
            throw new \Exception("El directorio ya existe", 400);
        }

        return Storage::disk($this->disk)->makeDirectory($path);
    }

    /**
     * Eliminar directorio
     */
    public function deleteDirectory($path, $recursive = false)
    {
        if (!Storage::disk($this->disk)->exists($path)) {
            throw new \Exception("El directorio no existe", 404);
        }

        return Storage::disk($this->disk)->deleteDirectory($path);
    }

    /**
     * Mover archivo
     */
    public function moveFile($from, $to)
    {
        if (!$this->fileExists($from)) {
            throw new \Exception("El archivo de origen no existe", 404);
        }

        // Asegurar que el directorio destino exista
        $destinationDir = dirname($to);
        if (!Storage::disk($this->disk)->exists($destinationDir)) {
            Storage::disk($this->disk)->makeDirectory($destinationDir);
        }

        return Storage::disk($this->disk)->move($from, $to);
    }

    /**
     * Copiar archivo
     */
    public function copyFile($from, $to)
    {
        if (!$this->fileExists($from)) {
            throw new \Exception("El archivo de origen no existe", 404);
        }

        // Asegurar que el directorio destino exista
        $destinationDir = dirname($to);
        if (!Storage::disk($this->disk)->exists($destinationDir)) {
            Storage::disk($this->disk)->makeDirectory($destinationDir);
        }

        return Storage::disk($this->disk)->copy($from, $to);
    }

    /**
     * Obtener espacio utilizado
     */
    public function getStorageUsage($path = null)
    {
        $searchPath = $path ?? $this->path;

        if (!Storage::disk($this->disk)->exists($searchPath)) {
            return [
                'total_size' => 0,
                'total_size_human' => '0 B',
                'file_count' => 0,
                'directory_count' => 0
            ];
        }

        $files = Storage::disk($this->disk)->allFiles($searchPath);
        $directories = Storage::disk($this->disk)->allDirectories($searchPath);

        $totalSize = 0;
        foreach ($files as $file) {
            $totalSize += Storage::disk($this->disk)->size($file);
        }

        return [
            'total_size' => $totalSize,
            'total_size_human' => $this->formatFileSize($totalSize),
            'file_count' => count($files),
            'directory_count' => count($directories)
        ];
    }

    /**
     * Limpiar archivos antiguos
     */
    public function cleanOldFiles($days = 30, $path = null)
    {
        $searchPath = $path ?? $this->path;
        $files = Storage::disk($this->disk)->files($searchPath);
        $deletedCount = 0;
        $deletedSize = 0;

        $cutoffDate = now()->subDays($days);

        foreach ($files as $file) {
            $lastModified = Storage::disk($this->disk)->lastModified($file);

            if ($lastModified < $cutoffDate->timestamp) {
                $fileSize = Storage::disk($this->disk)->size($file);

                if (Storage::disk($this->disk)->delete($file)) {
                    $deletedCount++;
                    $deletedSize += $fileSize;
                }
            }
        }

        return [
            'deleted_count' => $deletedCount,
            'deleted_size' => $deletedSize,
            'deleted_size_human' => $this->formatFileSize($deletedSize)
        ];
    }
}
