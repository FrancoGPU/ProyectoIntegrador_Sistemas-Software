import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Cliente {
  id: number;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion: string;
  categoria: 'Premium' | 'Corporativo' | 'Regular';
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent {
  mostrarFormulario = false;
  clienteEditando: Cliente | null = null;
  
  clienteTemp: Cliente = {
    id: 0,
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: '',
    categoria: 'Regular'
  };

  clientes: Cliente[] = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      empresa: 'Corporación ABC',
      email: 'juan@abc.com',
      telefono: '987654321',
      direccion: 'Av. Principal 123',
      categoria: 'Premium'
    },
    {
      id: 2,
      nombre: 'María García',
      empresa: 'Industrias XYZ',
      email: 'maria@xyz.com',
      telefono: '987654322',
      direccion: 'Jr. Comercio 456',
      categoria: 'Corporativo'
    },
    {
      id: 3,
      nombre: 'Carlos López',
      empresa: 'Distribuidora 123',
      email: 'carlos@dist123.com',
      telefono: '987654323',
      direccion: 'Av. Industrial 789',
      categoria: 'Regular'
    },
    {
      id: 4,
      nombre: 'Ana Rodríguez',
      empresa: 'Comercial Sur',
      email: 'ana@sur.com',
      telefono: '987654324',
      direccion: 'Calle Lima 321',
      categoria: 'Premium'
    }
  ];

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.cancelarEdicion();
    }
  }

  guardarCliente() {
    if (this.clienteEditando) {
      // Actualizar cliente existente
      const index = this.clientes.findIndex(c => c.id === this.clienteEditando!.id);
      if (index !== -1) {
        this.clientes[index] = { ...this.clienteTemp };
      }
    } else {
      // Agregar nuevo cliente
      const nuevoId = Math.max(...this.clientes.map(c => c.id)) + 1;
      this.clientes.push({ ...this.clienteTemp, id: nuevoId });
    }
    
    this.cancelarEdicion();
    this.mostrarFormulario = false;
  }

  editarCliente(cliente: Cliente) {
    this.clienteEditando = cliente;
    this.clienteTemp = { ...cliente };
    this.mostrarFormulario = true;
  }

  eliminarCliente(id: number) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.clientes = this.clientes.filter(c => c.id !== id);
    }
  }

  cancelarEdicion() {
    this.clienteEditando = null;
    this.clienteTemp = {
      id: 0,
      nombre: '',
      empresa: '',
      email: '',
      telefono: '',
      direccion: '',
      categoria: 'Regular'
    };
  }

  contarPorCategoria(categoria: 'Premium' | 'Corporativo' | 'Regular'): number {
    return this.clientes.filter(c => c.categoria === categoria).length;
  }
}
