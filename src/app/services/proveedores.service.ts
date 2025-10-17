import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

// Interfaz que coincide con el modelo del backend Java
export interface Proveedor {
  id?: string;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion: string;
  tipo: string; // "NACIONAL" o "INTERNACIONAL"
  rucNit: string;
  pais: string;
  ciudad: string;
  diasPago: number;
  descuentoGeneral: number;
  isActive: boolean;
  contactoComercial?: {
    nombre: string;
    email: string;
    telefono: string;
  };
  condicionesEspeciales?: string;
  rating?: number;
}

export interface ProveedorStats {
  total: number;
  activos: number;
  inactivos: number;
  nacionales?: number;
  internacionales?: number;
}

export interface TopProveedor {
  proveedor: string;
  cantidadPedidos: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  constructor(private apiService: ApiService) {}

  /**
   * Obtener todos los proveedores con paginación y filtros
   */
  getProveedores(params?: {
    page?: number;
    size?: number;
    tipo?: string;
    activos?: boolean;
    search?: string;
  }): Observable<any> {
    let queryParams = '';
    if (params) {
      const paramArray = [];
      if (params.page !== undefined) paramArray.push(`page=${params.page}`);
      if (params.size !== undefined) paramArray.push(`size=${params.size}`);
      if (params.tipo) paramArray.push(`tipo=${params.tipo}`);
      if (params.activos !== undefined) paramArray.push(`activos=${params.activos}`);
      if (params.search) paramArray.push(`search=${params.search}`);
      if (paramArray.length > 0) {
        queryParams = '?' + paramArray.join('&');
      }
    }
    return this.apiService.get(`proveedores${queryParams}`);
  }

  /**
   * Obtener un proveedor por ID
   */
  getProveedorById(id: string): Observable<Proveedor> {
    return this.apiService.get<Proveedor>(`proveedores/${id}`);
  }

  /**
   * Crear un nuevo proveedor
   */
  createProveedor(proveedor: Proveedor): Observable<Proveedor> {
    return this.apiService.post<Proveedor>('proveedores', proveedor);
  }

  /**
   * Actualizar un proveedor existente
   */
  updateProveedor(id: string, proveedor: Proveedor): Observable<Proveedor> {
    return this.apiService.put<Proveedor>(`proveedores/${id}`, proveedor);
  }

  /**
   * Eliminar un proveedor
   */
  deleteProveedor(id: string): Observable<void> {
    return this.apiService.delete<void>(`proveedores/${id}`);
  }

  /**
   * Obtener estadísticas de proveedores
   */
  getStats(): Observable<ProveedorStats> {
    return this.apiService.get<ProveedorStats>('proveedores/stats');
  }

  /**
   * Obtener top proveedores
   */
  getTopProveedores(limit: number = 5): Observable<TopProveedor[]> {
    return this.apiService.get<TopProveedor[]>(`proveedores/top?limit=${limit}`);
  }

  /**
   * Buscar proveedores
   */
  searchProveedores(searchTerm: string): Observable<Proveedor[]> {
    return this.apiService.get<Proveedor[]>(`proveedores?search=${searchTerm}`);
  }

  /**
   * Validar formato de email
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar formato de RUC (11 dígitos)
   */
  isValidRUC(ruc: string): boolean {
    const rucRegex = /^\d{11}$/;
    return rucRegex.test(ruc);
  }

  /**
   * Obtener color para estado
   */
  getEstadoColor(activo: boolean): string {
    return activo ? '#4CAF50' : '#6c757d';
  }

  /**
   * Obtener badge para tipo
   */
  getTipoBadge(tipo: string): string {
    return tipo === 'NACIONAL' ? 'badge-primary' : 'badge-success';
  }

  /**
   * Formatear días de pago
   */
  formatDiasPago(dias: number): string {
    if (dias === 0) return 'Pago inmediato';
    if (dias === 1) return '1 día';
    if (dias < 7) return `${dias} días`;
    if (dias < 30) {
      const semanas = Math.floor(dias / 7);
      return `${semanas} semana${semanas > 1 ? 's' : ''}`;
    }
    const meses = Math.floor(dias / 30);
    return `${meses} mes${meses > 1 ? 'es' : ''}`;
  }

  /**
   * Exportar proveedores a CSV
   */
  exportToCSV(proveedores: Proveedor[]): string {
    const headers = [
      'ID', 'Nombre', 'Empresa', 'Email', 'Teléfono', 'Dirección',
      'Tipo', 'RUC/NIT', 'País', 'Ciudad', 'Días Pago', 'Descuento', 'Estado'
    ];

    const csvContent = [
      headers.join(','),
      ...proveedores.map(p => [
        p.id,
        p.nombre,
        p.empresa,
        p.email,
        p.telefono,
        `"${p.direccion}"`,
        p.tipo,
        p.rucNit,
        p.pais,
        p.ciudad,
        p.diasPago,
        p.descuentoGeneral,
        p.isActive ? 'Activo' : 'Inactivo'
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Descargar archivo CSV
   */
  downloadCSV(content: string, filename: string = 'proveedores.csv'): void {
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
