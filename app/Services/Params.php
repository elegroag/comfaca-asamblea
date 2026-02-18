<?php

namespace App\Services;

class Params
{
    private $_params;

    public function __construct($__params)
    {
        $this->_params = $__params;
    }

    public function getParam($key)
    {
        return isset($this->_params[$key]) ? $this->_params[$key] : null;
    }

    public function setParam($key, $value)
    {
        $this->_params[$key] = $value;
    }

    public function getArguments()
    {
        return array_values($this->_params);
    }

    public function getKeys()
    {
        return array_keys($this->_params);
    }

    public function count()
    {
        return count($this->_params);
    }
}
