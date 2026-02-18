# StorageService - Servicio de Gestión de Almacenamiento Local

## 🗄️ **Servicio Completo de Storage**

### 🚀 **Características Principales**

#### **1. Clase StorageService**
```typescript
class StorageService {
    constructor(options?: StorageOptions)
    
    // Métodos básicos
    set<T>(key: string, data: T, expiration?: number): boolean
    get<T>(key: string, defaultValue?: T): T | null
    remove(key: string): boolean
    has(key: string): boolean
    clear(): boolean
    
    // Métodos avanzados
    setWithTTL<T>(key: string, data: T, ttl: number): boolean
    cleanExpired(): number
    getInfo(key: string): StorageInfo | null
    export(): Record<string, any>
    import(data: Record<string, any>, options?: ImportOptions): boolean
    
    // Utilidades
    keys(): string[]
    size(): number
    getAvailableSpace(): number
}
```

#### **2. Configuración Flexible**
```typescript
interface StorageOptions {
    prefix?: string;      // Prefijo para claves (default: 'app_')
    expiration?: number;  // Expiración por defecto en segundos (default: 3600)
    encrypt?: boolean;    // Encriptación simple (default: false)
}

// Ejemplos de configuración
const storage = new StorageService({
    prefix: 'myapp_',
    expiration: 7200,    // 2 horas
    encrypt: true        // Encriptar datos
});
```

#### **3. Tipado Completo**
```typescript
interface StorageItem<T = any> {
    data: T;              // Datos almacenados
    timestamp: number;   // Fecha de creación
    expiration?: number; // Fecha de expiración
    encrypted?: boolean; // Si está encriptado
}

interface StorageInfo {
    exists: boolean;
    size?: number;
    timestamp?: number;
    expiration?: number;
}
```

---

## 📋 **Uso Práctico**

### **Operaciones Básicas**
```typescript
import StorageService, { defaultStorage } from '@/services/StorageService';

// Usar instancia por defecto
defaultStorage.set('user', { name: 'John', age: 30 });
const user = defaultStorage.get('user');

// Crear instancia personalizada
const userStorage = new StorageService({
    prefix: 'user_',
    expiration: 1800 // 30 minutos
});

userStorage.set('preferences', { theme: 'dark', lang: 'es' });
```

### **Datos con Expiración**
```typescript
// Guardar con expiración personalizada
storage.set('token', 'abc123', 3600); // 1 hora

// Guardar con TTL (Time To Live)
storage.setWithTTL('session', data, 1800); // 30 minutos

// Verificar si existe y no ha expirado
if (storage.has('token')) {
    const token = storage.get('token');
}
```

### **Gestión de Colecciones**
```typescript
// Guardar array de tareas
storage.set('tasks', [
    { id: 1, title: 'Tarea 1', completed: false },
    { id: 2, title: 'Tarea 2', completed: true }
]);

// Obtener con valor por defecto
const tasks = storage.get('tasks', []);

// Agregar nueva tarea
const currentTasks = storage.get('tasks', []);
currentTasks.push({ id: 3, title: 'Nueva tarea', completed: false });
storage.set('tasks', currentTasks);
```

### **Limpieza y Mantenimiento**
```typescript
// Limpiar items expirados
const cleaned = storage.cleanExpired();
console.log(`Se limpiaron ${cleaned} items expirados`);

// Obtener información de un item
const info = storage.getInfo('user');
if (info?.exists) {
    console.log(`Tamaño: ${info.size} bytes`);
    console.log(`Creado: ${new Date(info.timestamp).toLocaleString()}`);
    if (info.expiration) {
        console.log(`Expira: ${new Date(info.expiration).toLocaleString()}`);
    }
}

// Limpiar todo el storage
storage.clear();
```

---

## 🔧 **Funcionalidades Avanzadas**

### **1. Encriptación**
```typescript
const secureStorage = new StorageService({
    prefix: 'secure_',
    encrypt: true
});

secureStorage.set('sensitive', { password: 'secret123', token: 'abc456' });
// Los datos se guardan encriptados en localStorage
```

### **2. Export/Import**
```typescript
// Exportar todos los datos
const allData = storage.export();
console.log('Datos exportados:', allData);

// Importar datos
storage.import(allData, {
    overwrite: true,  // Sobrescribir existentes
    merge: true       // Fusionar con existentes
});
```

