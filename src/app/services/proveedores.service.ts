import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Proveedor {
  _id?: string;
  codigo: string;
  nombre: string;
  contactoPrincipal: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  pais: string;
  ruc?: string;
  razonSocial?: string;
  categoria: string;
  fechaRegistro: Date;
  ultimaCompra?: Date;
  totalCompras: number;
  creditoDisponible: number;
  estado: 'activo' | 'inactivo' | 'suspendido';
  calificacion: number; // Del 1 al 5
  tiempoEntregaPromedio: number; // En días
  metodoPagoPreferido: string;
  descuentoNegociado: number;
  notas?: string;
  // Productos que suministra
  productos?: string[];
  // Coordenadas para logística
  coordenadas?: {
    lat: number;
    lng: number;
  };
}

export interface ProveedorFilter {
  busqueda?: string;
  categoria?: string;
  estado?: 'activo' | 'inactivo' | 'suspendido' | 'todos';
  ciudad?: string;
  calificacionMinima?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  montoMinimo?: number;
  montoMaximo?: number;
}

export interface ProveedorStats {
  total: number;
  activos: number;
  categorias: number;
  nuevosEsteMes: number;
  comprasPromedio: number;
  calificacionPromedio: number;
  tiempoEntregaPromedio: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  constructor(private apiService: ApiService) {}

