# COMFACA Asamblea - Sistema de Gestión de Asambleas

Sistema web para la gestión integral de asambleas de COMFACA (Caja de Compensación Familiar del Caquetá). Permite administrar el proceso completo de asambleas, desde el registro de asistentes hasta la generación de reportes y certificados.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Modelos Principales](#-modelos-principales)
- [API](#-api)
- [Testing](#-testing)
- [Tecnologías](#-tecnologías)

## ✨ Características

- **Gestión de Asambleas**: Creación y administración de asambleas con control de quórum y consensos
- **Registro de Asistencia**: Sistema de recepción y registro de asistentes con validación de habilitados
- **Control de Mesas**: Administración de mesas de votación y asignación de interventores
- **Gestión de Poderes**: Registro y validación de poderes de representación
- **Novedades**: Manejo de novedades y cambios en el registro de asistentes
- **Carteras**: Gestión de carteras y cruces con habilitados
- **Reportes**: Generación de reportes y certificados en PDF y Excel
- **Panel de Administración**: Dashboard con métricas y estadísticas en tiempo real

## 🔧 Requisitos

- PHP >= 8.1
- Composer
- Node.js >= 18.x
- pnpm (gestor de paquetes)
- MySQL/MariaDB
- Extensiones PHP: pdo_mysql, mbstring, exif, pcntl, bcmath, gd, xml, zip

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd comfaca-asamblea/laravel

# Instalar dependencias PHP
composer install

# Instalar dependencias JavaScript
pnpm install

# Copiar archivo de entorno
cp .env.example .env

# Generar clave de aplicación
php artisan key:generate

# Ejecutar migraciones
php artisan migrate

# Poblar base de datos (opcional)
php artisan db:seed

# Compilar assets
pnpm build
```

## ⚙️ Configuración

### Base de Datos

Configurar conexión en `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=comfaca_asamblea
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

### Correo Electrónico

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=tu_email@example.com
MAIL_PASSWORD=tu_contraseña
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@comfaca.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Sanctum (API Authentication)

El proyecto utiliza Laravel Sanctum para autenticación de API. Configurar el dominio del frontend:

```env
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:8000
SESSION_DOMAIN=localhost
```

## 💻 Uso

### Desarrollo

```bash
# Iniciar servidor de desarrollo
php artisan serve

# Compilar assets en modo desarrollo (hot reload)
pnpm dev
```

### Producción

```bash
# Compilar assets optimizados
pnpm build

# Optimizar autoloader
composer install --optimize-autoloader --no-dev

# Optimizar configuración
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 📁 Estructura del Proyecto

```
laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/     # Controladores HTTP
│   │   ├── Middleware/       # Middleware
│   │   └── Requests/         # Form Requests
│   ├── Models/               # Modelos Eloquent
│   ├── Services/             # Lógica de negocio
│   └── Helpers/              # Funciones auxiliares
├── database/
│   ├── migrations/           # Migraciones
│   ├── seeders/              # Seeders
│   └── factories/            # Factories
├── resources/
│   ├── js/                   # TypeScript/JavaScript
│   │   ├── components/       # Componentes UI
│   │   ├── models/           # Modelos Backbone
│   │   ├── pages/            # Páginas de la aplicación
│   │   ├── services/         # Servicios API
│   │   └── utils/            # Utilidades
│   └── views/                # Vistas Blade
├── routes/
│   ├── api.php               # Rutas API
│   └── web.php               # Rutas Web
└── tests/                    # Tests automatizados
```

## 🗃️ Modelos Principales

| Modelo | Descripción |
|---------|-------------|
| `AsaAsamblea` | Gestión de asambleas |
| `AsaUsuarios` | Usuarios del sistema |
| `AsaMesas` | Mesas de votación |
| `AsaRepresentantes` | Representantes de empresas |
| `AsaTrabajadores` | Trabajadores habilitados |
| `AsaConsenso` | Registro de consensos |
| `AsaInterventores` | Interventores de mesa |
| `Poderes` | Poderes de representación |
| `Carteras` | Carteras de empresas |
| `Novedades` | Novedades y cambios |
| `Empresas` | Empresas afiliadas |
| `RegistroIngresos` | Registro de ingresos |
| `Rechazos` | Registro de rechazos |

## 🔌 API

El proyecto expone una API REST para la comunicación con el frontend.

### Autenticación

```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
```

### Endpoints Principales

```http
GET    /api/asambleas           # Listar asambleas
POST   /api/asambleas           # Crear asamblea
GET    /api/asambleas/{id}      # Obtener asamblea
PUT    /api/asambleas/{id}      # Actualizar asamblea
DELETE /api/asambleas/{id}      # Eliminar asamblea

GET    /api/mesas               # Listar mesas
GET    /api/recepcion           # Gestión de recepción
GET    /api/reportes            # Generación de reportes
GET    /api/habiles             # Lista de habilitados
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
php artisan test

# Ejecutar tests específicos
php artisan test --filter AuthControllerTest

# Ejecutar con cobertura
php artisan test --coverage
```

## 🛠️ Tecnologías

### Backend
- **Laravel 10** - Framework PHP
- **Laravel Sanctum** - Autenticación API
- **Inertia.js** - SPA sin API
- **PHPSpreadsheet** - Generación de Excel
- **TCPDF** - Generación de PDF

### Frontend
- **TypeScript** - Tipado estático
- **Backbone.js** - Arquitectura MVC frontend
- **TailwindCSS 4** - Framework CSS
- **DaisyUI** - Componentes UI
- **Vite** - Build tool
- **jQuery** - Manipulación DOM
- **DataTables** - Tablas dinámicas
- **SweetAlert2** - Alertas
- **Flatpickr** - Selector de fechas
- **Choices.js** - Selectores avanzados

## 📝 Licencia

Este proyecto es propietario de COMFACA - Caja de Compensación Familiar del Caquetá.

## 👥 Equipo de Desarrollo

Desarrollado por el equipo de TICs de COMFACA.
