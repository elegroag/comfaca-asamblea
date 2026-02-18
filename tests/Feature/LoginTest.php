<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\UsuarioSisu;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class LoginTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Crear usuarios de prueba
        $this->createTestUsers();
    }

    /**
     * Crear usuarios de prueba para los tests.
     */
    private function createTestUsers(): void
    {
        // Limpiar usuarios de prueba si existen
        UsuarioSisu::whereIn('usuario', ['testuser', 'inactiveuser'])->delete();

        UsuarioSisu::create([
            'usuario' => 'testuser',
            'cedtra' => '999999999',
            'nombre' => 'Usuario de Prueba',
            'password' => Hash::make('password123'),
            'email' => 'test@example.com',
            'is_active' => 'S',
        ]);

        UsuarioSisu::create([
            'usuario' => 'inactiveuser',
            'cedtra' => '888888888',
            'nombre' => 'Usuario Inactivo',
            'password' => Hash::make('password123'),
            'email' => 'inactive@example.com',
            'is_active' => 'N',
        ]);
    }

    /**
     * Test que un usuario activo puede iniciar sesión.
     */
    public function test_active_user_can_login(): void
    {
        $response = $this->post('/login', [
            'usuario' => 'testuser',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Login exitoso',
        ]);

        // Verificar que el usuario está autenticado
        $this->assertAuthenticatedAs(User::where('usuario', 'testuser')->first());
    }

    /**
     * Test que un usuario inactivo no puede iniciar sesión.
     */
    public function test_inactive_user_cannot_login(): void
    {
        $response = $this->post('/login', [
            'usuario' => 'inactiveuser',
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Su cuenta está inactiva. Contacte al administrador.',
        ]);

        // Verificar que el usuario no está autenticado
        $this->assertGuest();
    }

    /**
     * Test que credenciales incorrectas no permiten el login.
     */
    public function test_invalid_credentials_cannot_login(): void
    {
        $response = $this->post('/login', [
            'usuario' => 'testuser',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'message' => 'Las credenciales no coinciden con nuestros registros.',
        ]);

        // Verificar que el usuario no está autenticado
        $this->assertGuest();
    }

    /**
     * Test que un usuario que no existe no puede iniciar sesión.
     */
    public function test_nonexistent_user_cannot_login(): void
    {
        $response = $this->post('/login', [
            'usuario' => 'nonexistent',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'message' => 'Las credenciales no coinciden con nuestros registros.',
        ]);

        // Verificar que el usuario no está autenticado
        $this->assertGuest();
    }

    /**
     * Test que el login requiere campo usuario.
     */
    public function test_login_requires_usuario_field(): void
    {
        $response = $this->post('/login', [
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['usuario']);
    }

    /**
     * Test que el login requiere campo password.
     */
    public function test_login_requires_password_field(): void
    {
        $response = $this->post('/login', [
            'usuario' => 'testuser',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    /**
     * Test que el login funciona con el modelo User.
     */
    public function test_login_works_with_user_model(): void
    {
        $response = $this->post('/login', [
            'usuario' => 'testuser',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);

        // Verificar que Auth::user() retorna una instancia de User
        $authenticatedUser = Auth::user();
        $this->assertInstanceOf(User::class, $authenticatedUser);
        $this->assertEquals('testuser', $authenticatedUser->usuario);
        $this->assertEquals('usuario_sisu', $authenticatedUser->getTable());
    }

    /**
     * Test que el login retorna información del usuario.
     */
    public function test_login_returns_user_information(): void
    {
        $response = $this->post('/login', [
            'usuario' => 'testuser',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'message',
            'user' => [
                'id',
                'usuario',
                'nombre',
                'email',
                'is_active',
            ],
            'redirect',
        ]);
    }

    /**
     * Test que un usuario puede cerrar sesión.
     */
    public function test_user_can_logout(): void
    {
        // Autenticar usuario
        $user = User::where('usuario', 'testuser')->first();
        $this->actingAs($user);

        $response = $this->post('/logout');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente',
        ]);

        // Verificar que el usuario ya no está autenticado
        $this->assertGuest();
    }

    /**
     * Test que la vista de login es accesible.
     */
    public function test_login_view_is_accessible(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    /**
     * Test que un usuario autenticado es redirigido del login.
     */
    public function test_authenticated_user_is_redirected_from_login(): void
    {
        $user = User::where('usuario', 'testuser')->first();
        $this->actingAs($user);

        $response = $this->get('/login');

        $response->assertRedirect('/dashboard');
    }

    /**
     * Test que el método estaActivo() funciona correctamente.
     */
    public function test_esta_activo_method_works(): void
    {
        $activeUser = User::where('usuario', 'testuser')->first();
        $inactiveUser = User::where('usuario', 'inactiveuser')->first();

        $this->assertTrue($activeUser->estaActivo());
        $this->assertFalse($inactiveUser->estaActivo());
    }

    /**
     * Test que el campo nombre_completo funciona.
     */
    public function test_nombre_completo_attribute(): void
    {
        $user = User::where('usuario', 'testuser')->first();
        
        $this->assertEquals('Usuario de Prueba', $user->nombre_completo);
    }

    /**
     * Test que el campo name (compatibilidad Laravel) funciona.
     */
    public function test_name_attribute_compatibility(): void
    {
        $user = User::where('usuario', 'testuser')->first();
        
        $this->assertEquals('Usuario de Prueba', $user->name);
    }

    /**
     * Test que la verificación de contraseña funciona.
     */
    public function test_password_verification(): void
    {
        $user = User::where('usuario', 'testuser')->first();
        
        $this->assertTrue($user->verifyPassword('password123'));
        $this->assertFalse($user->verifyPassword('wrongpassword'));
    }

    /**
     * Test que el scope de usuarios activos funciona.
     */
    public function test_activos_scope(): void
    {
        // Contar usuarios activos (incluyendo los del sistema)
        $activeUsers = UsuarioSisu::activos()->get();
        $inactiveUsers = UsuarioSisu::inactivos()->get();

        // Verificar que nuestros usuarios de prueba están en los resultados
        $this->assertGreaterThanOrEqual(1, $activeUsers->count());
        $this->assertGreaterThanOrEqual(1, $inactiveUsers->count());
        
        // Verificar que nuestro testuser está en los activos
        $this->assertTrue($activeUsers->contains('usuario', 'testuser'));
        
        // Verificar que nuestro inactiveuser está en los inactivos
        $this->assertTrue($inactiveUsers->contains('usuario', 'inactiveuser'));
    }

    /**
     * Test que la relación User ↔ UsuarioSisu funciona.
     */
    public function test_user_sisu_unification(): void
    {
        $user = User::where('usuario', 'testuser')->first();
        
        // Verificar que User es instancia de UsuarioSisu
        $this->assertInstanceOf(UsuarioSisu::class, $user);
        
        // Verificar que usan la misma tabla
        $this->assertEquals('usuario_sisu', $user->getTable());
        
        // Verificar que los métodos de UsuarioSisu funcionan
        $this->assertTrue($user->estaActivo());
        $this->assertEquals('Usuario de Prueba', $user->nombre_completo);
    }

    /**
     * Test que el login funciona con usuarios existentes del sistema.
     */
    public function test_login_with_existing_system_users(): void
    {
        // Usar usuarios existentes del sistema que sabemos que funcionan
        $response = $this->post('/login', [
            'usuario' => 'admin',
            'password' => 'admin123',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Login exitoso',
        ]);

        $this->assertAuthenticated();
        $this->post('/logout'); // Cerrar sesión
    }

    /**
     * Test que el AuthController funciona correctamente.
     */
    public function test_auth_controller_methods_exist(): void
    {
        $controller = new \App\Http\Controllers\AuthController();
        
        // Verificar que los métodos existan
        $this->assertTrue(method_exists($controller, 'login'));
        $this->assertTrue(method_exists($controller, 'register'));
        $this->assertTrue(method_exists($controller, 'authenticate'));
        $this->assertTrue(method_exists($controller, 'store'));
        $this->assertTrue(method_exists($controller, 'logout'));
    }

    /**
     * Test que los requests funcionan correctamente.
     */
    public function test_auth_requests_work(): void
    {
        $loginRequest = new \App\Http\Requests\Auth\LoginRequest();
        $registerRequest = new \App\Http\Requests\Auth\RegisterRequest();
        
        // Verificar que los métodos existan
        $this->assertTrue(method_exists($loginRequest, 'getCredentials'));
        $this->assertTrue(method_exists($registerRequest, 'getUserData'));
    }

    /**
     * Test que la configuración de auth.php es correcta.
     */
    public function test_auth_configuration_is_correct(): void
    {
        // Verificar que los guards apunten al provider 'users'
        $guards = config('auth.guards');
        foreach ($guards as $guard => $config) {
            $this->assertEquals('users', $config['provider']);
        }

        // Verificar que el provider 'users' use el modelo User
        $provider = config('auth.providers.users');
        $this->assertEquals('eloquent', $provider['driver']);
        $this->assertEquals(\App\Models\User::class, $provider['model']);
    }
}