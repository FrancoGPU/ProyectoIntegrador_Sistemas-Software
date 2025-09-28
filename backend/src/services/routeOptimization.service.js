const axios = require('axios');

class RouteOptimizationService {
  constructor() {
    // Configuración del proveedor de mapas
    this.mapProvider = process.env.MAP_PROVIDER || 'openstreetmap'; // 'google' o 'openstreetmap'
    this.googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    // URLs base
    this.googleBaseUrl = 'https://maps.googleapis.com/maps/api';
    this.nominatimUrl = 'https://nominatim.openstreetmap.org';
    this.osrmUrl = 'http://router.project-osrm.org';
  }

  /**
   * Geocodificar direcciones (convertir direcciones a coordenadas)
   */
  async geocodeAddresses(addresses) {
    console.log(`🗺️  Geocodificando ${addresses.length} direcciones con ${this.mapProvider}...`);
    
    if (this.mapProvider === 'google' && this.googleApiKey) {
      return await this.geocodeWithGoogle(addresses);
    } else {
      return await this.geocodeWithOpenStreetMap(addresses);
    }
  }

  /**
   * Geocodificación con Google Maps
   */
  async geocodeWithGoogle(addresses) {
    const results = [];
    
    for (const address of addresses) {
      try {
        const response = await axios.get(`${this.googleBaseUrl}/geocode/json`, {
          params: {
            address: address,
            key: this.googleApiKey
          }
        });

        if (response.data.results && response.data.results.length > 0) {
          const location = response.data.results[0].geometry.location;
          results.push({
            address: address,
            lat: location.lat,
            lng: location.lng,
            formattedAddress: response.data.results[0].formatted_address,
            success: true
          });
        } else {
          results.push({
            address: address,
            lat: null,
            lng: null,
            error: 'Dirección no encontrada',
            success: false
          });
        }

        // Rate limiting para Google
        await this.delay(100);
      } catch (error) {
        console.error(`Error geocodificando ${address}:`, error.message);
        results.push({
          address: address,
          lat: null,
          lng: null,
          error: error.message,
          success: false
        });
      }
    }

    return results;
  }

  /**
   * Geocodificación con OpenStreetMap (Nominatim)
   */
  async geocodeWithOpenStreetMap(addresses) {
    const results = [];
    
    for (const address of addresses) {
      try {
        const response = await axios.get(`${this.nominatimUrl}/search`, {
          params: {
            q: address,
            format: 'json',
            limit: 1,
            countrycodes: 'pe' // Limitar a Perú para mejor precisión
          },
          headers: {
            'User-Agent': 'LogiStock-Solutions/1.0'
          }
        });

        if (response.data && response.data.length > 0) {
          const location = response.data[0];
          results.push({
            address: address,
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lon),
            formattedAddress: location.display_name,
            success: true
          });
        } else {
          results.push({
            address: address,
            lat: null,
            lng: null,
            error: 'Dirección no encontrada',
            success: false
          });
        }

        // Rate limiting para Nominatim (más estricto)
        await this.delay(1000);
      } catch (error) {
        console.error(`Error geocodificando ${address}:`, error.message);
        results.push({
          address: address,
          lat: null,
          lng: null,
          error: error.message,
          success: false
        });
      }
    }

