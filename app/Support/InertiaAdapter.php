<?php

namespace App\Support;

use Inertia\Inertia;

/**
 * Adapter simplificado para renderizar exclusivamente vistas de Inertia.
 * Patrón: Adapter. Mantiene una API mínima y clara.
 */
class InertiaAdapter
{

    public static function setLayout(string $rootView)
    {
        if ($rootView) {
            Inertia::setRootView($rootView);
        }
    }

    /**
     * Renderiza un componente de Inertia con las props suministradas.
     * @param string $component Nombre del componente Inertia (por ejemplo: 'Tasks/Index')
     * @param array  $props     Props a inyectar en el componente
     * @param string|null $rootView Vista Blade raíz (por ejemplo: 'app' o 'layouts/admin')
     */
    public static function render(string $component, array $props = [], ?string $rootView = null)
    {
        if ($rootView) {
            Inertia::setRootView($rootView);
        }
        return Inertia::render($component, $props);
    }

    /** Azúcar sintáctico equivalente a render() */
    public static function inertia(string $component, array $props = [], ?string $rootView = null)
    {
        if ($rootView) {
            Inertia::setRootView($rootView);
        }
        return Inertia::render($component, $props);
    }
}
