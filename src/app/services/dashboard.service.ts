import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

// Interfaz que coincide con la respuesta del backend
export interface DashboardStats {
  productosEnInventario: number;
  clientesActivos: number;
  proveedoresActivos: number;
  rutasEnProceso: number;
  lowStockProducts: any[];
  pendingOrders: any[];
  recentActivity: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private apiService: ApiService) {}

  /**
   * Obtener estadísticas generales del dashboard
   */
  getStats(): Observable<DashboardStats> {
    return this.apiService.get<DashboardStats>('dashboard/stats');
  }

  /**
   * Formatear números grandes
   */
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Formatear moneda
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Formatear porcentaje
   */
  formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  /**
   * Obtener color para métricas
   */
  getMetricColor(value: number, threshold: { low: number; medium: number }): string {
    if (value >= threshold.medium) return '#4CAF50';
    if (value >= threshold.low) return '#FF9800';
    return '#F44336';
  }

  /**
   * Calcular progreso hacia meta
   */
  calculateProgress(current: number, target: number): number {
    return Math.min(100, Math.round((current / target) * 100));
  }

  /**
   * Formatear tiempo relativo
   */
  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Hace menos de 1 minuto';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    }
  }

  /**
   * Generar datos para gráficos
   */
  generateChartData() {
    return {
      // Gráfico de líneas para evolución temporal
      lineChart: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Productos',
          data: [120, 150, 180, 160, 200, 220],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4
        }]
      },
      // Gráfico circular para distribución
      pieChart: {
        labels: ['Productos', 'Clientes', 'Proveedores', 'Rutas'],
        datasets: [{
          data: [45, 25, 20, 10],
          backgroundColor: [
            '#667eea',
            '#4facfe',
            '#43e97b',
            '#fa709a'
          ]
        }]
      },
      // Gráfico de barras
      barChart: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        datasets: [{
          label: 'Actividad',
          data: [12, 19, 15, 25, 22, 18],
          backgroundColor: '#43e97b',
          borderRadius: 4
        }]
      }
    };
  }

  /**
   * Obtener icono para tipo de métrica
   */
  getMetricIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'productos': '📦',
      'clientes': '👤',
      'proveedores': '🏭',
      'rutas': '🚚'
    };
    return icons[type] || '📊';
  }

  /**
   * Comparar con período anterior
   */
  compareToPrevious(current: number, previous: number): {
    change: number;
    percentage: number;
    isIncrease: boolean;
  } {
    const change = current - previous;
    const percentage = previous > 0 ? Math.abs((change / previous) * 100) : 0;
    
    return {
      change: Math.abs(change),
      percentage: Math.round(percentage * 10) / 10,
      isIncrease: change >= 0
    };
  }
}
