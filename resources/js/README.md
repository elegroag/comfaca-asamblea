# Patrón Vanilla JS + Inertia en Habiles

Este documento describe la arquitectura y los flujos aplicados en la página Habiles usando Vanilla JS, Backbone-like (Bone), y Inertia como capa de orquestación desde Laravel.

## Visión general
- **Objetivo**: separar responsabilidades (UI, navegación, negocio y datos) aplicando principios SOLID/DRY.
- **Capas principales**:
  - **Router**: resuelve rutas de la subaplicación y delega en controladores.
  - **Controller**: orquesta regiones, layouts, vistas y servicios.
  - **Service**: encapsula la lógica de negocio y el acceso a la API.
  - **Views**: componentes de UI (BackboneView) que emiten/escuchan eventos.
  - **App/Region/Layout**: infraestructura de la SPA (contenedores y zonas de render).

## Estructura de archivos relevante
- Router y controladores
  - `EmpresasController.ts`
  - `EmpresasHabiles.ts`
  - `EmpresaCrear.ts`, `EmpresaEditar.ts`, `EmpresaDetalle.ts`, `EmpresaMasivo.ts`
- Servicio de dominio
  - `EmpresaService.ts`
- Vistas
  - `componentes/habiles/views/*`
- Entrada de página
  - `index.ts`

## Flujo de inicialización (Inertia → App → SubApp)
1. `index.ts` usa `useLayout` para montar el layout de la página.
2. Llama a `$App.startApp(RouterHabiles, { defaultRoute, mainRegion, props })`.
3. `App` crea/usa `mainRegion` y setea `props` comunes (api, logger, etc.).
4. El `Router` resuelve la ruta (e.g. `listar`) y llama a un método del `Controller`.
5. El `Controller` crea un `LayoutView`, muestra las vistas en regiones y conecta eventos a métodos del `Service`.

## Roles y responsabilidades
- Router
  - Define rutas (`listar`, `detalle/:id`, `crear`, `cargue`, etc.).
  - Resuelve cada ruta y ejecuta `controller.main().<acción>()`.
- Controller
  - Inyecta `api`, `App`, `logger`, `region`.
  - Crea `LayoutView` y muestra vistas en regiones (`body`, `subheader`).
  - Conecta eventos de las vistas con `EmpresaService` (e.g. `form:save`, `remove:habiles`).
  - Gestiona ciclo de vida (`destroy`): `region.remove()` y `stopListening()`.
- Service (EmpresaService)
  - Mantiene `Collections` locales (`empresas`, `habiles`).
  - Expone métodos públicos con prefijo `__` para ser utilizados por controllers/vistas.
  - Internamente delega a métodos privados que consumen API (`findAllApi`, `removeHabilApi`, `notifyPlataformaApi`).
  - Persiste/restaura colecciones con `BoxCollectionStorage` cuando aplica (`initializeCollections`).
- Views
  - Renderizan UI, recogen datos del formulario y emiten eventos (e.g. `form:save`).
  - No conocen detalles de API ni almacenamiento.

## Comunicación por eventos
- UI → Service (vía Controller)
  - La vista emite: `form:save`, `form:edit`, `remove:habiles`, `notify`, etc.
  - El controller hace `listenTo(view, 'form:save', service.__saveEmpresa)`.
- Service → App/UI
  - Notificaciones: `this.App?.trigger('alert:success'|'alert:error', { message })`.
  - Mutaciones de colecciones: `Collections.empresas.add(...)`, `Collections.habiles.remove(...)`.

## Acceso a API
- Se evita el mecanismo `syncro` y se usa `this.api` directamente.
- Patrones de implementación:
  - GET: `const response = await this.api.get('/habiles/listar')`.
  - POST: `await this.api.post('/habiles/saveEmpresaHabil', payload)`.
  - DELETE: `await this.api.delete(`/habiles/removeEmpresa/${id}`)`.
- Manejo de errores uniforme con `try/catch`, log con `logger` y feedback con `App.trigger('alert:*')`.

## Colecciones y almacenamiento
- Inicialización perezosa: `initEmpresas()`, `initHabiles()`.
- Adición/actualización: `add(..., { merge: true })`.
- Persistencia opcional vía `BoxCollectionStorage` usando `initializeCollections()`.

