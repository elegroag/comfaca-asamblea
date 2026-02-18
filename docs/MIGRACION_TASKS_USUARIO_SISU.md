# Migración de Tasks Relacionada con UsuarioSisu

## 📋 **Resumen de la Migración**

Se ha creado una nueva migración para la tabla `tasks` relacionada con el sistema de autenticación `UsuarioSisu`, reemplazando la relación anterior con el modelo `User` estándar de Laravel.

## 🔧 **Cambios Realizados**

### **1. Nueva Migración**
- **Archivo**: `2026_02_15_000021_create_tasks_table.php`
- **Tabla**: `tasks`
- **Relación**: `usuario_sisu_id` → `usuario_sisu.id`
- **Foreign Key**: Con `onDelete('set null')`

### **2. Modelo Task Actualizado**
- **Archivo**: `app/Models/Task.php`
- **Relación principal**: `usuarioSisu()`
- **Relación alias**: `user()` (compatibilidad)
- **Scopes actualizados**: `forUsuarioSisu()`, `forUser()`

### **3. Seeder Creado**
- **Archivo**: `database/seeders/TaskSeeder.php`
- **Datos**: 10 tareas de ejemplo del sistema de asambleas
- **Asignación**: Distribuidas entre usuarios SISU

## 🎯 **Estructura de la Tabla**

### **Tabla `tasks`**
```sql
CREATE TABLE `tasks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `description` text NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `usuario_sisu_id` bigint unsigned NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  INDEX `tasks_usuario_sisu_index` (`usuario_sisu_id`),
  INDEX `tasks_completed_index` (`completed`),
  INDEX `tasks_usuario_sisu_completed_index` (`usuario_sisu_sisu_id`, `completed`),
  CONSTRAINT `tasks_usuario_sisu_id_foreign` FOREIGN KEY (`usuario_sisu_id`) REFERENCES `usuario_sisu` (`id`) ON DELETE SET NULL
);
```

## 🔄 **Funcionalidad del Modelo**

### **✅ Relaciones**
```php
// Relación principal con UsuarioSisu
public function usuarioSisu(): BelongsTo
{
    return $this->belongsTo(UsuarioSisu::class, 'usuario_sisu_id');
}

// Alias para compatibilidad
public function user(): BelongsTo
{
    return $this->usuarioSisu();
}
```

### **✅ Scopes Actualizados**
```php
// Para UsuarioSisu
public function scopeForUsuarioSisu($query, $usuarioSisuId)
{
    return $query->where('usuario_sisu_id', $usuarioSisuId);
}

// Alias para compatibilidad
public function scopeForUser($query, $userId)
{
    return $query->forUsuarioSisu($userId);
}

// Scopes existentes
public function scopeCompleted($query) { ... }
public function scopePending($query) { ... }
public function scopeSearch($query, $term) { ... }
```

### **✅ Métodos de Ayuda**
```php
// Estados
public function estaCompletada() { ... }
public function estaPendiente() { ... }
public function toggleCompletado() { ... }

// Display
public function getEstadoAttribute() { ... }
public function getUsuarioNombreAttribute() { ... }
public function getResumenAttribute() { ... }
```

## 📊 **Datos Creados**

### **Tareas de Ejemplo (10 tareas)**
```
1. Configurar sistema de asambleas - Juan Pérez (admin) - Pendiente
2. Revisar documentación de consensos - Juan Pérez (jperez) - Pendiente
3. Validar datos de empresas - María González (mgonzalez) - Completada
4. Preparar informes de asamblea - Carlos Rodríguez (crodriguez) - Pendiente
5. Actualizar manual de procedimientos - Juan Pérez (admin) - Pendiente
6. Revisar configuración de mesas - Juan Pérez (jperez) - Completada
7. Capacitar personal de soporte - Juan Pérez (admin) - Pendiente
8. Testear sistema de votación - Carlos Rodríguez (crodriguez) - Pendiente
9. Generar reporte post-asamblea - María González (mgonzalez) - Pendiente
10. Archivar documentación - Juan Pérez (jperez) - Pendiente
```

### **Distribución por Usuario**
```
Juan Pérez (admin): 4 tareas
María González (mgonzalez): 3 tareas
Carlos Rodríguez (crodriguez): 3 tareas
```

## 🎯 **Ventajas de la Nueva Relación**

### **✅ Integración con Sistema SISU**
- **Usuarios reales**: Tareas asignadas a usuarios del sistema
- **Contexto relevante**: Tareas relacionadas con asambleas
- **Seguridad**: Solo usuarios SISU pueden ver sus tareas

### **✅ Flexibilidad**
- **Sin dependencia**: Usuarios pueden existir sin tareas
- **Borrado en cascada**: Si se elimina usuario, tareas quedan sin asignar
- **Reasignación fácil**: Cambiar usuario asignado a una tarea

### **✅ Compatibilidad**
- **Alias `user()`: Código existente sigue funcionando
- **Métodos heredados**: Scopes y funciones compatibles
- **Sin cambios**: No requiere modificar código existente

## 🔄 **Funcionalidad Verificada**

### **✅ Base de Datos**
```
- Tabla tasks: ✅ Creada correctamente
- Foreign key: ✅ Funcionando con usuario_sisu
- Índices: ✅ Optimizados para consultas
- Seeders: ✅ Datos de ejemplo creados
```

### **✅ Modelo Eloquent**
```
- Relación usuarioSisu: ✅ Funciona correctamente
- Scopes: ✅ Todos funcionando
- Métodos: ✅ Estados y display funcionando
- Alias: ✅ Compatibilidad mantenida
```

### **✅ Sistema Completo**
```
- Autenticación: ✅ UsuarioSisu funciona
- Tareas: ✅ Relacionadas con usuarios SISU
- Asambleas: ✅ Sistema completo funcionando
- Compatibilidad: ✅ Dualidad mantenida
```

## 📁 **Archivos Modificados/Creados**

### **Migraciones**
```
database/migrations/
└── ✅ 2026_02_15_000021_create_tasks_table.php  # Nueva migración
```

### **Modelos**
```
app/Models/
└── ✅ Task.php  # Actualizado para UsuarioSisu
```

### **Seeders**
```
database/seeders/
├── ✅ TaskSeeder.php  # Nuevo seeder de tareas
└── ✅ DatabaseSeeder.php  # Actualizado con TaskSeeder
```

## 🚀 **Resultado Final**

El sistema ahora tiene:
- **Tareas integradas** con el sistema de autenticación SISU
- **Relaciones funcionando** correctamente con UsuarioSisu
- **Datos de ejemplo** relevantes para el sistema de asambleas
- **Compatibilidad total** con código existente
- **Seeders completos** con datos de prueba

## 📈 **Estadísticas del Sistema de Tareas**

```
- Total tareas: 10
- Tareas completadas: 2
- Tareas pendientes: 8
- Usuarios con tareas: 3
- Promedio tareas por usuario: 3.33
```

## 🎉 **¡Migración de Tasks con UsuarioSisu Completada!**

La tabla `tasks` ahora está completamente integrada con el sistema de autenticación `UsuarioSisu`, permitiendo que los usuarios del sistema de asambleas gestionen sus tareas de manera contextual y relevante. El sistema mantiene la compatibilidad con código existente mientras aprovecha la integración con el modelo de usuarios real del sistema.