  /**
   * Obtener todos los proveedores con filtros opcionales
   */
  getProveedores(filter?: ProveedorFilter, page = 1, limit = 20): Observable<{
    proveedores: Proveedor[];
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
      proveedores: Proveedor[];
      total: number;
      page: number;
      totalPages: number;
    }>('proveedores', params);
  }

  /**
   * Obtener proveedor por ID
   */
  getProveedorById(id: string): Observable<Proveedor> {
    return this.apiService.get<Proveedor>(`proveedores/${id}`);
  }

  /**
   * Crear nuevo proveedor
   */
  createProveedor(proveedor: Omit<Proveedor, '_id' | 'fechaRegistro' | 'totalCompras'>): Observable<Proveedor> {
    return this.apiService.post<Proveedor>('proveedores', proveedor);
  }

  /**
   * Actualizar proveedor
   */
  updateProveedor(id: string, proveedor: Partial<Proveedor>): Observable<Proveedor> {
    return this.apiService.put<Proveedor>(`proveedores/${id}`, proveedor);
  }

  /**
   * Eliminar proveedor
   */
  deleteProveedor(id: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`proveedores/${id}`);
  }

  /**
   * Obtener estadísticas de proveedores
   */
  getProveedoresStats(): Observable<ProveedorStats> {
    return this.apiService.get<ProveedorStats>('proveedores/stats');
  }

  /**
   * Buscar proveedores por texto
   */
  searchProveedores(query: string): Observable<Proveedor[]> {
    return this.apiService.get<Proveedor[]>('proveedores/search', { q: query });
  }

  /**
   * Obtener categorías de proveedores
   */
  getCategorias(): Observable<string[]> {
    return this.apiService.get<string[]>('proveedores/categorias');
  }

  /**
   * Obtener proveedores por categoría
   */
  getProveedoresPorCategoria(): Observable<{ categoria: string; cantidad: number }[]> {
    return this.apiService.get<{ categoria: string; cantidad: number }[]>('proveedores/por-categoria');
  }

  /**
   * Calificar proveedor
   */
  calificarProveedor(id: string, calificacion: number, comentario?: string): Observable<Proveedor> {
    return this.apiService.post<Proveedor>(`proveedores/${id}/calificar`, {
      calificacion,
      comentario
    });
  }

  /**
   * Validar datos del proveedor
   */
  validateProveedor(proveedor: Partial<Proveedor>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validaciones requeridas
    if (!proveedor.nombre?.trim()) {
      errors.push('El nombre es requerido');
    }
    if (!proveedor.contactoPrincipal?.trim()) {
      errors.push('El contacto principal es requerido');
    }
    if (!proveedor.email?.trim()) {
      errors.push('El email es requerido');
    } else if (!this.isValidEmail(proveedor.email)) {
      errors.push('El email no tiene un formato válido');
    }
    if (!proveedor.telefono?.trim()) {
      errors.push('El teléfono es requerido');
    }
    if (!proveedor.direccion?.trim()) {
      errors.push('La dirección es requerida');
    }
    if (!proveedor.ciudad?.trim()) {
      errors.push('La ciudad es requerida');
    }
    if (!proveedor.categoria?.trim()) {
      errors.push('La categoría es requerida');
    }

    // Validaciones de formato
    if (proveedor.ruc && !this.isValidRUC(proveedor.ruc)) {
      errors.push('El RUC no tiene un formato válido');
    }
    if (proveedor.calificacion && (proveedor.calificacion < 1 || proveedor.calificacion > 5)) {
      errors.push('La calificación debe estar entre 1 y 5');
    }
    if (proveedor.creditoDisponible && proveedor.creditoDisponible < 0) {
      errors.push('El crédito disponible no puede ser negativo');
    }
    if (proveedor.descuentoNegociado && (proveedor.descuentoNegociado < 0 || proveedor.descuentoNegociado > 100)) {
      errors.push('El descuento debe estar entre 0 y 100%');
    }
    if (proveedor.tiempoEntregaPromedio && proveedor.tiempoEntregaPromedio < 0) {
      errors.push('El tiempo de entrega no puede ser negativo');
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
   * Validar formato de RUC (Perú)
   */
  private isValidRUC(ruc: string): boolean {
    const rucRegex = /^\d{11}$/;
    return rucRegex.test(ruc);
  }

  /**
   * Generar código único para proveedor
   */
  generateProveedorCode(nombre: string): string {
    const timestamp = Date.now().toString().slice(-4);
    const initials = nombre.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 3);
    return `PR-${initials}${timestamp}`;
  }

  /**
   * Obtener color para calificación
   */
  getCalificacionColor(calificacion: number): string {
    if (calificacion >= 4.5) return '#4CAF50';
    if (calificacion >= 3.5) return '#FF9800';
    if (calificacion >= 2.5) return '#FFC107';
    return '#F44336';
  }

  /**
   * Obtener estrellas para calificación
   */
  getEstrellas(calificacion: number): string {
    const estrellasLlenas = '⭐'.repeat(Math.floor(calificacion));
    const estrellasVacias = '☆'.repeat(5 - Math.floor(calificacion));
    return estrellasLlenas + estrellasVacias;
  }

  /**
   * Obtener color para estado
   */
  getEstadoColor(estado: string): string {
    const colors: { [key: string]: string } = {
      'activo': '#4CAF50',
      'inactivo': '#6c757d',
      'suspendido': '#F44336'
    };
    return colors[estado] || '#6c757d';
  }

  /**
   * Calcular antiguedad del proveedor
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
   * Formatear tiempo de entrega
   */
  formatTiempoEntrega(dias: number): string {
    if (dias < 1) {
      return 'Mismo día';
    } else if (dias === 1) {
      return '1 día';
    } else if (dias < 7) {
      return `${Math.round(dias)} días`;
    } else if (dias < 30) {
      const semanas = Math.floor(dias / 7);
      return `${semanas} semana${semanas > 1 ? 's' : ''}`;
    } else {
      const meses = Math.floor(dias / 30);
      return `${meses} mes${meses > 1 ? 'es' : ''}`;
    }
  }

  /**
   * Obtener nivel de confiabilidad
   */
  getNivelConfiabilidad(calificacion: number, tiempoEntrega: number): string {
    const scoreCalificacion = calificacion / 5 * 50; // 50% peso calificación
    const scoreTiempo = Math.max(0, 50 - (tiempoEntrega - 1) * 5); // 50% peso tiempo
    const scoreTotal = scoreCalificacion + scoreTiempo;

    if (scoreTotal >= 80) return 'Excelente';
    if (scoreTotal >= 60) return 'Bueno';
    if (scoreTotal >= 40) return 'Regular';
    return 'Necesita mejora';
  }

  /**
   * Geocodificar dirección del proveedor
   */
  geocodeProveedor(proveedor: Proveedor): Observable<{ lat: number; lng: number }> {
    const direccionCompleta = `${proveedor.direccion}, ${proveedor.ciudad}, ${proveedor.pais}`;
    return this.apiService.post<{ lat: number; lng: number }>('proveedores/geocode', {
      direccion: direccionCompleta
    });
  }

  /**
   * Obtener proveedores por producto
   */
  getProveedoresPorProducto(productoId: string): Observable<Proveedor[]> {
    return this.apiService.get<Proveedor[]>(`proveedores/por-producto/${productoId}`);
  }

  /**
   * Exportar proveedores a CSV
   */
  exportToCSV(proveedores: Proveedor[]): string {
    const headers = [
      'Código', 'Nombre', 'Contacto', 'Email', 'Teléfono', 'Categoría',
      'Dirección', 'Ciudad', 'Estado', 'Calificación', 'Tiempo Entrega', 'Total Compras'
    ];

    const csvContent = [
      headers.join(','),
      ...proveedores.map(proveedor => [
        proveedor.codigo,
        proveedor.nombre,
        proveedor.contactoPrincipal,
        proveedor.email,
        proveedor.telefono,
        proveedor.categoria,
        `"${proveedor.direccion}"`,
        proveedor.ciudad,
        proveedor.estado,
        proveedor.calificacion,
        proveedor.tiempoEntregaPromedio,
        proveedor.totalCompras
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Obtener recomendaciones de proveedores
   */
  getRecomendaciones(categoria?: string, limite = 5): Observable<Proveedor[]> {
    const params: any = { limite };
    if (categoria) params.categoria = categoria;
    
    return this.apiService.get<Proveedor[]>('proveedores/recomendaciones', params);
  }
}