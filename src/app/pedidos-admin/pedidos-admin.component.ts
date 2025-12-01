import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidosService, Pedido, ProductoPedido, PedidoEstadisticas } from '../services/pedidos.service';
import { ClientesService } from '../services/clientes.service';
import { InventarioService } from '../services/inventario.service';
import { RutasService, Ruta } from '../services/rutas.service';
import { ConfirmModalComponent } from '../shared/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './pedidos-admin.component.html',
  styleUrl: './pedidos-admin.component.css'
})
export class PedidosAdminComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  clientes: any[] = [];
  productos: any[] = [];
  rutas: Ruta[] = [];
  estadisticas?: PedidoEstadisticas;

  // Filtros
  filtroEstado: string = 'TODOS';
  filtroBusqueda: string = '';

  // Modal
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  pedidoActual: Pedido = this.nuevoPedidoVacio();
  rutaSeleccionadaId: string = ''; // Para el select de rutas

  // Modal de advertencia personalizado
  modalAdvertenciaVisible: boolean = false;
  advertenciaResultado: any = null;

  // Productos del pedido
  productosSeleccionados: ProductoPedido[] = [];
  productoTemp = {
    productoId: '',
    nombre: '',
    cantidad: 1,
    precioUnitario: 0
  };

  constructor(
    private pedidosService: PedidosService,
    private clientesService: ClientesService,
    private inventarioService: InventarioService,
    private rutasService: RutasService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargarPedidos();
    this.cargarEstadisticas();
    this.cargarClientes();
    this.cargarProductos();
    this.cargarRutas();
  }

  cargarRutas(): void {
    this.rutasService.getRutas({ page: 0, size: 100 }).subscribe({
      next: (response: any) => {
        this.rutas = response.rutas || response.content || response;
        console.log('Rutas cargadas:', this.rutas.length);
      },
      error: (error) => console.error('Error al cargar rutas:', error)
    });
  }

  cargarPedidos(): void {
    this.pedidosService.obtenerTodos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.aplicarFiltros();
      },
      error: (error) => console.error('Error al cargar pedidos:', error)
    });
  }

  cargarEstadisticas(): void {
    this.pedidosService.obtenerEstadisticas().subscribe({
      next: (data) => this.estadisticas = data,
      error: (error) => console.error('Error al cargar estadísticas:', error)
    });
  }

  cargarClientes(): void {
    this.clientesService.getClientes().subscribe({
      next: (response) => {
        console.log('Respuesta de clientes:', response);
        this.clientes = response.clientes || [];
        console.log('Clientes cargados:', this.clientes.length);
      },
      error: (error) => console.error('Error al cargar clientes:', error)
    });
  }

  cargarProductos(): void {
    this.inventarioService.getProducts().subscribe({
      next: (response) => {
        console.log('Respuesta de productos:', response);
        // Verificar diferentes estructuras de respuesta
        if (Array.isArray(response)) {
          this.productos = response;
        } else if (response.data && Array.isArray(response.data)) {
          this.productos = response.data;
        } else if (response.products && Array.isArray(response.products)) {
          this.productos = response.products;
        } else {
          console.error('Estructura de respuesta de productos no reconocida:', response);
          this.productos = [];
        }
        console.log('Productos cargados:', this.productos.length);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.productos = [];
      }
    });
  }

  aplicarFiltros(): void {
    this.pedidosFiltrados = this.pedidos.filter(pedido => {
      const coincideEstado = this.filtroEstado === 'TODOS' || pedido.estado === this.filtroEstado;
      const coincideBusqueda = !this.filtroBusqueda ||
        pedido.clienteNombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        pedido.id?.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      
      return coincideEstado && coincideBusqueda;
    });
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.pedidoActual = this.nuevoPedidoVacio();
    this.productosSeleccionados = [];
    this.mostrarModal = true;
  }

  abrirModalEditar(pedido: Pedido): void {
    this.modoEdicion = true;
    this.pedidoActual = { ...pedido };
    this.productosSeleccionados = pedido.productos ? [...pedido.productos] : [];
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.pedidoActual = this.nuevoPedidoVacio();
    this.productosSeleccionados = [];
  }

  onClienteSeleccionado(): void {
    const cliente = this.clientes.find(c => c.id === this.pedidoActual.clienteId);
    console.log('Cliente seleccionado:', cliente);
    
    if (cliente) {
      this.pedidoActual.clienteNombre = `${cliente.nombre} ${cliente.empresa ? '(' + cliente.empresa + ')' : ''}`;
      this.pedidoActual.clienteDireccion = cliente.direccion || '';
      this.pedidoActual.clienteTelefono = cliente.telefono || '';
      this.pedidoActual.direccionEntrega = cliente.direccion || '';
      
      console.log('Datos del pedido actualizados:', {
        nombre: this.pedidoActual.clienteNombre,
        direccion: this.pedidoActual.clienteDireccion,
        telefono: this.pedidoActual.clienteTelefono
      });
    } else {
      console.warn('No se encontró el cliente con ID:', this.pedidoActual.clienteId);
    }
  }

  onRutaSeleccionada(): void {
    if (this.rutaSeleccionadaId) {
      const ruta = this.rutas.find(r => r.id === this.rutaSeleccionadaId || r.codigo === this.rutaSeleccionadaId);
      if (ruta) {
        // Usar el destino de la ruta como dirección de entrega
        this.pedidoActual.direccionEntrega = ruta.destino;
        console.log('Dirección actualizada desde ruta:', ruta.destino);
      }
    }
  }

  onProductoSeleccionado(): void {
    if (this.productoTemp.productoId) {
      const producto = this.productos.find(p => (p.id || p._id) === this.productoTemp.productoId);
      console.log('Producto seleccionado:', producto);
      
      if (producto) {
        this.productoTemp.nombre = producto.name || producto.nombre || 'Producto sin nombre';
        const precio = producto.price || producto.precio || 0;
        // Redondear a 2 decimales
        this.productoTemp.precioUnitario = Math.round(precio * 100) / 100;
        
        console.log('Producto temporal actualizado:', this.productoTemp);
      } else {
        console.warn('No se encontró el producto con ID:', this.productoTemp.productoId);
      }
    }
  }

  agregarProducto(): void {
    if (!this.productoTemp.productoId) {
      console.warn('Debe seleccionar un producto');
      return;
    }

    if (this.productoTemp.cantidad < 1) {
      console.warn('La cantidad debe ser mayor a 0');
      return;
    }

    if (this.productoTemp.precioUnitario <= 0) {
      console.warn('El precio debe ser mayor a 0');
      return;
    }

    // Verificar si el producto ya está agregado
    const yaAgregado = this.productosSeleccionados.find(p => p.productoId === this.productoTemp.productoId);
    if (yaAgregado) {
      console.warn('Este producto ya está agregado. Elimínelo primero si desea cambiar la cantidad.');
      return;
    }

    this.productosSeleccionados.push({ ...this.productoTemp });
    console.log('Producto agregado:', this.productoTemp);
    
    // Resetear el formulario temporal
    this.productoTemp = {
      productoId: '',
      nombre: '',
      cantidad: 1,
      precioUnitario: 0
    };
  }

  eliminarProducto(index: number): void {
    this.productosSeleccionados.splice(index, 1);
  }

  calcularTotal(): number {
    return this.productosSeleccionados.reduce((sum, prod) => 
      sum + (prod.cantidad * prod.precioUnitario), 0);
  }

  guardarPedido(): void {
    // Validaciones
    if (!this.pedidoActual.clienteId) {
      console.error('Debe seleccionar un cliente');
      alert('Por favor seleccione un cliente');
      return;
    }

    if (!this.pedidoActual.direccionEntrega || this.pedidoActual.direccionEntrega.trim() === '') {
      console.error('Debe ingresar una dirección de entrega');
      alert('Por favor ingrese una dirección de entrega');
      return;
    }

    if (this.productosSeleccionados.length === 0) {
      console.error('Debe agregar al menos un producto');
      alert('Por favor agregue al menos un producto al pedido');
      return;
    }

    // Validar stock antes de crear el pedido (solo para pedidos nuevos)
    if (!this.modoEdicion) {
      console.log('🔍 Validando stock para productos:', this.productosSeleccionados);
      this.pedidosService.validarStock(this.productosSeleccionados).subscribe({
        next: (resultado) => {
          console.log('✅ Resultado de validación:', resultado);
          if (resultado.hasLowStockWarnings) {
            // Mostrar advertencia de stock bajo
            this.mostrarAdvertenciaStock(resultado);
          } else {
            // Stock OK, proceder a crear el pedido
            console.log('✅ Stock validado correctamente, procediendo a crear pedido');
            this.crearOActualizarPedido();
          }
        },
        error: (error) => {
          console.error('❌ Error completo al validar stock:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error body:', error.error);
          
          // Si es un error de validación o del servidor, mostrar mensaje específico
          const errorMsg = error.error?.error || error.error?.message || error.message || 'Error desconocido';
          
          if (confirm(`Error al validar stock: ${errorMsg}\n\n¿Desea continuar de todas formas?`)) {
            this.crearOActualizarPedido();
          }
        }
      });
    } else {
      // Para actualizaciones, proceder directamente
      this.crearOActualizarPedido();
    }
  }

  private mostrarAdvertenciaStock(resultado: any): void {
    // Mostrar modal de advertencia con la lista de warnings
    this.advertenciaResultado = resultado;
    this.modalAdvertenciaVisible = true;
  }

  onConfirmarAdvertencia(): void {
    this.modalAdvertenciaVisible = false;
    this.crearOActualizarPedido();
  }

  onCancelarAdvertencia(): void {
    this.modalAdvertenciaVisible = false;
    // Usuario canceló la operación
  }

  private crearOActualizarPedido(): void {
    // Preparar el pedido
    this.pedidoActual.productos = this.productosSeleccionados;
    console.log('Enviando pedido:', this.pedidoActual);

    if (this.modoEdicion && this.pedidoActual.id) {
      this.pedidosService.actualizarPedido(this.pedidoActual.id, this.pedidoActual).subscribe({
        next: (response) => {
          console.log('Pedido actualizado exitosamente:', response);
          alert('Pedido actualizado exitosamente');
          this.cargarDatos();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error completo al actualizar pedido:', error);
          alert(`Error al actualizar pedido: ${error.error?.error || error.message || 'Error desconocido'}`);
        }
      });
    } else {
      this.pedidosService.crearPedido(this.pedidoActual).subscribe({
        next: (response) => {
          console.log('Pedido creado exitosamente:', response);
          alert('Pedido creado exitosamente');
          this.cargarDatos();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error completo al crear pedido:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error body:', error.error);
          alert(`Error al crear pedido: ${error.error?.error || error.message || 'Error desconocido'}`);
        }
      });
    }
  }

  cancelarPedido(pedido: Pedido): void {
    if (confirm(`¿Está seguro de cancelar el pedido de ${pedido.clienteNombre}?`)) {
      this.pedidosService.cancelarPedido(pedido.id!).subscribe({
        next: () => this.cargarDatos(),
        error: (error) => console.error('Error al cancelar pedido:', error)
      });
    }
  }

  eliminarPedido(pedido: Pedido): void {
    if (confirm(`¿Está seguro de eliminar permanentemente el pedido de ${pedido.clienteNombre}?`)) {
      this.pedidosService.eliminarPedido(pedido.id!).subscribe({
        next: () => this.cargarDatos(),
        error: (error) => console.error('Error al eliminar pedido:', error)
      });
    }
  }

  getEstadoColor(estado: string): string {
    return this.pedidosService.getEstadoColor(estado);
  }

  getEstadoTexto(estado: string): string {
    return this.pedidosService.getEstadoTexto(estado);
  }

  private nuevoPedidoVacio(): Pedido {
    return {
      clienteId: '',
      clienteNombre: '',
      clienteDireccion: '',
      clienteTelefono: '',
      productos: [],
      direccionEntrega: '',
      observaciones: ''
    };
  }
}
