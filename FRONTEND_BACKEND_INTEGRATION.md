# 🔗 Integración Frontend-Backend LogiStock

## ✅ Servicios Actualizados

Se han actualizado los servicios de Angular para que coincidan con la estructura del backend Java Spring Boot.

### 1. **Proveedores Service** (`src/app/services/proveedores.service.ts`)

#### Interfaz Actualizada
```typescript
export interface Proveedor {
  id?: string;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion: string;
  tipo: string; // "NACIONAL" o "INTERNACIONAL"
  rucNit: string;
  pais: string;
  ciudad: string;
  diasPago: number;
  descuentoGeneral: number;
  isActive: boolean;
  contactoComercial?: {
    nombre: string;
    email: string;
    telefono: string;
  };
  condicionesEspeciales?: string;
  rating?: number;
}
```

#### Endpoints Disponibles
- `GET /api/proveedores` - Obtener todos con paginación y filtros
- `GET /api/proveedores/{id}` - Obtener por ID
- `POST /api/proveedores` - Crear nuevo
- `PUT /api/proveedores/{id}` - Actualizar
- `DELETE /api/proveedores/{id}` - Eliminar
- `GET /api/proveedores/stats` - Estadísticas
- `GET /api/proveedores/top?limit=5` - Top proveedores

---

### 2. **Rutas Service** (`src/app/services/rutas.service.ts`)

#### Interfaz Actualizada
```typescript
export interface Ruta {
  id?: string;
  codigo: string;
  nombre: string;
  origen: string;
  destino: string;
  distanciaKm: number;
  tiempoEstimadoHoras: number;
  estado: string; // "PLANIFICADA", "EN_PROCESO", "COMPLETADA", "CANCELADA"
  vehiculo: string;
  conductor: string;
  costoEstimado: number;
  fechaSalida: Date;
  fechaLlegadaEstimada: Date;
  fechaLlegadaReal?: Date;
  observaciones?: string;
  paradas?: string[];
  cargaKg?: number;
}
```

#### Endpoints Disponibles
- `GET /api/rutas` - Obtener todas con paginación y filtros
- `GET /api/rutas/{id}` - Obtener por ID
- `POST /api/rutas` - Crear nueva
- `PUT /api/rutas/{id}` - Actualizar
- `DELETE /api/rutas/{id}` - Eliminar
- `PATCH /api/rutas/{id}/estado` - Cambiar estado
- `GET /api/rutas/stats` - Estadísticas
- `GET /api/rutas/activas` - Rutas activas

---

### 3. **Dashboard Service** (`src/app/services/dashboard.service.ts`)

#### Interfaz Actualizada
```typescript
export interface DashboardStats {
  productosEnInventario: number;
  clientesActivos: number;
  proveedoresActivos: number;
  rutasEnProceso: number;
}
```

#### Endpoint
- `GET /api/dashboard/stats` - Estadísticas generales

---

## 📊 Datos de Prueba en MongoDB

### Colecciones Pobladas

| Colección | Cantidad | Descripción |
|-----------|----------|-------------|
| `products` | 2 | Productos en inventario |
| `clientes` | 3 | Clientes activos |
| `proveedores` | 5 | Proveedores (3 nacionales, 2 internacionales) |
| `rutas` | 5 | Rutas (1 en proceso, 4 completadas) |

### Ejemplo de Datos

#### Proveedores
```json
{
  "nombre": "Carlos Méndez",
  "empresa": "Distribuidora Lima SAC",
  "email": "carlos.mendez@distlima.com",
  "telefono": "+51 987654321",
  "direccion": "Av. Industrial 456",
  "tipo": "NACIONAL",
  "rucNit": "20567890123",
  "pais": "Perú",
  "ciudad": "Lima",
  "diasPago": 30,
  "descuentoGeneral": 5.0,
  "isActive": true
}
```

#### Rutas
```json
{
  "codigo": "RT-001",
  "nombre": "Ruta Centro-Norte Lima",
  "origen": "Almacén Central Lima",
  "destino": "Zona Norte Lima",
  "distanciaKm": 25.5,
  "tiempoEstimadoHoras": 2.0,
  "estado": "EN_PROCESO",
  "vehiculo": "Camión Mercedes-Benz",
  "conductor": "Juan Pérez",
  "costoEstimado": 150.00
}
```

---

## 🚀 Próximos Pasos

### 1. Iniciar el Backend
```bash
cd backend-java
java -jar target/logistock-backend-1.0.0.jar
```

