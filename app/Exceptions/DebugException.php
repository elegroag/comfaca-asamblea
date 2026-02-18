<?php

namespace App\Exceptions;

use Exception;
use Throwable;
use Illuminate\Http\Request;

class DebugException extends Exception
{
    static $errors = array();
    protected $extra = null;
    protected $orderId;

    public function __construct(string $message = "", int $code = 0, $extra = null, ?Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
        $this->extra = $extra;
    }

    public function context()
    {
        return ['order_id' => $this->orderId];
    }

    public function report()
    {
        $this->addMessage('mensaje', $this->getMessage());
        $this->addMessage('codigo', $this->getCode());
        $this->addMessage('linea', $this->getLine());
        $this->addMessage('archivo', $this->getFile());
    }

    public function render(Request $request)
    {
        return response()->json(
            [
                "success" => false,
                "exception" => 1,
                "message" => $this->getMessage(),
                "msj" => $this->getMessage(),
                'request' => $request,
                'extra' => $this->extra,
                'out' => [
                    'code' => $this->getCode(),
                    'file' => basename($this->getFile()),
                    'line' => $this->getLine()
                ]
            ], 203
        );
    }

    public static function add($key,  $collect)
    {
        self::$errors[$key] = $collect;
    }

    public static function item($key)
    {
        return (isset(self::$errors[$key])) ? self::$errors[$key] : "";
    }

    public function addMessage($item, $value){

    }
} 