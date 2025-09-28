import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
}

@Component({
  selector: 'app-inventario',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent {
  products: Product[] = [
    {
      id: 1,
      code: 'ASU001',
      name: 'Ordenador ASUS',
      description: 'Ordenador de alto rendimiento para oficina',
      category: 'Tecnología',
      stock: 25,
      minStock: 10,
      price: 3500
    },
    {
      id: 2,
      code: 'OFF001',
      name: 'Silla Ergonómica',
      description: 'Silla de oficina con soporte lumbar',
      category: 'Oficina',
      stock: 8,
      minStock: 15,
      price: 450
    },
    {
      id: 3,
      code: 'TEC001',
      name: 'Monitor LED 24"',
      description: 'Monitor LED Full HD para computadora',
      category: 'Tecnología',
      stock: 32,
      minStock: 12,
      price: 850
    },
    {
      id: 4,
      code: 'IND001',
      name: 'Estantería Metálica',
      description: 'Estantería industrial para almacén',
      category: 'Industrial',
      stock: 5,
      minStock: 8,
      price: 1200
    },
    {
      id: 5,
      code: 'CON001',
      name: 'Papel Bond A4',
      description: 'Resma de papel bond tamaño A4',
      category: 'Consumo',
      stock: 150,
      minStock: 50,
      price: 25
    }
  ];

  searchTerm: string = '';
  selectedCategory: string = '';
  showModal: boolean = false;
  isEditing: boolean = false;
  currentProduct: Product = this.getEmptyProduct();

  getEmptyProduct(): Product {
    return {
      id: 0,
      code: '',
      name: '',
      description: '',
      category: '',
      stock: 0,
      minStock: 0,
      price: 0
    };
  }

  getTotalProducts(): number {
    return this.products.length;
  }

  getTotalValue(): number {
    return this.products.reduce((total, product) => total + (product.stock * product.price), 0);
  }

  getLowStockCount(): number {
    return this.products.filter(product => product.stock <= product.minStock).length;
  }

  getAvailableCount(): number {
    return this.products.filter(product => product.stock > product.minStock).length;
  }

  getFilteredProducts(): Product[] {
    return this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           product.code.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  getCategoryClass(category: string): string {
    const classes: { [key: string]: string } = {
      'Tecnología': 'tech',
      'Oficina': 'office',
      'Industrial': 'industrial',
      'Consumo': 'consumer'
    };
    return classes[category] || '';
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

  updateStock(product: Product): void {
    const newStock = prompt(`Ingrese el nuevo stock para ${product.name}:`, product.stock.toString());
    if (newStock !== null && !isNaN(Number(newStock))) {
      const productIndex = this.products.findIndex(p => p.id === product.id);
      if (productIndex !== -1) {
        this.products[productIndex].stock = Number(newStock);
      }
    }
  }

  deleteProduct(product: Product): void {
    if (confirm(`¿Está seguro de eliminar el producto ${product.name}?`)) {
      this.products = this.products.filter(p => p.id !== product.id);
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.currentProduct = this.getEmptyProduct();
  }

  saveProduct(): void {
    if (this.isValidProduct()) {
      if (this.isEditing) {
        const productIndex = this.products.findIndex(p => p.id === this.currentProduct.id);
        if (productIndex !== -1) {
          this.products[productIndex] = { ...this.currentProduct };
        }
      } else {
        this.currentProduct.id = this.getNextId();
        this.products.push({ ...this.currentProduct });
      }
      this.closeModal();
    }
  }

  private isValidProduct(): boolean {
    return this.currentProduct.code.trim() !== '' &&
           this.currentProduct.name.trim() !== '' &&
           this.currentProduct.category !== '' &&
           this.currentProduct.price > 0 &&
           this.currentProduct.stock >= 0 &&
           this.currentProduct.minStock >= 0;
  }

  private getNextId(): number {
    return Math.max(...this.products.map(p => p.id), 0) + 1;
  }
}
