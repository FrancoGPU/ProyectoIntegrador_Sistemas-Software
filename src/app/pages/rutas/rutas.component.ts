import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RutasService, Ruta } from '../../services/rutas.service';

@Component({
  selector: 'app-rutas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rutas.component.html',
  styleUrl: './rutas.component.css',
})
export class RutasComponent implements OnInit {
  mostrarFormulario = false;
  rutaEditando: Ruta | null = null;
  loading = false;
  error: string | null = null;

  rutaTemp!: Ruta;
  rutas: Ruta[] = [];
  optimizedRoutes: any[] = []; // Para almacenar sugerencias de optimización

  constructor(private rutasService: RutasService) {
    // Inicializar rutaTemp después de que el servicio esté disponible
    this.rutaTemp = this.getEmptyRuta();
  }

  ngOnInit() {
    this.loadRutas();
  }

  loadRutas() {
    this.loading = true;
    this.error = null;

    this.rutasService.getRutas({ page: 0, size: 50 }).subscribe({
      next: (response: any) => {
        console.log('Rutas recibidas:', response);
        // El backend devuelve un objeto con la propiedad 'rutas'
        this.rutas = response.rutas || response.content || response;
        console.log('Rutas parseadas:', this.rutas);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar rutas:', error);
        this.error =
          'No se pudieron cargar las rutas. Verifica que el backend esté corriendo.';
        this.loading = false;
      },
    });
  }

  getEmptyRuta(): Ruta {
    return {
      codigo: this.rutasService.generarCodigo(),
      nombre: '',
      origen: '',
      destino: '',
      distanciaKm: 0,
      tiempoEstimadoMinutos: 0,
      estado: 'Planificada',
      vehiculoAsignado: '',
      conductorAsignado: '',
      costoTotal: 0,
      costoCombustible: 0,
      costoPeajes: 0,
      otrosCostos: 0,
      fechaPlanificada: new Date(),
      isActive: true,
    };
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.cancelarEdicion();
    }
  }

  guardarRuta() {
    if (this.rutaEditando && this.rutaEditando.id) {
      this.rutasService
        .updateRuta(this.rutaEditando.id, this.rutaTemp)
        .subscribe({
          next: () => {
            this.loadRutas();
            this.cancelarEdicion();
            this.mostrarFormulario = false;
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
            alert('No se pudo actualizar la ruta');
          },
        });
    } else {
      this.rutasService.createRuta(this.rutaTemp).subscribe({
        next: () => {
          this.loadRutas();
          this.cancelarEdicion();
          this.mostrarFormulario = false;
        },
        error: (error) => {
          console.error('Error al crear:', error);
          alert('No se pudo crear la ruta');
        },
      });
    }
  }

  editarRuta(ruta: Ruta) {
    this.rutaEditando = ruta;
    this.rutaTemp = { ...ruta };
    this.mostrarFormulario = true;
  }

  eliminarRuta(id: string) {
    if (confirm('¿Está seguro de eliminar esta ruta?')) {
      this.rutasService.deleteRuta(id).subscribe({
        next: () => {
          this.loadRutas();
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          alert('No se pudo eliminar la ruta');
        },
      });
    }
  }

  cambiarEstado(ruta: Ruta, nuevoEstado: string) {
    if (ruta.id) {
      this.rutasService.cambiarEstado(ruta.id, nuevoEstado).subscribe({
        next: () => {
          this.loadRutas();
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
          alert('No se pudo cambiar el estado');
        },
      });
    }
  }

  cancelarEdicion() {
    this.rutaEditando = null;
    this.rutaTemp = this.getEmptyRuta();
  }

  contarPorEstado(estado: string): number {
    return this.rutas.filter((r) => r.estado === estado).length;
  }

  calcularDistanciaTotal(): number {
    return this.rutas.reduce((total, r) => total + r.distanciaKm, 0);
  }

  calcularCostoTotal(): number {
    return this.rutas.reduce(
      (total, r) => total + (r.costoTotal || r.costoEstimado || 0),
      0
    );
  }

  getEstadoColor(estado: string): string {
    return this.rutasService.getEstadoColor(estado);
  }

  formatTiempo(horas: number): string {
    return this.rutasService.formatTiempo(horas);
  }

  calcularEficienciaPromedio(): number {
    if (this.rutas.length === 0) return 0;

    // Calcular eficiencia basada en la relación distancia/tiempo
    const eficiencias = this.rutas.map((ruta) => {
      const tiempoHoras =
        ruta.tiempoEstimadoHoras ||
        (ruta.tiempoEstimadoMinutos ? ruta.tiempoEstimadoMinutos / 60 : 0);
      if (tiempoHoras === 0) return 0;
      const velocidadPromedio = ruta.distanciaKm / tiempoHoras;
      // Normalizar a un porcentaje (asumiendo 60 km/h como 100% eficiente)
      return Math.min(100, (velocidadPromedio / 60) * 100);
    });

    const sumaEficiencias = eficiencias.reduce((sum, ef) => sum + ef, 0);
    return sumaEficiencias / this.rutas.length;
  }

  optimizarRutas() {
    // Simular análisis de optimización
    this.optimizedRoutes = [
      {
        tipo: 'Consolidación de Rutas',
        descripcion:
          'Se pueden combinar 2 rutas con destinos cercanos para reducir costos',
        ahorroTiempo: 2.5,
        ahorroDistancia: 45,
      },
      {
        tipo: 'Ruta Alternativa',
        descripcion:
          'Usar vía de evitamiento puede reducir tiempo en ruta Lima-Arequipa',
        ahorroTiempo: 1.2,
        ahorroDistancia: 15,
      },
      {
        tipo: 'Mejor Horario',
        descripcion: 'Salir 2 horas antes evitaría tráfico en 3 rutas urbanas',
        ahorroTiempo: 3.0,
        ahorroDistancia: 0,
      },
    ];

    alert('Análisis de optimización completado. Revisa las sugerencias abajo.');
  }
}
