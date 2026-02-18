<?php

if (!function_exists('capitalize')) {
    /**
     * capitalize
     * dar formato a las palabras que estan en mayusculas 
     * @param  mixed $string
     * @return string
     */
    function capitalize($string)
    {
        $exp = explode(" ", strtolower($string));
        $parts = "";
        foreach ($exp as $row) {
            if (strlen(trim($row)) > 0) {
                $parts .= " " . ucfirst($row);
            }
        }
        return trim($parts);
    }
}

if (!function_exists('encode_utf8')) {
    /**
     * utf8 codificar
     * dar formato a las palabras que estan en mayusculas 
     * @param  mixed $string
     * @return void
     */
    function encode_utf8($data, $lower = null)
    {
        if (is_array($data)) {
            $dt = array();
            //multiples filas
            if (isset($data[0])) {
                foreach ($data as $ai => $row) {
                    foreach ($row as $key => $value) {
                        if (is_numeric($value)) {
                            $dt[$ai][$key] = $value;
                        } else {
                            $encode = mb_detect_encoding($value);
                            switch ($encode) {
                                case 'ASCII':
                                    $value = mb_convert_encoding($value, "ISO-8859-1", "ASCII");
                                    break;
                                case 'ISO-8859-1':
                                    $value = mb_convert_encoding($value, "UTF-8", "ISO-8859-1");
                                    break;
                                case 'UTF-7':
                                    $value = mb_convert_encoding($value, "UTF-8", "UTF-7");
                                    break;
                            }
                            $value = ($lower) ? strtolower($value) : $value;
                            $dt[$ai][$key] = $value;
                        }
                    }
                }
            } else {
                //1 fila
                foreach ($data as $key => $value) {
                    if (is_numeric($value)) {
                        $dt[$key] = $value;
                    } else {
                        $encode = mb_detect_encoding($value);
                        switch ($encode) {
                            case 'ASCII':
                                $value = mb_convert_encoding($value, "ISO-8859-1", "ASCII");
                                $value = utf8_decode($value);
                                break;
                            case 'ISO-8859-1':
                                $value = mb_convert_encoding($value, "UTF-8", "ISO-8859-1");
                                break;
                            case 'UTF-7':
                                $value = mb_convert_encoding($value, "UTF-8", "UTF-7");
                                break;
                        }
                        $value = ($lower) ? strtolower($value) : $value;
                        $dt[$key] = $value;
                    }
                }
            }
            $data = $dt;
        } else {
            $encode = mb_detect_encoding($data);
            switch ($encode) {
                case 'ASCII':
                    $value = mb_convert_encoding($data, "UTF-8", "ASCII");
                    break;
                case 'ISO-8859-1':
                    $value = mb_convert_encoding($data, "UTF-8", "ISO-8859-1");
                    break;
                case 'UTF-7':
                    $value = mb_convert_encoding($data, "UTF-8", "UTF-7");
                    break;
            }
            $data = ($lower) ? strtolower($data) : $data;
        }
        return $data;
    }
}

if (!function_exists('mask_email')) {
    function mask_email($email)
    {
        $em   = explode("@", $email);
        $name = implode('@', array_slice($em, 0, count($em) - 1));
        $len  = floor(strlen($name) / 2);
        return substr($name, 0, $len) . str_repeat('*', $len) . "@" . end($em);
    }
}

if (!function_exists('validar_email')) {
    function validar_email($str)
    {
        return (!preg_match("/^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,10}$/ix", $str)) ? FALSE : TRUE;
    }
}

if (!function_exists('validar_clave')) {
    function validar_clave($str)
    {
        return (!preg_match('/^(?=.*[0-9])(?=.*[A-Z]).{8,20}$/', $str)) ? FALSE : TRUE;
    }
}

if (!function_exists('utf8n')) {
    function utf8n($string)
    {
        $encode = mb_detect_encoding($string);
        switch (strtoupper($encode)) {
            case 'ASCII':
                $nstring = mb_convert_encoding($string, "UTF-8", "ASCII");
                break;
            case 'ISO-8859-1':
                $nstring = mb_convert_encoding($string, "UTF-8", "ISO-8859-1");
                break;
            case 'UTF-7':
                $nstring = mb_convert_encoding($string, "UTF-8", "UTF-7");
                break;
            case 'WINDOWS-1252':
                $nstring = mb_convert_encoding($string, "UTF-8", "WINDOWS-1252");
                break;
            default:
                $nstring = $string;
                break;
        }

        $nstring = str_replace(array('Ã±', "Ã`"), 'Ñ', $nstring);
        $nstring = str_replace('Ã“', 'Ó', $nstring);
        return $nstring;
    }
}

