# Integración de Autenticación con Spring Security + JWT

## Resumen de la Implementación

Se ha implementado completamente un sistema de autenticación robusto integrando **Spring Security** con **JWT** en el backend y actualizando el frontend de Angular.

---

## Backend - Spring Boot

### 1. Dependencias Agregadas (pom.xml)
- `spring-boot-starter-security`
- `jjwt-api` 0.12.3
- `jjwt-impl` 0.12.3
- `jjwt-jackson` 0.12.3

### 2. Modelo de Datos (MongoDB)
**Entidad:** `com.logistock.model.User`
- id (String)
- username (String, índice único)
- email (String, índice único)
- password (String, hasheada con BCrypt)
- role (String: "ADMIN" o "USER")
- enabled (Boolean)
- createdAt (LocalDateTime)
- updatedAt (LocalDateTime)

### 3. Repositorio
**Interfaz:** `com.logistock.repository.UserRepository`
- `findByUsername(String username)`
- `findByEmail(String email)`
- `existsByUsername(String username)`
- `existsByEmail(String email)`

### 4. Servicio
**Clase:** `com.logistock.service.UserService`
- Implementa `UserDetailsService` de Spring Security
- Métodos CRUD para usuarios
- Hash automático de contraseñas con BCrypt

### 5. Seguridad JWT
**Clase:** `com.logistock.security.JwtUtil`
- Generación de tokens JWT (expiración: 24 horas)
- Validación de tokens
- Extracción de información (username, claims)
- Firma con clave secreta configurable

**Clase:** `com.logistock.security.JwtAuthenticationFilter`
- Intercepta todas las peticiones HTTP
- Extrae token del header `Authorization: Bearer <token>`
- Valida el token y establece el contexto de seguridad

**Clase:** `com.logistock.security.SecurityConfig`
- Configuración de Spring Security
- CORS configurado para Angular (localhost:4200)
- Endpoints públicos: `/api/auth/**`, `/swagger-ui/**`, `/actuator/**`
- Endpoints protegidos: todos los demás
- Sesiones: STATELESS (sin sesiones del servidor)

### 6. DTOs
- `LoginRequest`: username, password
- `RegisterRequest`: username, email, password
- `AuthResponse`: token, type, username, email, role
- `UserInfoResponse`: id, username, email, role, enabled

### 7. Controlador de Autenticación
**Clase:** `com.logistock.controller.AuthController`

**Endpoints:**
- `POST /api/auth/login`
  - Body: `{ "username": "admin", "password": "admin123" }`
  - Respuesta: `{ "token": "jwt_token", "type": "Bearer", "username": "admin", "email": "admin@logistock.com", "role": "ADMIN" }`

- `POST /api/auth/register`
  - Body: `{ "username": "nuevo", "email": "nuevo@example.com", "password": "password123" }`
  - Respuesta: `{ "message": "Usuario registrado exitosamente", "username": "nuevo" }`

- `GET /api/auth/me` (requiere autenticación)
  - Header: `Authorization: Bearer <token>`
  - Respuesta: `{ "id": "...", "username": "admin", "email": "admin@logistock.com", "role": "ADMIN", "enabled": true }`

### 8. Datos Iniciales
**Clase:** `com.logistock.config.DataInitializer`
- Crea automáticamente dos usuarios al iniciar la aplicación:
  - **Admin:** username: `admin`, password: `admin123`, role: `ADMIN`
  - **Usuario:** username: `usuario`, password: `user123`, role: `USER`

### 9. Configuración (application.properties)
```properties
# JWT Configuration
app.jwt.secret=LogiStock2025SecureSecretKeyForJWTTokenGenerationAndValidation
app.jwt.expiration-ms=86400000  # 24 horas
```

---

## Frontend - Angular

### 1. AuthService Actualizado
**Archivo:** `src/app/services/auth.service.ts`

**Cambios:**
- Ahora hace llamadas HTTP reales al backend
- Guarda el token JWT en `localStorage.getItem('authToken')`
- Manejo de errores con mensajes del servidor
- Método `getToken()` para obtener el token JWT
- Actualizado `isAdmin()` para verificar rol `"ADMIN"` (antes `"admin"`)

**Interfaces:**
```typescript
export interface User {
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  role: string;
}
```

### 2. Interceptor HTTP JWT
**Archivo:** `src/app/interceptors/jwt.interceptor.ts`

- Intercepta todas las peticiones HTTP
- Agrega automáticamente el header `Authorization: Bearer <token>` a todas las peticiones (excepto login y register)
- Utiliza el patrón funcional `HttpInterceptorFn` de Angular

