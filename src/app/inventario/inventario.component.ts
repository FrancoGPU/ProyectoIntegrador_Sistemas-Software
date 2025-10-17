import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { InventarioService, Product, InventoryFilters, InventoryStats } from '../services/inventario.service';

@Component({
  selector: 'app-inventario',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estado de la aplicación
  products: Product[] = [];
  stats = {
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    categories: 0
  };
  
  // Estado de la UI
  searchTerm: string = '';
  selectedCategory: string = '';
  showModal: boolean = false;
  isEditing: boolean = false;
  currentProduct: Product = this.getEmptyProduct();
  
  // Estados de carga
  loading = false;
  loadingStats = false;
  
  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalProducts = 0;
  totalPages = 0;
  
  // Filtros
  filter: { busqueda?: string; categoria?: string; stockBajo?: boolean } = {};

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.loading = true;
    
    // Preparar filtros
    const filters: InventoryFilters = {
      page: this.currentPage,
      limit: this.pageSize
    };
    
    if (this.searchTerm.trim()) {
      filters.search = this.searchTerm.trim();
    }
    if (this.selectedCategory && this.selectedCategory !== 'todos') {
      filters.category = this.selectedCategory;
    }
    
    this.inventarioService.getProducts(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Backend response:', response); // Debug log
          
          // Validamos que la respuesta exista
          if (!response) {
            console.error('Response is null or undefined');
            this.loadFallbackData();
            return;
          }
          
          // Adaptamos la respuesta del backend Java: {total, size, totalPages, page, products}
          this.products = response.products || response.data || [];
          this.totalProducts = response.total || 0;
          this.totalPages = response.totalPages || 1;
          this.currentPage = response.page || 0;
          this.loading = false;
          
          // Calcular estadísticas después de cargar productos
          this.calculateLocalStats();
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
          this.loading = false;
          // Usar datos de fallback en caso de error
          this.loadFallbackData();
        }
      });
  }



  loadFallbackData(): void {
    // Datos de fallback para cuando el backend no esté disponible
    this.products = [
      {
        _id: '1',
        code: 'ASU001',
        name: 'Ordenador ASUS',
        description: 'Ordenador de alto rendimiento para oficina',
        category: 'Tecnología',
        stock: 25,
        minStock: 10,
        price: 3500,
        isActive: true
      },
      {
        _id: '2',
        code: 'OFF001',
        name: 'Silla Ergonómica',
        description: 'Silla de oficina con soporte lumbar',
        category: 'Oficina',
        stock: 8,
        minStock: 15,
        price: 450,
        isActive: true
      },
      {
        _id: '3',
        code: 'TEC001',
        name: 'Monitor LED 24"',
        description: 'Monitor LED Full HD para computadora',
        category: 'Tecnología',
        stock: 32,
        minStock: 12,
        price: 850,
        isActive: true
      },
      {
        _id: '4',
        code: 'IND001',
        name: 'Estantería Metálica',
        description: 'Estantería industrial para almacén',
        category: 'Industrial',
        stock: 5,
        minStock: 8,
        price: 1200,
        isActive: true
      },
      {
        _id: '5',
        code: 'CON001',
        name: 'Papel Bond A4',
        description: 'Resma de papel bond tamaño A4',
        category: 'Consumo',
        stock: 150,
        minStock: 50,
        price: 25,
        isActive: true
      }
    ];
    this.totalProducts = this.products.length;
    this.loading = false;
    this.calculateLocalStats();
  }

  calculateLocalStats(): void {
    console.log('Calculando estadísticas con productos:', this.products);
    console.log('Total de productos desde backend:', this.totalProducts);
    
    // Calcular el valor total con los productos actuales en la página
    const totalValue = this.products.reduce((total, product) => {
      const productValue = product.stock * product.price;
      console.log(`Producto: ${product.name}, Stock: ${product.stock}, Precio: ${product.price}, Valor: ${productValue}`);
      return total + productValue;
    }, 0);
    
    console.log('Valor total calculado:', totalValue);
    
    // Contar productos con stock bajo
    const lowStockCount = this.products.filter(product => {
      const isLowStock = product.stock <= product.minStock;
      if (isLowStock) {
        console.log(`Stock bajo detectado: ${product.name} (${product.stock} <= ${product.minStock})`);
      }
      return isLowStock;
    }).length;
    
    // Usar el total del backend, no solo los productos de la página actual
    this.stats = {
      totalProducts: this.totalProducts || this.products.length,
      totalValue: totalValue,
      lowStock: lowStockCount,
      categories: [...new Set(this.products.map(p => p.category))].length
    };
    
    console.log('Estadísticas finales:', this.stats);
  }

  getEmptyProduct(): Product {
    return {
      code: '',
      name: '',
      description: '',
      category: 'Tecnología',
      stock: 0,
      minStock: 0,
      price: 0,
      isActive: true
    };
  }

  // Helper para obtener el ID del producto (compatible con ambos formatos)
  getProductId(product: Product): string | undefined {
    return product.id || product._id;
  }

  // Métodos de búsqueda y filtrado
  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  // Métodos de paginación
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  // Métodos de utilidad para la UI
  getCategoryClass(category: string): string {
    const classes: { [key: string]: string } = {
      'Tecnología': 'tech',
      'Oficina': 'office',
      'Industrial': 'industrial',
      'Consumo': 'consumer',
      'Otros': 'others'
    };
    return classes[category] || 'others';
  }

  getStatusClass(product: Product): string {
    if (product.stock <= product.minStock) {
      return 'low-stock';
    } else if (product.stock <= product.minStock * 1.5) {
      return 'medium-stock';
    }
    return 'good-stock';
  }

  getStatusText(product: Product): string {
    if (product.stock <= product.minStock) {
      return 'Stock Bajo';
    } else if (product.stock <= product.minStock * 1.5) {
      return 'Stock Medio';
    }
    return 'Stock Bueno';
  }

  // Métodos del modal
  openAddProductModal(): void {
    this.isEditing = false;
    this.currentProduct = this.getEmptyProduct();
    this.showModal = true;
  }

  editProduct(product: Product): void {
    this.isEditing = true;
    this.currentProduct = { ...product };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentProduct = this.getEmptyProduct();
  }

  // Métodos CRUD
  saveProduct(): void {
    if (this.isValidProduct()) {
      const productId = this.getProductId(this.currentProduct);
      if (this.isEditing && productId) {
        this.updateProductApi(productId, this.currentProduct);
      } else {
        this.createProductApi(this.currentProduct);
      }
    }
  }

  createProductApi(product: Product): void {
    this.inventarioService.createProduct(product)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newProduct) => {
          this.loadProducts();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al crear producto:', error);
          alert('Error al crear el producto. Intente nuevamente.');
        }
      });
  }

  updateProductApi(id: string, product: Product): void {
    this.inventarioService.updateProduct(id, product)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedProduct) => {
          this.loadProducts();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al actualizar producto:', error);
          alert('Error al actualizar el producto. Intente nuevamente.');
        }
      });
  }

  updateStock(product: Product): void {
    const newStock = prompt(`Ingrese el nuevo stock para ${product.name}:`, product.stock.toString());
    const productId = this.getProductId(product);
    if (newStock !== null && !isNaN(Number(newStock)) && productId) {
      const updatedProduct = { ...product, stock: Number(newStock) };
      this.updateProductApi(productId, updatedProduct);
    }
  }

  deleteProduct(product: Product): void {
    const productId = this.getProductId(product);
    if (confirm(`¿Está seguro de eliminar el producto ${product.name}?`) && productId) {
      this.inventarioService.deleteProduct(productId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadProducts();
          },
          error: (error) => {
            console.error('Error al eliminar producto:', error);
            alert('Error al eliminar el producto. Intente nuevamente.');
          }
        });
    }
  }

  private isValidProduct(): boolean {
    return this.currentProduct.code.trim() !== '' &&
           this.currentProduct.name.trim() !== '' &&
           this.currentProduct.category &&
           this.currentProduct.price > 0 &&
           this.currentProduct.stock >= 0 &&
           this.currentProduct.minStock >= 0;
  }

  // Métodos de formato
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('es-PE').format(num);
  }
}
