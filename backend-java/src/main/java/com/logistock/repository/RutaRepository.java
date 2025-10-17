package com.logistock.repository;

import com.logistock.model.Ruta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Ruta
 */
@Repository
public interface RutaRepository extends MongoRepository<Ruta, String> {

    // Buscar por código (único)
    Optional<Ruta> findByCodigo(String codigo);

    // Buscar por estado
    List<Ruta> findByEstado(String estado);

    // Buscar por prioridad
    List<Ruta> findByPrioridad(String prioridad);

    // Buscar rutas activas
    List<Ruta> findByIsActiveTrue();

    // Buscar rutas activas con paginación
    Page<Ruta> findByIsActiveTrue(Pageable pageable);

    // Buscar por estado con paginación
    Page<Ruta> findByEstadoAndIsActiveTrue(String estado, Pageable pageable);
    
    // Buscar por código o nombre (búsqueda de texto)
    List<Ruta> findByCodigoContainingIgnoreCaseOrNombreContainingIgnoreCase(String codigo, String nombre);

    // Buscar por prioridad con paginación
    Page<Ruta> findByPrioridadAndIsActiveTrue(String prioridad, Pageable pageable);

    // Buscar por vehículo asignado
    List<Ruta> findByVehiculoAsignadoContainingIgnoreCaseAndIsActiveTrue(String vehiculo);

    // Buscar por conductor asignado
    List<Ruta> findByConductorAsignadoContainingIgnoreCaseAndIsActiveTrue(String conductor);

    // Buscar rutas en proceso
    @Query("{ 'estado': 'En Proceso', 'isActive': true }")
    List<Ruta> findRutasEnProceso();

    // Buscar rutas completadas en un período
    @Query("{ 'estado': 'Completada', 'fechaFinalizacion': { $gte: ?0, $lte: ?1 }, 'isActive': true }")
    List<Ruta> findRutasCompletadasBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    // Buscar rutas planificadas para una fecha
    @Query("{ 'estado': 'Planificada', 'fechaPlanificada': { $gte: ?0, $lt: ?1 }, 'isActive': true }")
    List<Ruta> findRutasPlanificadasForDate(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    // Buscar rutas por distancia
    @Query("{ 'distanciaKm': { $gte: ?0, $lte: ?1 }, 'isActive': true }")
    List<Ruta> findByDistanciaKmBetween(BigDecimal distanciaMin, BigDecimal distanciaMax);

    // Buscar rutas por tiempo estimado
    @Query("{ 'tiempoEstimadoMinutos': { $gte: ?0, $lte: ?1 }, 'isActive': true }")
    List<Ruta> findByTiempoEstimadoMinutosBetween(Integer tiempoMin, Integer tiempoMax);

    // Contar rutas por estado
    long countByEstado(String estado);

    // Contar rutas por prioridad
    long countByPrioridad(String prioridad);

    // Verificar si existe un código (excluyendo un ID específico)
    @Query("{ 'codigo': ?0, '_id': { $ne: ?1 } }")
    Optional<Ruta> findByCodigoAndIdNot(String codigo, String id);

    // Buscar rutas por origen o destino
    @Query("{ $or: [ { 'origen': { $regex: ?0, $options: 'i' } }, { 'destino': { $regex: ?0, $options: 'i' } } ], 'isActive': true }")
    List<Ruta> findByOrigenOrDestinoContaining(String ubicacion);

    // Rutas más costosas
    @Query(value = "{ 'isActive': true }", sort = "{ 'costoCombustible': -1, 'costoPeajes': -1, 'otrosCostos': -1 }")
    List<Ruta> findTopRutasByCosto(Pageable pageable);
}