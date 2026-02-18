<?php
if (!function_exists('clave_hash')) {
    /**
     * password_hash
     * @return void
     */
    function clave_hash($password, $cost = 10)
    {
        $salt = substr(base64_encode(openssl_random_pseudo_bytes(17)), 0, 22);
        $salt = str_replace("+", ".", $salt);
        $param = '$' . implode('$', array(
            "2y", //select the most secure version of blowfish (>=PHP 5.3.7)
            str_pad($cost, 2, "0", STR_PAD_LEFT), //add the cost in two digits
            $salt //add the salt
        ));
        return crypt($password, $param);
    }
}

if (!function_exists('clave_verify')) {
    /**
     * clave_verify
     * @return void
     */
    function clave_verify($password, $hash)
    {
        /* Regenerating the with an available hash as the options parameter should
         * produce the same hash if the same password is passed.
        */
        return crypt($password, $hash) == $hash;
    }
}

if (!function_exists('password_hash_old')) {
    /**
     * password_hash_old
     * procesar la clave vieja de autenticacion
     * @return string
     */
    function password_hash_old($password)
    {
        $mclave = '';
        for ($i = 0; $i < strlen($password); $i++) {
            if ($i % 2 != 0) {
                $x = 6;
            } else {
                $x = -4;
            }
            $mclave .= chr(ord(substr($password, $i, 1)) + $x + 5);
        }
        return $mclave;
    }
}


if (!function_exists('generate_key')) {
    function generate_key()
    {
        $pass = "";
        $seed = str_split('abcdefghijklmnopqrstuvwxyz1234567890');
        shuffle($seed);
        foreach (array_rand($seed, 5) as $k) $pass .= $seed[$k];
        $mclave = '';
        for ($i = 0; $i < strlen($pass); $i++) {
            if ($i % 2 != 0) {
                $x = 6;
            } else {
                $x = -4;
            }
            $mclave .= chr(ord(substr($pass, $i, 1)) + $x + 5);
        }
        return array(md5($mclave), $pass);
    }
}


if (!function_exists('Kencrypt')) {
    function Kencrypt($token)
    {
        $iv = "";
        $seed = str_split('1234567890123456');
        shuffle($seed);
        foreach (array_rand($seed, 16) as $k) $iv .= $seed["$k"];
        $encryptedData = openssl_encrypt($token, "AES-256-CTR", "8QGTBVnqGh5A4a2WST0ztVU0eB9p2lSHwWWXy1GlSAhPoXyNMw-2023", 0, $iv);
        return array($encryptedData, $iv);
    }
}

if (!function_exists('Kdecrypt')) {
    function Kdecrypt($encryptedData, $iv)
    {
        $token = openssl_decrypt($encryptedData, 'AES-256-CTR', '8QGTBVnqGh5A4a2WST0ztVU0eB9p2lSHwWWXy1GlSAhPoXyNMw-2023', 0, $iv);
        return $token;
    }
}

if (!function_exists('generaCode')) {
    function generaCode(int|null $length = null)
    {
        $code = "";
        if (!$length) {
            $seed = str_split('1234567890');
            shuffle($seed);
            foreach (array_rand($seed, 4) as $k) $code .= $seed[$k];
            return $code;
        } else {
            $seed = str_split('abcdefghijklmnopqrstuvwxyz1234567890');
            shuffle($seed);
            foreach (array_rand($seed, $length) as $k) $code .= $seed[$k];
        }
        return $code;
    }
}
