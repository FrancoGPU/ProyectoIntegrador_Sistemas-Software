import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RutasService, Ruta } from '../../services/rutas.service';
import * as L from 'leaflet';

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

  // Mapa
  map: L.Map | undefined;
  startMarker: L.Marker | undefined;
  endMarker: L.Marker | undefined;
  routeLayer: L.Polyline | undefined;

  constructor(
    private rutasService: RutasService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
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
      distanciaKm: 1,
      tiempoEstimadoMinutos: 60,
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
    if (this.mostrarFormulario) {
      // Esperar a que el modal se renderice
      setTimeout(() => this.initMap(), 100);
    } else {
      this.cancelarEdicion();
    }
  }

  initMap() {
    if (this.map) {
      this.map.remove();
    }

    // Coordenadas por defecto (Lima, Perú)
    const defaultCoords: [number, number] = [-12.0464, -77.0428];
    this.map = L.map('map').setView(defaultCoords, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Fix iconos de Leaflet
    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    // Eventos del mapa
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.ngZone.run(() => {
        if (!this.startMarker) {
          this.setOrigin(e.latlng);
        } else if (!this.endMarker) {
          this.setDestination(e.latlng);
        } else {
          // Si ya hay ambos, reiniciar origen
          this.setOrigin(e.latlng);
          if (this.endMarker) this.map?.removeLayer(this.endMarker);
          this.endMarker = undefined;
          if (this.routeLayer) this.map?.removeLayer(this.routeLayer);
        }
      });
    });

    this.map.on('contextmenu', (e: L.LeafletMouseEvent) => {
      this.ngZone.run(() => {
        this.setDestination(e.latlng);
      });
    });
  }

  setOrigin(latlng: L.LatLng) {
    if (this.startMarker) this.map?.removeLayer(this.startMarker);
    this.startMarker = L.marker(latlng, { draggable: true }).addTo(this.map!)
      .bindPopup('Origen').openPopup();
    
    this.startMarker.on('dragend', (e) => {
      this.calculateRoute();
    });

    // Obtener dirección real
    this.rutasService.getAddressFromCoords(latlng.lat, latlng.lng).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.rutaTemp.origen = data.display_name || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
        });
      },
      error: () => {
        this.rutaTemp.origen = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
      }
    });

    this.calculateRoute();
  }

  setDestination(latlng: L.LatLng) {
    if (this.endMarker) this.map?.removeLayer(this.endMarker);
    this.endMarker = L.marker(latlng, { draggable: true }).addTo(this.map!)
      .bindPopup('Destino').openPopup();

    this.endMarker.on('dragend', (e) => {
      this.calculateRoute();
    });

    // Obtener dirección real
    this.rutasService.getAddressFromCoords(latlng.lat, latlng.lng).subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          this.rutaTemp.destino = data.display_name || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
        });
      },
      error: () => {
        this.rutaTemp.destino = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
      }
    });

    this.calculateRoute();
  }

  calculateRoute() {
    if (this.startMarker && this.endMarker) {
      const start = this.startMarker.getLatLng();
      const end = this.endMarker.getLatLng();

      console.log('Calculando ruta entre:', start, end);

      this.rutasService.getRouteOSRM([start.lat, start.lng], [end.lat, end.lng])
        .subscribe({
          next: (data: any) => {
            console.log('Respuesta OSRM:', data);
            this.ngZone.run(() => {
              if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                // OSRM devuelve distancia en metros y duración en segundos
                this.rutaTemp.distanciaKm = Math.round((route.distance / 1000) * 10) / 10;
                this.rutaTemp.tiempoEstimadoMinutos = Math.round(route.duration / 60);
                
                // Calcular costo estimado automáticamente
                // Fórmula: Costo Base (S/ 30.00) + (Distancia * Costo por Km (S/ 2.50))
                const costoBase = 30.00;
                const costoPorKm = 2.50;
                this.rutaTemp.otrosCostos = Math.round((costoBase + (this.rutaTemp.distanciaKm * costoPorKm)) * 100) / 100;

                console.log('Datos calculados:', {
                  distancia: this.rutaTemp.distanciaKm,
                  tiempo: this.rutaTemp.tiempoEstimadoMinutos,
                  costo: this.rutaTemp.otrosCostos
                });

                // Dibujar ruta
                if (this.routeLayer) this.map?.removeLayer(this.routeLayer);
                
                // OSRM devuelve [lon, lat], Leaflet necesita [lat, lon]
                const coordinates = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
                
                this.routeLayer = L.polyline(coordinates, { color: 'blue', weight: 5 }).addTo(this.map!);
                this.map?.fitBounds(this.routeLayer.getBounds(), { padding: [50, 50] });
                
                this.cdr.detectChanges();
              } else {
                console.warn('No se encontraron rutas en la respuesta OSRM');
                alert('No se pudo encontrar una ruta válida entre estos puntos.');
              }
            });
          },
          error: (err) => {
            console.error('Error calculando ruta:', err);
            alert('Error al conectar con el servicio de rutas. Por favor intente nuevamente.');
          }
        });
    }
  }

  guardarRuta() {
    console.log('Enviando ruta:', this.rutaTemp);
    
    // Asegurar que los campos requeridos por el backend estén presentes
    // Si el usuario ingresó tiempo en horas (si existiera ese campo en el formulario), convertir a minutos
    if (this.rutaTemp.tiempoEstimadoHoras && !this.rutaTemp.tiempoEstimadoMinutos) {
      this.rutaTemp.tiempoEstimadoMinutos = Math.round(this.rutaTemp.tiempoEstimadoHoras * 60);
    }
    
    // Si el usuario ingresó costo estimado (si existiera), asignarlo a otrosCostos si costoTotal es 0
    if (this.rutaTemp.costoEstimado && (!this.rutaTemp.otrosCostos || this.rutaTemp.otrosCostos === 0)) {
      this.rutaTemp.otrosCostos = this.rutaTemp.costoEstimado;
    }

    // Valores por defecto para campos ocultos
    if (!this.rutaTemp.vehiculoAsignado) this.rutaTemp.vehiculoAsignado = 'No Aplica';
    if (!this.rutaTemp.conductorAsignado) this.rutaTemp.conductorAsignado = 'No Aplica';

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
            this.mostrarError(error, 'No se pudo actualizar la ruta');
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
          this.mostrarError(error, 'No se pudo crear la ruta');
        },
      });
    }
  }

  private mostrarError(error: any, defaultMsg: string) {
    let msg = defaultMsg;
    if (error.error) {
      if (error.error.errors && Array.isArray(error.error.errors)) {
        const validationErrors = error.error.errors.map((e: any) => `${e.field}: ${e.defaultMessage}`).join('\n');
        msg += '\n' + validationErrors;
      } else if (error.error.message) {
        msg += ': ' + error.error.message;
      } else if (typeof error.error === 'string') {
        msg += ': ' + error.error;
      }
    } else if (error.message) {
      msg += ': ' + error.message;
    }
    alert(msg);
  }

  editarRuta(ruta: Ruta) {
    this.rutaEditando = ruta;
    this.rutaTemp = { ...ruta };
    this.mostrarFormulario = true;

    // Inicializar el mapa para permitir edición
    setTimeout(() => {
      this.initMap();
    }, 100);
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
    this.optimizedRoutes = [];
    
    // 1. Análisis de Costo por Km (Eficiencia)
    // Usamos costoTotal o costoEstimado o otrosCostos
    const rutasConDatos = this.rutas.filter(r => r.distanciaKm > 0 && (r.costoTotal || r.costoEstimado || r.otrosCostos));
    
    if (rutasConDatos.length > 0) {
      const costosPorKm = rutasConDatos.map(r => {
        const costo = r.costoTotal || r.costoEstimado || r.otrosCostos || 0;
        return { id: r.id, nombre: r.nombre, costoKm: costo / r.distanciaKm };
      });

      const promedioCostoKm = costosPorKm.reduce((sum, item) => sum + item.costoKm, 0) / costosPorKm.length;
      
      // Detectar rutas que cuestan 20% más que el promedio
      const rutasIneficientes = costosPorKm.filter(item => item.costoKm > (promedioCostoKm * 1.2));

      if (rutasIneficientes.length > 0) {
        this.optimizedRoutes.push({
          tipo: 'Baja Eficiencia de Costos',
          descripcion: `Se detectaron ${rutasIneficientes.length} rutas con un costo por km superior al promedio (S/ ${promedioCostoKm.toFixed(2)}/km). Revise: ${rutasIneficientes.map(r => r.nombre).join(', ')}.`,
          ahorroTiempo: 0,
          ahorroDistancia: 0,
          icon: 'fa-money-bill-wave',
          color: 'warning'
        });
      }
    }

    // 2. Análisis de Destinos Recurrentes (Consolidación)
    const destinos = this.rutas.map(r => r.destino.trim().toLowerCase());
    const destinosDuplicados = destinos.filter((item, index) => destinos.indexOf(item) !== index);
    const uniqueDuplicados = [...new Set(destinosDuplicados)];
    
    if (uniqueDuplicados.length > 0) {
       // Buscar los nombres originales para mostrar
       const nombresDestinos = this.rutas
         .filter(r => uniqueDuplicados.includes(r.destino.trim().toLowerCase()))
         .map(r => r.destino)
         .filter((v, i, a) => a.indexOf(v) === i) // Unique
         .slice(0, 3); // Solo mostrar los primeros 3

       this.optimizedRoutes.push({
          tipo: 'Oportunidad de Consolidación',
          descripcion: `Existen múltiples rutas hacia los mismos destinos (${nombresDestinos.join(', ')}...). Considere crear una ruta multiparada o consolidar envíos.`,
          ahorroTiempo: uniqueDuplicados.length * 1.5, // Estimado
          ahorroDistancia: uniqueDuplicados.length * 10, // Estimado
          icon: 'fa-boxes',
          color: 'info'
       });
    }

    // 3. Rutas "Largas" (Fatiga conductor)
    const rutasLargas = this.rutas.filter(r => {
      const minutos = r.tiempoEstimadoMinutos || (r.tiempoEstimadoHoras ? r.tiempoEstimadoHoras * 60 : 0);
      return minutos > 480; // > 8 horas
    });

    if (rutasLargas.length > 0) {
        this.optimizedRoutes.push({
          tipo: 'Riesgo de Fatiga',
          descripcion: `${rutasLargas.length} rutas exceden las 8 horas de conducción. Se recomienda asignar conductores de relevo o planificar paradas de descanso.`,
          ahorroTiempo: 0,
          ahorroDistancia: 0,
          icon: 'fa-user-clock',
          color: 'danger'
       });
    }

    if (this.optimizedRoutes.length === 0) {
        alert('Análisis completado: Sus rutas actuales parecen eficientes y bien distribuidas.');
    } else {
        // Scroll to results
        setTimeout(() => {
            document.querySelector('.optimization-panel')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
  }
}
