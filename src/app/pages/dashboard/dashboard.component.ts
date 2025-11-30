import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  DashboardService,
  DashboardStats,
} from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  // Métricas del dashboard (datos reales del backend)
  totalInventario: number = 0;
  totalClientes: number = 0;
  rutasActivas: number = 0;
  totalProveedores: number = 0;

  // Datos para la nueva vista
  lowStockProducts: any[] = [];
  recentActivity: any[] = [];
  pendingOrders: any[] = [];

  // Estado de carga
  loading: boolean = true;
  error: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.error = null;

    this.dashboardService.getStats().subscribe({
      next: (data: DashboardStats) => {
        console.log('Datos recibidos del backend:', data);
        this.totalInventario = data.productosEnInventario;
        this.totalClientes = data.clientesActivos;
        this.totalProveedores = data.proveedoresActivos;
        this.rutasActivas = data.rutasEnProceso;

        // Mapear productos con bajo stock
        this.lowStockProducts = (data.lowStockProducts || []).map((p: any) => ({
          name: p.name,
          stock: p.stock,
          minStock: p.minStock,
          status: p.stock <= (p.minStock || 0) / 2 ? 'Crítico' : 'Bajo'
        }));

        // Mapear pedidos pendientes
        this.pendingOrders = (data.pendingOrders || []).map((o: any) => ({
          id: '#' + o.id.substring(0, 8), // ID corto
          customer: o.clienteNombre || 'Cliente General',
          total: this.dashboardService.formatCurrency(o.total || 0),
          status: o.estado === 'DISPONIBLE' ? 'Pendiente' : o.estado,
          date: new Date(o.fechaCreacion).toLocaleDateString()
        }));

        // Mapear actividad reciente (usando pedidos recientes)
        this.recentActivity = (data.recentActivity || []).map((o: any) => ({
          action: `Nuevo pedido creado`,
          user: 'Sistema', // El backend no siempre devuelve el usuario creador en el pedido simple
          time: this.dashboardService.formatTimeAgo(o.fechaCreacion),
          icon: 'fas fa-shopping-cart',
          type: 'info'
        }));

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del dashboard:', error);
        this.error =
          'No se pudieron cargar los datos. Verifica que el backend esté corriendo.';
        this.loading = false;
      },
    });
  }
}
