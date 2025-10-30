import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductoPedido {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface LowStockWarning {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  requestedQuantity: number;
  resultingStock: number;
}

export interface StockValidationResult {
  hasLowStockWarnings: boolean;
  warnings: LowStockWarning[];
}

export interface Pedido {
  id?: string;
  clienteId: string;
  clienteNombre: string;
  clienteDireccion: string;
  clienteTelefono: string;
  productos: ProductoPedido[];
  direccionEntrega: string;
  observaciones?: string;
  estado?: string;
  usuarioAsignadoId?: string;
  usuarioAsignadoNombre?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  fechaAsignacion?: string;
  fechaEntrega?: string;
  total?: number;
}

export interface PedidoEstadisticas {
  disponibles: number;
  asignados: number;
  enCamino: number;
  entregados: number;
  cancelados: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private apiUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  // ==================== ENDPOINTS ADMIN ====================

  /**
   * Validar stock antes de crear pedido (ADMIN)
   */
  validarStock(productos: ProductoPedido[]): Observable<StockValidationResult> {
    return this.http.post<StockValidationResult>(`${this.apiUrl}/validar-stock`, productos);
  }

  /**
   * Crear nuevo pedido (ADMIN)
   */
  crearPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido);
  }

  /**
   * Obtener todos los pedidos (ADMIN)
   */
  obtenerTodos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  /**
   * Obtener pedido por ID (ADMIN)
   */
  obtenerPorId(id: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualizar pedido (ADMIN)
   */
  actualizarPedido(id: string, pedido: Pedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${id}`, pedido);
  }

  /**
   * Cancelar pedido (ADMIN)
   */
  cancelarPedido(id: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  /**
   * Eliminar pedido (ADMIN)
   */
  eliminarPedido(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener estadísticas (ADMIN)
   */
  obtenerEstadisticas(): Observable<PedidoEstadisticas> {
    return this.http.get<PedidoEstadisticas>(`${this.apiUrl}/estadisticas`);
  }

  /**
   * Obtener pedidos por estado (ADMIN)
   */
  obtenerPorEstado(estado: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/estado/${estado}`);
  }

  // ==================== ENDPOINTS USER ====================

  /**
   * Obtener pedidos disponibles (USER)
   */
  obtenerDisponibles(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/disponibles`);
  }

  /**
   * Tomar un pedido (USER)
   */
  tomarPedido(id: string): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.apiUrl}/${id}/tomar`, {});
  }

  /**
   * Obtener mis entregas (USER)
   */
  obtenerMisEntregas(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/mis-entregas`);
  }

  /**
   * Actualizar estado de mi pedido (USER)
   */
  actualizarEstado(id: string, nuevoEstado: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${id}/estado`, { nuevoEstado });
  }

  // ==================== UTILIDADES ====================

  /**
   * Obtener el color del badge según el estado
   */
  getEstadoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'DISPONIBLE': 'success',
      'ASIGNADO': 'info',
      'EN_CAMINO': 'warning',
      'ENTREGADO': 'primary',
      'CANCELADO': 'danger'
    };
    return colores[estado] || 'secondary';
  }

  /**
   * Obtener el texto traducido del estado
   */
  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'DISPONIBLE': 'Disponible',
      'ASIGNADO': 'Asignado',
      'EN_CAMINO': 'En Camino',
      'ENTREGADO': 'Entregado',
      'CANCELADO': 'Cancelado'
    };
    return textos[estado] || estado;
  }
}
