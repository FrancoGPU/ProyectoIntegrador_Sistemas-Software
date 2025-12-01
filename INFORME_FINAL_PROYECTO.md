# 📄 INFORME FINAL DEL PROYECTO - LogiStock Solutions

## 1. Título del Proyecto
**LogiStock Solutions: Sistema Integral de Gestión Logística y Optimización de Rutas**

## 2. Objetivo del Proyecto
Desarrollar una plataforma web integral que optimice la gestión logística de la empresa, centralizando el control de inventarios, pedidos, clientes y proveedores, e incorporando herramientas avanzadas para la planificación y optimización de rutas de distribución, con el fin de reducir costos operativos y mejorar la eficiencia en las entregas.

## 3. Descripción General del Problema
### 3.1 Descripción de la Empresa
**LogiStock S.A.** es una empresa dedicada a la distribución y logística de productos de consumo masivo. Actualmente opera en el sector metropolitano, gestionando una flota de vehículos y un almacén central.

**Misión:** Proveer soluciones logísticas eficientes y confiables que impulsen el crecimiento de nuestros clientes mediante la innovación tecnológica y la excelencia operativa.

**Visión:** Convertirnos en el referente nacional en logística inteligente para el año 2030, reconocidos por nuestra capacidad de adaptación y sostenibilidad.

### 3.2 Definición del Problema
La empresa enfrenta desafíos significativos en su operación diaria debido a la falta de digitalización:
*   **Gestión manual de inventarios:** Uso de hojas de cálculo propensas a errores, ocasionando quiebres de stock.
*   **Planificación de rutas ineficiente:** Las rutas se asignan empíricamente, resultando en recorridos largos, mayor consumo de combustible y fatiga de los conductores.
*   **Desconexión de información:** Los datos de clientes, pedidos y stock no están integrados, dificultando la toma de decisiones.
*   **Falta de trazabilidad:** No existe un monitoreo real del estado de los pedidos ni del rendimiento del sistema.

### 3.3 Alcance del Proyecto
El sistema abarca los siguientes módulos:
*   Gestión de Inventario (Productos, Categorías, Alertas).
*   Gestión de Terceros (Clientes y Proveedores).
*   Gestión de Pedidos y Entregas.
*   Planificación y Optimización de Rutas (Integración con Mapas).
*   Reportes y Analítica.
*   Seguridad y Administración de Usuarios.

## 4. Metodología Utilizada
Se utilizó una metodología **Ágil (Scrum/Iterativa)**, dividiendo el desarrollo en fases o sprints para permitir entregas incrementales y ajustes rápidos basados en pruebas.

### Fases del Desarrollo (Cronograma de 17 Semanas)
*   **Fase 1: Planificación y Análisis (Semanas 1-3):** Definición de requerimientos, diseño de arquitectura, selección de tecnologías y configuración del entorno de desarrollo (Docker, Git).
*   **Fase 2: Desarrollo del Backend y Base de Datos (Semanas 4-8):** Implementación de modelos de datos en MongoDB, desarrollo de API REST con Spring Boot, seguridad con JWT y lógica de negocio core (Inventario, Proveedores).
*   **Fase 3: Desarrollo del Frontend e Integración (Semanas 9-13):** Construcción de interfaces en Angular, integración con servicios REST, implementación de módulos de Pedidos y Clientes.
*   **Fase 4: Funcionalidades Avanzadas y Optimización (Semanas 14-15):** Integración de mapas (Leaflet), algoritmos de rutas, generación de reportes y panel de monitoreo.
*   **Fase 5: Pruebas, Despliegue y Cierre (Semanas 16-17):** Pruebas integrales (QA), corrección de errores, despliegue final, manuales y documentación del proyecto.

## 5. Tecnologías Utilizadas

### Frontend (Cliente)
*   **Framework:** Angular 19 (Standalone Components).
*   **Lenguaje:** TypeScript 5.7, HTML5, CSS3.
*   **Librerías:** Leaflet (Mapas), RxJS (Reactividad).
*   **Herramientas:** Angular CLI, NPM.

### Backend (Servidor)
*   **Framework:** Spring Boot 3.2.x.
*   **Lenguaje:** Java 21.
*   **Seguridad:** Spring Security, JWT (JSON Web Tokens).
*   **Reportes:** Apache POI (Excel), iText (PDF).
*   **Monitoreo:** Spring Boot Actuator.
*   **Herramientas:** Maven, Lombok.

