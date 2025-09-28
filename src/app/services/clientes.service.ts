import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Cliente {
  _id?: string;
  codigo: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  empresa?: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  pais: string;
  tipoCliente: 'regular' | 'premium' | 'corporativo';
  fechaRegistro: Date;
  ultimaCompra?: Date;
  totalCompras: number;
  creditoDisponible: number;
  estado: 'activo' | 'inactivo' | 'suspendido';
  notas?: string;
  descuentoAplicable: number;
  metodoPagoPreferido: string;
  // Coordenadas para optimización de rutas
  coordenadas?: {
    lat: number;
    lng: number;
  };
}

export interface ClienteFilter {
  busqueda?: string;
  tipoCliente?: 'regular' | 'premium' | 'corporativo' | 'todos';
  estado?: 'activo' | 'inactivo' | 'suspendido' | 'todos';
  ciudad?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  montoMinimo?: number;
  montoMaximo?: number;
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
        if (value !== undefined && value !== null && value !== '' && value !== 'todos') {
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
  createCliente(cliente: Omit<Cliente, '_id' | 'fechaRegistro' | 'totalCompras'>): Observable<Cliente> {
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
   * Obtener clientes por ciudad
   */
  getClientesPorCiudad(): Observable<{ ciudad: string; cantidad: number }[]> {
    return this.apiService.get<{ ciudad: string; cantidad: number }[]>('clientes/por-ciudad');
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
    if (!cliente.apellido?.trim()) {
      errors.push('El apellido es requerido');
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
    if (!cliente.ciudad?.trim()) {
      errors.push('La ciudad es requerida');
    }
    if (!cliente.tipoCliente) {
      errors.push('El tipo de cliente es requerido');
    }

    // Validaciones de formato
    if (cliente.creditoDisponible && cliente.creditoDisponible < 0) {
      errors.push('El crédito disponible no puede ser negativo');
    }
    if (cliente.descuentoAplicable && (cliente.descuentoAplicable < 0 || cliente.descuentoAplicable > 100)) {
      errors.push('El descuento debe estar entre 0 y 100%');
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
   * Generar código único para cliente
   */
  generateClienteCode(nombre: string, apellido: string): string {
    const timestamp = Date.now().toString().slice(-4);
    const initials = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
    return `CL-${initials}${timestamp}`;
  }

  /**
   * Formatear nombre completo
   */
  formatNombreCompleto(cliente: Cliente): string {
    return `${cliente.nombre} ${cliente.apellido}`;
  }

  /**
   * Obtener color para tipo de cliente
   */
  getTipoClienteColor(tipo: string): string {
    const colors: { [key: string]: string } = {
      'regular': '#6c757d',
      'premium': '#ffc107',
      'corporativo': '#007bff'
    };
    return colors[tipo] || '#6c757d';
  }

  /**
   * Obtener badge para tipo de cliente
   */
  getTipoClienteBadge(tipo: string): string {
    const badges: { [key: string]: string } = {
      'regular': '👤',
      'premium': '⭐',
      'corporativo': '🏢'
    };
    return badges[tipo] || '👤';
  }

  /**
   * Calcular antiguedad del cliente
   */
  calcularAntiguedad(fechaRegistro: Date): string {
    const now = new Date();
    const registro = new Date(fechaRegistro);
    const diffTime = Math.abs(now.getTime() - registro.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} días`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mes${months > 1 ? 'es' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} año${years > 1 ? 's' : ''}`;
    }
  }

  /**
   * Geocodificar dirección del cliente
   */
  geocodeCliente(cliente: Cliente): Observable<{ lat: number; lng: number }> {
    const direccionCompleta = `${cliente.direccion}, ${cliente.ciudad}, ${cliente.pais}`;
    return this.apiService.post<{ lat: number; lng: number }>('clientes/geocode', {
      direccion: direccionCompleta
    });
  }

  /**
   * Obtener clientes para optimización de rutas
   */
  getClientesParaRutas(): Observable<Cliente[]> {
    return this.apiService.get<Cliente[]>('clientes/para-rutas');
  }

  /**
   * Exportar clientes a CSV
   */
  exportToCSV(clientes: Cliente[]): string {
    const headers = [
      'Código', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Empresa',
      'Dirección', 'Ciudad', 'Tipo Cliente', 'Estado', 'Total Compras', 'Fecha Registro'
    ];

    const csvContent = [
      headers.join(','),
      ...clientes.map(cliente => [
        cliente.codigo,
        cliente.nombre,
        cliente.apellido,
        cliente.email,
        cliente.telefono,
        cliente.empresa || '',
        `"${cliente.direccion}"`,
        cliente.ciudad,
        cliente.tipoCliente,
        cliente.estado,
        cliente.totalCompras,
        new Date(cliente.fechaRegistro).toLocaleDateString()
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}