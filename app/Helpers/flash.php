<?php
 
 use Illuminate\Support\Facades\Session;

if (!function_exists('set_flashdata')) {
    /**
     * capitalize
     * dar formato a las palabras que estan en mayusculas 
     * @param  mixed $string
     * @return string
     */
    function set_flashdata($item, $data, $persiste = false)
    {
        // Almacena datos temporales usando la sesión de Laravel
        if ($persiste) {
            // Persistente hasta que se elimine manualmente
            $messages = session('PERSISTE', []);
            $messages["{$item}"] = $data;
            Session::put('PERSISTE', $messages);
        } else {
            // Solo para el próximo request (flash)
            $messages = session('FLASH', []);
            $messages["{$item}"] = $data;
            // flash reemplaza la clave completa, por eso acumulamos antes
            session()->flash('FLASH', $messages);
        }
    }
}

if (!function_exists('get_flashdata')) {
    function get_flashdata($destroy = false)
    {
        $messages = session('FLASH', []);
        if ($destroy) {
            // Opcionalmente eliminar inmediatamente (aunque flash expira solo)
            Session::forget('FLASH');
        }
        return $messages;
    }
}

if (!function_exists('get_flashdata_item')) {
    function get_flashdata_item($item, $destroy = false)
    {
        $messages1 = session('FLASH', []);
        $messages2 = session('PERSISTE', []);
        if ($destroy) {
            // Mantiene comportamiento previo: elimina ambos contenedores
            Session::forget('FLASH');
            Session::forget('PERSISTE');
        }
        $msj = isset($messages1["{$item}"]) ? $messages1["{$item}"] : false;
        if (empty($msj)) {
            $msj = isset($messages2["{$item}"]) ? $messages2["{$item}"] : false;
        }
        return $msj;
    }
}