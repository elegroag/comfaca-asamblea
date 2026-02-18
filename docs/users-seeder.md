# Users Seeder - Arquitectura Dual

## 📋 **Usuarios Creados**

### 🔑 **Credenciales de Prueba**

| Tipo | Email | Password | Uso |
|------|-------|----------|-----|
| **Admin** | `admin@comfaca.test` | `password` | Administración general |
| **Test** | `user@comfaca.test` | `password` | Pruebas web estándar |
| **API** | `api@comfaca.test` | `password` | Pruebas de API endpoints |

### 👥 **Usuarios Adicionales**

| Email | Nombre | Rol |
|-------|--------|-----|
| `juan@comfaca.test` | Juan Pérez | Usuario estándar |
| `maria@comfaca.test` | María García | Usuario estándar |
| `carlos@comfaca.test` | Carlos López | Usuario estándar |
| `ana@comfaca.test` | Ana Martínez | Usuario estándar |
| `roberto@comfaca.test` | Roberto Sánchez | Usuario estándar |

### 🏭 **Usuarios Factory**

- **10 usuarios adicionales** generados con factory
- **Datos aleatorios** para pruebas de carga
- **Emails únicos** y verificados

---

## 🚀 **Casos de Uso para Testing**

### 1. **Web Authentication (Sessions)**
```bash
# Login web tradicional
Email: admin@comfaca.test
Password: password
```

### 2. **API Authentication (Sanctum)**
```bash
# Obtener token
curl -X POST http://localhost:8000/api/sanctum/token \
  -H "Content-Type: application/json" \
  -d '{"email": "api@comfaca.test", "password": "password", "device_name": "test"}'

# Usar token
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer TOKEN_AQUI"
```

### 3. **Frontend Testing**
```javascript
// Login con Backbone/Inertia
const loginData = {
    email: 'user@comfaca.test',
    password: 'password'
};

// API calls con $App.api
$App.api.get('/tasks'); // Usará token automático
```

---

## 📊 **Estadísticas del Seeder**

- **Total usuarios**: 18 (8 manuales + 10 factory)
- **Todos verificados**: `email_verified_at` establecido
- **Password uniforme**: `password` para facilidad de testing
- **Dominio consistente**: `@comfaca.test`

---

## 🔄 **Comandos Disponibles**

### Ejecutar seeder individual
```bash
php artisan db:seed --class=UserSeeder
```

### Ejecutar todos los seeders
```bash
php artisan db:seed
```

### Fresh migrate + seed
```bash
php artisan migrate:fresh --seed
```

---

## 🎯 **Escenarios de Prueba**

### 1. **Login Web**
- Navegar a `/login`
- Usar `user@comfaca.test` / `password`
- Verificar redirect a `/dashboard`
- Validar token disponible en frontend

### 2. **API Endpoints**
- Obtener token con `api@comfaca.test`
- Probar `/api/tasks` con Bearer token
- Verificar user filtering funciona

### 3. **Multi-User Testing**
- Login con diferentes usuarios
- Verificar aislamiento de datos
- Probar ownership validation

### 4. **Concurrent Sessions**
- Mismo usuario en web y API
- Validar token management
- Probar session regeneration

---

## 🔒 **Consideraciones de Seguridad**

⚠️ **Entorno de Desarrollo Only**
- Password simple (`password`) solo para desarrollo
- En producción usar passwords seguros
- Considerar variables de entorno para credenciales

✅ **Características Implementadas**
- Todos los usuarios con email verificado
- Hash de passwords con Laravel Hash
- Soporte para Sanctum tokens
- Compatible con arquitectura dual

---

## 📝 **Notas Adicionales**

- Los usuarios están listos para probar **sessions** y **tokens**
- Puedes crear tareas para probar **user filtering**
- Los tokens de Sanctum se generarán automáticamente al login web
- Los factory users son ideales para **pruebas de carga**
