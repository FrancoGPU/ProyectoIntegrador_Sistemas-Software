package com.logistock.service;

import com.logistock.model.Ruta;
import com.logistock.repository.RutaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de rutas
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RutaService {

    private final RutaRepository rutaRepository;

    /**
     * Obtener todas las rutas activas
     */
    public List<Ruta> findAll() {
        log.debug("Obteniendo todas las rutas activas");
        return rutaRepository.findByIsActiveTrue();
    }

    /**
     * Obtener rutas con paginación
     */
    public Page<Ruta> findAll(int page, int size, String sortBy, String sortDirection) {
        log.debug("Obteniendo rutas - página: {}, tamaño: {}", page, size);
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return rutaRepository.findByIsActiveTrue(pageable);
    }

    /**
     * Obtener ruta por ID
     */
    public Optional<Ruta> findById(String id) {
        log.debug("Buscando ruta por ID: {}", id);
        return rutaRepository.findById(id);
    }

    /**
     * Buscar por código
     */
    public Optional<Ruta> findByCodigo(String codigo) {
        log.debug("Buscando ruta por código: {}", codigo);
        return rutaRepository.findByCodigo(codigo.toUpperCase());
    }

    /**
     * Buscar rutas por texto (código o nombre)
     */
    public List<Ruta> searchByText(String searchText) {
        log.debug("Buscando rutas por texto: {}", searchText);
        return rutaRepository.findByCodigoContainingIgnoreCaseOrNombreContainingIgnoreCase(
                searchText, searchText);
    }

    /**
     * Buscar por estado
     */
    public List<Ruta> findByEstado(String estado) {
        log.debug("Buscando rutas por estado: {}", estado);
        return rutaRepository.findByEstado(estado);
    }

    /**
     * Buscar por prioridad
     */
    public List<Ruta> findByPrioridad(String prioridad) {
        log.debug("Buscando rutas por prioridad: {}", prioridad);
        return rutaRepository.findByPrioridad(prioridad);
    }

    /**
     * Buscar rutas en proceso
     */
    public List<Ruta> findRutasEnProceso() {
        log.debug("Buscando rutas en proceso");
        return rutaRepository.findRutasEnProceso();
    }

    /**
     * Buscar por vehículo
     */
    public List<Ruta> findByVehiculo(String vehiculo) {
        log.debug("Buscando rutas por vehículo: {}", vehiculo);
        return rutaRepository.findByVehiculoAsignadoContainingIgnoreCaseAndIsActiveTrue(vehiculo);
    }

    /**
     * Buscar por conductor
     */
    public List<Ruta> findByConductor(String conductor) {
        log.debug("Buscando rutas por conductor: {}", conductor);
        return rutaRepository.findByConductorAsignadoContainingIgnoreCaseAndIsActiveTrue(conductor);
    }

    /**
     * Crear nueva ruta
     */
    public Ruta create(Ruta ruta) {
        log.info("Creando nueva ruta: {}", ruta.getCodigo());
        
        // Validar que no exista código duplicado
        if (ruta.getCodigo() != null) {
            Optional<Ruta> existingByCodigo = findByCodigo(ruta.getCodigo());
            if (existingByCodigo.isPresent()) {
                throw new IllegalArgumentException("Ya existe una ruta con el código: " + ruta.getCodigo());
            }
        }

        // Establecer valores por defecto
        if (ruta.getIsActive() == null) {
            ruta.setIsActive(true);
        }
        if (ruta.getEstado() == null) {
            ruta.setEstado("Planificada");
        }
        if (ruta.getPrioridad() == null) {
            ruta.setPrioridad("Media");
        }
        if (ruta.getCostoCombustible() == null) {
            ruta.setCostoCombustible(BigDecimal.ZERO);
        }
        if (ruta.getCostoPeajes() == null) {
            ruta.setCostoPeajes(BigDecimal.ZERO);
        }
        if (ruta.getOtrosCostos() == null) {
            ruta.setOtrosCostos(BigDecimal.ZERO);
        }

        ruta.setCreatedAt(LocalDateTime.now());
        ruta.setUpdatedAt(LocalDateTime.now());

        return rutaRepository.save(ruta);
    }

    /**
     * Actualizar ruta
     */
    public Ruta update(String id, Ruta rutaActualizada) {
        log.info("Actualizando ruta ID: {}", id);
        
        return rutaRepository.findById(id)
                .map(rutaExistente -> {
                    // Validar código único si cambió
                    if (rutaActualizada.getCodigo() != null && 
                        !rutaActualizada.getCodigo().equals(rutaExistente.getCodigo())) {
                        Optional<Ruta> existingByCodigo = findByCodigo(rutaActualizada.getCodigo());
                        if (existingByCodigo.isPresent() && !existingByCodigo.get().getId().equals(id)) {
                            throw new IllegalArgumentException("Ya existe una ruta con el código: " + rutaActualizada.getCodigo());
                        }
                    }

                    // Actualizar campos
                    rutaExistente.setCodigo(rutaActualizada.getCodigo());
                    rutaExistente.setNombre(rutaActualizada.getNombre());
                    rutaExistente.setDescripcion(rutaActualizada.getDescripcion());
                    rutaExistente.setOrigen(rutaActualizada.getOrigen());
                    rutaExistente.setDestino(rutaActualizada.getDestino());
                    rutaExistente.setParadas(rutaActualizada.getParadas());
                    rutaExistente.setDistanciaKm(rutaActualizada.getDistanciaKm());
                    rutaExistente.setTiempoEstimadoMinutos(rutaActualizada.getTiempoEstimadoMinutos());
                    rutaExistente.setEstado(rutaActualizada.getEstado());
                    rutaExistente.setPrioridad(rutaActualizada.getPrioridad());
                    rutaExistente.setVehiculoAsignado(rutaActualizada.getVehiculoAsignado());
                    rutaExistente.setConductorAsignado(rutaActualizada.getConductorAsignado());
                    rutaExistente.setCostoCombustible(rutaActualizada.getCostoCombustible());
                    rutaExistente.setCostoPeajes(rutaActualizada.getCostoPeajes());
                    rutaExistente.setOtrosCostos(rutaActualizada.getOtrosCostos());
                    rutaExistente.setFechaPlanificada(rutaActualizada.getFechaPlanificada());
                    rutaExistente.setFechaInicio(rutaActualizada.getFechaInicio());
                    rutaExistente.setFechaFinalizacion(rutaActualizada.getFechaFinalizacion());
                    rutaExistente.setIsActive(rutaActualizada.getIsActive());
                    rutaExistente.setObservaciones(rutaActualizada.getObservaciones());
                    rutaExistente.setUpdatedAt(LocalDateTime.now());

                    return rutaRepository.save(rutaExistente);
                })
                .orElseThrow(() -> new NoSuchElementException("Ruta no encontrada con ID: " + id));
    }

    /**
     * Cambiar estado de la ruta
     */
    public Ruta cambiarEstado(String id, String nuevoEstado) {
        log.info("Cambiando estado de ruta ID: {} a {}", id, nuevoEstado);
        
        // Validar estado válido
        List<String> estadosValidos = Arrays.asList("Planificada", "En Proceso", "Completada", "Suspendida", "Cancelada");
        if (!estadosValidos.contains(nuevoEstado)) {
            throw new IllegalArgumentException("Estado inválido: " + nuevoEstado);
        }
        
        return rutaRepository.findById(id)
                .map(ruta -> {
                    String estadoAnterior = ruta.getEstado();
                    ruta.setEstado(nuevoEstado);
                    
                    // Actualizar fechas según el estado
                    if ("En Proceso".equals(nuevoEstado) && ruta.getFechaInicio() == null) {
                        ruta.setFechaInicio(LocalDateTime.now());
                    } else if ("Completada".equals(nuevoEstado) && ruta.getFechaFinalizacion() == null) {
                        ruta.setFechaFinalizacion(LocalDateTime.now());
                    }
                    
                    ruta.setUpdatedAt(LocalDateTime.now());
                    log.info("Estado cambiado de '{}' a '{}' para ruta {}", estadoAnterior, nuevoEstado, id);
                    
                    return rutaRepository.save(ruta);
                })
                .orElseThrow(() -> new NoSuchElementException("Ruta no encontrada con ID: " + id));
    }

    /**
     * Eliminar ruta (soft delete)
     */
    public void delete(String id) {
        log.info("Eliminando ruta ID: {}", id);
        
        rutaRepository.findById(id)
                .ifPresent(ruta -> {
                    ruta.setIsActive(false);
                    ruta.setUpdatedAt(LocalDateTime.now());
                    rutaRepository.save(ruta);
                });
    }

    /**
     * Eliminar ruta permanentemente
     */
    public void deleteHard(String id) {
        log.warn("Eliminación permanente de ruta ID: {}", id);
        rutaRepository.deleteById(id);
    }

    /**
     * Obtener estadísticas de rutas
     */
    public Map<String, Object> getStats() {
        log.debug("Calculando estadísticas de rutas");
        
        List<Ruta> allRutas = rutaRepository.findByIsActiveTrue();
        
        Map<String, Object> stats = new HashMap<>();
        
        // Totales generales
        stats.put("totalRutas", allRutas.size());
        stats.put("totalActivas", allRutas.stream().filter(Ruta::getIsActive).count());
        
        // Por estado
        Map<String, Long> porEstado = allRutas.stream()
                .collect(Collectors.groupingBy(Ruta::getEstado, Collectors.counting()));
        stats.put("porEstado", porEstado);
        
        // Por prioridad
        Map<String, Long> porPrioridad = allRutas.stream()
                .collect(Collectors.groupingBy(Ruta::getPrioridad, Collectors.counting()));
        stats.put("porPrioridad", porPrioridad);
        
        // Rutas en proceso
        long rutasEnProceso = allRutas.stream()
                .filter(Ruta::isEnProceso)
                .count();
        stats.put("rutasEnProceso", rutasEnProceso);
        
        // Rutas completadas
        long rutasCompletadas = allRutas.stream()
                .filter(Ruta::isCompletada)
                .count();
        stats.put("rutasCompletadas", rutasCompletadas);
        
        // Costos totales
        BigDecimal costoTotalCombustible = allRutas.stream()
                .map(Ruta::getCostoCombustible)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("costoTotalCombustible", costoTotalCombustible);
        
        BigDecimal costoTotalPeajes = allRutas.stream()
                .map(Ruta::getCostoPeajes)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("costoTotalPeajes", costoTotalPeajes);
        
        BigDecimal costoTotalOtros = allRutas.stream()
                .map(Ruta::getOtrosCostos)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("costoTotalOtros", costoTotalOtros);
        
        BigDecimal costoTotal = costoTotalCombustible.add(costoTotalPeajes).add(costoTotalOtros);
        stats.put("costoTotal", costoTotal);
        
        // Distancia total
        BigDecimal distanciaTotal = allRutas.stream()
                .map(Ruta::getDistanciaKm)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("distanciaTotal", distanciaTotal);
        
        // Tiempo total estimado
        int tiempoTotalMinutos = allRutas.stream()
                .mapToInt(Ruta::getTiempoEstimadoMinutos)
                .sum();
        stats.put("tiempoTotalMinutos", tiempoTotalMinutos);
        stats.put("tiempoTotalHoras", tiempoTotalMinutos / 60.0);
        
        return stats;
    }

    /**
     * Contar rutas activas
     */
    public long countActive() {
        return rutaRepository.findByIsActiveTrue().size();
    }

    /**
     * Contar rutas por estado
     */
    public long countByEstado(String estado) {
        return rutaRepository.countByEstado(estado);
    }
}
