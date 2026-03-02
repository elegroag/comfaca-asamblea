<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PerfilApiController extends Controller
{
    /**
     * Página de perfil de usuario
     */
    public function profile()
    {
        $this->initialize('primary');

        $user = Auth::user();

        $profileData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i:s'),
            'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
        ];

        // Dual response: HTML/Inertia o JSON
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Profile loaded successfully',
                'data' => $profileData
            ]);
        }
    }

    /**
     * Actualizar perfil de usuario
     */
    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . Auth::id(),
        ]);

        $user = Auth::user();
        // Actualizar usuario usando query builder para evitar problemas de IDE
        DB::table('users')
            ->where('id', $user->id)
            ->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'updated_at' => now(),
            ]);

        // Recargar usuario desde la base de datos
        $updatedUser = DB::table('users')
            ->where('id', $user->id)
            ->first();

        // Dual response: HTML/Inertia o JSON
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $updatedUser
            ]);
        }
    }
}
