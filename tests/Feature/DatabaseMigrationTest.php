<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;

class DatabaseMigrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Configurar la conexión para que use la base de datos de pruebas
        Config::set('database.default', 'asamblea_test');
    }

    /**
     * Test que verifica que la base de datos de pruebas se configure correctamente.
     */
    public function test_database_connection_is_test_database(): void
    {
        // Verificar que estamos usando la base de datos de pruebas
        $databaseName = DB::connection()->getDatabaseName();
        $this->assertEquals('asamblea_test', $databaseName);
    }

    /**
     * Test que verifica que las migraciones se ejecutan correctamente.
     */
    public function test_migrations_run_successfully(): void
    {
        // Verificar que las tablas principales existan
        $this->assertTrue(Schema::hasTable('usuario_sisu'));
        $this->assertTrue(Schema::hasTable('migrations'));
        
        // Verificar estructura de la tabla usuario_sisu
        $this->assertTrue(Schema::hasColumn('usuario_sisu', 'id'));
        $this->assertTrue(Schema::hasColumn('usuario_sisu', 'usuario'));
        $this->assertTrue(Schema::hasColumn('usuario_sisu', 'cedtra'));
        $this->assertTrue(Schema::hasColumn('usuario_sisu', 'nombre'));
        $this->assertTrue(Schema::hasColumn('usuario_sisu', 'password'));
        $this->assertTrue(Schema::hasColumn('usuario_sisu', 'email'));
        $this->assertTrue(Schema::hasColumn('usuario_sisu', 'is_active'));
        $this->assertTrue(Schema::hasColumn('usuario_sisu', 'created_at'));
        $this->assertTrue(Schema::hasColumn('usuario_sisu', 'updated_at'));
    }

    /**
     * Test que verifica que los seeders se ejecutaron correctamente.
     */
    public function test_seeders_executed_successfully(): void
    {
        // Verificar que los seeders crearon los datos
        $this->assertDatabaseHas('usuario_sisu', ['usuario' => 'admin']);
        $this->assertDatabaseHas('usuario_sisu', ['usuario' => 'jperez']);
        $this->assertDatabaseHas('usuario_sisu', ['usuario' => 'mgonzalez']);
        $this->assertDatabaseHas('usuario_sisu', ['usuario' => 'crodriguez']);
        
        // Verificar que hay usuarios en la base de datos
        $userCount = DB::table('usuario_sisu')->count();
        $this->assertGreaterThan(0, $userCount);
    }

    /**
     * Test que verifica que podemos crear datos en la base de pruebas.
     */
    public function test_can_create_data_in_test_database(): void
    {
        // Crear un usuario de prueba
        DB::table('usuario_sisu')->insert([
            'usuario' => 'testuser',
            'cedtra' => '123456789',
            'nombre' => 'Test User',
            'password' => bcrypt('password123'),
            'email' => 'test@example.com',
            'is_active' => 'S',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Verificar que el usuario fue creado
        $userCount = DB::table('usuario_sisu')->count();
        $this->assertGreaterThan(4, $userCount); // Debe haber más de los 4 del seeder

        // Verificar los datos
        $user = DB::table('usuario_sisu')->where('usuario', 'testuser')->first();
        $this->assertEquals('testuser', $user->usuario);
        $this->assertEquals('Test User', $user->nombre);
        $this->assertEquals('S', $user->is_active);
    }

    /**
     * Test que verifica que RefreshDatabase limpia los datos entre tests.
     */
    public function test_refresh_database_cleans_data_between_tests(): void
    {
        // Crear datos
        DB::table('usuario_sisu')->insert([
            'usuario' => 'cleanup_test',
            'nombre' => 'Cleanup Test',
            'password' => bcrypt('password123'),
            'is_active' => 'S',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Verificar que existen
        $this->assertDatabaseHas('usuario_sisu', ['usuario' => 'cleanup_test']);

        // El trait RefreshDatabase debería limpiar automáticamente después del test
        // Este test verifica que podemos empezar con una base limpia en el siguiente test
    }

    /**
     * Test que verifica que los índices existen.
     */
    public function test_database_indexes_exist(): void
    {
        // Verificar que los índices de la tabla usuario_sisu existan
        $indexes = DB::select("SHOW INDEX FROM usuario_sisu");
        
        $indexNames = array_map(function($index) {
            return $index->Key_name;
        }, $indexes);

        // Verificar índices principales
        $this->assertTrue(in_array('PRIMARY', $indexNames));
        $this->assertTrue(in_array('usuario_sisu_usuario_unique', $indexNames) || 
                        in_array('usuario', $indexNames)); // Puede variar el nombre
    }

    /**
     * Test que verifica que las relaciones funcionan en la base de pruebas.
     */
    public function test_database_relationships_work(): void
    {
        // Crear datos de prueba
        $userId = DB::table('usuario_sisu')->insertGetId([
            'usuario' => 'relation_test',
            'cedtra' => '987654321',
            'nombre' => 'Relation Test',
            'password' => bcrypt('password123'),
            'email' => 'relation@example.com',
            'is_active' => 'S',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Verificar que podemos consultar los datos
        $user = DB::table('usuario_sisu')->find($userId);
        $this->assertNotNull($user);
        $this->assertEquals('relation_test', $user->usuario);
        $this->assertEquals('Relation Test', $user->nombre);
    }

    /**
     * Test que verifica que los modelos funcionan con la base de datos de pruebas.
     */
    public function test_models_work_with_test_database(): void
    {
        // Usar el modelo UsuarioSisu para verificar que funciona
        $user = \App\Models\UsuarioSisu::where('usuario', 'admin')->first();
        
        $this->assertNotNull($user);
        $this->assertEquals('admin', $user->usuario);
        $this->assertTrue($user->estaActivo());
        $this->assertEquals('usuario_sisu', $user->getTable());
    }

    /**
     * Test que verifica que la autenticación funciona con la base de datos de pruebas.
     */
    public function test_authentication_works_with_test_database(): void
    {
        // Verificar que podemos autenticar con los datos del seeder
        $credentials = [
            'usuario' => 'admin',
            'password' => 'admin123',
        ];

        // Intentar autenticación
        $this->post('/login', $credentials);
        
        // Verificar que el usuario existe en la base de datos
        $user = \App\Models\UsuarioSisu::where('usuario', 'admin')->first();
        $this->assertNotNull($user);
        $this->assertTrue(\Hash::check('admin123', $user->password));
    }
}