<?php

namespace App\Services\Reportes;

use App\Services\Reportes\Libs\ReportesHelper;
use Carbon\Carbon;

class NovedadQuorum
{
    /**
     * Generar reporte de novedades para plataforma Quorum
     */
    public function generar(array $dataQuorum): array
    {
        // Validar que haya datos
        if (empty($dataQuorum)) {
            return [
                'success' => false,
                'message' => 'No se proporcionaron datos para generar el reporte'
            ];
        }

        // Generar nombre de archivo
        $name = time() . '_novedad_quorum';

        // Definir columnas según el original
        $columns = [
            'Nit',
            'Razón social',
            'Cedula representante',
            'Nombre representante',
            'Apoderado Nit',
            'Apoderado Cedula',
            'Apoderado Nombre',
            'Clave',
            'Linea'
        ];

        // Procesar y validar datos
        $dataProcesada = $this->procesarDatos($dataQuorum);

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::crearExcel('Reporte novedades a plataforma Quorum', $name, $columns, $dataProcesada);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($dataProcesada),
            'fecha_generacion' => Carbon::now()->toDateTimeString()
        ];
    }

    /**
     * Procesar y validar datos del quorum
     */
    private function procesarDatos(array $dataQuorum): array
    {
        $dataProcesada = [];

        foreach ($dataQuorum as $index => $row) {
            // Asegurar que todas las columnas existan
            $rowProcesada = [
                'Nit' => $this->limpiarDato($row['Nit'] ?? ''),
                'Razón social' => $this->limpiarDato($row['Razón social'] ?? ''),
                'Cedula representante' => $this->limpiarDato($row['Cedula representante'] ?? ''),
                'Nombre representante' => $this->limpiarDato($row['Nombre representante'] ?? ''),
                'Apoderado Nit' => $this->limpiarDato($row['Apoderado Nit'] ?? ''),
                'Apoderado Cedula' => $this->limpiarDato($row['Apoderado Cedula'] ?? ''),
                'Apoderado Nombre' => $this->limpiarDato($row['Apoderado Nombre'] ?? ''),
                'Clave' => $this->limpiarDato($row['Clave'] ?? ''),
                'Linea' => $this->limpiarDato($row['Linea'] ?? ($index + 1))
            ];

            $dataProcesada[] = $rowProcesada;
        }

        return $dataProcesada;
    }

    /**
     * Limpiar y formatear un dato individual
     */
    private function limpiarDato($dato): string
    {
        if ($dato === null || $dato === '') {
            return '';
        }

        // Convertir a string si no lo es
        $dato = (string) $dato;

        // Limpiar espacios en blanco
        $dato = trim($dato);

        // Manejar saltos de línea y tabulaciones
        $dato = str_replace(["\n", "\r", "\t"], [' ', ' ', ' '], $dato);

        // Reemplazar caracteres problemáticos para Excel
        $dato = str_replace([';', '|', '"', "'"], [' ', ' ', ' ', ' '], $dato);

        // Limitar longitud para evitar problemas en Excel
        if (strlen($dato) > 255) {
            $dato = substr($dato, 0, 252) . '...';
        }

        return $dato;
    }

    /**
     * Generar reporte con validación adicional
     */
    public function generarConValidacion(array $dataQuorum, array $opciones = []): array
    {
        // Validar estructura de datos
        $validacion = $this->validarEstructuraDatos($dataQuorum);
        
        if (!$validacion['valido']) {
            return [
                'success' => false,
                'message' => 'Estructura de datos inválida: ' . implode(', ', $validacion['errores'])
            ];
        }

        // Procesar datos con opciones adicionales
        $dataProcesada = $this->procesarDatosConOpciones($dataQuorum, $opciones);

        // Generar nombre de archivo con sufijo si hay opciones
        $sufijo = !empty($opciones) ? '_procesado' : '';
        $name = time() . '_novedad_quorum' . $sufijo;

        // Definir columnas
        $columns = [
            'Nit',
            'Razón social',
            'Cedula representante',
            'Nombre representante',
            'Apoderado Nit',
            'Apoderado Cedula',
            'Apoderado Nombre',
            'Clave',
            'Linea'
        ];

        // Usar el servicio de reportes para generar Excel
        $filepath = ReportesHelper::crearExcel('Reporte novedades a plataforma Quorum', $name, $columns, $dataProcesada);

        return [
            'success' => true,
            'url' => 'download_reporte/' . $filepath,
            'filename' => $filepath,
            'total_registros' => count($dataProcesada),
            'opciones_aplicadas' => $opciones,
            'fecha_generacion' => Carbon::now()->toDateTimeString()
        ];
    }

    /**
     * Validar estructura de los datos
     */
    private function validarEstructuraDatos(array $data): array
    {
        $errores = [];
        $columnasRequeridas = [
            'Nit',
            'Razón social',
            'Cedula representante',
            'Nombre representante'
        ];

        if (empty($data)) {
            return ['valido' => false, 'errores' => ['No hay datos para procesar']];
        }

        // Verificar columnas requeridas en el primer registro
        $primerRegistro = $data[0];
        foreach ($columnasRequeridas as $columna) {
            if (!array_key_exists($columna, $primerRegistro)) {
                $errores[] = "Falta columna requerida: {$columna}";
            }
        }

        return [
            'valido' => empty($errores),
            'errores' => $errores
        ];
    }

    /**
     * Procesar datos con opciones adicionales
     */
    private function procesarDatosConOpciones(array $dataQuorum, array $opciones): array
    {
        $dataProcesada = [];

        foreach ($dataQuorum as $index => $row) {
            $rowProcesada = [
                'Nit' => $this->aplicarOpcionesDato($row['Nit'] ?? '', $opciones['nit'] ?? []),
                'Razón social' => $this->aplicarOpcionesDato($row['Razón social'] ?? '', $opciones['razon_social'] ?? []),
                'Cedula representante' => $this->aplicarOpcionesDato($row['Cedula representante'] ?? '', $opciones['cedula_representante'] ?? []),
                'Nombre representante' => $this->aplicarOpcionesDato($row['Nombre representante'] ?? '', $opciones['nombre_representante'] ?? []),
                'Apoderado Nit' => $this->aplicarOpcionesDato($row['Apoderado Nit'] ?? '', $opciones['apoderado_nit'] ?? []),
                'Apoderado Cedula' => $this->aplicarOpcionesDato($row['Apoderado Cedula'] ?? '', $opciones['apoderado_cedula'] ?? []),
                'Apoderado Nombre' => $this->aplicarOpcionesDato($row['Apoderado Nombre'] ?? '', $opciones['apoderado_nombre'] ?? []),
                'Clave' => $this->aplicarOpcionesDato($row['Clave'] ?? '', $opciones['clave'] ?? []),
                'Linea' => $this->aplicarOpcionesDato($row['Linea'] ?? ($index + 1), $opciones['linea'] ?? [])
            ];

            $dataProcesada[] = $rowProcesada;
        }

        return $dataProcesada;
    }

    /**
     * Aplicar opciones de procesamiento a un dato
     */
    private function aplicarOpcionesDato(string $dato, array $opciones): string
    {
        // Limpiar dato base
        $dato = $this->limpiarDato($dato);

        // Aplicar opciones
        if (isset($opciones['mayusculas']) && $opciones['mayusculas']) {
            $dato = strtoupper($dato);
        }

        if (isset($opciones['minusculas']) && $opciones['minusculas']) {
            $dato = strtolower($dato);
        }

        if (isset($opciones['quitar_espacios']) && $opciones['quitar_espacios']) {
            $dato = str_replace(' ', '', $dato);
        }

        if (isset($opciones['prefijo'])) {
            $dato = $opciones['prefijo'] . $dato;
        }

        if (isset($opciones['sufijo'])) {
            $dato = $dato . $opciones['sufijo'];
        }

        return $dato;
    }

    /**
     * Obtener estadísticas de los datos
     */
    public function obtenerEstadisticas(array $dataQuorum): array
    {
        if (empty($dataQuorum)) {
            return [
                'total_registros' => 0,
                'con_apoderados' => 0,
                'sin_apoderados' => 0,
                'con_clave' => 0,
                'sin_clave' => 0
            ];
        }

        $totalRegistros = count($dataQuorum);
        $conApoderados = 0;
        $conClave = 0;

        foreach ($dataQuorum as $row) {
            // Verificar si tiene apoderado
            $apoderadoNit = $row['Apoderado Nit'] ?? '';
            if (!empty(trim($apoderadoNit))) {
                $conApoderados++;
            }

            // Verificar si tiene clave
            $clave = $row['Clave'] ?? '';
            if (!empty(trim($clave))) {
                $conClave++;
            }
        }

        return [
            'total_registros' => $totalRegistros,
            'con_apoderados' => $conApoderados,
            'sin_apoderados' => $totalRegistros - $conApoderados,
            'con_clave' => $conClave,
            'sin_clave' => $totalRegistros - $conClave,
            'porcentaje_con_apoderados' => $totalRegistros > 0 ? round(($conApoderados / $totalRegistros) * 100, 2) : 0,
            'porcentaje_con_clave' => $totalRegistros > 0 ? round(($conClave / $totalRegistros) * 100, 2) : 0
        ];
    }

    /**
     * Generar vista previa de datos
     */
    public function generarPreview(array $dataQuorum, int $limit = 10): array
    {
        if (empty($dataQuorum)) {
            return [
                'success' => false,
                'message' => 'No hay datos para previsualizar'
            ];
        }

        // Tomar solo los primeros registros para preview
        $datosPreview = array_slice($dataQuorum, 0, $limit);
        $dataProcesada = $this->procesarDatos($datosPreview);

        return [
            'success' => true,
            'data' => $dataProcesada,
            'total_preview' => count($dataProcesada),
            'total_original' => count($dataQuorum),
            'limit' => $limit
        ];
    }

    /**
     * Validar datos antes de generar reporte
     */
    public function validarDatos(array $dataQuorum): array
    {
        $errores = [];
        $advertencias = [];

        if (empty($dataQuorum)) {
            return [
                'valido' => false,
                'errores' => ['No hay datos para validar'],
                'advertencias' => []
            ];
        }

        foreach ($dataQuorum as $index => $row) {
            $linea = $index + 1;

            // Validaciones requeridas
            if (empty(trim($row['Nit'] ?? ''))) {
                $errores[] = "Línea {$linea}: El NIT es requerido";
            }

            if (empty(trim($row['Razón social'] ?? ''))) {
                $errores[] = "Línea {$linea}: La razón social es requerida";
            }

            if (empty(trim($row['Cedula representante'] ?? ''))) {
                $errores[] = "Línea {$linea}: La cédula del representante es requerida";
            }

            // Advertencias
            if (empty(trim($row['Apoderado Nit'] ?? ''))) {
                $advertencias[] = "Línea {$linea}: No tiene apoderado especificado";
            }

            if (empty(trim($row['Clave'] ?? ''))) {
                $advertencias[] = "Línea {$linea}: No tiene clave de acceso";
            }
        }

        return [
            'valido' => empty($errores),
            'errores' => $errores,
            'advertencias' => $advertencias,
            'total_errores' => count($errores),
            'total_advertencias' => count($advertencias)
        ];
    }
}
