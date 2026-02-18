# ApiService - Servicio de API con Sanctum

## 🚀 **Servicio Extraído y Mejorado**

### 📋 **Características Principales**

#### **1. Clase ApiService Dedicada**
```typescript
class ApiService {
    private app: AppInstance;

    constructor(app: AppInstance) {
        this.app = app;
    }

    // Métodos completos para API con Sanctum
    getToken(): string | null
    getHeaders(): Record<string, string>
    get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>
    post<T>(url: string, data?: Record<string, any>): Promise<ApiResponse<T>>
    put<T>(url: string, data?: Record<string, any>): Promise<ApiResponse<T>>
    patch<T>(url: string, data?: Record<string, any>): Promise<ApiResponse<T>>
    delete<T>(url: string): Promise<ApiResponse<T>>
    upload<T>(url: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>>
    download(url: string, filename?: string): Promise<void>
    isAuthenticated(): boolean
    getUserInfo(): any | null
}
```

#### **2. Tipado Completo**
```typescript
interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

interface ApiError {
    message: string;
    status: number;
    statusText: string;
}
```

#### **3. Manejo de Errores Avanzado**
```typescript
private handleError(error: any, url: string): never {
    // ✅ Diferentes tipos de errores
    if (error instanceof Response) {
        if (error.status === 401) {
            // Redirección automática a login
            window.location.href = '/login';
        }
        if (error.status === 403) {
            errorMessage = 'Acceso denegado';
        }
        // ... más casos
    }
    
    // ✅ Logging consistente
    console.error(`API Error [${status}] ${url}:`, apiError);
    throw apiError;
}
```

#### **4. Funciones Adicionales**
```typescript
// ✅ Upload de archivos
async upload<T>(url: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>>

// ✅ Download de archivos  
async download(url: string, filename?: string): Promise<void>

// ✅ Verificación de autenticación
isAuthenticated(): boolean

// ✅ Obtener info del usuario
getUserInfo(): any | null
```

---

## 🔄 **Integración con App.ts**

### **Antes (Objeto Inline)**
```typescript
api: {
    getToken: function () { ... },
    getHeaders: function () { ... },
    get: async function (url, params) { ... },
    // ... 80+ líneas de código
}
```

### **Ahora (Servicio Dedicado)**
```typescript
// Import del servicio
import ApiService from '@/services/ApiService';

// Creación de instancia
const apiService = new ApiService($App);

// Asignación limpia
$App.api = apiService;
```

---

## 🎯 **Ventajas de la Extracción**

#### **✅ Modularidad**
- **Código separado** en su propio archivo
- **Responsabilidad única** para operaciones API
- **Reutilizable** en otros proyectos

#### **✅ Mantenimiento**
- **Más fácil** de modificar y extender
- **Testing unitario** simplificado
- **Debugging** centralizado

#### **✅ Type Safety**
- **Interfaces completas** para responses
- **Error handling** tipado
- **Autocompletado** mejorado

#### **✅ Funcionalidad Extendida**
- **Upload de archivos** nativo
- **Download de archivos** 
- **PATCH method** adicional
- **Authentication helpers**

---

## 📝 **Uso Práctico**

### **En Componentes**
```typescript
// ✅ Tipado completo
interface Task {
    id: number;
    title: string;
    completed: boolean;
}

// ✅ Llamadas API tipadas
const tasks = await $App.api.get<Task[]>('/tasks');
const task = await $App.api.post<Task>('/tasks', { title: 'Nueva tarea' });

// ✅ Upload de archivos
const result = await $App.api.upload('/upload', file, { category: 'documents' });

// ✅ Download de archivos
await $App.api.download('/files/1', 'document.pdf');

// ✅ Verificación de autenticación
if ($App.api.isAuthenticated()) {
    const user = $App.api.getUserInfo();
    console.log('Usuario:', user);
}
```

### **Error Handling**
```typescript
try {
    const result = await $App.api.get('/tasks');
    console.log(result.data);
} catch (error: ApiError) {
    if (error.status === 401) {
        // Redirección automática manejada por el servicio
    } else if (error.status === 403) {
        $App.notify('error', 'No tienes permisos');
    }
}
```

---

## 📁 **Estructura de Archivos**

```
resources/js/
├── services/
│   └── ApiService.ts          # ← Nuevo servicio dedicado
├── core/
│   └── App.ts                 # ← Actualizado para usar ApiService
└── types/
    └── types.d.ts             # ← Tipos compartidos
```

---

## 🎉 **Resultado Final**

**ApiService extraído correctamente:**

- ✅ **Servicio dedicado** con 200+ líneas de funcionalidad
- ✅ **TypeScript completo** con interfaces y tipos
- ✅ **Error handling** avanzado y centralizado
- ✅ **Funciones adicionales** (upload, download, auth helpers)
- ✅ **App.ts limpio** y mantenible
- ✅ **Modularidad** y reutilización mejoradas

**El código API ahora está completamente separado, tipado y listo para uso en toda la aplicación.**
