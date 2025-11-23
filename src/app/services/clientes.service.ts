import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Cliente {
  id?: string;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion: string;
  categoria: string; // "Regular", "Premium", "Corporativo"
  fechaRegistro?: string;
  ultimaCompra?: string;
  totalCompras: number;
  isActive: boolean;
  notas?: string;
}

export interface ClienteFilter {
  busqueda?: string;
  categoria?: string;
  isActive?: boolean;
}

export interface ClienteStats {
  total: number;
  activos: number;
  premium: number;
  corporativo: number;
  regular: number;
  nuevosEsteMes: number;
  ventasPromedio: number;
  satisfaccionPromedio: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  constructor(private apiService: ApiService) {}

  /**
   * Obtener todos los clientes con filtros opcionales
   */
  getClientes(filter?: ClienteFilter, page = 1, limit = 20): Observable<{
    clientes: Cliente[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params: any = { page, limit };
    
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params[key] = value;
        }
      });
    }

    return this.apiService.get<{
      clientes: Cliente[];
      total: number;
      page: number;
      totalPages: number;
    }>('clientes', params);
  }

  /**
   * Obtener cliente por ID
   */
  getClienteById(id: string): Observable<Cliente> {
    return this.apiService.get<Cliente>(`clientes/${id}`);
  }

  /**
   * Crear nuevo cliente
   */
  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.apiService.post<Cliente>('clientes', cliente);
  }

  /**
   * Actualizar cliente
   */
  updateCliente(id: string, cliente: Partial<Cliente>): Observable<Cliente> {
    return this.apiService.put<Cliente>(`clientes/${id}`, cliente);
  }

  /**
   * Eliminar cliente
   */
  deleteCliente(id: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`clientes/${id}`);
  }

  /**
   * Obtener estadísticas de clientes
   */
  getClientesStats(): Observable<ClienteStats> {
    return this.apiService.get<ClienteStats>('clientes/stats');
  }

  /**
   * Buscar clientes por texto
   */
  searchClientes(query: string): Observable<Cliente[]> {
    return this.apiService.get<Cliente[]>('clientes/search', { q: query });
  }

  /**
   * Validar datos del cliente
   */
  validateCliente(cliente: Partial<Cliente>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validaciones requeridas
    if (!cliente.nombre?.trim()) {
      errors.push('El nombre es requerido');
    }
    if (!cliente.empresa?.trim()) {
      errors.push('La empresa es requerida');
    }
    if (!cliente.email?.trim()) {
      errors.push('El email es requerido');
    } else if (!this.isValidEmail(cliente.email)) {
      errors.push('El email no tiene un formato válido');
    }
    if (!cliente.telefono?.trim()) {
      errors.push('El teléfono es requerido');
    }
    if (!cliente.direccion?.trim()) {
      errors.push('La dirección es requerida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Obtener color para tipo de cliente
   */
  getCategoriaColor(categoria: string): string {
    const colors: { [key: string]: string } = {
      'Regular': '#6c757d',
      'Premium': '#ffc107',
      'Corporativo': '#007bff'
    };
    return colors[categoria] || '#6c757d';
  }

  /**
   * Obtener badge para tipo de cliente
   */
  getCategoriaBadge(categoria: string): string {
    const badges: { [key: string]: string } = {
      'Regular': '👤',
      'Premium': '⭐',
      'Corporativo': '🏢'
    };
    return badges[categoria] || '👤';
  }
}