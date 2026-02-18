<?php

namespace App\Models\Adapter;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

trait ValidateWithRules
{
    /**
     * Boot the trait.
     *
     * @return void
     */
    public static function booted()
    {
        static::saving(function ($model) {
            $model->validateRules();
        });

        // El evento `creating` se dispara antes de crear un nuevo registro
        static::creating(function ($model) {
            $model->validateRules();
        });

        // El evento `updating` se dispara antes de actualizar un registro
        static::updating(function ($model) {
            $model->validateRules();
        });
    }

    /**
     * Perform the validation.
     *
     * @return void
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function validateRules()
    {
        $validator = Validator::make($this->getAttributes(), $this->rules());

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }
}
