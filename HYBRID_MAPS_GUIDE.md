# 🗺️ Guía de Configuración del Sistema Híbrido de Mapas

## 🎯 Estrategia para tu Proyecto

### 📅 **Semana Próxima (Avance)**: Google Maps
- **Profesional y preciso** para impresionar al profesor
- **$300 USD gratis** por 90 días (más que suficiente)
- **Geocodificación perfecta** y cálculos de distancia exactos

### 🎓 **Presentación Final**: OpenStreetMap  
- **Completamente gratuito** para siempre
- **Sin límites** ni vencimientos
- **Funcionalidad idéntica** al usuario final

---

## ⚡ Configuración Rápida

### 🆓 **Modo OpenStreetMap (Actual)**
```bash
# Ya configurado por defecto
# No requiere API keys
# Funciona inmediatamente
```

### 💎 **Modo Google Maps (Para avance)**

#### 1. Obtener API Key (5 minutos)
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto: "LogiStock Solutions"
3. Activar APIs:
   - Maps JavaScript API
   - Geocoding API  
   - Distance Matrix API
4. Crear credenciales → API Key
5. Copiar la key

#### 2. Configurar en el proyecto
```bash
# En backend/.env
MAP_PROVIDER=google
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

#### 3. Probar
```bash
cd backend
npm run dev
./test-optimization.sh
```

---

## 🔄 Cambio Dinámico de Proveedor

### Durante la ejecución (API Endpoint)
```bash
# Cambiar a Google Maps
curl -X POST http://localhost:3000/api/rutas/provider \
  -H "Content-Type: application/json" \
  -d '{"provider": "google"}'

# Cambiar a OpenStreetMap  
curl -X POST http://localhost:3000/api/rutas/provider \
  -H "Content-Type: application/json" \
  -d '{"provider": "openstreetmap"}'
```

### Desde Angular (Frontend)
```typescript
// En tu servicio Angular
switchToGoogle() {
  return this.http.post('/api/rutas/provider', { provider: 'google' });
}

switchToOpenStreetMap() {
  return this.http.post('/api/rutas/provider', { provider: 'openstreetmap' });
}
```

---

## 📊 Comparación de Proveedores

| Característica | Google Maps | OpenStreetMap |
|---|---|---|
| **Precisión** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐☆ |
| **Costo** | $300 gratis/90d | Gratuito ♾️ |
| **Límites** | 40K requests/mes | Sin límites |
| **Velocidad** | Muy rápida | Rápida |
| **Cobertura Perú** | Excelente | Muy buena |
| **Profesionalidad** | Máxima | Alta |

---

## 🧪 Pruebas del Sistema

### Probar Geocodificación
```bash
curl -X POST http://localhost:3000/api/rutas/geocode \
  -H "Content-Type: application/json" \
  -d '{
    "addresses": [
      "Av. Javier Prado 123, San Isidro, Lima",
      "Centro Comercial Jockey Plaza, Surco"
    ]
  }'
```

### Probar Optimización Completa
```bash
curl -X POST http://localhost:3000/api/rutas/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "deliveries": [
      {"id": 1, "address": "Av. Arequipa 1000, Lima"},
      {"id": 2, "address": "Av. Brasil 500, Magdalena"},  
      {"id": 3, "address": "Av. Javier Prado 2000, San Isidro"}
    ],
    "vehicles": [
      {"id": 1, "driver": "Carlos", "capacity": 1000}
    ]
  }'
```

---

## 🎯 Plan de Implementación

### ✅ **Esta Semana**
- [x] Sistema híbrido funcionando
- [x] OpenStreetMap por defecto
- [x] APIs completas implementadas

### 📅 **Próxima Semana (Avance)**
- [ ] Configurar Google Maps API
- [ ] Probar con datos reales del proyecto  
- [ ] Demostrar funcionalidad al profesor

### 🎓 **Semanas Finales**
- [ ] Cambiar a OpenStreetMap
- [ ] Optimizar rendimiento
- [ ] Preparar presentación final

---

## 🚨 Troubleshooting

### Error: "No se pudieron geocodificar direcciones"
- **OpenStreetMap**: Direcciones muy específicas (incluir "Lima, Perú")
- **Google**: Verificar API key y créditos

### Error: "Rate limit exceeded" 
- **OpenStreetMap**: Reducir velocidad (delay de 1s)
- **Google**: Verificar límites de API

### Error: "CORS"
- Verificar que el frontend esté en puerto 4200
- Revisar configuración CORS en app.js

---

## 💡 Tips para la Presentación

### 🎯 **Para el Avance**
- Mostrar Google Maps funcionando
- Demostrar geocodificación en tiempo real
- Comparar rutas optimizadas vs no optimizadas

### 🎓 **Para la Final** 
- Explicar la estrategia híbrida
- Mostrar que funciona sin dependencias externas
- Destacar la optimización del TSP algorithm

**¡Tu proyecto estará 100% funcional sin importar el proveedor!** 🚀