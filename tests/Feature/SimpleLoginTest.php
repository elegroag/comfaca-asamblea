<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\UsuarioSisu;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;

class SimpleLoginTest extends TestCase
{
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
     * Test básico de autenticación con usuarios existentes.
     */
    public function test_basic_authentication(): void
    {
        // Verificar que estamos usando la base de datos de pruebas
        $databaseName = \DB::connection()->getDatabaseName();
        $this->assertEquals('asamblea_test', $databaseName);

        // Verificar que los usuarios del seeder existen
        $user = UsuarioSisu::where('usuario', 'admin')->first();
        $this->assertNotNull($user);
        $this->assertEquals('Administrador del Sistema', $user->nombre);

        // Verificar que la contraseña está encriptada
        $this->assertTrue(Hash::check('admin123', $user->password));

        // Intentar autenticar
        $response = $this->post('/login', [
            'usuario' => 'admin',
            'password' => 'admin123',
        ]);

        $response->assertStatus(302);
        $this->assertAuthenticated();

        // Verificar datos del usuario autenticado
        $authenticatedUser = Auth::user();
        $this->assertEquals('admin', $authenticatedUser->usuario);
        $this->assertTrue($authenticatedUser->estaActivo());

        // Cerrar sesión
        $this->post('/logout');
        $this->assertGuest();
    }

    /**
     * Test de autenticación con todos los usuarios del seeder.
     */
    public function test_all_seeder_users_authentication(): void
    {
        $users = [
            ['usuario' => 'admin', 'password' => 'admin123'],
            ['usuario' => 'jperez', 'password' => 'jperez123'],
            ['usuario' => 'mgonzalez', 'password' => 'mgonzalez123'],
            ['usuario' => 'crodriguez', 'password' => 'crodriguez123'],
        ];

        foreach ($users as $credentials) {
            // Autenticar
            $response = $this->post('/login', $credentials);
            $response->assertStatus(302);
            $this->assertAuthenticated();

            // Verificar usuario
            $user = Auth::user();
            $this->assertEquals($credentials['usuario'], $user->usuario);
            $this->assertTrue($user->estaActivo());

            // Cerrar sesión
            $this->post('/logout');
            $this->assertGuest();
        }
    }

    /**
     * Test de autenticación fallida.
     */
    public function test_failed_authentication(): void
    {
        // Intentar autenticar con contraseña incorrecta
        $response = $this->post('/login', [
            'usuario' => 'admin',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(302);
        $this->assertGuest();

        // Intentar autenticar con usuario inexistente
        $response = $this->post('/login', [
            'usuario' => 'nonexistent',
            'password' => 'password123',
        ]);

        $response->assertStatus(302);
        $this->assertGuest();
    }

    /**
     * Test de unificación User ↔ UsuarioSisu.
     */
    public function test_user_sisu_unification(): void
    {
        // Autenticar
        $this->post('/login', [
            'usuario' => 'admin',
            'password' => 'admin123',
        ]);

        // Verificar unificación
        $user = Auth::user();
        
        // User debe ser instancia de UsuarioSisu
        $this->assertInstanceOf(UsuarioSisu::class, $user);
        
        // User debe usar la tabla usuario_sisu
        $this->assertEquals('usuario_sisu', $user->getTable());
        
        // Métodos de UsuarioSisu deben funcionar
        $this->assertTrue($user->estaActivo());
        $this->assertEquals('Administrador del Sistema', $user->nombre_completo);
        
        // Métodos de compatibilidad Laravel deben funcionar
        $this->assertEquals('Administrador del Sistema', $user->name);

        // Cerrar sesión
        $this->post('/logout');
    }

    /**
     * Test de creación de usuario.
     */
    public function test_user_creation(): void
    {
        // Crear usuario directamente en la base de datos
        $userData = [
            'usuario' => 'testuser',
            'cedtra' => '999999999',
            'nombre' => 'Test User',
            'password' => Hash::make('testpass123'),
            'email' => 'test@example.com',
            'is_active' => 'S',
            'created_at' => now(),
            'updated_at' => now(),
        ];

        DB::table('usuario_sisu')->insert($userData);

        // Verificar que el usuario fue creado
        $this->assertDatabaseHas('usuario_sisu', ['usuario' => 'testuser']);

        // Autenticar con el nuevo usuario
        $response = $this->post('/login', [
            'usuario' => 'testuser',
            'password' => 'testpass123',
        ]);

        $response->assertStatus(302);
        $this->assertAuthenticated();

        // Verificar datos
        $user = Auth::user();
        $this->assertEquals('testuser', $user->usuario);
        $this->assertEquals('Test User', $user->nombre);
        $this->assertTrue($user->estaActivo());

        // Limpiar
        DB::table('usuario_sisu')->where('usuario', 'testuser')->delete();
    }

    /**
     * Test que verifica los datos del seeder.
     */
    public function test_seeder_data_verification(): void
    {
        // Verificar cantidad de usuarios
        $userCount = UsuarioSisu::count();
        $this->assertGreaterThanOrEqual(4, $userCount);

        // Verificar usuarios específicos
        $users = ['admin', 'jperez', 'mgonzalez', 'crodriguez'];
        
        foreach ($users as $usuario) {
            $user = UsuarioSisu::where('usuario', $usuario)->first();
            $this->assertNotNull($user);
            $this->assertTrue($user->estaActivo());
            $this->assertNotNull($user->password);
            $this->assertNotEquals('', $user->password);
        }
    }
}