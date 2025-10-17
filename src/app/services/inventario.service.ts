import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Product {
  id?: string;
  _id?: string;  // Mantener compatibilidad
  code: string;
  name: string;
  description?: string;
  category: 'Tecnología' | 'Oficina' | 'Industrial' | 'Consumo' | 'Otros';
  stock: number;
  minStock: number;
  price: number;
  supplier?: string;
  location?: string;
  isActive?: boolean;
  stockStatus?: 'low' | 'medium' | 'good';
  totalValue?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface InventoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  stockStatus?: 'low' | 'medium' | 'good';
}

export interface InventoryStats {
  general: {
    totalProducts: number;
    totalValue: number;
    totalStock: number;
    lowStockCount: number;
    avgPrice: number;
  };
  byCategory: Array<{
    _id: string;
    count: number;
    totalValue: number;
  }>;
}

export interface PaginatedProducts {
  data: Product[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  constructor(private apiService: ApiService) {}

  /**
   * Obtener todos los productos con filtros y paginación
   */
  getProducts(filters: InventoryFilters = {}): Observable<any> {
    return this.apiService.get<any>('inventario', filters);
  }

  /**
   * Obtener estadísticas del inventario
   * NOTA: Temporalmente deshabilitado hasta implementar en backend Java
   */
  // getInventoryStats(): Observable<InventoryStats> {
  //   return this.apiService.get<InventoryStats>('inventario/stats');
  // }

  /**
   * Obtener un producto por ID
   */
  getProductById(id: string): Observable<Product> {
    return this.apiService.get<Product>(`inventario/${id}`);
  }

  /**
   * Crear un nuevo producto
   */
  createProduct(product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Observable<Product> {
    return this.apiService.post<Product>('inventario', product);
  }

  /**
   * Actualizar un producto
   */
  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.apiService.put<Product>(`inventario/${id}`, product);
  }

  /**
   * Actualizar solo el stock de un producto
   */
  updateStock(id: string, stock: number): Observable<Product> {
    return this.apiService.patch<Product>(`inventario/${id}`, { stock });
  }

  /**
   * Eliminar un producto (soft delete)
   */
  deleteProduct(id: string): Observable<any> {
    return this.apiService.delete(`inventario/${id}`);
  }

  /**
   * Obtener productos con stock bajo
   */
  getLowStockProducts(): Observable<Product[]> {
    return this.apiService.get<Product[]>('inventario/low-stock');
  }

  /**
   * Obtener categorías disponibles
   */
  getCategories(): string[] {
    return ['Tecnología', 'Oficina', 'Industrial', 'Consumo', 'Otros'];
  }

  /**
   * Validar código de producto
   */
  validateProductCode(code: string): boolean {
    return /^[A-Z0-9]{3,10}$/.test(code);
  }

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  }

  /**
   * Obtener clase CSS para estado del stock
   */
  getStockStatusClass(product: Product): string {
    if (product.stock <= product.minStock) {
      return 'low-stock';
    } else if (product.stock <= product.minStock * 1.5) {
      return 'medium-stock';
    }
    return 'good-stock';
  }

  /**
   * Obtener texto del estado del stock
   */
  getStockStatusText(product: Product): string {
    if (product.stock <= product.minStock) {
      return 'Stock Bajo';
    } else if (product.stock <= product.minStock * 1.5) {
      return 'Stock Medio';
    }
    return 'Stock Bueno';
  }
}

// Función auxiliar para mapping (si es necesaria)
function map<T, R>(fn: (value: T) => R) {
  return (source: Observable<T>): Observable<R> => {
    return new Observable<R>(observer => {
      return source.subscribe({
        next: value => observer.next(fn(value)),
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  };
}