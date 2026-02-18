# Guía de Migración a TypeScript

## 📋 Resumen del Proyecto

Se ha completado la migración completa del proyecto JavaScript a TypeScript, manteniendo total compatibilidad con **Backbone.js**, **jQuery** y **Underscore.js**.

## 🎯 Beneficios Alcanzados

### ✅ Tipado Fuerte
- **Backbone.js**: Model, View, Collection, Router completamente tipados
- **jQuery**: Manipulación DOM y AJAX con autocompletado
- **Underscore.js**: Todas las funciones utilitarias tipadas
- **Datos**: Interfaces para Task, User, Beneficiario, etc.

### ✅ Desarrollo Mejorado
- **Autocompletado** inteligente en VSCode
- **Detección de errores** en tiempo de compilación
- **Refactorización segura** con tipado
- **Documentación integrada** en el código

## 📁 Estructura de Archivos

```
resources/js/
├── types/
│   ├── backbone.d.ts      # Tipos Backbone.js
│   ├── underscore.d.ts    # Tipos Underscore.js  
│   ├── jquery.d.ts        # Tipos jQuery extendidos
│   ├── models.d.ts        # Interfaces de datos
│   └── types.d.ts         # Tipos globales
├── core/
│   ├── App.ts             # Aplicación principal tipada
│   ├── Core.ts            # Utilidades core
│   └── Utils.ts           # Utilidades del sistema
├── common/
│   ├── Controller.ts      # Controlador base
│   ├── ModelView.ts       # Vista Backbone tipada
│   └── Region.ts          # Gestor de regiones
├── pages/
│   └── Tasks/
│       ├── Index.ts       # Listado de tareas
│       ├── Edit.ts        # Edición de tareas
│       └── Create/
│           └── main.ts    # Creación de tareas
└── app.ts                 # Punto de entrada
```

## 🔧 Configuración

### TypeScript (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext", 
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["resources/js/*"]
    }
  }
}
```

### ESLint (`eslint.config.js`)
- Validación TypeScript + JavaScript
- Reglas específicas para Backbone/jQuery
- Autocorrección automática

### Vite (`vite.config.js`)
- Compilación TypeScript optimizada
- Bundle splitting para vendor/libs
- Source maps para debugging

## 🚀 Patrones de Uso

### 1. Componentes con Tipado

```typescript
interface TaskComponent extends Component {
    tasks: Task[];
    filters: TaskFilters;
}

class TaskIndex implements TaskComponent {
    render(): string { /* ... */ }
    mount(el: HTMLElement): void { /* ... */ }
    destroy(): void { /* ... */ }
}
```

### 2. Modelos de Datos

```typescript
interface Task extends BaseModel {
    name: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
}
```

### 3. Backbone con Tipos

```typescript
class TaskView extends Backbone.View {
    model: Task;
    
    render(): this {
        const data = this.model.toJSON();
        this.$el.html(this.template(data));
        return this;
    }
}
```

### 4. jQuery con Tipos

```typescript
const $form = $('#task-form') as JQuery;
$form.on('submit', (e: JQuery.Event) => {
    e.preventDefault();
    const data = this.getFormData();
    this.submitTask(data);
});
```

### 5. Underscore con Tipos

```typescript
const filteredTasks = _.filter(this.tasks, (task: Task) => {
    return task.status === 'pending';
});

const taskNames = _.map(this.tasks, (task: Task) => task.name);
```

## 🎨 Ejemplos Prácticos

### Formularios Tipados

```typescript
interface TaskFormData {
    name: string;
    priority: 'low' | 'medium' | 'high';
    assigned_to?: number;
}

private validateForm(): boolean {
    const nameValid = this.validateField('name');
    const priorityValid = this.validateField('priority');
    return nameValid && priorityValid;
}

private getFormData(): TaskFormData {
    return {
        name: $('#name').val() as string,
        priority: $('#priority').val() as 'low' | 'medium' | 'high',
        assigned_to: $('#assigned_to').val() ? Number($('#assigned_to').val()) : undefined,
    };
}
```

### API Requests con Tipos

```typescript
private async loadTasks(): Promise<void> {
    try {
        const response = await fetch(window.route('tasks.index'), {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
        });

        if (response.ok) {
            const data: ApiResponse<Task[]> = await response.json();
            this.tasks = data.data || [];
            this.renderTasks();
        }
    } catch (error) {
        this.showError('Error al cargar las tareas');
    }
}
```

### Eventos con Tipos

```typescript
private bindEvents(): void {
    $('#apply-filters').on('click', () => {
        this.applyFilters();
    });

    $('#tasks-tbody').on('click', '.edit-task', (e: JQuery.Event) => {
        const taskId = $(e.currentTarget).data('id') as number;
        this.editTask(taskId);
    });
}
```

## 🔍 Mejores Prácticas

### 1. Tipado Estricto
- Usar `interface` para modelos de datos
- Evitar `any` siempre que sea posible
- Definir tipos de unión para valores enumerados

### 2. Nomenclatura
- Interfaces en PascalCase: `TaskFormData`
- Tipos unión: `'pending' | 'completed'`
- Clases: PascalCase: `TaskIndex`

### 3. Organización
- Tipos relacionados en archivos dedicados
- Exportaciones consistentes
- Imports con alias `@/types/types`

### 4. Validación
- Validación en tiempo real con tipos
- Manejo de errores tipado
- Respuestas API con interfaces

## 🛠️ Comandos Útiles

### Desarrollo
```bash
pnpm run dev          # Servidor con validación TS
pnpm run build        # Compilación producción
pnpm run lint         # Validación ESLint
pnpm run lint:fix     # Autocorrección
```

### TypeScript
```bash
npx tsc --noEmit      # Verificar tipos sin compilar
npx tsc --showConfig  # Mostrar configuración
```

## 📚 Referencias

### Tipos Definidos
- **Backbone**: `Backbone.Model`, `Backbone.View`, `Backbone.Collection`
- **jQuery**: `JQuery`, `JQuery.AjaxSettings`, `JQuery.Event`
- **Underscore**: `UnderscoreStatic`, funciones utilitarias
- **Datos**: `Task`, `User`, `Beneficiario`, `ApiResponse`

### Globales Disponibles
```typescript
declare global {
    var $: JQueryStatic;
    var _: UnderscoreStatic;
    var Backbone: BackboneStatic;
    var window: Window & { route: (name: string) => string };
}
```

## 🎯 Siguientes Pasos

1. **Migrar páginas restantes** (Beneficiarios, Independientes, etc.)
2. **Crear tests unitarios** con tipado
3. **Optimizar bundles** con code splitting
4. **Documentar componentes** con JSDoc

## 🐈‍⬛ Soporte

El proyecto mantiene 100% compatibilidad con:
- ✅ Backbone.js 1.6.0
- ✅ jQuery 3.7.1  
- ✅ Underscore.js 1.13.7
- ✅ Bootstrap 5.3.3
- ✅ Inertia.js 0.11.1

---

**¡Listo para desarrollo TypeScript productivo!** 🚀