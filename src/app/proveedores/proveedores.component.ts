import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Proveedor {
  id: number;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion: string;
  categoria: 'Estratégico' | 'Preferido' | 'Estándar';
  calificacion: number;
  tiempoEntrega: number;
}

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.css'
})
export class ProveedoresComponent {
  mostrarFormulario = false;
  proveedorEditando: Proveedor | null = null;
  
  proveedorTemp: Proveedor = {
    id: 0,
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: '',
    categoria: 'Estándar',
    calificacion: 3,
    tiempoEntrega: 7
  };

  proveedores: Proveedor[] = [
    {
      id: 1,
      nombre: 'Roberto Silva',
      empresa: 'Transportes Rápidos SA',
      email: 'roberto@transportes.com',
      telefono: '987654321',
      direccion: 'Av. Logística 100',
      categoria: 'Estratégico',
      calificacion: 5,
      tiempoEntrega: 2
    },
    {
      id: 2,
      nombre: 'Carmen Torres',
      empresa: 'Almacenes Unidos',
      email: 'carmen@almacenes.com',
      telefono: '987654322',
      direccion: 'Jr. Industrial 250',
      categoria: 'Preferido',
      calificacion: 4,
      tiempoEntrega: 3
    },
    {
      id: 3,
      nombre: 'Miguel Herrera',
      empresa: 'Distribuciones Norte',
      email: 'miguel@norte.com',
      telefono: '987654323',
      direccion: 'Av. Norte 180',
      categoria: 'Estándar',
      calificacion: 3,
      tiempoEntrega: 5
    },
    {
      id: 4,
      nombre: 'Laura Mendoza',
      empresa: 'Logística Express',
      email: 'laura@express.com',
      telefono: '987654324',
      direccion: 'Calle Express 90',
      categoria: 'Estratégico',
      calificacion: 5,
      tiempoEntrega: 1
    },
    {
      id: 5,
      nombre: 'Diego Vargas',
      empresa: 'Servicios Integrales',
      email: 'diego@servicios.com',
      telefono: '987654325',
      direccion: 'Av. Servicios 300',
      categoria: 'Preferido',
      calificacion: 4,
      tiempoEntrega: 4
    }
  ];

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.cancelarEdicion();
    }
  }

  guardarProveedor() {
    if (this.proveedorEditando) {
      // Actualizar proveedor existente
      const index = this.proveedores.findIndex(p => p.id === this.proveedorEditando!.id);
      if (index !== -1) {
        this.proveedores[index] = { ...this.proveedorTemp };
      }
    } else {
      // Agregar nuevo proveedor
      const nuevoId = Math.max(...this.proveedores.map(p => p.id)) + 1;
      this.proveedores.push({ ...this.proveedorTemp, id: nuevoId });
    }
    
    this.cancelarEdicion();
    this.mostrarFormulario = false;
  }

  editarProveedor(proveedor: Proveedor) {
    this.proveedorEditando = proveedor;
    this.proveedorTemp = { ...proveedor };
    this.mostrarFormulario = true;
  }

  eliminarProveedor(id: number) {
    if (confirm('¿Está seguro de eliminar este proveedor?')) {
      this.proveedores = this.proveedores.filter(p => p.id !== id);
    }
  }

  cancelarEdicion() {
    this.proveedorEditando = null;
    this.proveedorTemp = {
      id: 0,
      nombre: '',
      empresa: '',
      email: '',
      telefono: '',
      direccion: '',
      categoria: 'Estándar',
      calificacion: 3,
      tiempoEntrega: 7
    };
  }

  contarPorCategoria(categoria: 'Estratégico' | 'Preferido' | 'Estándar'): number {
    return this.proveedores.filter(p => p.categoria === categoria).length;
  }

  calcularCalificacionPromedio(): number {
    if (this.proveedores.length === 0) return 0;
    const suma = this.proveedores.reduce((acc, p) => acc + p.calificacion, 0);
    return suma / this.proveedores.length;
  }

  calcularTiempoPromedio(): number {
    if (this.proveedores.length === 0) return 0;
    const suma = this.proveedores.reduce((acc, p) => acc + p.tiempoEntrega, 0);
    return suma / this.proveedores.length;
  }

  getStars(calificacion: number): { filled: boolean }[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push({ filled: i <= calificacion });
    }
    return stars;
  }
}
