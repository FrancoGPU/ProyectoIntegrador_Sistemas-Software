# 🚚 LogiStock Solutions

_Sistema de Gestión Logística Completo_

## 📋 Descripción

LogiStock Solutions es una aplicación web full-stack desarrollada con **Angular** (frontend) y **Spring Boot** (backend) que proporciona una solución integral para la gestión logística empresarial. El sistema incluye módulos especializados para inventario, clientes, proveedores y rutas de distribución.

## 🏗️ Arquitectura del Proyecto

```
ProyectoIntegrador_Sistemas-Software/
│
├── 📂 backend-java/              # Backend Spring Boot
│   ├── src/main/java/
│   │   └── com/logistock/
│   │       ├── controller/      # Controladores REST
│   │       ├── service/         # Lógica de negocio
│   │       ├── model/           # Entidades MongoDB
│   │       ├── repository/      # Acceso a datos
│   │       └── config/          # Configuración
│   └── pom.xml                  # Dependencias Maven
│
└── 📂 src/app/                   # Frontend Angular
    ├── pages/                   # Componentes de páginas
    │   ├── dashboard/           # Panel de control
    │   ├── inventario/          # Gestión de productos
    │   ├── proveedores/         # Gestión de proveedores
    │   ├── rutas/               # Optimización de rutas
    │   └── clientes/            # Gestión de clientes
    │
    ├── services/                # Servicios HTTP
    │   ├── api.service.ts       # Cliente HTTP base
    │   ├── dashboard.service.ts
    │   ├── inventario.service.ts
    │   ├── proveedores.service.ts
    │   └── rutas.service.ts
    │
    └── components/              # Componentes reutilizables
```

## ✨ Características Principales

- 📊 **Dashboard Ejecutivo** - Panel principal con métricas y estadísticas en tiempo real.
- 📦 **Gestión de Inventario** - Control completo de productos, categorías y alertas de stock bajo.
- 👥 **Administración de Clientes** - Base de datos de clientes con historial de compras.
- 🏢 **Gestión de Proveedores** - Directorio completo de proveedores y gestión de suministros.
- 🚚 **Optimización de Rutas (Nuevo)** 
  - Integración con **Leaflet Maps** para visualización interactiva.
  - Cálculo automático de rutas, distancias y tiempos usando **OSRM API**.
  - Geocodificación inversa con **Nominatim** para obtener direcciones reales.
  - Herramienta de **Análisis de Rutas** para detectar ineficiencias de costos y riesgos de fatiga.
- 📦 **Gestión de Pedidos (Nuevo)**
  - Creación y seguimiento de pedidos.
  - Integración con rutas para autocompletado de direcciones.
  - Validación de stock en tiempo real.
- 📄 **Reportes Avanzados** - Generación de reportes en PDF y Excel para todos los módulos.

## 🎨 Diseño y UX

- **Responsive Design** - Optimizado para desktop, tablet y móvil.
- **Modales Interactivos** - Formularios de creación y edición en ventanas modales para mejor flujo de trabajo.
- **Tablas Avanzadas** - Columnas fijas (sticky), scroll horizontal y acciones rápidas.
- **Menú móvil inteligente** - Navegación fluida con auto-cierre al scroll.
- **Glassmorphism effects** - Interfaz moderna con efectos de vidrio.

## 🛠️ Tecnologías Utilizadas

### Frontend

- **Angular 19** - Framework principal (Standalone Components).
- **Leaflet** - Librería de mapas interactivos.
- **TypeScript** - Programación tipada.
- **CSS Grid & Flexbox** - Layouts responsivos.
- **Angular Router** - Navegación SPA.
- **RxJS** - Programación reactiva.

### Backend

- **Spring Boot 3.2.x** - Framework Java.
- **MongoDB** - Base de datos NoSQL.
- **Spring Data MongoDB** - ORM para MongoDB.
- **iText / Apache POI** - Generación de reportes PDF y Excel.
- **Lombok** - Reducción de código boilerplate.
- **Swagger/OpenAPI** - Documentación de API.

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+
- Angular CLI 19+
- Java 17+
- Maven 3.8+
- MongoDB 6.0+

### Instalación del Backend

```bash
# Navegar al directorio del backend
cd backend-java

# Compilar el proyecto
mvn clean package -DskipTests

# Ejecutar el servidor (puerto 8080)
java -jar target/logistock-backend-1.0.0.jar
```

### Instalación del Frontend

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (puerto 4200)
ng serve
```

### Acceso a la Aplicación

- **Frontend**: `http://localhost:4200/`
- **Backend API**: `http://localhost:8080/api/`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ iOS Safari, Chrome Mobile
- ✅ Responsive desde 320px hasta 4K
- ✅ Touch-friendly para dispositivos móviles

## 👨‍💻 Autor

**FrancoGPU** - Desarrollador Full Stack

## 📄 Licencia

Este proyecto es parte de un proyecto integrador académico.
