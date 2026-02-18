<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\UsuarioSisu;

class LoginRequest extends FormRequest
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
            'usuario' => 'required|string',
            'password' => 'required|string',
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
            'password.required' => 'El campo contraseña es obligatorio.',
            'password.string' => 'La contraseña debe ser texto.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'usuario' => 'usuario',
            'password' => 'contraseña',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Si se envía 'email' pero no 'usuario', adaptar el campo
        if ($this->has('email') && !$this->has('usuario')) {
            $this->merge([
                'usuario' => $this->input('email'),
            ]);
        }
    }

    /**
     * Get the credentials for authentication.
     */
    public function getCredentials(): array
    {
        $validated = $this->validated();
        $usuarioInput = $validated['usuario'];
        
        // Verificar si el input es un email o un nombre de usuario
        $user = UsuarioSisu::where('usuario', $usuarioInput)
            ->orWhere('email', $usuarioInput)
            ->first();
        
        if ($user) {
            // Si encontramos el usuario, usar el campo 'usuario' para autenticación
            return [
                'usuario' => $user->usuario,
                'password' => $validated['password'],
            ];
        }
        
        // Si no encontramos el usuario, usar el input como está
        return [
            'usuario' => $usuarioInput,
            'password' => $validated['password'],
        ];
    }
}