### **3. Gestión de Espacio**
```typescript
// Ver espacio usado
const usedSpace = storage.size();
console.log(`Espacio usado: ${usedSpace} bytes`);

// Ver espacio disponible
const availableSpace = storage.getAvailableSpace();
console.log(`Espacio disponible: ${availableSpace} bytes`);

// Obtener todas las claves
const keys = storage.keys();
console.log('Claves almacenadas:', keys);
```

---

## 🎯 **Casos de Uso Comunes**

### **1. Cache de API**
```typescript
class ApiCache {
    private storage = new StorageService({
        prefix: 'api_cache_',
        expiration: 300 // 5 minutos
    });

    async get<T>(url: string): Promise<T | null> {
        const cached = this.storage.get<T>(url);
        if (cached) return cached;

        const response = await fetch(url);
        const data = await response.json();
        
        this.storage.set(url, data);
        return data;
    }
}
```

### **2. Preferencias de Usuario**
```typescript
class UserPreferences {
    private storage = new StorageService({
        prefix: 'prefs_',
        expiration: 86400 * 30 // 30 días
    });

    setTheme(theme: 'light' | 'dark'): void {
        this.storage.set('theme', theme);
    }

    getTheme(): 'light' | 'dark' {
        return this.storage.get('theme', 'light');
    }

    setLanguage(lang: string): void {
        this.storage.set('language', lang);
    }

    getLanguage(): string {
        return this.storage.get('language', 'es');
    }
}
```

### **3. Estado de Aplicación**
```typescript
class AppState {
    private storage = new StorageService({
        prefix: 'state_',
        expiration: 86400 // 1 día
    });

    saveState(state: any): void {
        this.storage.set('current', state);
    }

    loadState(): any {
        return this.storage.get('current');
    }

    clearState(): void {
        this.storage.remove('current');
    }
}
```

---

## 📊 **Métricas y Monitoreo**

### **Información de Storage**
```typescript
// Estadísticas completas
const storageStats = {
    totalItems: storage.keys().length,
    usedSpace: storage.size(),
    availableSpace: storage.getAvailableSpace(),
    expiredItems: storage.cleanExpired()
};

console.log('Estadísticas del Storage:', storageStats);
```

### **Debugging**
```typescript
// Ver todos los items con su información
storage.keys().forEach(key => {
    const info = storage.getInfo(key);
    console.log(`Key: ${key}`, info);
});
```

---

## 🛡️ **Seguridad Consideraciones**

### **1. Datos Sensibles**
```typescript
// Para datos sensibles, usar encriptación
const secureStorage = new StorageService({
    prefix: 'secure_',
    encrypt: true,
    expiration: 3600 // Expiración corta
});

// No guardar passwords directamente
secureStorage.set('session_token', token);
```

### **2. Validación**
```typescript
function validateAndSet<T>(key: string, data: T, validator: (data: T) => boolean): boolean {
    if (!validator(data)) {
        console.error('Datos inválidos');
        return false;
    }
    
    return storage.set(key, data);
}
```

---

## 📁 **Integración con App.ts**

```typescript
// En App.ts
import StorageService from '@/services/StorageService';

const $App: AppInstance = {
    // ... otras propiedades
    
    // Instancia de storage
    storage: new StorageService({
        prefix: 'app_',
        expiration: 3600
    }),
    
    // ... otros métodos
};
```

### **Uso en Componentes**
```typescript
// Guardar estado del formulario
$App.storage.set('form_data', formData);

// Recuperar estado
const savedData = $App.storage.get('form_data', {});

// Limpiar al cerrar sesión
$App.storage.clear();
```

---

## 🎉 **Ventajas del StorageService**

- ✅ **TypeScript completo** con tipado fuerte
- ✅ **Expiración automática** de datos
- ✅ **Encriptación opcional** para datos sensibles
- ✅ **Gestión de espacio** y limpieza
- ✅ **Export/Import** para migración de datos
- ✅ **Prefijos configurables** para evitar colisiones
- ✅ **Error handling** robusto
- ✅ **Métricas y monitoreo** integrados

**StorageService proporciona una solución completa y segura para el manejo de localStorage en aplicaciones TypeScript.**
