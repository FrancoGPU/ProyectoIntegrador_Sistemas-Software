#!/bin/bash

echo "🗺️  Probando Sistema Híbrido de Optimización de Rutas"
echo "=================================================="

BASE_URL="http://localhost:3000/api/rutas"

echo ""
echo "📋 1. Información del proveedor actual..."
curl -s "$BASE_URL/provider" | jq '.'

echo ""
echo "🧪 2. Probando geocodificación..."
curl -s -X POST "$BASE_URL/geocode" \
  -H "Content-Type: application/json" \
  -d '{
    "addresses": [
      "Av. Javier Prado 123, San Isidro, Lima",
      "Jr. Comercio 456, Breña, Lima",
      "Av. Industrial 789, Ate, Lima"
    ]
  }' | jq '.'

echo ""
echo "🚚 3. Optimización REAL de rutas..."
curl -s -X POST "$BASE_URL/optimize" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveries": [
      {
        "id": 1,
        "address": "Av. Javier Prado 123, San Isidro, Lima",
        "priority": "alta"
      },
      {
        "id": 2,
        "address": "Jr. Comercio 456, Breña, Lima", 
        "priority": "media"
      },
      {
        "id": 3,
        "address": "Av. Industrial 789, Ate, Lima",
        "priority": "baja"
      },
      {
        "id": 4,
        "address": "Av. Arequipa 1000, Lince, Lima",
        "priority": "alta"
      }
    ],
    "vehicles": [
      {
        "id": 1,
        "driver": "Carlos Mendoza",
        "capacity": 1000,
        "type": "Camión"
      },
      {
        "id": 2,
        "driver": "Ana Rodríguez", 
        "capacity": 800,
        "type": "Van"
      }
    ],
    "preferences": {
      "optimizeBy": "distance"
    }
  }' | jq '.'

echo ""
echo "🔄 4. Cambiando a Google Maps (si tienes API key)..."
curl -s -X POST "$BASE_URL/provider" \
  -H "Content-Type: application/json" \
  -d '{"provider": "google"}' | jq '.'

echo ""
echo "✅ Pruebas completadas!"
echo ""
echo "💡 Para usar Google Maps:"
echo "   1. Obtén API key de Google Cloud"
echo "   2. Agrega GOOGLE_MAPS_API_KEY=tu_key al .env"
echo "   3. Cambia MAP_PROVIDER=google en .env"