El backend estará disponible en: **http://localhost:8080/api**

### 2. Iniciar el Frontend
```bash
npm start
```

El frontend estará disponible en: **http://localhost:4200**

### 3. Verificar Conexión

Puedes probar los endpoints con curl:

```bash
# Dashboard Stats
curl http://localhost:8080/api/dashboard/stats

# Proveedores
curl http://localhost:8080/api/proveedores

# Rutas
curl http://localhost:8080/api/rutas

# Clientes
curl http://localhost:8080/api/clientes

# Productos
curl http://localhost:8080/api/products
```

---

## 📝 Actualizar Componentes

Ahora debes actualizar los componentes para usar los nuevos servicios:

### Dashboard Component (`src/app/dashboard/dashboard.component.ts`)

```typescript
import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardStats } from '../services/dashboard.service';

export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }
}
```

### Proveedores Component (`src/app/proveedores/proveedores.component.ts`)

```typescript
import { Component, OnInit } from '@angular/core';
import { ProveedoresService, Proveedor } from '../services/proveedores.service';

export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  loading = false;

  constructor(private proveedoresService: ProveedoresService) {}

  ngOnInit(): void {
    this.loadProveedores();
  }

  loadProveedores(): void {
    this.loading = true;
    this.proveedoresService.getProveedores({ page: 0, size: 20 }).subscribe({
      next: (response) => {
        this.proveedores = response.content || response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        this.loading = false;
      }
    });
  }
}
```

### Rutas Component (`src/app/rutas/rutas.component.ts`)

```typescript
import { Component, OnInit } from '@angular/core';
import { RutasService, Ruta } from '../services/rutas.service';

export class RutasComponent implements OnInit {
  rutas: Ruta[] = [];
  loading = false;

  constructor(private rutasService: RutasService) {}

  ngOnInit(): void {
    this.loadRutas();
  }

  loadRutas(): void {
    this.loading = true;
    this.rutasService.getRutas({ page: 0, size: 20 }).subscribe({
      next: (response) => {
        this.rutas = response.content || response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar rutas:', error);
        this.loading = false;
      }
    });
  }
}
```

---

## ✨ Mejoras Implementadas

### Servicios
- ✅ Interfaces actualizadas para coincidir con backend Java
- ✅ Métodos CRUD completos
- ✅ Paginación y filtros
- ✅ Estadísticas y reportes
- ✅ Utilidades de formato y validación
- ✅ Exportación a CSV

### Backend
- ✅ 15 nuevos endpoints REST
- ✅ 7 endpoints para Proveedores
- ✅ 8 endpoints para Rutas
- ✅ Dashboard integrado con datos reales
- ✅ Paginación con Spring Data
- ✅ Búsqueda y filtrado

---

## 🔍 Testing de Integración

### Verificar Estadísticas del Dashboard
```bash
curl http://localhost:8080/api/dashboard/stats
```

**Respuesta Esperada:**
```json
{
  "productosEnInventario": 2,
  "clientesActivos": 3,
  "proveedoresActivos": 5,
  "rutasEnProceso": 1
}
```

### Verificar Proveedores
```bash
curl http://localhost:8080/api/proveedores?size=2
```

### Verificar Rutas
```bash
curl http://localhost:8080/api/rutas/activas
```

---

## 🐛 Troubleshooting

### Error: Backend no se conecta
- Verificar que MongoDB esté corriendo: `sudo systemctl status mongod`
- Verificar puerto 8080 esté libre: `lsof -i :8080`
- Revisar logs del backend en consola

### Error: Frontend no muestra datos
- Verificar que backend esté corriendo
- Abrir DevTools del navegador (F12) y revisar:
  - Console (errores JavaScript)
  - Network (llamadas HTTP)
- Verificar CORS en backend (ya configurado)

### Error: CORS
El backend ya tiene CORS configurado en `CorsConfig.java` para aceptar peticiones desde `http://localhost:4200`.

---

## 📚 Documentación Adicional

- [BACKEND_FRONTEND_CONNECTION.md](./BACKEND_FRONTEND_CONNECTION.md) - Conexión Backend-Frontend
- [MONGODB_GUIDE.md](./MONGODB_GUIDE.md) - Guía de MongoDB
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - Implementación completa
- [scripts/mongodb-queries.sh](./scripts/mongodb-queries.sh) - Queries útiles de MongoDB

---

## 👨‍💻 Autor
LogiStock Solutions Team
Fecha: $(date +%Y-%m-%d)