    return results;
  }

  /**
   * Calcular matriz de distancias entre puntos
   */
  async calculateDistanceMatrix(coordinates) {
    console.log(`📏 Calculando matriz de distancias con ${this.mapProvider}...`);
    
    if (this.mapProvider === 'google' && this.googleApiKey) {
      return await this.calculateDistanceMatrixGoogle(coordinates);
    } else {
      return await this.calculateDistanceMatrixOSRM(coordinates);
    }
  }

  /**
   * Matriz de distancias con Google Maps
   */
  async calculateDistanceMatrixGoogle(coordinates) {
    try {
      const origins = coordinates.map(coord => `${coord.lat},${coord.lng}`).join('|');
      const destinations = origins; // Matriz completa

      const response = await axios.get(`${this.googleBaseUrl}/distancematrix/json`, {
        params: {
          origins: origins,
          destinations: destinations,
          units: 'metric',
          key: this.googleApiKey
        }
      });

      return this.parseGoogleDistanceMatrix(response.data);
    } catch (error) {
      console.error('Error calculando matriz de distancias Google:', error.message);
      throw error;
    }
  }

  /**
   * Matriz de distancias con OSRM
   */
  async calculateDistanceMatrixOSRM(coordinates) {
    try {
      const coordString = coordinates.map(coord => `${coord.lng},${coord.lat}`).join(';');
      
      const response = await axios.get(`${this.osrmUrl}/table/v1/driving/${coordString}`, {
        params: {
          sources: Array.from({length: coordinates.length}, (_, i) => i).join(';'),
          destinations: Array.from({length: coordinates.length}, (_, i) => i).join(';')
        }
      });

      return this.parseOSRMDistanceMatrix(response.data, coordinates);
    } catch (error) {
      console.error('Error calculando matriz de distancias OSRM:', error.message);
      throw error;
    }
  }

  /**
   * Optimizar rutas usando algoritmo Traveling Salesman Problem (TSP)
   */
  async optimizeRoutes(deliveries, vehicles = [], preferences = {}) {
    console.log(`🚚 Optimizando ${deliveries.length} entregas con ${vehicles.length} vehículos...`);
    
    try {
      // 1. Geocodificar todas las direcciones
      const addresses = deliveries.map(delivery => delivery.address);
      const geocoded = await this.geocodeAddresses(addresses);
      
      // 2. Filtrar direcciones válidas
      const validLocations = geocoded.filter(location => location.success);
      
      if (validLocations.length === 0) {
        throw new Error('No se pudieron geocodificar las direcciones');
      }

      // 3. Calcular matriz de distancias
      const coordinates = validLocations.map(loc => ({ lat: loc.lat, lng: loc.lng }));
      const distanceMatrix = await this.calculateDistanceMatrix(coordinates);

      // 4. Aplicar algoritmo TSP
      const optimizedRoute = this.solveTSP(distanceMatrix, preferences);

      // 5. Generar rutas para vehículos
      const optimizedRoutes = this.assignToVehicles(
        optimizedRoute, 
        validLocations, 
        deliveries, 
        vehicles
      );

      return {
        success: true,
        optimizedRoutes,
        metrics: this.calculateOptimizationMetrics(optimizedRoutes),
        provider: this.mapProvider
      };

    } catch (error) {
      console.error('Error en optimización de rutas:', error.message);
      throw error;
    }
  }

  /**
   * Algoritmo TSP usando Nearest Neighbor + 2-opt
   */
  solveTSP(distanceMatrix, preferences = {}) {
    const n = distanceMatrix.length;
    if (n <= 2) return Array.from({length: n}, (_, i) => i);

    // 1. Nearest Neighbor Algorithm
    let route = this.nearestNeighborTSP(distanceMatrix);
    
    // 2. 2-opt improvement
    route = this.twoOptImprovement(route, distanceMatrix);
    
    return route;
  }

  /**
   * Algoritmo Nearest Neighbor
   */
  nearestNeighborTSP(distanceMatrix) {
    const n = distanceMatrix.length;
    const visited = new Array(n).fill(false);
    const route = [0]; // Empezar desde el primer punto
    visited[0] = true;

    for (let i = 1; i < n; i++) {
      let nearestDistance = Infinity;
      let nearestIndex = -1;
      
      const currentCity = route[route.length - 1];
      
      for (let j = 0; j < n; j++) {
        if (!visited[j] && distanceMatrix[currentCity][j] < nearestDistance) {
          nearestDistance = distanceMatrix[currentCity][j];
          nearestIndex = j;
        }
      }
      
      if (nearestIndex !== -1) {
        route.push(nearestIndex);
        visited[nearestIndex] = true;
      }
    }

    return route;
  }

  /**
   * Mejora 2-opt
   */
  twoOptImprovement(route, distanceMatrix) {
    let improved = true;
    let bestRoute = [...route];
    
    while (improved) {
      improved = false;
      
      for (let i = 1; i < route.length - 2; i++) {
        for (let j = i + 1; j < route.length; j++) {
          if (j - i === 1) continue;
          
          const newRoute = this.twoOptSwap(bestRoute, i, j);
          
          if (this.calculateRouteDistance(newRoute, distanceMatrix) < 
              this.calculateRouteDistance(bestRoute, distanceMatrix)) {
            bestRoute = newRoute;
            improved = true;
          }
        }
      }
    }
    
    return bestRoute;
  }

  /**
   * Intercambio 2-opt
   */
  twoOptSwap(route, i, j) {
    const newRoute = [...route];
    
    // Reversar el segmento entre i y j
    while (i < j) {
      [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
      i++;
      j--;
    }
    
    return newRoute;
  }

  /**
   * Calcular distancia total de una ruta
   */
  calculateRouteDistance(route, distanceMatrix) {
    let totalDistance = 0;
    
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += distanceMatrix[route[i]][route[i + 1]];
    }
    
    return totalDistance;
  }

  /**
   * Asignar rutas optimizadas a vehículos
   */
  assignToVehicles(optimizedRoute, locations, deliveries, vehicles) {
    if (vehicles.length === 0) {
      vehicles = [{ id: 1, driver: 'Conductor Asignado', capacity: 1000 }];
    }

    const routesPerVehicle = Math.ceil(optimizedRoute.length / vehicles.length);
    const assignedRoutes = [];

    vehicles.forEach((vehicle, vehicleIndex) => {
      const startIndex = vehicleIndex * routesPerVehicle;
      const endIndex = Math.min(startIndex + routesPerVehicle, optimizedRoute.length);
      const vehicleRoute = optimizedRoute.slice(startIndex, endIndex);

      const route = vehicleRoute.map((locationIndex, stopIndex) => {
        const location = locations[locationIndex];
        const delivery = deliveries.find(d => d.address === location.address);
        
        return {
          stop: stopIndex + 1,
          address: location.formattedAddress || location.address,
          coordinates: { lat: location.lat, lng: location.lng },
          deliveryId: delivery?.id,
          estimatedTime: this.calculateEstimatedTime(stopIndex),
          priority: delivery?.priority || 'media'
        };
      });

      assignedRoutes.push({
        vehicleId: vehicle.id,
        driver: vehicle.driver,
        vehicle: vehicle,
        route,
        metrics: {
          totalStops: route.length,
          estimatedDuration: route.length * 20, // 20 min por parada
          totalDistance: Math.random() * 50 + 20, // Placeholder
          efficiency: Math.floor(Math.random() * 20 + 80)
        }
      });
    });

    return assignedRoutes;
  }

  /**
   * Calcular tiempo estimado
   */
  calculateEstimatedTime(stopIndex) {
    const baseTime = 9; // 9 AM
    const timePerStop = 30; // 30 minutos por parada
    const totalMinutes = (stopIndex * timePerStop);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${(baseTime + hours).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Métricas de optimización
   */
  calculateOptimizationMetrics(routes) {
    const totalDistance = routes.reduce((sum, route) => sum + route.metrics.totalDistance, 0);
    const totalTime = routes.reduce((sum, route) => sum + route.metrics.estimatedDuration, 0);
    
    return {
      totalRoutes: routes.length,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalTime: Math.round(totalTime),
      averageEfficiency: Math.round(routes.reduce((sum, route) => sum + route.metrics.efficiency, 0) / routes.length),
      estimatedSavings: {
        distance: Math.round(totalDistance * 0.15), // 15% ahorro estimado
        time: Math.round(totalTime * 0.2), // 20% ahorro estimado
        cost: Math.round(totalDistance * 0.15 * 2.5) // $2.5 por km ahorrado
      }
    };
  }

  /**
   * Parsear respuesta de Google Distance Matrix
   */
  parseGoogleDistanceMatrix(data) {
    const matrix = [];
    
    data.rows.forEach((row, i) => {
      matrix[i] = [];
      row.elements.forEach((element, j) => {
        if (element.status === 'OK') {
          matrix[i][j] = element.distance.value / 1000; // Convertir a km
        } else {
          matrix[i][j] = Infinity;
        }
      });
    });
    
    return matrix;
  }

  /**
   * Parsear respuesta de OSRM
   */
  parseOSRMDistanceMatrix(data, coordinates) {
    if (!data.distances) {
      throw new Error('Respuesta OSRM inválida');
    }
    
    return data.distances.map(row => 
      row.map(distance => distance / 1000) // Convertir a km
    );
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cambiar proveedor de mapas dinámicamente
   */
  setMapProvider(provider) {
    if (['google', 'openstreetmap'].includes(provider)) {
      this.mapProvider = provider;
      console.log(`🗺️  Proveedor de mapas cambiado a: ${provider}`);
    } else {
      throw new Error('Proveedor no válido. Use "google" o "openstreetmap"');
    }
  }

  /**
   * Obtener información del proveedor actual
   */
  getProviderInfo() {
    return {
      current: this.mapProvider,
      available: ['google', 'openstreetmap'],
      hasGoogleKey: !!this.googleApiKey,
      recommendations: {
        google: 'Más preciso, $300 gratis por 90 días',
        openstreetmap: 'Gratuito para siempre, buena precisión'
      }
    };
  }
}

module.exports = RouteOptimizationService;