## Ejemplos de uso
- Listar empresas (desde controller):
```ts
await this.api?.get('/habiles/listar');
this.empresaService.__setEmpresas(response.empresas);
layout.getRegion('body').show(listView);
```
- Guardar empresa (desde view → controller → service):
```ts
// view
this.trigger('form:save', { model, callback });
// controller
this.listenTo(view, 'form:save', this.empresaService.__saveEmpresa);
// service (privado)
await this.api.post('/habiles/saveEmpresaHabil', model.toJSON());
```
- Remover habil:
```ts
this.listenTo(listView, 'remove:habiles', this.empresaService.__removeHabil);
// service → removeHabilApi → Collections.habiles.remove(model)
```

## Convenciones
- Métodos públicos de servicio: prefijo `__` (interfaz para controllers/vistas).
- Métodos privados de servicio: nombre semántico `*Api()` para llamadas HTTP.
- Notificaciones: `alert:success` / `alert:error` con `{ message }`.
- Tipado TS: evitar `any` en código nuevo. Donde exista legado, encapsular en el service.

## Guía para extender
1. Crear una vista y su template.
2. Añadir ruta en el Router y método en el Controller que:
   - construya `LayoutView`,
   - instancie la vista,
   - conecte eventos con `EmpresaService`.
3. Implementar en `EmpresaService` los métodos `__*` públicos y `*Api` privados.
4. Actualizar colecciones y emitir notificaciones.

## Ciclo de vida y limpieza
- Cada controller implementa `destroy()`:
  - `this.region.remove()` para desmontar contenido.
  - `this.stopListening()` para evitar fugas de eventos.

## Beneficios del patrón
- Aísla UI de la lógica de negocio y del transporte.
- Facilita pruebas unitarias del service y de las views independientes.
- Permite migrar gradualmente de `syncro` a API estándar.
- Escalable para nuevas rutas y funcionalidades.





Sí. Te dejo una guía práctica y concreta para aplicar esas dos mejoras de forma incremental, alineada con tu stack actual.

# Objetivo
- Centralizar la creación de `api`, `logger`, `App`, `Region`.
- Pasar dependencias por constructor a Routers, Controllers y Services.
- Eliminar accesos globales como `$App`, `_`, `Empresa`.

# 1) Composition Root (Bootstrap) centralizado
Crea un único punto de arranque que construye e inyecta dependencias.

```ts
// core/bootstrap.ts
import ApiService from '@/core/ApiService';
import Logger from '@/common/Logger';
import $App from '@/core/App';
import { Region } from '@/common/Region';

export interface Dependencies {
  api: ApiService;
  logger: Logger;
  app: typeof $App;
  mainRegion: Region;
}

export function createDeps(mainRegionEl: string, props: any): Dependencies {
  const logger = new Logger();         // tipado y con niveles
  const api = new ApiService(props);   // ya lo usas con props
  const mainRegion = new Region({ el: mainRegionEl });

  // Inicializa App con región y props sin exponerlo globalmente a la UI
  $App.startApp(
    // Nota: si tu startApp requiere Router, aquí solo inicializa estado base
    class DummyRouter {},
    { defaultRoute: '', mainRegion, props }
  );

  return { api, logger, app: $App, mainRegion };
}
```

# 2) Inyección explícita en Router/Controller/Service
Define opciones tipadas y pásalas por constructor.

```ts
// pages/Habiles/types.ts
import type ApiService from '@/core/ApiService';
import type Logger from '@/common/Logger';
import type { Region } from '@/common/Region';
import type { AppInstance } from '@/types/types';

export interface CommonDeps {
  api: ApiService;
  logger: Logger;
  app: AppInstance;
  region: Region;
}
```

```ts
// pages/Habiles/EmpresaService.ts (fragmento)
export interface EmpresaServiceOptions {
  api: ApiService;
  logger: Logger;
  app: AppInstance;
  // si requieres storage, pásalo aquí también
}

export default class EmpresaService {
  constructor(private readonly opts: EmpresaServiceOptions) {}

  private get api() { return this.opts.api; }
  private get logger() { return this.opts.logger; }
  private get App() { return this.opts.app; }

  async findAllApi(): Promise<void> {
    try {
      const response = await this.api.get('/habiles/listar');
      if (response?.success) {
        this.__setEmpresas(response.empresas);
      } else {
        this.App.trigger('alert:error', { message: response.msj });
      }
    } catch (e:any) {
      this.logger.error('Error al listar empresas:', e);
      this.App.trigger('alert:error', { message: e.message || 'Error de conexión' });
    }
  }
}
```

