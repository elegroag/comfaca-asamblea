<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Task;
use App\Models\UsuarioSisu;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener usuarios SISU existentes
        $usuariosSisu = UsuarioSisu::all();
        
        if ($usuariosSisu->isEmpty()) {
            $this->command->warn('No hay usuarios SISU disponibles. Creando tareas sin asignación.');
        }

        $tasks = [
            [
                'title' => 'Configurar sistema de asambleas',
                'description' => 'Configurar las opciones y parámetros del sistema de asambleas para la próxima reunión.',
                'completed' => false,
                'usuario_sisu_id' => $usuariosSisu->firstWhere('usuario', 'admin')->value('id'),
            ],
            [
                'title' => 'Revisar documentación de consensos',
                'description' => 'Revisar y actualizar la documentación de los consensos de asambleas anteriores.',
                'completed' => false,
                'usuario_sisu_id' => $usuariosSisu->firstWhere('usuario', 'jperez')->value('id'),
            ],
            [
                'title' => 'Validar datos de empresas',
                'description' => 'Verificar que los datos de las empresas participantes estén actualizados y correctos.',
                'completed' => true,
                'usuario_sisu_id' => $usuariosSisu->firstWhere('usuario', 'mgonzalez')->value('id'),
            ],
            [
                'title' => 'Preparar informes de asamblea',
                'description' => 'Generar y preparar los informes y comunicaciones para la próxima asamblea general.',
                'completed' => false,
                'usuario_sisu_id' => $usuariosSisu->firstWhere('usuario', 'crodriguez')->value('id'),
            ],
            [
                'title' => 'Actualizar manual de procedimientos',
                'description' => 'Actualizar el manual de procedimientos con los cambios aprobados en la última asamblea.',
                'completed' => false,
                'usuario_sisu_id' => $usuariosSisu->firstWhere('usuario', 'admin')->value('id'),
            ],
            [
                'title' => 'Revisar configuración de mesas',
                'description' => 'Verificar que la configuración de las mesas de votación sea correcta y funcional.',
                'completed' => true,
                'usuario_sisu_id' => $usuariosSisu->firstWhere('usuario', 'jperez')->value('id'),
            ],
            [
                'title' => 'Capacitar personal de soporte',
                'description' => 'Capacitar al personal de soporte técnico para el día de la asamblea.',
                'completed' => false,
                'usuario_sisu_id' => $usuariosSisu->firstWhere('usuario', 'admin')->value('id'),
            ],
            [
                'title' => 'Testear sistema de votación',
                'description' => 'Realizar pruebas exhaustivas del sistema de votación para asegurar su correcto funcionamiento.',
                'completed' => false,
                'usuario_sisu_id' => $usuariosSisu->firstWhere('usuario', 'crodriguez')->value('id'),
            ],
            [
                'title' => 'Generar reporte post-asamblea',
                'description' => 'Crear y enviar el reporte de resultados de la asamblea a todos los participantes.',
                'completed' => false,
                'usuario_sisu_id' => $usuariosSisu->firstWhere('usuario', 'mgonzalez')->value('id'),
            ],
            [
                'title' => 'Archivar documentación',
                'description' => 'Organizar y archivar toda la documentación generada durante la asamblea.',
                'completed' => false,
                'usuario_sisu_id' => $usuariosSisu->firstWhere('usuario', 'jperez')->value('id'),
            ],
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }

        $this->command->info('Tasks creadas exitosamente');
        $this->command->info('Total tareas: ' . count($tasks));
        $this->command->info('Tareas completadas: ' . Task::completed()->count());
        $this->command->info('Tareas pendientes: ' . Task::pending()->count());
    }
}