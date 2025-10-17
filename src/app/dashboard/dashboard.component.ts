import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // Métricas del dashboard (datos reales del backend)
  totalInventario: number = 0;
  totalClientes: number = 0;
  rutasActivas: number = 0;
  totalProveedores: number = 0;
  
  // Datos operacionales
  entregasHoy: number = 23;
  eficienciaRutas: number = 94;
  tiempoPromedio: number = 2.4;

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
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del dashboard:', error);
        this.error = 'No se pudieron cargar los datos. Verifica que el backend esté corriendo.';
        this.loading = false;
      }
    });
  }
}
