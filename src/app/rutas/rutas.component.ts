import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Ruta {
  id: number;
  nombre: string;
  conductor: string;
  origen: string;
  destino: string;
  distancia: number;
  tiempoEstimado: number;
  estado: 'Planificada' | 'En Tránsito' | 'Completada' | 'Retrasada';
  prioridad: 'Alta' | 'Media' | 'Baja';
  eficiencia: number;
}

interface OptimizacionSugerencia {
  tipo: string;
  descripcion: string;
  ahorroTiempo: number;
  ahorroDistancia: number;
}

@Component({
  selector: 'app-rutas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rutas.component.html',
  styleUrl: './rutas.component.css'
})
export class RutasComponent {
  mostrarFormulario = false;
  rutaEditando: Ruta | null = null;
  optimizedRoutes: OptimizacionSugerencia[] = [];
  
  rutaTemp: Ruta = {
    id: 0,
    nombre: '',
    conductor: '',
    origen: '',
    destino: '',
    distancia: 0,
    tiempoEstimado: 0,
    estado: 'Planificada',
    prioridad: 'Media',
    eficiencia: 85
  };

  rutas: Ruta[] = [
    {
      id: 1,
      nombre: 'Ruta Centro-Norte',
      conductor: 'Carlos Mendoza',
      origen: 'Centro de Distribución',
      destino: 'Zona Norte',
      distancia: 45.5,
      tiempoEstimado: 2.5,
      estado: 'En Tránsito',
      prioridad: 'Alta',
      eficiencia: 92
    },
    {
      id: 2,
      nombre: 'Ruta Sur-Este',
      conductor: 'Ana Torres',
      origen: 'Almacén Sur',
      destino: 'Zona Este',
      distancia: 32.8,
      tiempoEstimado: 1.8,
      estado: 'Completada',
      prioridad: 'Media',
      eficiencia: 88
    },
    {
      id: 3,
      nombre: 'Ruta Express Oeste',
      conductor: 'Miguel Silva',
      origen: 'Hub Principal',
      destino: 'Zona Oeste',
      distancia: 28.2,
      tiempoEstimado: 1.5,
      estado: 'Planificada',
      prioridad: 'Alta',
      eficiencia: 95
    },
    {
      id: 4,
      nombre: 'Ruta Metropolitana',
      conductor: 'Laura Vega',
      origen: 'Centro',
      destino: 'Área Metropolitana',
      distancia: 67.3,
      tiempoEstimado: 3.2,
      estado: 'Retrasada',
      prioridad: 'Baja',
      eficiencia: 78
    },
    {
      id: 5,
      nombre: 'Ruta Industrial',
      conductor: 'Diego Herrera',
      origen: 'Planta Industrial',
      destino: 'Parque Industrial',
      distancia: 15.7,
      tiempoEstimado: 1.0,
      estado: 'En Tránsito',
      prioridad: 'Media',
      eficiencia: 85
    }
  ];

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.cancelarEdicion();
    }
  }

  guardarRuta() {
    // Calcular eficiencia basada en distancia y tiempo
    this.rutaTemp.eficiencia = Math.round(Math.max(70, 100 - (this.rutaTemp.distancia / this.rutaTemp.tiempoEstimado) * 0.5));
    
    if (this.rutaEditando) {
      // Actualizar ruta existente
      const index = this.rutas.findIndex(r => r.id === this.rutaEditando!.id);
      if (index !== -1) {
        this.rutas[index] = { ...this.rutaTemp };
      }
    } else {
      // Agregar nueva ruta
      const nuevoId = Math.max(...this.rutas.map(r => r.id)) + 1;
      this.rutas.push({ ...this.rutaTemp, id: nuevoId });
    }
    
    this.cancelarEdicion();
    this.mostrarFormulario = false;
  }

  editarRuta(ruta: Ruta) {
    this.rutaEditando = ruta;
    this.rutaTemp = { ...ruta };
    this.mostrarFormulario = true;
  }

  eliminarRuta(id: number) {
    if (confirm('¿Está seguro de eliminar esta ruta?')) {
      this.rutas = this.rutas.filter(r => r.id !== id);
    }
  }

  cancelarEdicion() {
    this.rutaEditando = null;
    this.rutaTemp = {
      id: 0,
      nombre: '',
      conductor: '',
      origen: '',
      destino: '',
      distancia: 0,
      tiempoEstimado: 0,
      estado: 'Planificada',
      prioridad: 'Media',
      eficiencia: 85
    };
  }

  contarPorEstado(estado: 'Planificada' | 'En Tránsito' | 'Completada' | 'Retrasada'): number {
    return this.rutas.filter(r => r.estado === estado).length;
  }

  calcularDistanciaTotal(): number {
    return this.rutas.reduce((total, ruta) => total + ruta.distancia, 0);
  }

  calcularEficienciaPromedio(): number {
    if (this.rutas.length === 0) return 0;
    const suma = this.rutas.reduce((acc, r) => acc + r.eficiencia, 0);
    return suma / this.rutas.length;
  }

  optimizarRutas() {
    // Simular optimización inteligente basada en las estrategias FODA
    this.optimizedRoutes = [
      {
        tipo: 'Consolidación de Rutas',
        descripcion: 'Combinar rutas Sur-Este y Metropolitana para reducir costos',
        ahorroTiempo: 1.2,
        ahorroDistancia: 15.5
      },
      {
        tipo: 'Ruta Alternativa',
        descripcion: 'Usar ruta express para Zona Norte durante horas pico',
        ahorroTiempo: 0.8,
        ahorroDistancia: 8.3
      },
      {
        tipo: 'Redistribución de Carga',
        descripcion: 'Balancear carga entre conductores para mejorar eficiencia',
        ahorroTiempo: 0.5,
        ahorroDistancia: 5.2
      }
    ];

    // Simular mejora de eficiencia en rutas retrasadas
    this.rutas.forEach(ruta => {
      if (ruta.estado === 'Retrasada') {
        ruta.eficiencia = Math.min(95, ruta.eficiencia + 10);
      }
    });

    alert('🚀 Optimización completada! Revisa las sugerencias generadas.');
  }
}
