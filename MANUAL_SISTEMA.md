# 🛠️ MANUAL DE SISTEMA - LogiStock Solutions

## 1. Información General
*   **Nombre del Sistema:** LogiStock Solutions
*   **Versión:** 1.0.0
*   **Arquitectura:** Cliente-Servidor (SPA + REST API)
*   **Repositorio:** GitHub

---

## 2. Arquitectura Técnica

### 2.1 Frontend (Cliente)
*   **Tecnología:** Angular 19
*   **Lenguaje:** TypeScript
*   **Puerto por defecto:** `4200`
*   **Dependencias Clave:**
    *   `leaflet`: Mapas interactivos.
    *   `jspdf`: Generación de reportes en cliente.
    *   `sweetalert2`: Alertas y modales.

### 2.2 Backend (Servidor)
*   **Tecnología:** Spring Boot 3.2.0 (Java 21)
*   **Puerto por defecto:** `8080`
*   **Seguridad:** Spring Security + JWT.
*   **Persistencia:** Spring Data MongoDB.
*   **Monitoreo:** Spring Boot Actuator.

### 2.3 Base de Datos
*   **Motor:** MongoDB 6.0+
*   **Puerto por defecto:** `27017`
*   **Nombre BD:** `logistockdb`

---

## 3. Instalación y Despliegue

### 3.1 Prerrequisitos
*   Java JDK 17 o superior.
*   Node.js v18 o superior.
*   MongoDB instalado y ejecutándose localmente o en clúster.
*   Maven 3.8+.

### 3.2 Despliegue Local (Desarrollo)

**Backend:**
```bash
cd backend-java
mvn clean install
mvn spring-boot:run
```
*Verificar en: `http://localhost:8080/api/actuator/health`*

**Frontend:**
```bash
cd src
npm install
ng serve
```
*Acceder en: `http://localhost:4200`*

### 3.3 Despliegue con Docker
El proyecto incluye configuración para contenedores.
```bash
docker-compose up --build -d
```
Esto levantará:
1.  Contenedor MongoDB.
2.  Contenedor Backend (Java).
3.  Contenedor Frontend (Nginx).

---

## 4. Configuración

### 4.1 Backend (`application.properties`)
Ubicación: `backend-java/src/main/resources/application.properties`

Variables clave:
*   `spring.data.mongodb.uri`: Cadena de conexión a la BD.
*   `app.jwt.secret`: Clave secreta para firmar tokens (¡Cambiar en producción!).
*   `app.jwt.expiration-ms`: Tiempo de vida del token.
*   `app.cors.allowed-origins`: Dominios permitidos para peticiones API.

### 4.2 Frontend (`environment.ts`)
Ubicación: `src/environments/environment.prod.ts`
*   `apiUrl`: URL base del backend (ej. `/api` o `https://api.midominio.com`).

---

## 5. Mantenimiento y Monitoreo

### 5.1 Panel de Monitoreo
El sistema cuenta con un panel visual de estado accesible en:
👉 **URL:** `/api/monitor.html`
*   Muestra uso de CPU, Memoria y Uptime.
*   Permite ejecutar tareas de mantenimiento manual.

### 5.2 Tareas Programadas (Cron Jobs)
Configuradas en `MaintenanceService.java`:
1.  **Backup Semanal:** Domingos 01:00 AM.
2.  **Limpieza Diaria:** Todos los días 03:00 AM (archivos temporales).
3.  **Health Check:** Cada hora (registro en logs).

### 5.3 Scripts de Servidor
Ubicación: `/scripts/maintenance.sh`
Script Bash para tareas a nivel de sistema operativo:
*   Rotación de logs antiguos.
*   Backup físico de MongoDB (usando `mongodump`).
*   Verificación de espacio en disco.

**Ejecución manual:**
```bash
./scripts/maintenance.sh
```

---

## 6. Solución de Problemas (Troubleshooting)

### Error: "Connection Refused" (Backend)
*   **Causa:** El servicio Java no está corriendo.
*   **Solución:** Ejecutar `mvn spring-boot:run` y verificar que no haya errores de compilación.

### Error: "CORS Policy" (Frontend)
*   **Causa:** El frontend intenta acceder al backend desde un dominio no autorizado.
*   **Solución:** Revisar `app.cors.allowed-origins` en `application.properties` o verificar la configuración del Proxy en desarrollo.

### Error: "JWT Expired"
*   **Causa:** La sesión del usuario ha caducado.
*   **Solución:** El usuario debe iniciar sesión nuevamente.

---

## 7. Estructura de Base de Datos (Colecciones)

*   `users`: `{ username, password (bcrypt), email, roles }`
*   `products`: `{ name, description, price, stock, minStock, category }`
*   `pedidos`: `{ cliente, items: [{producto, cantidad}], total, estado, fecha }`
*   `rutas`: `{ nombre, origen, destinos: [], distanciaKm, tiempoEst }`
