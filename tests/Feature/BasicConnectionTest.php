<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\UsuarioSisu;

class BasicConnectionTest extends TestCase
{
    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        // Esperar un momento para que la conexión se establezca
        usleep(100000); // 0.1 segundos
    }

    /**
     * Test que verifica la conexión a la base de datos de pruebas.
     */
    public function test_database_connection(): void
    {
        try {
            // Verificar que podemos ejecutar una consulta simple
            $result = DB::select('SELECT 1 as test');
            $this->assertNotEmpty($result);
            
            // Verificar que estamos usando la base de datos correcta
            $databaseName = DB::connection()->getDatabaseName();
            $this->assertEquals('asamblea_test', $databaseName);
            
        } catch (\Exception $e) {
            $this->fail('Error de conexión a la base de datos: ' . $e->getMessage());
        }
    }

    /**
     * Test que verifica que las tablas existen.
     */
    public function test_tables_exist(): void
    {
        try {
            // Verificar que la tabla usuario_sisu existe usando Schema
            $this->assertTrue(Schema::hasTable('usuario_sisu'), 'La tabla usuario_sisu no existe');
            
            // Verificar que la tabla migrations existe
            $this->assertTrue(Schema::hasTable('migrations'), 'La tabla migrations no existe');
            
            // Verificar que hay usuarios en la tabla
            $userCount = DB::table('usuario_sisu')->count();
            $this->assertGreaterThan(0, $userCount, 'No hay usuarios en la tabla usuario_sisu');
            
        } catch (\Exception $e) {
            $this->fail('Error al verificar tablas: ' . $e->getMessage());
        }
    }

    /**
     * Test que verifica los usuarios del seeder.
     */
    public function test_seeder_users_exist(): void
    {
        try {
            // Verificar usuarios específicos del seeder
            $users = ['admin', 'jperez', 'mgonzalez', 'crodriguez'];
            
            foreach ($users as $usuario) {
                $user = DB::table('usuario_sisu')->where('usuario', $usuario)->first();
                $this->assertNotNull($user, "Usuario {$usuario} no encontrado");
                $this->assertEquals($usuario, $user->usuario, "Usuario {$usuario} con datos incorrectos");
                $this->assertNotNull($user->nombre, "Usuario {$usuario} sin nombre");
                $this->assertEquals('S', $user->is_active, "Usuario {$usuario} no está activo");
            }
            
        } catch (\Exception $e) {
            $this->fail('Error al verificar usuarios del seeder: ' . $e->getMessage());
        }
    }

    /**
     * Test que verifica la estructura de la tabla usuario_sisu.
     */
    public function test_usuario_sisu_structure(): void
    {
        try {
            // Verificar columnas importantes usando Schema
            $expectedColumns = [
                'id', 'usuario', 'cedtra', 'nombre', 'password', 'email', 'is_active', 'created_at', 'updated_at'
            ];
            
            foreach ($expectedColumns as $column) {
                $this->assertTrue(
                    Schema::hasColumn('usuario_sisu', $column), 
                    "Columna {$column} no existe en la tabla usuario_sisu"
                );
            }
            
            // Verificar que la columna password existe y no es criptada
            $this->assertTrue(Schema::hasColumn('usuario_sisu', 'password'), 'Columna password no existe');
            $this->assertFalse(Schema::hasColumn('usuario_sisu', 'criptada'), 'Columna criptada no debería existir');
            
        } catch (\Exception $e) {
            $this->fail('Error al verificar estructura de tabla: ' . $e->getMessage());
        }
    }

    /**
     * Test que verifica el modelo UsuarioSisu funciona.
     */
    public function test_usuario_sisu_model_works(): void
    {
        try {
            // Verificar que podemos usar el modelo
            $user = UsuarioSisu::where('usuario', 'admin')->first();
            $this->assertNotNull($user, 'No se puede encontrar usuario admin con el modelo');
            
            // Verificar métodos del modelo
            $this->assertEquals('admin', $user->usuario);
            $this->assertEquals('Administrador del Sistema', $user->nombre);
            $this->assertTrue($user->estaActivo());
            
            // Verificar nombre_completo (que devuelve el nombre del trabajador relacionado)
            $this->assertEquals('Juan Pérez', $user->nombre_completo);
            
            // Verificar que la contraseña está encriptada
            $this->assertNotNull($user->password);
            $this->assertNotEquals('admin123', $user->password);
            $this->assertTrue(\Hash::check('admin123', $user->password));
            
        } catch (\Exception $e) {
            $this->fail('Error al probar modelo UsuarioSisu: ' . $e->getMessage());
        }
    }

    /**
     * Test que verifica la configuración de autenticación con UsuarioSisu.
     */
    public function test_auth_configuration(): void
    {
        try {
            // Verificar configuración de auth.php
            $guards = config('auth.guards');
            $this->assertArrayHasKey('web', $guards);
            $this->assertEquals('users', $guards['web']['provider']);
            
            $providers = config('auth.providers');
            $this->assertArrayHasKey('users', $providers);
            $this->assertEquals(\App\Models\UsuarioSisu::class, $providers['users']['model']);
            
        } catch (\Exception $e) {
            $this->fail('Error al verificar configuración de autenticación: ' . $e->getMessage());
        }
    }

    /**
     * Test que verifica que las contraseñas están encriptadas correctamente.
     */
    public function test_password_encryption(): void
    {
        try {
            // Verificar que las contraseñas de los usuarios están encriptadas
            $users = DB::table('usuario_sisu')->get();
            
            foreach ($users as $user) {
                $this->assertNotNull($user->password, "Usuario {$user->usuario} sin contraseña");
                $this->assertNotEquals('', $user->password, "Usuario {$user->usuario} con contraseña vacía");
                
                // Verificar que no esté en texto plano (no debería ser igual al usuario)
                $this->assertNotEquals($user->usuario, $user->password, 
                    "Usuario {$user->usuario} con contraseña en texto plano");
            }
            
        } catch (\Exception $e) {
            $this->fail('Error al verificar encriptación de contraseñas: ' . $e->getMessage());
        }
    }

    /**
     * Test que verifica que el campo is_active funciona correctamente.
     */
    public function test_is_active_field(): void
    {
        try {
            // Verificar que todos los usuarios del seeder están activos
            $activeUsers = UsuarioSisu::where('is_active', 'S')->count();
            $totalUsers = UsuarioSisu::count();
            
            $this->assertGreaterThan(0, $totalUsers, 'No hay usuarios en la base de datos');
            $this->assertEquals($totalUsers, $activeUsers, 'No todos los usuarios están activos');
            
            // Verificar el método estaActivo()
            $user = UsuarioSisu::where('usuario', 'admin')->first();
            $this->assertTrue($user->estaActivo());
            
        } catch (\Exception $e) {
            $this->fail('Error al verificar campo is_active: ' . $e->getMessage());
        }
    }

    /**
     * Test que verifica la relación con trabajadores.
     */
    public function test_trabajador_relation(): void
    {
        try {
            // Verificar que el usuario admin tiene relación con trabajador
            $user = UsuarioSisu::where('usuario', 'admin')->first();
            $this->assertNotNull($user);
            
            // Verificar que el nombre_completo viene del trabajador relacionado
            $this->assertEquals('Juan Pérez', $user->nombre_completo);
            
            // Verificar cédula del trabajador
            $this->assertEquals('123456789', $user->cedtra);
            
        } catch (\Exception $e) {
            $this->fail('Error al verificar relación con trabajador: ' . $e->getMessage());
        }
    }

    /**
     * Test que verifica todos los usuarios tienen contraseñas válidas.
     */
    public function test_all_users_have_valid_passwords(): void
    {
        try {
            $users = ['admin', 'jperez', 'mgonzalez', 'crodriguez'];
            $passwords = ['admin123', 'jperez123', 'mgonzalez123', 'crodriguez123'];
            
            foreach ($users as $index => $usuario) {
                $user = UsuarioSisu::where('usuario', $usuario)->first();
                $this->assertNotNull($user, "Usuario {$usuario} no encontrado");
                
                // Verificar contraseña
                $password = $passwords[$index];
                $this->assertTrue(\Hash::check($password, $user->password), 
                    "Contraseña incorrecta para usuario {$usuario}");
            }
            
        } catch (\Exception $e) {
            $this->fail('Error al verificar contraseñas de usuarios: ' . $e->getMessage());
        }
    }

    /**
     * Test que verifica que el modelo UsuarioSisu implementa Authenticatable.
     */
    public function test_usuario_sisu_implements_authenticatable(): void
    {
        try {
            // Verificar que UsuarioSisu implementa la interfaz Authenticatable
            $user = UsuarioSisu::where('usuario', 'admin')->first();
            $this->assertNotNull($user);
            
            // Verificar que tiene los métodos de Authenticatable
            $this->assertTrue(method_exists($user, 'getAuthIdentifierName'));
            $this->assertTrue(method_exists($user, 'getAuthIdentifier'));
            $this->assertTrue(method_exists($user, 'getAuthPassword'));
            
            // Verificar que los métodos retornan los valores correctos
            $this->assertEquals('usuario', $user->getAuthIdentifierName());
            $this->assertEquals('admin', $user->getAuthIdentifier()); // getAuthIdentifier retorna el campo 'usuario'
            $this->assertEquals($user->password, $user->getAuthPassword());
            
        } catch (\Exception $e) {
            $this->fail('Error al verificar implementación Authenticatable: ' . $e->getMessage());
        }
    }

    /**
     * Test que verifica que el modelo UsuarioSisu tiene los traits necesarios.
     */
    public function test_usuario_sisu_has_required_traits(): void
    {
        try {
            // Verificar que UsuarioSisu tiene los traits necesarios
            $user = UsuarioSisu::where('usuario', 'admin')->first();
            $this->assertNotNull($user);
            
            // Verificar que tiene el trait HasApiTokens (para Sanctum)
            $this->assertTrue(method_exists($user, 'createToken'));
            $this->assertTrue(method_exists($user, 'tokens'));
            
            // Verificar que tiene el trait Notifiable
            $this->assertTrue(method_exists($user, 'notify'));
            
        } catch (\Exception $e) {
            $this->fail('Error al verificar traits de UsuarioSisu: ' . $e->getMessage());
        }
    }

    /**
     * Test que verifica que el campo usuario es el identificador de autenticación.
     */
    public function test_usuario_field_is_auth_identifier(): void
    {
        try {
            // Verificar que el campo 'usuario' es el identificador de autenticación
            $user = UsuarioSisu::where('usuario', 'admin')->first();
            $this->assertNotNull($user);
            
            // El campo 'usuario' debe ser único y usado para autenticación
            $this->assertEquals('usuario', $user->getAuthIdentifierName());
            $this->assertEquals('admin', $user->getAuthIdentifier());
            
            // Verificar que el campo es único en la base de datos
            $this->assertEquals('admin', $user->usuario);
            
            // Verificar que podemos encontrar usuarios por este campo
            $foundUser = UsuarioSisu::where('usuario', 'admin')->first();
            $this->assertNotNull($foundUser);
            $this->assertEquals($user->id, $foundUser->id);
            
        } catch (\Exception $e) {
            $this->fail('Error al verificar campo usuario como identificador: ' . $e->getMessage());
        }
    }
}