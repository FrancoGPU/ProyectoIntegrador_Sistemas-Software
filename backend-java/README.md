# LogiStock Solutions - Backend Java

## 🚀 Descripción

Backend desarrollado en **Java 17** con **Spring Boot 3.2** y **MongoDB** para el sistema de gestión logística LogiStock Solutions.

Este backend reemplaza la implementación anterior de Node.js/Express manteniendo la misma funcionalidad y APIs.

## 📋 Características

- ✅ **Spring Boot 3.2** - Framework moderno de Java
- ✅ **MongoDB** - Base de datos NoSQL
- ✅ **Spring Data MongoDB** - Persistencia de datos
- ✅ **Validación** - Validación automática de datos
- ✅ **CORS** - Configurado para Angular frontend
- ✅ **Swagger/OpenAPI** - Documentación automática de APIs
- ✅ **Lombok** - Reduce boilerplate code
- ✅ **ModelMapper** - Mapeo entre DTOs y entidades
- ✅ **Spring Boot Actuator** - Monitoreo y métricas

## 🏗️ Arquitectura

```
backend-java/
├── src/main/java/com/logistock/
│   ├── LogiStockApplication.java          # Clase principal
│   ├── config/                            # Configuraciones
│   │   ├── AppConfig.java                 # Configuración general
│   │   └── CorsConfig.java                # Configuración CORS
│   ├── model/                             # Entidades/Modelos
│   │   ├── Product.java                   # Modelo de Producto
│   │   ├── Cliente.java                   # Modelo de Cliente
│   │   ├── Proveedor.java                 # Modelo de Proveedor
│   │   └── Ruta.java                      # Modelo de Ruta
│   └── repository/                        # Repositorios
│       ├── ProductRepository.java         # Repositorio de Producto
│       ├── ClienteRepository.java         # Repositorio de Cliente
│       ├── ProveedorRepository.java       # Repositorio de Proveedor
│       └── RutaRepository.java            # Repositorio de Ruta
├── src/main/resources/
│   └── application.properties             # Configuración de la aplicación
├── src/test/                              # Tests
└── pom.xml                                # Dependencias Maven
```

## 🔧 Configuración

### Prerrequisitos

- **Java 17** o superior
- **Maven 3.8+**
- **MongoDB** (usando Docker o instalación local)

### Variables de Entorno

El backend está configurado para usar las mismas credenciales que el backend de Node.js:

```properties
# MongoDB
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=logistockdb
spring.data.mongodb.username=logistock
spring.data.mongodb.password=logistock123
spring.data.mongodb.authentication-database=admin

# Server
server.port=8080
server.servlet.context-path=/api
```

## 🚀 Ejecución

### Desarrollo

```bash
# Compilar el proyecto
mvn clean compile

# Ejecutar en modo development
mvn spring-boot:run

# O usando el jar compilado
mvn clean package
java -jar target/logistock-backend-1.0.0.jar
```

### Producción con Docker

```bash
# Construir imagen Docker
docker build -t logistock-backend-java .

# Ejecutar container
docker run -p 8080:8080 logistock-backend-java
```

## 📡 APIs Disponibles

El backend expone las siguientes APIs REST:

- **Base URL**: `http://localhost:8080/api`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **API Docs**: `http://localhost:8080/api-docs`

### Endpoints Principales

#### Productos (`/api/inventario`)
- `GET /` - Listar productos
- `POST /` - Crear producto
- `GET /{id}` - Obtener producto por ID
- `PUT /{id}` - Actualizar producto
- `DELETE /{id}` - Eliminar producto

#### Clientes (`/api/clientes`)
- `GET /` - Listar clientes
- `POST /` - Crear cliente
- `GET /{id}` - Obtener cliente por ID
- `PUT /{id}` - Actualizar cliente
- `DELETE /{id}` - Eliminar cliente

#### Proveedores (`/api/proveedores`)
- `GET /` - Listar proveedores
- `POST /` - Crear proveedor
- `GET /{id}` - Obtener proveedor por ID
- `PUT /{id}` - Actualizar proveedor
- `DELETE /{id}` - Eliminar proveedor

#### Rutas (`/api/rutas`)
- `GET /` - Listar rutas
- `POST /` - Crear ruta
- `GET /{id}` - Obtener ruta por ID
- `PUT /{id}` - Actualizar ruta
- `DELETE /{id}` - Eliminar ruta

#### Dashboard (`/api/dashboard`)
- `GET /stats` - Estadísticas generales

## 🔄 Migración desde Node.js

### Diferencias Principales

1. **Puerto**: Cambió de `3000` a `8080`
2. **Base URL**: Ahora incluye `/api` como context path
3. **Estructura de respuestas**: Mantiene la misma estructura JSON
4. **Validaciones**: Mejoradas con Bean Validation (JSR-303)

### Pasos para la Migración

1. **Detener el backend de Node.js**
2. **Iniciar el backend de Java**
3. **Actualizar la configuración del frontend Angular** para apuntar al puerto 8080
4. **Verificar que MongoDB esté ejecutándose**

## 🧪 Testing

```bash
# Ejecutar todos los tests
mvn test

# Ejecutar tests con coverage
mvn test jacoco:report
```

## 📊 Monitoreo

Spring Boot Actuator proporciona endpoints de monitoreo:

- **Health**: `http://localhost:8080/actuator/health`
- **Info**: `http://localhost:8080/actuator/info`
- **Metrics**: `http://localhost:8080/actuator/metrics`

## 🐛 Troubleshooting

### Problemas Comunes

1. **MongoDB Connection**: Verificar que MongoDB esté ejecutándose y las credenciales sean correctas
2. **Puerto ocupado**: Cambiar el puerto en `application.properties`
3. **Java Version**: Asegurar que se está usando Java 17+

### Logs

Los logs se muestran en consola con nivel DEBUG para desarrollo.

## 👥 Contribución

1. Fork del proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

MIT License - ver archivo `LICENSE` para detalles.

---

**Desarrollado por**: FrancoGPU  
**Versión**: 1.0.0  
**Fecha**: Septiembre 2025