<?php

if (!function_exists('calemp_array')) {
    function calemp_array()
    {
        return array(
            'E' => 'EMPRESA',
            'I' => 'INDEPENDIENTE',
            'P' => 'PENSIONADO',
            'F' => 'FACULTATIVO',
            'D' => 'DESEMPLEADO'
        );
    }
}

if (!function_exists('coddoc_repleg_array')) {
    function coddoc_repleg_array()
    {
        return array(
            1 => 'CC',
            10 => 'TMF',
            11 => 'CD',
            12 => 'ISE',
            13 => 'V',
            14 => 'PT',
            2 => 'TI',
            3 => 'NI',
            4 => 'CE',
            5 => 'NU',
            6 => 'PA',
            7 => 'RC',
            8 => 'PEP',
            9 => 'CB'
        );
    }
}

if (!function_exists('tipper_array')) {
    function tipper_array()
    {
        return array(
            'N' => 'NATURAL',
            'J' => 'JURIDICA'
        );
    }
}

if (!function_exists('calemp_detalle_value')) {
    function calemp_detalle_value($calemp)
    {
        switch ($calemp) {
            case 'E':
                return 'EMPRESA';
                break;
            case 'I':
                return 'INDEPENDIENTE';
                break;
            case 'P':
                return 'PENSIONADO';
                break;
            case 'F':
                return 'FACULTATIVO';
                break;
            case 'D':
                return 'DESEMPLEADO';
                break;
            default:
                return null;
                break;
        }
    }
}

if (!function_exists('calemp_use_tipo_value')) {
    function calemp_use_tipo_value($detalle)
    {
        switch (strtolower($detalle)) {
            case 'empresa':
                return 'E';
                break;
            case 'independiente':
                return 'I';
                break;
            case 'pensionado':
                return 'O';
                break;
            case 'facultativo':
                return 'F';
                break;
            case 'desempleado':
                return 'D';
                break;
            default:
                return null;
                break;
        }
    }
}


if (!function_exists('estado_detalle_value')) {
    function estado_detalle_value($estado)
    {
        $return = "";
        if ($estado == "T") $return = "TEMPORAL";
        if ($estado == "D") $return = "DEVUELTO";
        if ($estado == "A") $return = "APROBADO";
        if ($estado == "X") $return = "RECHAZADO";
        return $return;
    }
}
