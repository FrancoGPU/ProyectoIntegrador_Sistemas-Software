import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Delivery {
  id: number;
  address: string;
  priority?: 'alta' | 'media' | 'baja';
  timeWindow?: {
    start: string;
    end: string;
  };
  weight?: number;
  volume?: number;
}

export interface Vehicle {
  id: number;
  driver: string;
  capacity: {
    weight?: number;
    volume?: number;
  };
  type?: string;
  startLocation?: string;
}

export interface OptimizationPreferences {
  optimizeBy?: 'time' | 'distance' | 'cost';
  avoidTolls?: boolean;
  avoidHighways?: boolean;
}

export interface RouteStop {
  stop: number;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  deliveryId?: number;
  estimatedTime: string;
  priority?: string;
}

export interface OptimizedRoute {
  vehicleId: number;
  driver: string;
  vehicle: Vehicle;
  route: RouteStop[];
  metrics: {
    totalStops: number;
    estimatedDuration: number;
    totalDistance: number;
    efficiency: number;
  };
}

export interface OptimizationResult {
  optimizedRoutes: OptimizedRoute[];
  metrics: {
    totalRoutes: number;
    totalDistance: number;
    totalTime: number;
    averageEfficiency: number;
    estimatedSavings: {
      distance: number;
      time: number;
      cost: number;
    };
  };
  provider: string;
}

export interface GeocodeResult {
  address: string;
  lat: number | null;
  lng: number | null;
  formattedAddress?: string;
  success: boolean;
  error?: string;
}

export interface MapProviderInfo {
  current: string;
  available: string[];
  hasGoogleKey: boolean;
  recommendations: {
    google: string;
    openstreetmap: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RutasService {

  constructor(private apiService: ApiService) {}

  /**
   * Optimizar rutas de entrega
   */
  optimizeRoutes(
    deliveries: Delivery[], 
    vehicles: Vehicle[] = [], 
    preferences: OptimizationPreferences = {}
  ): Observable<OptimizationResult> {
    const payload = {
      deliveries,
      vehicles,
      preferences
    };

    return this.apiService.post<OptimizationResult>('rutas/optimize', payload);
  }

  /**
   * Geocodificar direcciones
   */
  geocodeAddresses(addresses: string[]): Observable<{
    data: GeocodeResult[];
    provider: string;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    return this.apiService.post('rutas/geocode', { addresses });
  }

  /**
   * Obtener información del proveedor de mapas actual
   */
  getMapProviderInfo(): Observable<MapProviderInfo> {
    return this.apiService.get<MapProviderInfo>('rutas/provider');
  }

  /**
   * Cambiar proveedor de mapas
   */
  setMapProvider(provider: 'google' | 'openstreetmap'): Observable<{
    message: string;
    data: MapProviderInfo;
  }> {
    return this.apiService.post('rutas/provider', { provider });
  }

  /**
   * Validar dirección
   */
  validateAddress(address: string): boolean {
    return address.trim().length >= 10;
  }

  /**
   * Formatear tiempo estimado
   */
  formatEstimatedTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  /**
   * Calcular ahorro de costos
   */
  calculateSavings(originalDistance: number, optimizedDistance: number, costPerKm: number = 2.5): {
    distanceSaved: number;
    costSaved: number;
    percentageSaved: number;
  } {
    const distanceSaved = originalDistance - optimizedDistance;
    const costSaved = distanceSaved * costPerKm;
    const percentageSaved = (distanceSaved / originalDistance) * 100;

    return {
      distanceSaved: Math.round(distanceSaved * 100) / 100,
      costSaved: Math.round(costSaved * 100) / 100,
      percentageSaved: Math.round(percentageSaved * 100) / 100
    };
  }

  /**
   * Obtener clase CSS para prioridad
   */
  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'alta': 'priority-high',
      'media': 'priority-medium', 
      'baja': 'priority-low'
    };
    return classes[priority] || 'priority-medium';
  }

  /**
   * Obtener color para eficiencia
   */
  getEfficiencyColor(efficiency: number): string {
    if (efficiency >= 90) return '#4CAF50'; // Verde
    if (efficiency >= 75) return '#FF9800'; // Naranja
    if (efficiency >= 60) return '#FFC107'; // Amarillo
    return '#F44336'; // Rojo
  }

  /**
   * Generar datos de ejemplo para pruebas
   */
  generateSampleData(): {
    deliveries: Delivery[];
    vehicles: Vehicle[];
  } {
    return {
      deliveries: [
        {
          id: 1,
          address: 'Av. Javier Prado 123, San Isidro, Lima',
          priority: 'alta'
        },
        {
          id: 2,
          address: 'Jr. Comercio 456, Breña, Lima',
          priority: 'media'
        },
        {
          id: 3,
          address: 'Av. Industrial 789, Ate, Lima',
          priority: 'baja'
        },
        {
          id: 4,
          address: 'Av. Arequipa 1000, Lince, Lima',
          priority: 'alta'
        }
      ],
      vehicles: [
        {
          id: 1,
          driver: 'Carlos Mendoza',
          capacity: { weight: 1000, volume: 10 },
          type: 'Camión'
        },
        {
          id: 2,
          driver: 'Ana Rodríguez',
          capacity: { weight: 800, volume: 8 },
          type: 'Van'
        }
      ]
    };
  }

  /**
   * Exportar rutas a CSV
   */
  exportRoutesToCSV(routes: OptimizedRoute[]): string {
    const headers = ['Vehículo', 'Conductor', 'Parada', 'Dirección', 'Hora Estimada', 'Prioridad'];
    let csv = headers.join(',') + '\n';

    routes.forEach(route => {
      route.route.forEach(stop => {
        const row = [
          route.vehicleId,
          route.driver,
          stop.stop,
          `"${stop.address}"`,
          stop.estimatedTime,
          stop.priority || 'media'
        ];
        csv += row.join(',') + '\n';
      });
    });

    return csv;
  }

  /**
   * Descargar archivo CSV
   */
  downloadCSV(content: string, filename: string = 'rutas_optimizadas.csv'): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}