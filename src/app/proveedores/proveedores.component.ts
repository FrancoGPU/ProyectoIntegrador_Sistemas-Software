import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProveedoresService, Proveedor } from '../services/proveedores.service';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.css'
})
export class ProveedoresComponent implements OnInit {
  mostrarFormulario = false;
  proveedorEditando: Proveedor | null = null;
  loading = false;
  error: string | null = null;
  
  proveedorTemp: Proveedor = this.getEmptyProveedor();

  proveedores: Proveedor[] = [];

  constructor(private proveedoresService: ProveedoresService) {}

  ngOnInit() {
    this.loadProveedores();
  }

  loadProveedores() {
    this.loading = true;
    this.error = null;
    
    this.proveedoresService.getProveedores({ page: 0, size: 50 }).subscribe({
      next: (response: any) => {
        console.log('Proveedores recibidos:', response);
        // El backend devuelve un objeto con la propiedad 'proveedores'
        this.proveedores = response.proveedores || response.content || response;
        console.log('Proveedores parseados:', this.proveedores);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        this.error = 'No se pudieron cargar los proveedores. Verifica que el backend esté corriendo.';
        this.loading = false;
      }
    });
  }

  getEmptyProveedor(): Proveedor {
    return {
      nombre: '',
      empresa: '',
      email: '',
      telefono: '',
      direccion: '',
      tipo: 'Nacional',
      rucNit: '',
      pais: 'Perú',
      ciudad: '',
      diasPago: 30,
      descuentoGeneral: 0,
      isActive: true
    };
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.cancelarEdicion();
    }
  }

  guardarProveedor() {
    if (this.proveedorEditando && this.proveedorEditando.id) {
      // Actualizar proveedor existente
      this.proveedoresService.updateProveedor(this.proveedorEditando.id, this.proveedorTemp).subscribe({
        next: () => {
          this.loadProveedores();
          this.cancelarEdicion();
          this.mostrarFormulario = false;
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          alert('No se pudo actualizar el proveedor');
        }
      });
    } else {
      // Agregar nuevo proveedor
      this.proveedoresService.createProveedor(this.proveedorTemp).subscribe({
        next: () => {
          this.loadProveedores();
          this.cancelarEdicion();
          this.mostrarFormulario = false;
        },
        error: (error) => {
          console.error('Error al crear:', error);
          alert('No se pudo crear el proveedor');
        }
      });
    }
  }

  editarProveedor(proveedor: Proveedor) {
    this.proveedorEditando = proveedor;
    this.proveedorTemp = { ...proveedor };
    this.mostrarFormulario = true;
  }

  eliminarProveedor(id: string) {
    if (confirm('¿Está seguro de eliminar este proveedor?')) {
      this.proveedoresService.deleteProveedor(id).subscribe({
        next: () => {
          this.loadProveedores();
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          alert('No se pudo eliminar el proveedor');
        }
      });
    }
  }

  cancelarEdicion() {
    this.proveedorEditando = null;
    this.proveedorTemp = this.getEmptyProveedor();
  }

  contarPorTipo(tipo: string): number {
    return this.proveedores.filter(p => p.tipo === tipo).length;
  }

  calcularDiasPagoPromedio(): number {
    if (this.proveedores.length === 0) return 0;
    const suma = this.proveedores.reduce((acc, p) => acc + p.diasPago, 0);
    return Math.round(suma / this.proveedores.length);
  }

  calcularDescuentoPromedio(): number {
    if (this.proveedores.length === 0) return 0;
    const suma = this.proveedores.reduce((acc, p) => acc + p.descuentoGeneral, 0);
    return Math.round((suma / this.proveedores.length) * 10) / 10;
  }

  getStars(rating: number = 0): { filled: boolean }[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push({ filled: i <= rating });
    }
    return stars;
  }
}
