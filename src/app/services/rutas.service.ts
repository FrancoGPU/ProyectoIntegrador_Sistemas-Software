import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

// Interfaz que coincide con el modelo del backend Java
export interface Ruta {
  id?: string;
  codigo: string;
  nombre: string;
  origen: string;
  destino: string;
  distanciaKm: number;
  tiempoEstimadoHoras?: number;
  tiempoEstimadoMinutos?: number;
  estado: string; // "Planificada", "En Proceso", "Completada", "Suspendida"
  vehiculo?: string;
  vehiculoAsignado?: string;
  conductor?: string;
  conductorAsignado?: string;
  costoEstimado?: number;
  costoTotal?: number;
  costoCombustible?: number;
  costoPeajes?: number;
  otrosCostos?: number;
  fechaSalida?: Date;
  fechaLlegadaEstimada?: Date;
  fechaLlegadaReal?: Date;
  fechaPlanificada?: Date;
  observaciones?: string;
  descripcion?: string;
  paradas?: string[];
  cargaKg?: number;
  prioridad?: string;
  isActive?: boolean;
}

export interface RutaStats {
  total: number;
  planificadas: number;
  enProceso: number;
  completadas: number;
  canceladas: number;
  distanciaTotal: number;
  costoTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class RutasService {

  constructor(private apiService: ApiService) {}

  /**
   * Obtener todas las rutas con paginación y filtros
   */
  getRutas(params?: {
    page?: number;
    size?: number;
    estado?: string;
    conductor?: string;
    search?: string;
  }): Observable<any> {
    let queryParams = '';
    if (params) {
      const paramArray = [];
      if (params.page !== undefined) paramArray.push(`page=${params.page}`);
      if (params.size !== undefined) paramArray.push(`size=${params.size}`);
      if (params.estado) paramArray.push(`estado=${params.estado}`);
      if (params.conductor) paramArray.push(`conductor=${params.conductor}`);
      if (params.search) paramArray.push(`search=${params.search}`);
      if (paramArray.length > 0) {
        queryParams = '?' + paramArray.join('&');
      }
    }
    return this.apiService.get(`rutas${queryParams}`);
  }

  /**
   * Obtener una ruta por ID
   */
  getRutaById(id: string): Observable<Ruta> {
    return this.apiService.get<Ruta>(`rutas/${id}`);
  }

  /**
   * Crear una nueva ruta
   */
  createRuta(ruta: Ruta): Observable<Ruta> {
    return this.apiService.post<Ruta>('rutas', ruta);
  }

  /**
   * Actualizar una ruta existente
   */
  updateRuta(id: string, ruta: Ruta): Observable<Ruta> {
    return this.apiService.put<Ruta>(`rutas/${id}`, ruta);
  }

  /**
   * Eliminar una ruta
   */
  deleteRuta(id: string): Observable<void> {
    return this.apiService.delete<void>(`rutas/${id}`);
  }

  /**
   * Cambiar el estado de una ruta
   */
  cambiarEstado(id: string, nuevoEstado: string): Observable<Ruta> {
    return this.apiService.patch<Ruta>(`rutas/${id}/estado`, { estado: nuevoEstado });
  }

  /**
   * Obtener estadísticas de rutas
   */
  getStats(): Observable<RutaStats> {
    return this.apiService.get<RutaStats>('rutas/stats');
  }

  /**
   * Obtener rutas activas (planificadas o en proceso)
   */
  getRutasActivas(): Observable<Ruta[]> {
    return this.apiService.get<Ruta[]>('rutas/activas');
  }

  /**
   * Buscar rutas por conductor
   */
  getRutasPorConductor(conductor: string): Observable<Ruta[]> {
    return this.apiService.get<Ruta[]>(`rutas?conductor=${conductor}`);
  }

  /**
   * Obtener color para el estado
   */
  getEstadoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'PLANIFICADA': '#007bff',
      'EN_PROCESO': '#ffc107',
      'COMPLETADA': '#28a745',
      'CANCELADA': '#dc3545'
    };
    return colores[estado] || '#6c757d';
  }

  /**
   * Obtener badge para el estado
   */
  getEstadoBadge(estado: string): string {
    const badges: { [key: string]: string } = {
      'PLANIFICADA': 'badge-primary',
      'EN_PROCESO': 'badge-warning',
      'COMPLETADA': 'badge-success',
      'CANCELADA': 'badge-danger'
    };
    return badges[estado] || 'badge-secondary';
  }

  /**
   * Formatear tiempo de ruta
   */
  formatTiempo(horas: number): string {
    const h = Math.floor(horas);
    const m = Math.round((horas - h) * 60);
    return `${h}h ${m}m`;
  }

  /**
   * Calcular costo por kilómetro
   */
  calcularCostoPorKm(costoTotal: number, distancia: number): number {
    return distancia > 0 ? Math.round((costoTotal / distancia) * 100) / 100 : 0;
  }

  /**
   * Validar ruta
   */
  validateRuta(ruta: Partial<Ruta>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!ruta.codigo?.trim()) {
      errors.push('El código es requerido');
    }
    if (!ruta.nombre?.trim()) {
      errors.push('El nombre es requerido');
    }
    if (!ruta.origen?.trim()) {
      errors.push('El origen es requerido');
    }
    if (!ruta.destino?.trim()) {
      errors.push('El destino es requerido');
    }
    if (!ruta.vehiculo?.trim()) {
      errors.push('El vehículo es requerido');
    }
    if (!ruta.conductor?.trim()) {
      errors.push('El conductor es requerido');
    }
    if (!ruta.distanciaKm || ruta.distanciaKm <= 0) {
      errors.push('La distancia debe ser mayor a 0');
    }
    if (!ruta.tiempoEstimadoHoras || ruta.tiempoEstimadoHoras <= 0) {
      errors.push('El tiempo estimado debe ser mayor a 0');
    }
    if (!ruta.costoEstimado || ruta.costoEstimado <= 0) {
      errors.push('El costo estimado debe ser mayor a 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Exportar rutas a CSV
   */
  exportToCSV(rutas: Ruta[]): string {
    const headers = [
      'Código', 'Nombre', 'Origen', 'Destino', 'Distancia (km)', 'Tiempo (h)',
      'Estado', 'Vehículo', 'Conductor', 'Costo', 'Fecha Salida', 'Fecha Llegada'
    ];

    const csvContent = [
      headers.join(','),
      ...rutas.map(r => [
        r.codigo,
        `"${r.nombre}"`,
        `"${r.origen}"`,
        `"${r.destino}"`,
        r.distanciaKm,
        r.tiempoEstimadoHoras || (r.tiempoEstimadoMinutos ? r.tiempoEstimadoMinutos / 60 : 0),
        r.estado,
        r.vehiculoAsignado || r.vehiculo || '',
        r.conductorAsignado || r.conductor || '',
        r.costoTotal || r.costoEstimado || 0,
        r.fechaSalida ? new Date(r.fechaSalida).toLocaleDateString() : '',
        r.fechaLlegadaEstimada ? new Date(r.fechaLlegadaEstimada).toLocaleDateString() : ''
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Descargar archivo CSV
   */
  downloadCSV(content: string, filename: string = 'rutas.csv'): void {
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

  /**
   * Generar código de ruta
   */
  generarCodigo(): string {
    const timestamp = Date.now().toString().slice(-6);
    return `RT-${timestamp}`;
  }

  /**
   * Calcular eficiencia de ruta (km/h)
   */
  calcularEficiencia(distancia: number, tiempo: number): number {
    return tiempo > 0 ? Math.round((distancia / tiempo) * 100) / 100 : 0;
  }
}
