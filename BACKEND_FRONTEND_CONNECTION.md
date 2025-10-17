# 🔗 Conexión Backend-Frontend

## ✅ Estado Actual: **CONECTADO Y FUNCIONANDO**

---

## 📋 Resumen de Configuración

### Backend (Java Spring Boot)
- **Puerto:** 8080
- **Context Path:** `/api`
- **URL Base:** `http://localhost:8080/api`
- **Base de Datos:** MongoDB en `localhost:27017`
- **Estado:** ✅ Activo y respondiendo

### Frontend (Angular)
- **Puerto:** 4200 (por defecto)
- **API URL Configurada:** `http://localhost:8080/api`
- **Estado:** Configurado correctamente

---

## 🔧 Configuración CORS

### Backend (`CorsConfig.java`)
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:4200")  // ✅ Frontend permitido
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Frontend (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',  // ✅ Apunta al backend Java
  // ...
};
```

---

## 🛣️ Endpoints Disponibles

### ✅ Inventario
- `GET /api/inventario` - Listar productos (con paginación)
- `GET /api/inventario/{id}` - Obtener producto por ID
- `POST /api/inventario` - Crear producto
- `PUT /api/inventario/{id}` - Actualizar producto
- `DELETE /api/inventario/{id}` - Eliminar producto
- `GET /api/inventario/low-stock` - Productos con stock bajo
- `GET /api/inventario/stats` - Estadísticas de inventario

### ✅ Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/{id}` - Obtener cliente por ID
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/{id}` - Actualizar cliente
- `DELETE /api/clientes/{id}` - Eliminar cliente
- `GET /api/clientes/top` - Top clientes
- `GET /api/clientes/stats` - Estadísticas de clientes

### ✅ Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/metrics` - Métricas del sistema
- `GET /api/dashboard/health` - Estado del sistema

### ✅ Actuator
- `GET /api/actuator/health` - Health check
- `GET /api/actuator/info` - Información de la aplicación
- `GET /api/actuator/metrics` - Métricas del sistema

---

## 🧪 Pruebas de Conexión

### 1. Verificar Backend está corriendo:
```bash
curl http://localhost:8080/api/actuator/health
```
**Respuesta esperada:**
```json
{"status":"UP"}
```

### 2. Probar endpoint de Inventario:
```bash
curl http://localhost:8080/api/inventario
```
**Respuesta exitosa:**
```json
{
  "total": 2,
  "size": 10,
  "totalPages": 1,
  "page": 0,
  "products": [
    {
      "id": "68da1ce608a529744cba9ed0",
      "code": "OFF002",
      "name": "Producto de Prueba",
      "category": "Tecnología",
      "stock": 10,
      "minStock": 5,
      "price": 99.99,
      "isActive": true
    }
  ]
}
```

### 3. Probar endpoint de Dashboard:
```bash
curl http://localhost:8080/api/dashboard/stats
```
**Respuesta exitosa:** Estadísticas generales del sistema

---

## 🔍 Servicio Frontend

El servicio `ApiService` en el frontend maneja todas las peticiones HTTP:

```typescript
// src/app/services/api.service.ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl; // http://localhost:8080/api
  
  get<T>(endpoint: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params })
      .pipe(catchError(this.handleError.bind(this)));
  }
  // ... más métodos (post, put, delete, patch)
}
```

### Uso en Componentes:
```typescript
// Ejemplo en inventario.component.ts
this.inventarioService.getProducts(filters)
  .subscribe({
    next: (response) => {
      this.products = response.products;
      this.totalProducts = response.total;
    },
    error: (error) => {
      console.error('Error al cargar productos:', error);
    }
  });
```

---

## 🚀 Cómo Iniciar la Aplicación

### 1. Iniciar MongoDB (si no está corriendo):
```bash
# Opción A: Con Docker
docker-compose up mongodb -d

# Opción B: MongoDB local
mongod
```

### 2. Iniciar Backend (Java):
```bash
cd backend-java
java -jar target/logistock-backend-1.0.0.jar
```
**Logs esperados:**
```
✅ LogiStock Solutions Backend iniciado exitosamente!
Tomcat started on port 8080 (http) with context path '/api'
```

### 3. Iniciar Frontend (Angular):
```bash
npm start
# o
ng serve
```
**Acceder a:** `http://localhost:4200`

---

## ✅ Verificación de Conexión

### Indicadores de que está funcionando:

1. **Backend logs muestran:**
   - ✅ `Tomcat started on port 8080`
   - ✅ `MongoClient connected to localhost:27017`
   - ✅ Sin errores de conexión a MongoDB

2. **Frontend puede:**
   - ✅ Cargar datos del inventario
   - ✅ Crear/editar/eliminar productos
   - ✅ Mostrar estadísticas del dashboard
   - ✅ No muestra errores CORS en la consola del navegador

3. **Pruebas cURL exitosas:**
   - ✅ `curl http://localhost:8080/api/actuator/health` responde
   - ✅ `curl http://localhost:8080/api/inventario` devuelve productos

---

## 🐛 Problemas Comunes y Soluciones

### ❌ Error: "Connection refused" en Frontend
**Causa:** Backend no está corriendo  
**Solución:**
```bash
cd backend-java
java -jar target/logistock-backend-1.0.0.jar
```

### ❌ Error CORS en el navegador
**Causa:** Frontend corriendo en puerto diferente a 4200  
**Solución:** Actualizar `allowedOrigins` en `CorsConfig.java`

### ❌ Error: "MongoSocketOpenException"
**Causa:** MongoDB no está corriendo  
**Solución:**
```bash
docker-compose up mongodb -d
# o iniciar MongoDB localmente
```

### ❌ Error 404 en endpoints
**Causa:** Ruta incorrecta (olvidar `/api` prefix)  
**Solución:** Asegurar que todas las rutas incluyan `/api`
```
✅ Correcto: http://localhost:8080/api/inventario
❌ Incorrecto: http://localhost:8080/inventario
```

---

## 📊 Formato de Respuestas

### Backend Java (Paginación)
```json
{
  "total": 10,
  "size": 10,
  "totalPages": 1,
  "page": 0,
  "products": [ /* array de productos */ ]
}
```

### Frontend espera (adaptación en componentes)
```typescript
this.products = response.products || response.data || [];
this.totalProducts = response.total || 0;
this.totalPages = response.totalPages || 1;
this.currentPage = response.page || 0;
```

---

## 🎯 Próximos Pasos

- [ ] Implementar autenticación JWT
- [ ] Agregar más endpoints para proveedores y rutas
- [ ] Implementar WebSockets para notificaciones en tiempo real
- [ ] Agregar logs de auditoría
- [ ] Configurar HTTPS para producción

---

**Última verificación:** 17 de octubre de 2025  
**Estado:** ✅ **Backend y Frontend conectados correctamente**
