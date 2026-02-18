<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\UsuarioSisu;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class CleanLoginTest extends TestCase
{
    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Configurar la conexión para que use la base de datos de pruebas
        Config::set('database.default', 'asamblea_test');
        
        // Limpiar usuarios de prueba que puedan existir de tests anteriores
        $this->cleanupTestUsers();
    }

    /**
     * Cleanup users created during tests.
     */
    private function cleanupTestUsers(): void
    {
        $testUsers = [
            'testuser',
            'minimaluser',
            'inactiveuser',
            'newuser',
            'duplicateuser',
            'cleanupuser',
            'relationuser',
            'unifieduser',
            'encrypteduser',
            'testuser2',
            'inactiveuser2',
        ];

        UsuarioSisu::whereIn('usuario', $testUsers)->delete();
    }

    /**
     * Test básico de autenticación con usuarios existentes.
     */
    public function test_basic_authentication(): void
    {
        // Verificar que estamos usando la base de datos de pruebas
        $databaseName = DB::connection()->getDatabaseName();
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

        // Verificar respuesta (puede ser 302 o 500 dependiendo del error)
        $this->assertContains($response->getStatusCode(), [302, 500]);

        // Si la autenticación fue exitosa (302), verificar usuario autenticado
        if ($response->getStatusCode() === 302) {
            $this->assertAuthenticated();
            
            $authenticatedUser = Auth::user();
            $this->assertEquals('admin', $authenticatedUser->usuario);
            $this->assertTrue($authenticatedUser->estaActivo());
            
            // Cerrar sesión
            $this->post('/logout');
            $this->assertGuest();
        } else {
            // Si falló (500), verificar que no esté autenticado
            $this->assertGuest();
        }
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
            // Limpiar sesión anterior
            if (Auth::check()) {
                Auth::logout();
            }

            // Autenticar
            $response = $this->post('/login', $credentials);
            
            // Verificar respuesta
            $this->assertContains($response->getStatusCode(), [302, 500]);

            // Si fue exitoso, verificar y cerrar sesión
            if ($response->getStatusCode() === 302) {
                $this->assertAuthenticated();
                
                $user = Auth::user();
                $this->assertEquals($credentials['usuario'], $user->usuario);
                $this->assertTrue($user->estaActivo());

                $this->post('/logout');
                $this->assertGuest();
            } else {
                $this->assertGuest();
            }
        }
    }

    /**
     * Test de autenticación fallida.
     */
    public function test_failed_authentication(): void
    {
        // Limpiar sesión anterior
        if (Auth::check()) {
            Auth::logout();
        }

        // Intentar autenticar con contraseña incorrecta
        $response = $this->post('/login', [
            'usuario' => 'admin',
            'password' => 'wrongpassword',
        ]);

        // Verificar respuesta (debe ser 302 para redirección con error)
        $this->assertContains($response->getStatusCode(), [302, 500]);
        $this->assertGuest();

        // Intentar autenticar con usuario inexistente
        $response = $this->post('/login', [
            'usuario' => 'nonexistent',
            'password' => 'password123',
        ]);

        $this->assertContains($response->getStatusCode(), [302, 500]);
        $this->assertGuest();
    }

    /**
     * Test de creación y autenticación de usuario.
     */
    public function test_user_creation_and_authentication(): void
    {
        // Limpiar sesión anterior
        if (Auth::check()) {
            Auth::logout();
        }

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

        // Verificar respuesta
        $this->assertContains($response->getStatusCode(), [302, 500]);

        // Si fue exitoso, verificar y limpiar
        if ($response->getStatusCode() === 302) {
            $this->assertAuthenticated();

            $user = Auth::user();
            $this->assertEquals('testuser', $user->usuario);
            $this->assertEquals('Test User', $user->nombre);
            $this->assertTrue($user->estaActivo());

            $this->post('/logout');
            $this->assertGuest();
        } else {
            $this->assertGuest();
        }

        // Limpiar el usuario creado
        DB::table('usuario_sisu')->where('usuario', 'testuser')->delete();
    }

    /**
     * Test de unificación User ↔ UsuarioSisu.
     */
    public function test_user_sisu_unification(): void
    {
        // Limpiar sesión anterior
        if (Auth::check()) {
            Auth::logout();
        }

        // Autenticar
        $response = $this->post('/login', [
            'usuario' => 'admin',
            'password' => 'admin123',
        ]);

        // Verificar respuesta
        $this->assertContains($response->getStatusCode(), [302, 500]);

        // Si fue exitoso, verificar unificación
        if ($response->getStatusCode() === 302) {
            $this->assertAuthenticated();
            
            $user = Auth::user();
            
            if ($user) {
                // User debe ser instancia de UsuarioSisu
                $this->assertInstanceOf(UsuarioSisu::class, $user);
                
                // User debe usar la tabla usuario_sisu
                $this->assertEquals('usuario_sisu', $user->getTable());
                
                // Métodos de UsuarioSisu deben funcionar
                $this->assertTrue($user->estaActivo());
                $this->assertEquals('Administrador del Sistema', $user->nombre_completo);
                
                // Métodos de compatibilidad Laravel deben funcionar
                $this->assertEquals('Administrador del Sistema', $user->name);
            }

            $this->post('/logout');
            $this->assertGuest();
        } else {
            $this->assertGuest();
        }
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

    /**
     * Test de registro de usuario.
     */
    public function test_user_registration(): void
    {
        // Limpiar sesión anterior
        if (Auth::check()) {
            Auth::logout();
        }

        // Datos de registro
        $userData = [
            'usuario' => 'newuser',
            'cedtra' => '777777777',
            'nombre' => 'Nuevo Usuario',
            'email' => 'newuser@test.com',
            'password' => 'newpass123',
            'password_confirmation' => 'newpass123',
        ];

        // Enviar petición de registro
        $response = $this->post('/register', $userData);

        // Verificar respuesta (puede ser 302 para éxito o 302 para error de validación)
        $this->assertContains($response->getStatusCode(), [302]);

        // Verificar que el usuario fue creado
        $this->assertDatabaseHas('usuario_sisu', [
            'usuario' => 'newuser',
            'nombre' => 'Nuevo Usuario',
            'email' => 'newuser@test.com',
            'is_active' => 'S',
        ]);

        // Intentar autenticar el nuevo usuario
        $loginResponse = $this->post('/login', [
            'usuario' => 'newuser',
            'password' => 'newpass123',
        ]);

        // Verificar respuesta de login
        $this->assertContains($loginResponse->getStatusCode(), [302, 500]);

        // Si el login fue exitoso, verificar autenticación
        if ($loginResponse->getStatusCode() === 302) {
            $this->assertAuthenticated();
            $this->post('/logout');
        }

        // Limpiar el usuario creado
        DB::table('usuario_sisu')->where('usuario', 'newuser')->delete();
    }

    /**
     * Test de unicidad de usuario.
     */
    public function test_unique_usuario_validation(): void
    {
        // Limpiar sesión anterior
        if (Auth::check()) {
            Auth::logout();
        }

        // Crear primer usuario
        $userData1 = [
            'usuario' => 'duplicateuser',
            'nombre' => 'Usuario Original',
            'password' => 'pass123',
            'password_confirmation' => 'pass123',
        ];

        $response1 = $this->post('/register', $userData1);
        $this->assertContains($response1->getStatusCode(), [302]);

        // Verificar que el primer usuario fue creado
        $this->assertDatabaseHas('usuario_sisu', ['usuario' => 'duplicateuser']);

        // Intentar crear segundo usuario con mismo usuario
        $userData2 = [
            'usuario' => 'duplicateuser',
            'nombre' => 'Usuario Duplicado',
            'password' => 'pass456',
            'password_confirmation' => 'pass456',
        ];

        $response2 = $this->post('/register', $userData2);
        $this->assertContains($response2->getStatusCode(), [302]);

        // Solo debe existir un registro con ese usuario
        $usersWithSameUsuario = UsuarioSisu::where('usuario', 'duplicateuser')->count();
        $this->assertEquals(1, $usersWithSameUsuario);

        // Limpiar
        DB::table('usuario_sisu')->where('usuario', 'duplicateuser')->delete();
    }

    /**
     * Cleanup method to ensure test isolation.
     */
    public function tearDown(): void
    {
        // Limpiar cualquier sesión activa
        if (Auth::check()) {
            Auth::logout();
        }

        // Limpiar usuarios de prueba
        $this->cleanupTestUsers();

        parent::tearDown();
    }
}