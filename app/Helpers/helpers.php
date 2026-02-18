<?php

// app/Helpers/helpers.php

if (!function_exists('format_price')) {
    /**
     * Formatea un número como un precio con el símbolo de la moneda.
     *
     * @param float $amount La cantidad a formatear.
     * @return string El precio formateado.
     */
    function format_price(float $amount): string
    {
        // Puedes hacer esta lógica tan compleja como necesites
        return '$' . number_format($amount, 2);
    }
}

if (!function_exists('get_initials')) {
    /**
     * Obtiene las iniciales de un nombre completo.
     *
     * @param string $name El nombre completo.
     * @return string Las iniciales.
     */
    function get_initials(string $name): string
    {
        $words = explode(' ', $name);
        $initials = '';
        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper($word[0]);
            }
        }
        return $initials;
    }
}

if (!function_exists('get_params_destructures')) {
    /**
     * get_params_destructures function
     *
     * @param array $data
     * @return array
     */
    function get_params_destructures(array $data): array
    {
        $params = [];
        if (is_array($data) && count($data) > 0) {
            foreach ($data as $item) {
                if (stristr($item, ':') === FALSE) {
                    $params[0] = trim($item);
                    continue;
                }
                $name = substr($item, 0, strpos($item, ':'));
                $params[$name] = trim(substr($item, strpos($item, ':') + 1));
            }
        }
        return $params;
    }
}

require_once __DIR__ . '/format.php';
require_once __DIR__ . '/flash.php';
require_once __DIR__ . '/files.php';
require_once __DIR__ . '/hashes.php';
require_once __DIR__ . '/company.php';