```ts
// pages/Habiles/EmpresasController.ts (fragmento)
import { Controller } from '@/common/Controller';
import { CommonDeps } from './types';
import EmpresaService from './EmpresaService';
import LayoutView from '@/componentes/layouts/views/LayoutView';

interface EmpresasControllerOptions extends CommonDeps {}

export default class EmpresasController extends Controller {
  private service: EmpresaService;
  private region: Region;

  constructor(options: EmpresasControllerOptions) {
    super(options);
    this.region = options.region;
    this.service = new EmpresaService({
      api: options.api,
      logger: options.logger,
      app: options.app,
    });
  }

  async listaEmpresas(): Promise<void> {
    const layout = new LayoutView();
    this.region.show(layout);
    await this.service.findAllApi();
    // ...
  }
}
```

```ts
// pages/Habiles/RouterHabiles.ts (fragmento)
import { BackboneRouter } from '@/common/Bone';
import type { CommonDeps } from './types';
import EmpresasController from './EmpresasController';

interface RouterHabilesOptions extends Partial<CommonDeps> {}

export default class RouterHabiles extends BackboneRouter {
  constructor(private deps: CommonDeps, options: RouterHabilesOptions = {}) {
    super({ ...options, routes: { listar: 'listaEmpresas' } });
    this._bindRoutes();
  }

  listaEmpresas(): void {
    const controller = new EmpresasController(this.deps);
    controller.listaEmpresas();
  }

  // factoriza si necesitas main() reutilizable
}
```

# 3) Punto de entrada de página sin globales
El index de la página recibe `props`, compone dependencias y arranca.

```ts
// pages/Habiles/index.ts (fragmento)
import useLayout from '@/componentes/useLayout';
import RouterHabiles from './RouterHabiles';
import { createDeps } from '@/core/bootstrap';

const Habiles = {
  mount(el: HTMLElement, props: any) {
    const { layout } = useLayout(props);
    const deps = createDeps('#contentView', props);

    const mainRegion = layout.getRegion('content');
    const router = new RouterHabiles({ ...deps, region: mainRegion });

    // si tu App necesita conocer Router, pásalo como prop, no por global
    deps.app.startSubApplication(/* ... */);
  }
};

export default Habiles;
```

# 4) Evitar `$App`, `_`, `Empresa` globales
- `$App`: ya se inyecta como `app` y se usa vía `this.App`.
- `_`: importa lodash/util concreto o elimina dependencia donde no sea necesaria.
- `Empresa`: importa el modelo explícitamente en donde se use y pásalo como dependencia si quieres testear/aislar.

Ejemplo en una View:
```ts
// En vez de usar globals en la view, pasa por options:
interface EmpresaEditarViewOptions {
  EmpresaModel: typeof Empresa;
  // ...
}

constructor(options: EmpresaEditarViewOptions) {
  super(options);
  this.modelUse = options.EmpresaModel;
}
```

# 5) Check-list rápido para migrar
- Crear `bootstrap.ts` y `types.ts` (CommonDeps).
- Actualizar [index.ts](cci:7://file:///home/elegro/proyectos/php/php8/www/comfaca-asamblea/laravel/resources/js/pages/Usuarios/index.ts:0:0-0:0) de cada página para usar `createDeps(...)` y pasar `region`.
- Refactorizar `Router*` para recibir `deps: CommonDeps`.
- Refactorizar `Controller` para recibir `region`, `api`, `logger`, `app`.
- Refactorizar `Service` para recibir `api`, `logger`, `app` y eliminar globals.
- Sustituir usos de `$App`, `_`, `Empresa` por importación/inyección.

# Beneficios inmediatos
- Menos acoplamiento y menos efectos colaterales de globales.
- Tests de unidades más simples (mocks de `api`, `logger`, `app`, `region`).
- Escalabilidad: incorporar nuevos dominios reutilizando el mismo bootstrap.

Si quieres, te preparo un PR mínimo que agregue `bootstrap.ts`, `CommonDeps` y refactorice Habiles en 3 archivos clave: [index.ts](cci:7://file:///home/elegro/proyectos/php/php8/www/comfaca-asamblea/laravel/resources/js/pages/Usuarios/index.ts:0:0-0:0), `RouterHabiles.ts`, [EmpresasController.ts](cci:7://file:///home/elegro/proyectos/php/php8/www/comfaca-asamblea/laravel/resources/js/pages/Habiles/EmpresasController.ts:0:0-0:0)/[EmpresaService.ts](cci:7://file:///home/elegro/proyectos/php/php8/www/comfaca-asamblea/laravel/resources/js/pages/Habiles/EmpresaService.ts:0:0-0:0).
