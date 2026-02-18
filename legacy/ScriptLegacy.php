<?php
// En tu controlador, comando de Artisan, o cualquier otro archivo PHP
// donde ejecutas el script que genera warnings.

class ScriptLegacy
{

    public function execute($dir)
    {
        // 1. Guardar el nivel de reporte de errores actual
        $originalErrorReporting = error_reporting();

        // 2. Establecer el reporte de errores para ignorar warnings (E_WARNING)
        // Puedes combinar otros niveles si quieres ignorar más tipos de errores,
        // pero manteniendo los errores fatales.
        error_reporting($originalErrorReporting & ~E_WARNING);

        // O, si quieres ignorar TODOS los errores (warnings, notices, deprecations, etc.)
        // y solo ver los errores fatales (E_ERROR), podrías hacer:
        // error_reporting(E_ERROR);

        // Si quieres ignorar TODO, incluso los errores fatales (NO RECOMENDADO), usa:
        // error_reporting(0); // Esto apaga todo el reporte de errores

        // Opcional: También puedes suprimir la visualización de errores temporalmente
        // si los warnings se están mostrando directamente en la salida.
        $originalDisplayErrors = ini_get('display_errors');
        ini_set('display_errors', 'Off');


        // 3. Incluir o ejecutar tu script problemático aquí
        // Asegúrate de que la ruta sea correcta.
        // Por ejemplo, si está en storage/app/scripts/mi_script_legado.php
        require_once storage_path($dir);

        // 4. Restaurar el nivel de reporte de errores a su estado original
        error_reporting($originalErrorReporting);

        // Opcional: Restaurar la visualización de errores
        ini_set('display_errors', $originalDisplayErrors);
    }
}
