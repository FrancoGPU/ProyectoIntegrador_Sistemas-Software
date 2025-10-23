# 📁 Estructura del Proyecto Frontend

## 🏗️ Arquitectura de Carpetas

```
src/app/
├── 📄 app.component.ts          # Componente raíz de la aplicación
├── 📄 app.config.ts             # Configuración global de la app
├── 📄 app.routes.ts             # Definición de rutas (routing)
│
├── 📂 pages/                    # Componentes de páginas principales
│   ├── 📂 dashboard/            # Dashboard principal con estadísticas
│   ├── 📂 inventario/           # Gestión de productos
│   ├── 📂 proveedores/          # Gestión de proveedores
│   ├── 📂 rutas/                # Gestión de rutas de entrega
│   ├── 📂 clientes/             # Gestión de clientes
│   ├── 📂 foda/                 # Análisis FODA
│   └── 📄 index.ts              # Barrel exports de páginas
│
├── 📂 components/               # Componentes reutilizables (vacío por ahora)
│   └── (componentes compartidos como botones, modales, etc.)
│
└── 📂 services/                 # Servicios de comunicación con backend
    ├── 📄 api.service.ts        # Servicio HTTP base
    ├── 📄 dashboard.service.ts  # Lógica de dashboard
    ├── 📄 inventario.service.ts # Lógica de inventario
    ├── 📄 proveedores.service.ts# Lógica de proveedores
    ├── 📄 rutas.service.ts      # Lógica de rutas
    ├── 📄 clientes.service.ts   # Lógica de clientes
    └── 📄 index.ts              # Barrel exports de servicios
```

## 📋 Convenciones

### **Pages (Páginas)**
- Componentes que representan **vistas completas** de la aplicación
- Cada página tiene su propia carpeta con:
  - `*.component.ts` - Lógica del componente
  - `*.component.html` - Plantilla HTML
  - `*.component.css` - Estilos específicos
  - `*.component.spec.ts` - Pruebas unitarias

### **Components (Componentes)**
- Componentes **reutilizables** que se usan en múltiples páginas
- Ejemplos: botones, modales, tablas, gráficos, etc.
- Siguen la misma estructura que las páginas

### **Services (Servicios)**
- Manejan la **lógica de negocio** y comunicación con el backend
- Cada servicio se enfoca en un dominio específico
- Se inyectan en los componentes mediante Dependency Injection

## 🔄 Importaciones Limpias

Gracias a los archivos `index.ts` (barrel files), puedes importar de forma más limpia:

### Antes:
```typescript
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
```

### Ahora:
```typescript
import { DashboardComponent, InventarioComponent, ClientesComponent } from './pages';
```

## 🎯 Ventajas de esta Estructura

✅ **Organización Clara**: Fácil encontrar componentes, páginas y servicios
✅ **Escalabilidad**: Puedes agregar más componentes sin desorganizar
✅ **Mantenibilidad**: Código separado por responsabilidad
✅ **Reutilización**: Componentes compartidos en una sola carpeta
✅ **Imports Limpios**: Barrel files simplifican las importaciones

## 🚀 Próximos Pasos

1. Crear componentes reutilizables en `/components`:
   - `button/` - Botones personalizados
   - `modal/` - Modales reutilizables
   - `table/` - Tablas con funcionalidades comunes
   - `chart/` - Gráficos estadísticos

2. Agregar guards y interceptors:
   - `/guards/` - Protección de rutas
   - `/interceptors/` - Manejo de peticiones HTTP

3. Crear modelos compartidos:
   - `/models/` - Interfaces y tipos TypeScript
