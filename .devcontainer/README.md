# 🐳 DevContainer - LogiStock Solutions

Este proyecto utiliza **Dev Containers** para proporcionar un entorno de desarrollo consistente y reproducible.

## 🚀 Requisitos Previos

- **Docker Desktop** instalado y ejecutándose
- **Visual Studio Code** con la extensión **Dev Containers** instalada
  - Extensión: `ms-vscode-remote.remote-containers`

## 📦 ¿Qué incluye el DevContainer?

### Lenguajes y Runtimes
- ☕ **Java 17** (con Maven)
- 🟢 **Node.js 18** (para Angular)
- 🔧 **Git**

### Servicios
- 🗄️ **MongoDB 7.0** (puerto 27017)
  - Usuario: `logistock`
  - Contraseña: `logistock123`
  - Base de datos: `logistockdb`

### Extensiones VS Code Preinstaladas

**Backend (Java/Spring Boot):**
- Java Extension Pack
- Spring Boot Dashboard
- Spring Boot Tools
- Maven for Java
- Language Support for Java (Red Hat)

**Frontend (Angular/TypeScript):**
- Angular Language Service
- TypeScript Support
- ESLint
- Prettier

**Base de Datos:**
- MongoDB for VS Code

## 🏃 Cómo Usar

### Opción 1: Abrir en DevContainer (Recomendado)

1. Abre VS Code en la carpeta raíz del proyecto
2. Presiona `F1` y selecciona: **Dev Containers: Reopen in Container**
3. Espera a que el contenedor se construya (primera vez toma ~5-10 minutos)
4. Una vez dentro:
   ```bash
   # Terminal 1: Backend
   cd backend-java
   mvn spring-boot:run
   
   # Terminal 2: Frontend
   npm install
   npm start
   ```

### Opción 2: Abrir Localmente (Sin DevContainer)

Si prefieres trabajar sin DevContainer:

1. Renombra `.devcontainer` a `.devcontainer.backup`
2. Asegúrate de tener instalado localmente:
   - Java 17+ y Maven
   - Node.js 18+
   - MongoDB 6.0+
3. Configura MongoDB local en `backend-java/src/main/resources/application.properties`

## 🔧 Puertos Expuestos

| Puerto | Servicio | URL |
|--------|----------|-----|
| 4200 | Angular Frontend | http://localhost:4200 |
| 8080 | Spring Boot Backend | http://localhost:8080 |
| 27017 | MongoDB | mongodb://localhost:27017 |

## 🐛 Solución de Problemas

### Error: "Workspace folder does not exist"

**Causa:** Configuración obsoleta de `workspaceFolder`

**Solución:** Ya corregido en esta versión. Si persiste:
1. Elimina los contenedores: `docker-compose -f .devcontainer/docker-compose.yml down -v`
2. Reconstruye: **Dev Containers: Rebuild Container**

### Error: MongoDB connection refused

**Causa:** MongoDB no ha iniciado completamente

**Solución:**
```bash
# Verifica el estado de MongoDB
docker-compose -f .devcontainer/docker-compose.yml ps

# Si no está corriendo, reinicia
docker-compose -f .devcontainer/docker-compose.yml restart mongodb
```

### Error: Maven/Java no encontrado

**Causa:** Features de Java no instaladas correctamente

**Solución:**
1. Reconstruye el contenedor: **Dev Containers: Rebuild Container**
2. Verifica instalación:
   ```bash
   java -version
   mvn -version
   ```

## 📝 Configuración Personalizada

### Cambiar Puerto de MongoDB

Edita `.devcontainer/docker-compose.yml`:
```yaml
mongodb:
  ports:
    - "27018:27017"  # Cambia 27018 por tu puerto deseado
```

### Añadir Extensiones VS Code

Edita `.devcontainer/devcontainer.json`:
```json
"customizations": {
  "vscode": {
    "extensions": [
      "tu-extension-aqui"
    ]
  }
}
```

## 🔐 Credenciales por Defecto

⚠️ **Solo para desarrollo local:**

- **MongoDB:**
  - Usuario root: `logistock`
  - Contraseña: `logistock123`
  - Base de datos: `logistockdb`

🛡️ **IMPORTANTE:** Cambia estas credenciales antes de desplegar a producción.

## 📚 Recursos Adicionales

- [Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Spring Boot in Docker](https://spring.io/guides/gs/spring-boot-docker/)

---

**Última actualización:** 16 de noviembre de 2025  
**Autor:** FrancoGPU
