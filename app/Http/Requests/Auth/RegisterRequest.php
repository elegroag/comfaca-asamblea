<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'usuario' => 'required|string|unique:usuario_sisu,usuario|max:255',
            'cedtra' => 'nullable|string|unique:usuario_sisu,cedtra|max:18',
            'nombre' => 'required|string|max:255',
            'email' => 'nullable|email|unique:usuario_sisu,email|max:255',
            'password' => 'required|string|min:8|confirmed',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'usuario.required' => 'El campo usuario es obligatorio.',
            'usuario.string' => 'El usuario debe ser texto.',
            'usuario.unique' => 'Este usuario ya está registrado.',
            'usuario.max' => 'El usuario no puede tener más de 255 caracteres.',
            
            'cedtra.string' => 'La cédula debe ser texto.',
            'cedtra.unique' => 'Esta cédula ya está registrada.',
            'cedtra.max' => 'La cédula no puede tener más de 18 caracteres.',
            
            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.string' => 'El nombre debe ser texto.',
            'nombre.max' => 'El nombre no puede tener más de 255 caracteres.',
            
            'email.email' => 'El email debe ser una dirección válida.',
            'email.unique' => 'Este email ya está registrado.',
            'email.max' => 'El email no puede tener más de 255 caracteres.',
            
            'password.required' => 'El campo contraseña es obligatorio.',
            'password.string' => 'La contraseña debe ser texto.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'usuario' => 'usuario',
            'cedtra' => 'cédula',
            'nombre' => 'nombre',
            'email' => 'email',
            'password' => 'contraseña',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Si se envía 'name' pero no 'nombre', adaptar el campo
        if ($this->has('name') && !$this->has('nombre')) {
            $this->merge([
                'nombre' => $this->input('name'),
            ]);
        }
    }

    /**
     * Get the user data for registration.
     */
    public function getUserData(): array
    {
        $validated = $this->validated();
        
        return [
            'usuario' => $validated['usuario'],
            'cedtra' => $validated['cedtra'] ?? null,
            'nombre' => $validated['nombre'],
            'email' => $validated['email'] ?? null,
            'password' => bcrypt($validated['password']),
            'is_active' => 'S',
        ];
    }
}