### Base de Datos
*   **Motor:** MongoDB 6.0+ (NoSQL).
*   **ORM:** Spring Data MongoDB.

## 6. Arquitectura de Desarrollo Web
El sistema sigue una arquitectura **Monolítica Modular** con separación clara entre Frontend y Backend (Arquitectura Cliente-Servidor RESTful).

*   **Patrón de Diseño:** MVC (Modelo-Vista-Controlador) en el Backend.
*   **Comunicación:** API REST mediante protocolo HTTP/HTTPS intercambiando datos en formato JSON.
*   **Capa de Datos:** Repositorios (DAO) que abstraen el acceso a MongoDB.
*   **Capa de Servicio:** Lógica de negocio, validaciones y cálculos.
*   **Capa de Presentación:** SPA (Single Page Application) en Angular.

## 7. Análisis del Sistema

### 7.1 Necesidades del Usuario
*   Acceso rápido a la información de stock.
*   Visualización geográfica de las rutas de entrega.
*   Generación automática de reportes para la gerencia.
*   Sistema seguro con diferentes niveles de acceso.

### 7.2 Requisitos Funcionales
1.  **Autenticación:** Login seguro y gestión de sesiones.
2.  **Inventario:** Crear, leer, actualizar y eliminar productos; alertas de stock bajo.
3.  **Rutas:** Visualizar mapas, calcular distancias y tiempos, optimizar recorridos.
4.  **Pedidos:** Registrar ventas, descontar stock automáticamente, asignar rutas.
5.  **Reportes:** Exportar listados a PDF y Excel.

### 7.3 Requisitos No Funcionales
1.  **Seguridad:** Encriptación de contraseñas (BCrypt), protección de endpoints.
2.  **Rendimiento:** Tiempos de respuesta < 2 segundos.
3.  **Disponibilidad:** Sistema operativo 24/7 con monitoreo de salud.
4.  **Mantenimiento:** Tareas automáticas de backup y limpieza.

## 8. Diseño del Sistema

### 8.1 Diseño de Base de Datos (Colecciones MongoDB)
El modelo de datos es NoSQL, orientado a documentos, lo que permite flexibilidad y escalabilidad.

*   **`users`**: Almacena credenciales y roles.
    *   Campos: `_id`, `username`, `password` (hash), `email`, `roles` [ARRAY].
*   **`products`**: Catálogo de inventario.
    *   Campos: `_id`, `name`, `description`, `price`, `stock`, `minStock`, `category`.
*   **`clientes`**: Base de datos de clientes.
    *   Campos: `_id`, `nombre`, `direccion`, `telefono`, `email`, `tipo` (Regular/Premium).
*   **`proveedores`**: Información de proveedores.
    *   Campos: `_id`, `empresa`, `contacto`, `telefono`, `categoria`.
*   **`pedidos`**: Transacciones de venta.
    *   Campos: `_id`, `clienteId` (Ref), `items` [ARRAY: {productoId, cantidad, precioUnitario}], `total`, `estado`, `fecha`.
*   **`rutas`**: Planificación logística.
    *   Campos: `_id`, `nombre`, `origen` {lat, lng}, `destinos` [ARRAY], `distanciaKm`, `tiempoEstimado`.

### 8.2 Diseño de Interfaces
*   **Dashboard:** Tarjetas de métricas y gráficos.
*   **Tablas de Gestión:** Listados con filtros, paginación y acciones.
*   **Mapas Interactivos:** Visualización de marcadores y trazado de rutas sobre OpenStreetMap.

## 9. Desarrollo de la Aplicación

### 9.1 Entorno de Desarrollo
*   **IDE:** Visual Studio Code (con extensiones para Java y Angular).
*   **Contenedores:** Docker y DevContainers para estandarizar el entorno.
*   **SO:** Linux (Ubuntu) en entorno de desarrollo.

### 9.2 Integración Backend-Frontend
*   Configuración de **CORS** para permitir peticiones cruzadas.
*   Uso de **Proxy** en desarrollo (`proxy.conf.json`) para redireccionar llamadas `/api`.
*   Servicios en Angular (`api.service.ts`) que consumen los endpoints REST de Spring Boot.

### 9.3 Control de Versiones
*   **Plataforma:** GitHub.
*   **Estrategia:** Ramas por funcionalidad (`feature/mapas`, `feature/reportes`) fusionadas a `main`.
*   **Historial:** Commits semánticos para trazar la evolución del código.

