<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('Iniciando proceso de seeders...');

        // Tablas base (dependencias)
        $this->call([
            AsaTrabajadoresSeeder::class,
            AsaAsambleaSeeder::class,
            AsaConsensoSeeder::class,
            EmpresasSeeder::class,
            UsuarioSisuSeeder::class,  // Sistema de autenticación principal (unificado)
            CriteriosRechazosSeeder::class,
            CriterioRechazosSeeder::class, // Versión alternativa
        ]);

        // Tablas que dependen de las anteriores
        $this->call([
            AsaUsuariosSeeder::class,
            AsaMesasSeeder::class,
            AsaRepresentantesSeeder::class,
            CarterasSeeder::class,
            PoderesSeeder::class,
            RegistroIngresosSeeder::class,
            TrabajadoresSeeder::class, // Datos adicionales
            TaskSeeder::class,        // Sistema de tareas
        ]);

        // Sistema de navegación
        $this->call([
            SidebarSeeder::class,
        ]);

        $this->command->info('¡Todos los seeders han sido ejecutados exitosamente!');
        $this->command->info('Resumen de datos creados:');

        // Contar registros de forma segura sin usar modelos con SoftDeletes
        $this->command->info('- Trabajadores: ' . DB::table('asa_trabajadores')->count());
        $this->command->info('- Asambleas: ' . DB::table('asa_asambleas')->count());
        $this->command->info('- Consensos: ' . DB::table('asa_consensos')->count());
        $this->command->info('- Empresas: ' . DB::table('empresas')->count());
        $this->command->info('- Usuarios SISU: ' . DB::table('usuario_sisu')->count());
        $this->command->info('- Criterios de Rechazo: ' . DB::table('criterios_rechazos')->count());
        $this->command->info('- Usuarios de Asamblea: ' . DB::table('asa_usuarios')->count());
        $this->command->info('- Mesas: ' . DB::table('asa_mesas')->count());
        $this->command->info('- Representantes: ' . DB::table('asa_representantes')->count());
        $this->command->info('- Carteras: ' . DB::table('carteras')->count());
        $this->command->info('- Poderes: ' . DB::table('poderes')->count());
        $this->command->info('- Registro de Ingresos: ' . DB::table('registro_ingresos')->count());
        $this->command->info('- Tasks: ' . DB::table('tasks')->count());
        $this->command->info('- Menú Sidebar: ' . DB::table('sidebar')->count());
        $this->command->info('- Permisos: ' . DB::table('sidebar_permisos')->count());

        $this->command->info('');
        $this->command->info('✅ Sistema unificado User ↔ UsuarioSisu funcionando');
        $this->command->info('✅ User extiende UsuarioSisu (compatibilidad Laravel)');
        $this->command->info('✅ UsuarioSisu es el modelo principal de autenticación');
    }
}