if (!function_exists('sanetizar')) {
    function sanetizar($string)
    {
        $string = trim($string);
        $string = str_replace(
            array('á', 'à', 'ä', 'â', 'ª', 'Á', 'À', 'Â', 'Ä'),
            array('a', 'a', 'a', 'a', 'a', 'A', 'A', 'A', 'A'),
            $string
        );

        $string = str_replace(
            array('é', 'è', 'ë', 'ê', 'É', 'È', 'Ê', 'Ë'),
            array('e', 'e', 'e', 'e', 'E', 'E', 'E', 'E'),
            $string
        );

        $string = str_replace(
            array('í', 'ì', 'ï', 'î', 'Í', 'Ì', 'Ï', 'Î'),
            array('i', 'i', 'i', 'i', 'I', 'I', 'I', 'I'),
            $string
        );

        $string = str_replace(
            array('ó', 'ò', 'ö', 'ô', 'Ó', 'Ò', 'Ö', 'Ô'),
            array('o', 'o', 'o', 'o', 'O', 'O', 'O', 'O'),
            $string
        );

        $string = str_replace(
            array('ú', 'ù', 'ü', 'û', 'Ú', 'Ù', 'Û', 'Ü'),
            array('u', 'u', 'u', 'u', 'U', 'U', 'U', 'U'),
            $string
        );

        $string = str_replace(
            array('ñ', 'Ñ', 'ç', 'Ç'),
            array('n', 'N', 'c', 'C',),
            $string
        );

        $string = str_replace(
            array(
                "¨",
                "º",
                "-",
                "~",
                "·",
                "$",
                "%",
                "&",
                "/",
                "°",
                "(",
                ")",
                "?",
                "'",
                "¡",
                "¿",
                "[",
                "^",
                "<code>",
                "]",
                "+",
                "}",
                "{",
                "¨",
                "´",
                ">",
                "< ",
                ";",
                ",",
                ":"
            ),
            '',
            $string
        );

        return $string;
    }
}


if (!function_exists('sanetizar_input')) {
    function sanetizar_input($string)
    {
        $string = trim($string);
        $string = str_replace(
            array(
                "¨",
                "º",
                "-",
                "~",
                "·",
                "$",
                "%",
                "&",
                "/",
                "°",
                "(",
                ")",
                "?",
                "'",
                "¡",
                "¿",
                "[",
                "^",
                "<code>",
                "]",
                "+",
                "}",
                "{",
                "¨",
                "´",
                ">",
                "< ",
                ";",
                ",",
                ":"
            ),
            '',
            $string
        );
        return $string;
    }
}

if (!function_exists('sanetizar_date')) {
    function sanetizar_date($string)
    {
        $string = trim($string);
        $string = str_replace(
            array(
                'b',
                'c',
                'd',
                'e',
                'f',
                'g',
                'h',
                'i',
                'j',
                'k',
                'l',
                'n',
                'o',
                'q',
                'r',
                's',
                't',
                'u',
                'v',
                'w',
                'x',
                'y',
                'z',
                'B',
                'C',
                'D',
                'E',
                'F',
                'G',
                'H',
                'I',
                'J',
                'K',
                'L',
                'N',
                'O',
                'Q',
                'R',
                'S',
                'T',
                'U',
                'V',
                'W',
                'X',
                'Y',
                'Z',
                "¨",
                "º",
                "~",
                "·",
                "$",
                "%",
                "&",
                "°",
                "(",
                ")",
                "?",
                "'",
                "¡",
                "¿",
                "[",
                "^",
                "<code>",
                "]",
                "+",
                "}",
                "{",
                "¨",
                "´",
                ">",
                "< ",
                ";",
                ","
            ),
            '',
            $string
        );
        return $string;
    }
}

