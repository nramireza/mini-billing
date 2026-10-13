# Mini Billing

Aplicación full-stack de facturación (clientes, facturas e ítems) construida con **Laravel** (API REST) y **Next.js** (interfaz), empaquetada con **Docker**.

Proyecto de portafolio orientado a un dominio **Sales & Billing**: modela clientes, facturas con múltiples ítems, cálculo de IVA, estados de factura y un panel de métricas.

## Stack

| Capa | Tecnología |
|------|------------|
| Backend | PHP 8.5 · Laravel 13 · API REST · Eloquent |
| Frontend | Next.js 16 (App Router, RSC) · React 19 · TypeScript · Tailwind CSS |
| Base de datos | MySQL 8.4 |
| Infraestructura | Docker · Docker Compose |
| Testing | PHPUnit (18 tests de feature) |

## Arquitectura

```
┌──────────────────┐        /api/*        ┌───────────────────┐        ┌──────────┐
│  Navegador        │ ───────────────────▶ │  Next.js (3000)   │ ─────▶ │ Laravel  │
│  localhost:3001   │                      │  rewrite → backend│        │  (8000)  │
└──────────────────┘                      └───────────────────┘        └────┬─────┘
                                                                            │
                                                                     ┌──────▼──────┐
                                                                     │  MySQL 8.4  │
                                                                     └─────────────┘
```

- El frontend expone `/api/*` mediante **rewrites** de Next.js y los redirige internamente al backend (`API_URL`). Así el navegador consume un origen único y no hay que preocuparse por CORS en el cliente.
- El backend sigue el patrón **Form Request → Controller → Resource**: validación de entrada, lógica en el controlador y serialización controlada de la respuesta.
- Los totales de la factura (`subtotal`, `tax`, `total`) se derivan de los ítems y la tasa de IVA.

## Funcionalidades

- **Clientes**: CRUD, búsqueda por nombre/RUT/email, conteo de facturas. No se permite borrar un cliente con facturas (HTTP 409).
- **Facturas**: CRUD con ítems anidados, numeración automática (`INV-00001`), filtro por estado, búsqueda por número o cliente y paginación.
- **Ítems**: descripción, cantidad y precio unitario, con total por línea e IVA configurable por factura.
- **Estados**: `draft`, `issued`, `paid`, `cancelled`, actualizables desde la interfaz.
- **Panel**: métricas agregadas (clientes, facturas, total facturado) y desglose por estado.

## API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/stats` | Métricas del panel |
| GET | `/api/customers` | Lista paginada (`q`, `page`, `per_page`) |
| POST | `/api/customers` | Crea un cliente |
| GET | `/api/customers/{id}` | Detalle de cliente |
| PUT | `/api/customers/{id}` | Actualiza un cliente |
| DELETE | `/api/customers/{id}` | Elimina un cliente (409 si tiene facturas) |
| GET | `/api/invoices` | Lista paginada (`status`, `customer_id`, `q`, `page`) |
| POST | `/api/invoices` | Crea una factura con ítems |
| GET | `/api/invoices/{id}` | Detalle de factura con cliente e ítems |
| PUT | `/api/invoices/{id}` | Actualiza la factura (reemplaza ítems) |
| PATCH | `/api/invoices/{id}/status` | Cambia el estado |
| DELETE | `/api/invoices/{id}` | Elimina la factura y sus ítems |

## Cómo levantar el proyecto

Requisitos: Docker y Docker Compose.

```bash
docker compose up -d --build
```

- Frontend: http://localhost:3001
- API: http://localhost:8081/api/stats
- MySQL: `localhost:3307` (usuario `mini`, password `secret`)

El backend corre migraciones y carga datos de ejemplo (8 clientes con facturas e ítems) al arrancar. La siembra es idempotente: no duplica datos en reinicios.

Para detener y limpiar:

```bash
docker compose down          # detener
docker compose down -v       # detener y borrar la base de datos
```

## Tests

Los tests corren dentro del contenedor del backend (incluyen la extensión `pdo_mysql`):

```bash
docker compose exec backend php artisan test
```

Cubren creación y validación de clientes, cálculo de totales, reemplazo de ítems, filtros, cambio de estado, borrado en cascada y reglas de negocio (por ejemplo, no borrar clientes con facturas).

## Decisiones técnicas

- **Rewrite en Next.js en lugar de CORS**: el cliente consume `/api` del mismo origen; Next reescribe hacia el backend. Menos configuración y más cercano a un despliegue real.
- **Cálculo de totales en el modelo**: `subtotal`, `tax` y `total` son accessors derivados de los ítems, evitando guardar datos redundantes y manteniendo la consistencia.
- **Transacciones** para crear/actualizar facturas con sus ítems, garantizando atomicidad.
- **Datos de ejemplo idempotentes** para que `docker compose up` sea reproducible sin acumular registros.
- **Cache Components de Next 16**: los límites de `<Suspense>` se declaran explícitamente para los segmentos dinámicos y efectos con `fetch`.

## Desarrollo asistido por IA

Parte del desarrollo se apoyó en asistentes de IA (OpenCode/Claude) para:

- generar el andamiaje del backend (modelos, migraciones, requests, resources, tests),
- iterar sobre la interfaz de Next 16 (App Router con Cache Components),
- redactar y ajustar los tests de feature,
- depurar la integración Docker (rewrites, variables de entorno, extensiones de PHP).

Todo el código fue revisado y probado localmente antes de integrarse.
