import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  // Métricas del dashboard
  totalInventario: number = 1247;
  totalClientes: number = 89;
  rutasActivas: number = 15;
  totalProveedores: number = 34;
  
  // Datos operacionales
  entregasHoy: number = 23;
  eficienciaRutas: number = 94;
  tiempoPromedio: number = 2.4;

  constructor() {
    // Simular carga de datos en tiempo real
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Aquí se conectaría con servicios reales para obtener datos
    console.log('Cargando datos del dashboard...');
  }
}
