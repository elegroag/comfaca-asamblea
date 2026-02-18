<?php

namespace App\Http\Middleware;

use App\Models\AsaUsuarios;
use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\SidebarPermisos;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'appName' => config('app.name'),
            'auth' => fn() => $this->getDataAuthUser($request),
            'flash' => [
                'message' => fn() => $request->session()->get('message'),
            ],
            'token' => fn() => $this->getSanctumToken($request)
        ]);
    }

    /**
     * Obtener token de Sanctum para el usuario autenticado
     */
    protected function getSanctumToken(Request $request): ?string
    {
        $user = $request->user();

        if (!$user) {
            return null;
        }

        $token = $user->tokens()->where('name', 'app')->where('expires_at', '>', now())->first();
        if (!$token) {
            $user->tokens()->where('name', 'app')->delete();
            $token = $user->createToken('app');
        }
        return $token->plainTextToken;
    }

    protected function getDataAuthUser(Request $request): array|null
    {
        $user = $request->user();

        if (!$user) {
            return null;
        }

        return [
            'user' => $user->only('id', 'name', 'email'),
            'roles' => [],
            'permissions' => [],
            'menu' => $this->getMenu($user)
        ];
    }

    protected function getMenu($user): array
    {
        $asaUsuarios = AsaUsuarios::where('cedtra', $user->cedtra)->first();

        return SidebarPermisos::where('rol', $asaUsuarios->rol)->with('sidebar')->get()->toArray();
    }
}
