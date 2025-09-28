#!/bin/bash

# Script para probar las APIs de LogiStock Solutions
echo "🚚 Probando APIs de LogiStock Solutions..."

BASE_URL="http://localhost:3000/api"

echo ""
echo "📊 1. Probando Dashboard..."
curl -s "$BASE_URL/dashboard/stats" | jq '.'

echo ""
echo "📦 2. Probando Inventario - Stats..."
curl -s "$BASE_URL/inventario/stats" | jq '.'

echo ""
echo "📦 3. Probando Inventario - Todos los productos..."
curl -s "$BASE_URL/inventario?limit=3" | jq '.'

echo ""
echo "📦 4. Creando producto de prueba..."
curl -s -X POST "$BASE_URL/inventario" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST001",
    "name": "Producto de Prueba",
    "description": "Este es un producto de prueba para la API",
    "category": "Tecnología",
    "stock": 50,
    "minStock": 10,
    "price": 299.99
  }' | jq '.'

echo ""
echo "🚚 5. Probando optimización básica de rutas..."
curl -s -X POST "$BASE_URL/rutas/optimize" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveries": [
      {"id": 1, "address": "Av. Javier Prado 123, San Isidro"},
      {"id": 2, "address": "Jr. Comercio 456, Breña"},
      {"id": 3, "address": "Av. Industrial 789, Ate"}
    ],
    "vehicles": [
      {"id": 1, "driver": "Carlos Mendoza", "capacity": 1000}
    ]
  }' | jq '.'

echo ""
echo "✅ Pruebas completadas!"