### 3. Configuración de la Aplicación
**Archivo:** `src/app/app.config.ts`

- Configurado `provideHttpClient(withInterceptors([jwtInterceptor]))`
- El interceptor se aplica globalmente a todas las peticiones HTTP

### 4. Componente de Login Actualizado
**Archivo:** `src/app/pages/login/login.component.ts`

- Maneja errores del servidor mostrando mensajes específicos
- Feedback visual durante el proceso de autenticación (loading state)

---

## Flujo de Autenticación

### Login
1. Usuario ingresa credenciales en el formulario de login
2. Frontend envía `POST /api/auth/login` con username y password
3. Backend valida credenciales con Spring Security
4. Backend genera token JWT y lo devuelve junto con información del usuario
5. Frontend guarda token en localStorage (`authToken`) y usuario (`currentUser`)
6. Usuario es redirigido al dashboard

### Acceso a Endpoints Protegidos
1. Usuario realiza petición a endpoint protegido (ej: `/api/productos`)
2. Interceptor agrega automáticamente header `Authorization: Bearer <token>`
3. Backend valida el token en `JwtAuthenticationFilter`
4. Si el token es válido, la petición continúa normalmente
5. Si el token es inválido o expiró, Backend devuelve 401 Unauthorized

### Logout
1. Usuario hace clic en "Cerrar Sesión"
2. Frontend elimina token y datos del usuario de localStorage
3. Usuario es redirigido al login

---

## Seguridad Implementada

✅ **Autenticación basada en JWT** (stateless, escalable)  
✅ **Contraseñas hasheadas con BCrypt** (no se guardan en texto plano)  
✅ **Tokens con expiración** (24 horas)  
✅ **CORS configurado** para permitir solo el frontend de Angular  
✅ **Endpoints protegidos** con Spring Security  
✅ **Interceptor automático** para agregar tokens en cada petición  
✅ **Roles de usuario** (ADMIN, USER) para autorización futura  
✅ **Validación de tokens** en cada petición al backend  

---

## Pruebas Recomendadas

### 1. Probar Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "username": "admin",
  "email": "admin@logistock.com",
  "role": "ADMIN"
}
```

### 2. Probar Endpoint Protegido
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <token_aqui>"
```

**Respuesta esperada:**
```json
{
  "id": "...",
  "username": "admin",
  "email": "admin@logistock.com",
  "role": "ADMIN",
  "enabled": true
}
```

### 3. Probar Registro
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'
```

### 4. Probar en el Frontend
1. Iniciar backend: `cd backend-java && mvn spring-boot:run`
2. Iniciar frontend: `npm start`
3. Navegar a `http://localhost:4200`
4. Intentar acceder a `/dashboard` (debe redirigir a `/login`)
5. Ingresar credenciales: `admin` / `admin123`
6. Verificar redirección al dashboard
7. Verificar que el navbar muestra el botón de logout
8. Hacer logout y verificar redirección al login

---

## Usuarios de Prueba

| Username | Password  | Role  | Email                    |
|----------|-----------|-------|--------------------------|
| admin    | admin123  | ADMIN | admin@logistock.com      |
| usuario  | user123   | USER  | usuario@logistock.com    |

---

## Próximos Pasos Opcionales

- [ ] Implementar refresh tokens para renovar tokens expirados
- [ ] Agregar autorización basada en roles con `@PreAuthorize`
- [ ] Implementar "Recordarme" con tokens de larga duración
- [ ] Agregar límite de intentos de login fallidos
- [ ] Implementar recuperación de contraseña
- [ ] Agregar auditoría de login (registro de accesos)
- [ ] Implementar logout desde el backend (blacklist de tokens)

---

## Archivos Creados/Modificados

### Backend
- ✅ `pom.xml` (dependencias agregadas)
- ✅ `application.properties` (configuración JWT)
- ✅ `model/User.java`
- ✅ `repository/UserRepository.java`
- ✅ `service/UserService.java`
- ✅ `security/JwtUtil.java`
- ✅ `security/JwtAuthenticationFilter.java`
- ✅ `security/SecurityConfig.java`
- ✅ `dto/LoginRequest.java`
- ✅ `dto/RegisterRequest.java`
- ✅ `dto/AuthResponse.java`
- ✅ `dto/UserInfoResponse.java`
- ✅ `controller/AuthController.java`
- ✅ `config/DataInitializer.java`

### Frontend
- ✅ `services/auth.service.ts` (actualizado)
- ✅ `pages/login/login.component.ts` (actualizado)
- ✅ `interceptors/jwt.interceptor.ts` (nuevo)
- ✅ `app.config.ts` (actualizado)

---

**Implementación completada exitosamente** ✅
