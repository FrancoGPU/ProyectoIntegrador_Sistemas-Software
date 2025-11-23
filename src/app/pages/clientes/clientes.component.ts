import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientesService, Cliente } from '../../services/clientes.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  mostrarFormulario = false;
  clienteEditando: Cliente | null = null;
  loading = false;
  error: string | null = null;
  
  clienteTemp: Cliente = this.getEmptyCliente();

  clientes: Cliente[] = [];

  constructor(private clientesService: ClientesService) {}

  ngOnInit() {
    this.loadClientes();
  }

  getEmptyCliente(): Cliente {
    return {
      nombre: '',
      empresa: '',
      email: '',
      telefono: '',
      direccion: '',
      categoria: 'Regular',
      isActive: true,
      totalCompras: 0,
      notas: ''
    };
  }

  loadClientes() {
    this.loading = true;
    this.error = null;
    this.clientesService.getClientes().subscribe({
      next: (response) => {
        this.clientes = response.clientes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.error = 'No se pudieron cargar los clientes';
        this.loading = false;
      }
    });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.cancelarEdicion();
    }
  }

  guardarCliente() {
    if (this.clienteEditando && this.clienteEditando.id) {
      // Actualizar cliente existente
      this.clientesService.updateCliente(this.clienteEditando.id, this.clienteTemp).subscribe({
        next: () => {
          this.loadClientes();
          this.cancelarEdicion();
          this.mostrarFormulario = false;
        },
        error: (err) => {
          console.error('Error al actualizar cliente', err);
          alert('Error al actualizar cliente');
        }
      });
    } else {
      // Agregar nuevo cliente
      this.clientesService.createCliente(this.clienteTemp).subscribe({
        next: () => {
          this.loadClientes();
          this.cancelarEdicion();
          this.mostrarFormulario = false;
        },
        error: (err) => {
          console.error('Error al crear cliente', err);
          alert('Error al crear cliente');
        }
      });
    }
  }

  editarCliente(cliente: Cliente) {
    this.clienteEditando = cliente;
    this.clienteTemp = { ...cliente };
    this.mostrarFormulario = true;
  }

  eliminarCliente(id: string) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.clientesService.deleteCliente(id).subscribe({
        next: () => {
          this.loadClientes();
        },
        error: (err) => {
          console.error('Error al eliminar cliente', err);
          alert('Error al eliminar cliente');
        }
      });
    }
  }

  cancelarEdicion() {
    this.clienteEditando = null;
    this.clienteTemp = this.getEmptyCliente();
  }

  contarPorCategoria(categoria: string): number {
    return this.clientes.filter(c => c.categoria === categoria).length;
  }
  
  getCategoriaBadge(categoria: string): string {
    return this.clientesService.getCategoriaBadge(categoria);
  }
}
