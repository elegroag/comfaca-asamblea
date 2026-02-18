<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sidebar;
use App\Models\SidebarPermisos;

class SidebarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menuItems = [
            // Menú principal - Recepción
            [
                'label' => 'RECEPCIÓN',
                'estado' => 'activo',
                'resource_router' => null,
                'orden' => 1,
                'sidebar_id' => null,
                'ambiente' => 'todos',
                'icon' => 'nc-icon nc-book-bookmark',
                'hijos' => [
                    [
                        'label' => 'Registro de Ingresos',
                        'estado' => 'activo',
                        'resource_router' => 'registro-ingresos',
                        'orden' => 1,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-single-02',
                    ],
                    [
                        'label' => 'Control de Acceso',
                        'estado' => 'activo',
                        'resource_router' => 'control-acceso',
                        'orden' => 2,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-key-25',
                    ],
                ]
            ],

            // Menú principal - Poderes
            [
                'label' => 'PODERES',
                'estado' => 'activo',
                'resource_router' => null,
                'orden' => 2,
                'sidebar_id' => null,
                'ambiente' => 'todos',
                'icon' => 'nc-icon nc-briefcase-24',
                'hijos' => [
                    [
                        'label' => 'Gestión de Poderes',
                        'estado' => 'activo',
                        'resource_router' => 'poderes#listar',
                        'orden' => 1,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-paper',
                    ],
                    [
                        'label' => 'Buscar Poder',
                        'estado' => 'activo',
                        'resource_router' => 'poderes#buscar',
                        'orden' => 2,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-paper',
                    ],
                    [
                        'label' => 'Nuevo Poder',
                        'estado' => 'activo',
                        'resource_router' => 'poderes#crear',
                        'orden' => 3,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-paper',
                    ],
                    [
                        'label' => 'Masivo',
                        'estado' => 'activo',
                        'resource_router' => 'poderes#masivo',
                        'orden' => 4,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-paper',
                    ],
                    [
                        'label' => 'Rechazar Poder',
                        'estado' => 'activo',
                        'resource_router' => 'poderes#rechazar',
                        'orden' => 5,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-badge',
                    ],
                ]
            ],

            // Menú principal - Empresas
            [
                'label' => 'EMPRESAS HABILES',
                'estado' => 'activo',
                'resource_router' => null,
                'orden' => 3,
                'sidebar_id' => null,
                'ambiente' => 'todos',
                'icon' => 'nc-icon nc-bulb-63',
                'hijos' => [
                    [
                        'label' => 'Lista de Empresas',
                        'estado' => 'activo',
                        'resource_router' => 'empresas',
                        'orden' => 1,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-shop',
                    ],
                    [
                        'label' => 'Novedades',
                        'estado' => 'activo',
                        'resource_router' => 'novedades',
                        'orden' => 2,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-refresh-69',
                    ],
                ]
            ],

            // Menú principal - Cartera
            [
                'label' => 'CARTERA',
                'estado' => 'activo',
                'resource_router' => null,
                'orden' => 4,
                'sidebar_id' => null,
                'ambiente' => 'todos',
                'icon' => 'nc-icon nc-bank',
                'hijos' => [
                    [
                        'label' => 'Conceptos de Cartera',
                        'estado' => 'activo',
                        'resource_router' => 'carteras',
                        'orden' => 1,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-money-coins',
                    ],
                    [
                        'label' => 'Reportes Financieros',
                        'estado' => 'activo',
                        'resource_router' => 'reportes-financieros',
                        'orden' => 2,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-chart-bar-32',
                    ],
                ]
            ],

            // Menú principal - Asambleas
            [
                'label' => 'ASAMBLEAS',
                'estado' => 'activo',
                'resource_router' => null,
                'orden' => 5,
                'sidebar_id' => null,
                'ambiente' => 'todos',
                'icon' => 'nc-icon nc-calendar-60',
                'hijos' => [
                    [
                        'label' => 'Gestión de Asambleas',
                        'estado' => 'activo',
                        'resource_router' => 'asambleas',
                        'orden' => 1,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-calendar-60',
                    ],
                    [
                        'label' => 'Mesas de Votación',
                        'estado' => 'activo',
                        'resource_router' => 'mesas',
                        'orden' => 2,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-tablet-2',
                    ],
                    [
                        'label' => 'Consensos',
                        'estado' => 'activo',
                        'resource_router' => 'consensos',
                        'orden' => 3,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-check-2',
                    ],
                    [
                        'label' => 'Usuarios de Asamblea',
                        'estado' => 'activo',
                        'resource_router' => 'usuarios-asamblea',
                        'orden' => 4,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-single-02',
                    ],
                ]
            ],

            // Menú principal - Sistema
            [
                'label' => 'SISTEMA',
                'estado' => 'activo',
                'resource_router' => null,
                'orden' => 6,
                'sidebar_id' => null,
                'ambiente' => 'todos',
                'icon' => 'nc-icon nc-settings-gear-65',
                'hijos' => [
                    [
                        'label' => 'Trabajadores',
                        'estado' => 'activo',
                        'resource_router' => 'trabajadores',
                        'orden' => 1,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-single-02',
                    ],
                    [
                        'label' => 'Usuarios SISU',
                        'estado' => 'activo',
                        'resource_router' => 'usuarios-sisu',
                        'orden' => 2,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-key-25',
                    ],
                    [
                        'label' => 'Comandos',
                        'estado' => 'activo',
                        'resource_router' => 'comandos',
                        'orden' => 3,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-terminal',
                    ],
                    [
                        'label' => 'Configuración',
                        'estado' => 'activo',
                        'resource_router' => 'configuracion',
                        'orden' => 4,
                        'ambiente' => 'todos',
                        'icon' => 'nc-icon nc-settings',
                    ],
                ]
            ],
        ];

        // Crear menú principal y sus hijos
        foreach ($menuItems as $item) {
            $hijos = $item['hijos'];
            unset($item['hijos']);

            $parent = Sidebar::firstOrCreate(
                ['label' => $item['label']],
                $item
            );

            // Crear hijos
            foreach ($hijos as $hijo) {
                $hijo['sidebar_id'] = $parent->id;
                Sidebar::firstOrCreate(
                    ['label' => $hijo['label']],
                    $hijo
                );
            }
        }

        // Crear permisos para administrador (acceso a todo)
        $this->createPermissions();

        $this->command->info('Menú y permisos creados exitosamente');
    }

    private function createPermissions()
    {
        // Dar acceso completo a administradores
        $allItems = Sidebar::all();

        foreach ($allItems as $item) {
            SidebarPermisos::firstOrCreate(
                ['sidebar_id' => $item->id, 'rol' => 'administrador'],
                ['sidebar_id' => $item->id, 'rol' => 'administrador']
            );
        }

        // Dar acceso limitado a supervisores
        $supervisorItems = Sidebar::whereIn('label', [
            'RECEPCIÓN',
            'PODERES',
            'EMPRESAS HABILES',
            'ASAMBLEAS',
        ])->get();

        foreach ($supervisorItems as $item) {
            SidebarPermisos::firstOrCreate(
                ['sidebar_id' => $item->id, 'rol' => 'supervisor'],
                ['sidebar_id' => $item->id, 'rol' => 'supervisor']
            );
        }

        // Dar acceso básico a operadores
        $operatorItems = Sidebar::whereIn('label', [
            'RECEPCIÓN',
            'Registro de Ingresos',
            'Control de Acceso',
        ])->get();

        foreach ($operatorItems as $item) {
            SidebarPermisos::firstOrCreate(
                ['sidebar_id' => $item->id, 'rol' => 'operador'],
                ['sidebar_id' => $item->id, 'rol' => 'operador']
            );
        }

        // Dar acceso de solo lectura a invitados
        $guestItems = Sidebar::whereIn('label', [
            'ASAMBLEAS',
            'Gestión de Asambleas',
            'Mesas de Votación',
            'Consensos',
        ])->get();

        foreach ($guestItems as $item) {
            SidebarPermisos::firstOrCreate(
                ['sidebar_id' => $item->id, 'rol' => 'invitado'],
                ['sidebar_id' => $item->id, 'rol' => 'invitado']
            );
        }
    }
}
