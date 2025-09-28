import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DashboardStats {
  inventario: {
    totalProducts: number;
    totalValue: number;
    lowStock: number;
    categories: number;
  };
  clientes: {
    total: number;
    premium: number;
    corporativo: number;
    regular: number;
  };
  rutas: {
    activas: number;
    completadas: number;
    eficienciaPromedio: number;
    kilometrajeMes: number;
  };
  operaciones: {
    entregasHoy: number;
    entregasPendientes: number;
    tiempoPromedioEntrega: number;
    satisfaccionCliente: number;
  };
}

export interface RecentActivity {
  id: number;
  type: 'inventory' | 'route' | 'client' | 'order';
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private apiService: ApiService) {}

  /**
   * Obtener estadísticas generales del dashboard
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.apiService.get<DashboardStats>('dashboard/stats');
  }

  /**
   * Obtener actividad reciente
   */
  getRecentActivity(): Observable<RecentActivity[]> {
    return this.apiService.get<RecentActivity[]>('dashboard/recent');
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Formatear porcentaje
   */
  formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  /**
   * Obtener color para eficiencia
   */
  getEfficiencyColor(efficiency: number): string {
    if (efficiency >= 90) return '#4CAF50';
    if (efficiency >= 75) return '#FF9800';
    if (efficiency >= 60) return '#FFC107';
    return '#F44336';
  }

  /**
   * Obtener icono para tipo de actividad
   */
  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'inventory': '📦',
      'route': '🚚',
      'client': '👤',
      'order': '📋'
    };
    return icons[type] || '📊';
  }

  /**
   * Obtener clase CSS para prioridad
   */
  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return classes[priority] || 'priority-medium';
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
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

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
   * Generar datos simulados para gráficos
   */
  generateChartData() {
    return {
      // Datos para gráfico de ventas mensuales
      salesData: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Ventas',
          data: [65000, 75000, 82000, 78000, 88000, 92000],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4
        }]
      },
      // Datos para gráfico de categorías
      categoryData: {
        labels: ['Tecnología', 'Oficina', 'Industrial', 'Consumo'],
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
      // Datos para gráfico de eficiencia de rutas
      routeEfficiencyData: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        datasets: [{
          label: 'Eficiencia %',
          data: [85, 92, 88, 94, 87, 90],
          backgroundColor: '#43e97b',
          borderRadius: 4
        }]
      }
    };
  }
}