if (!function_exists('mimeType')) {

    function mimeType($type)
    {
        $data = array(
            "html" => "text/html",
            "htm" => "text/html",
            "shtml" => "text/html",
            "css" => "text/css",
            "xml" => "text/xml",
            "gif" => "image/gif",
            "jpeg" => "image/jpeg",
            "jpg" => "image/jpeg",
            "js" => "application/javascript",
            "atom" => "application/atom+xml",
            "rss" => "application/rss+xml",
            "mml" => "text/mathml",
            "txt" => "text/plain",
            "jad" => "text/vnd.sun.j2me.app-descriptor",
            "wml" => "text/vnd.wap.wml",
            "htc" => "text/x-component",
            "png" => "image/png",
            "tif" => "image/tiff",
            "tiff" => "image/tiff",
            "wbmp" => "image/vnd.wap.wbmp",
            "ico" => "image/x-icon",
            "jng" => "image/x-jng",
            "bmp" => "image/x-ms-bmp",
            "svg" => "image/svg+xml",
            "svgz" => "image/svg+xml",
            "webp" => "image/webp",
            "woff" => "application/font-woff",
            "jar" => "application/java-archive",
            "war" => "application/java-archive",
            "ear" => "application/java-archive",
            "json" => "application/json",
            "hqx" => "application/mac-binhex40",
            "doc" => "application/msword",
            "pdf" => "application/pdf",
            "ps" => "application/postscript",
            "eps" => "application/postscript",
            "ai" => "application/postscript",
            "rtf" => "application/rtf",
            "m3u8" => "application/vnd.apple.mpegurl",
            "xls" => "application/vnd.ms-excel",
            "eot" => "application/vnd.ms-fontobject",
            "ppt" => "application/vnd.ms-powerpoint",
            "wmlc" => "application/vnd.wap.wmlc",
            "kml" => "application/vnd.google-earth.kml+xml",
            "kmz" => "application/vnd.google-earth.kmz",
            "7z" => "application/x-7z-compressed",
            "cco" => "application/x-cocoa",
            "jardiff" => "application/x-java-archive-diff",
            "jnlp" => "application/x-java-jnlp-file",
            "run" => "application/x-makeself",
            "pl" => "application/x-perl",
            "pm" => "application/x-perl",
            "prc" => "application/x-pilot",
            "pdb" => "application/x-pilot",
            "rar" => "application/x-rar-compressed",
            "rpm" => "application/x-redhat-package-manager",
            "sea" => "application/x-sea",
            "swf" => "application/x-shockwave-flash",
            "sit" => "application/x-stuffit",
            "tcl" => "application/x-tcl",
            "tk" => "application/x-tcl",
            "der" => "application/x-x509-ca-cert",
            "pem" => "application/x-x509-ca-cert",
            "crt" => "application/x-x509-ca-cert",
            "xpi" => "application/x-xpinstall",
            "xhtml" => "application/xhtml+xml",
            "xspf" => "application/xspf+xml",
            "zip" => "application/zip",
            "epub" => "application/epub+zip",
            "docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "mid" => "audio/midi",
            "midi" => "audio/midi",
            "kar" => "audio/midi",
            "mp3" => "audio/mpeg",
            "ogg" => "audio/ogg",
            "m4a" => "audio/x-m4a",
            "ra" => "audio/x-realaudio",
            "3gpp" => "video/3gpp",
            "3gp" => "video/3gpp",
            "ts" => "video/mp2t",
            "mp4" => "video/mp4",
            "mpeg" => "video/mpeg",
            "mpg" => "video/mpeg",
            "mov" => "video/quicktime",
            "webm" => "video/webm",
            "flv" => "video/x-flv",
            "m4v" => "video/x-m4v",
            "mng" => "video/x-mng",
            "asx" => "video/x-ms-asf",
            "asf" => "video/x-ms-asf",
            "wmv" => "video/x-ms-wmv",
            "avi" => "video/x-msvideo"
        );
        return $data["{$type}"];
    }
}

if (!function_exists('d')) {
    /**
     * Depura e imprime una o más variables sin terminar la ejecución del script.
     * @param mixed ...$vars Las variables a inspeccionar.
     * @return void
     */
    function d($vars)
    {
        $isCli = (php_sapi_name() == 'cli');
        if ($isCli) {
            echo "\033[96m" . "dump--------------------\n" . "\033[0m"; // Cian
            echo "\033[97m";
            var_dump($vars);
            echo "\033[0m";
            echo "\033[96m" . "end--------------------\n" . "\033[0m";
        } else {
            echo '<pre style="background-color: #e0f7fa; border: 1px solid #b2ebf2; padding: 10px; margin: 10px; border-radius: 4px; overflow-x: auto; font-family: monospace; font-size: 14px; line-height: 1.5;">';
            echo '<span style="color: #00BCD4;">dump--------------------</span><br>'; // Cian
            echo '<code style="color: #333;">';
            var_dump($vars);
            echo '</code>';
            echo '<span style="color: #00BCD4;"><br>end--------------------</span>';
            echo '</pre>';
        }
    }
}

if (!function_exists('is_ajax')) {
    function is_ajax()
    {
        if (
            isset($header['Authorization']) ||
            (
                empty($_SERVER['HTTP_X_REQUESTED_WITH']) == False &&
                strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest')
        ) {
            return true;
        } else {
            return false;
        }
    }
}

if (!function_exists('public_url')) {
    function public_url($resource = '')
    {
        if ($resource == '') {
            return env('APP_URL') . '/public/';
        } else {
            return env('APP_URL') . '/public/' . trim($resource);
        }
    }
}

if (!function_exists('get_mes_name')) {
    /**
     * Retorna el nombre del mes en español a partir de un número de mes (1-12 o cadena "01"-"12").
     * @param int|string $month
     * @return string
     */
    function get_mes_name($month)
    {
        $meses = array(
            1 => 'Enero',
            2 => 'Febrero',
            3 => 'Marzo',
            4 => 'Abril',
            5 => 'Mayo',
            6 => 'Junio',
            7 => 'Julio',
            8 => 'Agosto',
            9 => 'Septiembre',
            10 => 'Octubre',
            11 => 'Noviembre',
            12 => 'Diciembre'
        );
        $idx = intval($month);
        return isset($meses[$idx]) ? $meses[$idx] : '';
    }
}
