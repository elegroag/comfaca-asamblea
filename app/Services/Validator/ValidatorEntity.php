<?php

namespace App\Services\Validator;

use Exception;
use DateTime;

trait ValidatorTrait
{
    protected $validator;
    protected $entity;

    public function create($data)
    {
        $this->entity = array();
        foreach ($this->fillable as $key) {
            $this->entity[$key] = isset($data[$key]) ? $data[$key] : null;
        }
    }

    public function getData()
    {
        return $this->entity;
    }

    public function initValidator()
    {
        $this->validator = new ValidatorEntity();
        $this->validator->setRules($this->getRules());
    }

    public function validate()
    {
        if (!$this->validator) {
            $this->initValidator();
        }
        return $this->validator->validate($this->entity);
    }

    public function getValidationErrors()
    {
        return $this->validator ? $this->validator->getErrors() : [];
    }

    public function getAttrErrors()
    {
        return $this->validator ? $this->validator->getAttrErrors() : [];
    }

    // Este método debe ser implementado por cada modelo
    abstract protected function getRules();
}

class ValidatorEntity
{
    protected $rules = [];

    protected $errors = [];

    protected $attrerrors = [];

    public function setRules(array $rules)
    {
        $this->rules = $rules;
    }

    public function validate($entity)
    {
        $this->errors = [];

        foreach ($entity as $field => $value) {
            if (isset($this->rules[$field])) {
                $this->validateField($field, $value, $this->rules[$field]);
            }
        }

        return empty($this->errors);
    }

    protected function validateField($field, $value, $rules)
    {
        if (is_null($value) && isset($rules['is_null']) && !$rules['is_null']) {
            $this->addError($field, "El campo {$field} no puede ser nulo");
        }

        if (is_null($value) && isset($rules['is_null']) && $rules['is_null']) {
            return;
        }
        // Validar tipo de dato
        switch ($rules['type']) {
            case 'numeric':
                if (!empty($value) && !is_numeric($value)) {
                    $this->addError($field, "El campo debe ser numérico");
                }
                break;
            case 'email':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->addError($field, "El campo debe ser un email válido");
                }
                break;
            case 'rangelength':
                if (!empty($value) && strlen($value) < $rules['min'] || strlen($value) > $rules['max']) {
                    $this->addError($field, "El campo {$field} debe tener entre {$rules['min']} y {$rules['max']} caracteres");
                }
                break;
            case 'enum':
                if (!empty($value) && !in_array($value, $rules['values'])) {
                    $this->addError($field, "El campo {$field} debe ser uno de los siguientes valores: " . implode(', ', $rules['values']));
                }
                break;
            case 'date':
                if (!empty($value) && !$this->isValidDate($value)) {
                    $this->addError($field, "El campo {$field} debe ser una fecha válida");
                }
                break;
            case 'integer':
                if (!empty($value) && !is_int($value)) {
                    $this->addError($field, "El campo {$field} debe ser un entero");
                }
                break;
            case 'string':
                if (!empty($value) && !is_string($value)) {
                    $this->addError($field, "El campo {$field} debe ser un string");
                }
                break;
            default:
                if (!isset($rules['is_null']) || !$rules['is_null']) {
                    if (empty($value)) {
                        $this->addError($field, "El campo es obligatorio");
                    }
                }
                break;
        }

        if ($rules['type'] == 'numeric' && isset($rules['range'])) {
            if ($value < $rules['min'] || $value > $rules['max']) {
                $this->addError($field, "El campo {$field} debe tener entre {$rules['min']} y {$rules['max']} caracteres");
            }
        }

        // Validar longitud máxima
        if (isset($rules['max']) && strlen($value) > $rules['max']) {
            $this->addError($field, "El campo {$field} excede el tamaño máximo de {$rules['max']} caracteres");
        }
    }

    protected function isValidDate($date)
    {
        if (empty($date)) return true;

        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }

    protected function addError($field, $message)
    {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
            $this->attrerrors[] = $field;
        }
        $this->errors[$field][] = $message;
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function getAttrErrors()
    {
        return $this->attrerrors;
    }
}


class EntityException extends Exception
{
    public $errors;
    public function __construct($errors)
    {
        parent::__construct('Error validación de datos', 501);
        $this->errors = $errors;
    }

    public function getErrors()
    {
        return $this->errors;
    }
}