## 10. Pruebas

### 10.1 Plan de Pruebas
*   **Pruebas Unitarias:** Validación de lógica de negocio en Servicios (JUnit, Mockito).
*   **Pruebas de Integración:** Verificación de la comunicación con la base de datos y API.
*   **Pruebas Manuales:** Validación de flujos de usuario (crear pedido, visualizar mapa).

### 10.2 Pruebas de Seguridad
*   Verificación de acceso denegado sin Token JWT.
*   Validación de roles (Admin vs User).
*   Protección contra inyección NoSQL (manejada por Spring Data).

## 11. Despliegue
*   **Configuración:** Aplicación "Dockerizada".
    *   `Dockerfile` para Backend (Java).
    *   `Dockerfile` para Frontend (Nginx/Node).
    *   `docker-compose.yml` para orquestar ambos servicios junto con la base de datos.
*   **Nube:** Compatible con despliegue en servicios como Azure, AWS o Render.
*   **Seguridad en Despliegue:** Variables de entorno para secretos y credenciales.

## 12. Monitoreo y Mantenimiento

### 12.1 Monitoreo
Implementación de **Spring Boot Actuator** para supervisión en tiempo real:
*   Endpoint `/actuator/health`: Estado del sistema y base de datos.
*   Endpoint `/actuator/metrics`: Uso de CPU, Memoria JVM, Uptime.
*   **Panel Visual:** Página `/monitor.html` integrada para visualizar métricas gráficamente.

### 12.2 Mantenimiento
Automatización de tareas críticas:
*   **Scripts de Shell (`maintenance.sh`):** Rotación de logs y backups de sistema de archivos.
*   **Tareas Programadas (Cron Jobs en Java):**
    *   Backup semanal de base de datos.
    *   Limpieza diaria de archivos temporales.
    *   Health Check periódico en logs.
*   **Ejecución Manual:** Funcionalidad para disparar mantenimiento bajo demanda desde el panel de control.

## 13. Resultados y Conclusiones
El sistema **LogiStock Solutions** ha logrado digitalizar exitosamente los procesos logísticos clave, cumpliendo con el 100% de los requerimientos funcionales planteados.

### 13.1 Comparación: Situación Inicial vs. Situación Final

| Aspecto | Situación Inicial (Manual) | Situación Final (LogiStock) |
| :--- | :--- | :--- |
| **Control de Stock** | Hojas de cálculo desactualizadas. | Inventario en tiempo real con alertas automáticas. |
| **Planificación de Rutas** | Basada en experiencia del conductor. | Optimización digital con mapas y cálculo de distancias. |
| **Gestión de Pedidos** | Procesamiento lento y propenso a errores. | Validación automática de stock y generación instantánea. |
| **Reportes** | Elaboración manual (horas de trabajo). | Generación en 1 clic (PDF/Excel). |
| **Seguridad** | Archivos locales vulnerables. | Acceso seguro con roles y encriptación. |

### 13.2 Beneficios Obtenidos
*   **Eficiencia Operativa:** Reducción estimada del 30% en tiempos de planificación de rutas.
*   **Reducción de Costos:** Disminución de pérdidas por quiebres de stock o productos vencidos.
*   **Mejor Toma de Decisiones:** Acceso a métricas clave mediante el Dashboard ejecutivo.
*   **Escalabilidad:** La arquitectura basada en microservicios (preparada) y contenedores permite crecer sin límites.

## 14. Anexos

### 14.1 Manual de Usuario (Resumen)
1.  Ingresar a la plataforma con credenciales.
2.  Navegar al módulo deseado desde el menú lateral.
3.  Para crear un pedido: Ir a "Pedidos" -> "Nuevo", seleccionar cliente y productos.
4.  Para ver rutas: Ir a "Rutas", seleccionar una ruta y hacer clic en "Ver Mapa".
5.  Para reportes: Usar los botones "Exportar PDF/Excel" en cada tabla.

### 14.2 Manual del Sistema (Técnico)
*   **Reinicio del servicio:** `docker-compose restart backend`.
*   **Ver logs:** `docker logs logistock-backend`.
*   **Acceso a BD:** Conexión a puerto 27017 con MongoDB Compass.
*   **Panel de Monitoreo:** Acceder a `/api/monitor.html` (requiere autenticación o acceso a red interna).
