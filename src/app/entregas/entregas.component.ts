import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidosService, Pedido } from '../services/pedidos.service';

@Component({
  selector: 'app-entregas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entregas.component.html',
  styleUrl: './entregas.component.css'
})
export class EntregasComponent implements OnInit {
  pedidosDisponibles: Pedido[] = [];
  misEntregas: Pedido[] = [];
  cargando = false;
  mensajeError = '';

  constructor(private pedidosService: PedidosService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargarPedidosDisponibles();
    this.cargarMisEntregas();
  }

  cargarPedidosDisponibles(): void {
    this.cargando = true;
    this.pedidosService.obtenerDisponibles().subscribe({
      next: (data) => {
        this.pedidosDisponibles = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar pedidos disponibles:', error);
        this.mensajeError = 'Error al cargar pedidos disponibles';
        this.cargando = false;
      }
    });
  }

  cargarMisEntregas(): void {
    this.pedidosService.obtenerMisEntregas().subscribe({
      next: (data) => {
        this.misEntregas = data;
      },
      error: (error) => {
        console.error('Error al cargar mis entregas:', error);
      }
    });
  }

  tomarPedido(pedido: Pedido): void {
    if (confirm(`¿Deseas tomar el pedido para ${pedido.clienteNombre}?`)) {
      this.cargando = true;
      this.pedidosService.tomarPedido(pedido.id!).subscribe({
        next: () => {
          this.cargarDatos();
          this.mensajeError = '';
        },
        error: (error) => {
          console.error('Error al tomar pedido:', error);
          this.mensajeError = error.error?.error || 'Error al tomar el pedido';
          this.cargando = false;
        }
      });
    }
  }

  iniciarEntrega(pedido: Pedido): void {
    this.cargando = true;
    this.pedidosService.actualizarEstado(pedido.id!, 'EN_CAMINO').subscribe({
      next: () => {
        this.cargarDatos();
        this.mensajeError = '';
      },
      error: (error) => {
        console.error('Error al iniciar entrega:', error);
        this.mensajeError = 'Error al actualizar el estado';
        this.cargando = false;
      }
    });
  }

  marcarEntregado(pedido: Pedido): void {
    if (confirm(`¿Confirmas que el pedido para ${pedido.clienteNombre} fue entregado?`)) {
      this.cargando = true;
      this.pedidosService.actualizarEstado(pedido.id!, 'ENTREGADO').subscribe({
        next: () => {
          this.cargarDatos();
          this.mensajeError = '';
        },
        error: (error) => {
          console.error('Error al marcar como entregado:', error);
          this.mensajeError = 'Error al actualizar el estado';
          this.cargando = false;
        }
      });
    }
  }

  getEstadoColor(estado: string): string {
    return this.pedidosService.getEstadoColor(estado);
  }

  getEstadoTexto(estado: string): string {
    return this.pedidosService.getEstadoTexto(estado);
  }

  calcularTotalProductos(productos: any[]): number {
    return productos.reduce((sum, prod) => sum + prod.cantidad, 0);
  }
}
