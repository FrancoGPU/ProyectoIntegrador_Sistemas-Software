package com.logistock.controller;

import com.logistock.model.Ruta;
import com.logistock.service.RutaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión de rutas
 */
@RestController
@RequestMapping("/rutas")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Rutas", description = "APIs para la gestión de rutas de entrega")
public class RutasController {

    private final RutaService rutaService;

    /**
     * Obtener todas las rutas
     */
    @GetMapping
    @Operation(summary = "Obtener todas las rutas", description = "Retorna la lista de todas las rutas activas con filtros opcionales")
    public ResponseEntity<Map<String, Object>> getAllRutas(
            @Parameter(description = "Número de página (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Campo para ordenar") @RequestParam(defaultValue = "fechaPlanificada") String sortBy,
            @Parameter(description = "Dirección de ordenamiento") @RequestParam(defaultValue = "desc") String sortDirection,
            @Parameter(description = "Estado para filtrar") @RequestParam(required = false) String estado,
            @Parameter(description = "Prioridad para filtrar") @RequestParam(required = false) String prioridad,
            @Parameter(description = "Texto para búsqueda") @RequestParam(required = false) String search,
            @Parameter(description = "Vehículo asignado") @RequestParam(required = false) String vehiculo,
            @Parameter(description = "Conductor asignado") @RequestParam(required = false) String conductor) {
        
        try {
            log.info("GET /rutas - página: {}, tamaño: {}, estado: {}, búsqueda: {}", page, size, estado, search);
            
            List<Ruta> rutas;
            Map<String, Object> response = new HashMap<>();
            
            // Aplicar filtros
            if (search != null && !search.trim().isEmpty()) {
                rutas = rutaService.searchByText(search.trim());
                response.put("rutas", rutas);
                response.put("total", rutas.size());
                response.put("page", 0);
                response.put("size", rutas.size());
                response.put("totalPages", 1);
            } else if (estado != null && !estado.trim().isEmpty()) {
                rutas = rutaService.findByEstado(estado.trim());
                response.put("rutas", rutas);
                response.put("total", rutas.size());
                response.put("page", 0);
                response.put("size", rutas.size());
                response.put("totalPages", 1);
            } else if (prioridad != null && !prioridad.trim().isEmpty()) {
                rutas = rutaService.findByPrioridad(prioridad.trim());
                response.put("rutas", rutas);
                response.put("total", rutas.size());
                response.put("page", 0);
                response.put("size", rutas.size());
                response.put("totalPages", 1);
            } else if (vehiculo != null && !vehiculo.trim().isEmpty()) {
                rutas = rutaService.findByVehiculo(vehiculo.trim());
                response.put("rutas", rutas);
                response.put("total", rutas.size());
                response.put("page", 0);
                response.put("size", rutas.size());
                response.put("totalPages", 1);
            } else if (conductor != null && !conductor.trim().isEmpty()) {
                rutas = rutaService.findByConductor(conductor.trim());
                response.put("rutas", rutas);
                response.put("total", rutas.size());
                response.put("page", 0);
                response.put("size", rutas.size());
                response.put("totalPages", 1);
            } else {
                // Sin filtros - usar paginación
                Page<Ruta> pageResult = rutaService.findAll(page, size, sortBy, sortDirection);
                response.put("rutas", pageResult.getContent());
                response.put("total", pageResult.getTotalElements());
                response.put("page", pageResult.getNumber());
                response.put("size", pageResult.getSize());
                response.put("totalPages", pageResult.getTotalPages());
            }
            
            log.info("Rutas encontradas: {}", response.get("total"));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener rutas", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener rutas: " + e.getMessage()));
        }
    }

    /**
     * Obtener ruta por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener ruta por ID", description = "Retorna una ruta específica por su ID")
    public ResponseEntity<Object> getRutaById(@PathVariable String id) {
        try {
            log.info("GET /rutas/{}", id);
            
            return rutaService.findById(id)
                    .<ResponseEntity<Object>>map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("error", "Ruta no encontrada con ID: " + id)));
                            
        } catch (Exception e) {
            log.error("Error al obtener ruta por ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener ruta: " + e.getMessage()));
        }
    }

    /**
     * Crear nueva ruta
     */
    @PostMapping
    @Operation(summary = "Crear ruta", description = "Crea una nueva ruta en el sistema")
    public ResponseEntity<?> createRuta(@Valid @RequestBody Ruta ruta) {
        try {
            log.info("POST /rutas - código: {}", ruta.getCodigo());
            
            Ruta nuevaRuta = rutaService.create(ruta);
            log.info("Ruta creada exitosamente con ID: {}", nuevaRuta.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaRuta);
            
        } catch (IllegalArgumentException e) {
            log.warn("Error de validación al crear ruta: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al crear ruta", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al crear ruta: " + e.getMessage()));
        }
    }

    /**
     * Actualizar ruta
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar ruta", description = "Actualiza una ruta existente")
    public ResponseEntity<?> updateRuta(
            @PathVariable String id,
            @Valid @RequestBody Ruta ruta) {
        try {
            log.info("PUT /rutas/{}", id);
            
            Ruta rutaActualizada = rutaService.update(id, ruta);
            log.info("Ruta actualizada exitosamente: {}", id);
            
            return ResponseEntity.ok(rutaActualizada);
            
        } catch (IllegalArgumentException e) {
            log.warn("Error de validación al actualizar ruta: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (java.util.NoSuchElementException e) {
            log.warn("Ruta no encontrada: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al actualizar ruta: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al actualizar ruta: " + e.getMessage()));
        }
    }

    /**
     * Cambiar estado de la ruta
     */
    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado", description = "Cambia el estado de una ruta")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable String id,
            @RequestParam String estado) {
        try {
            log.info("PATCH /rutas/{}/estado - nuevo estado: {}", id, estado);
            
            Ruta rutaActualizada = rutaService.cambiarEstado(id, estado);
            log.info("Estado de ruta {} cambiado a: {}", id, estado);
            
            return ResponseEntity.ok(rutaActualizada);
            
        } catch (IllegalArgumentException e) {
            log.warn("Estado inválido: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (java.util.NoSuchElementException e) {
            log.warn("Ruta no encontrada: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al cambiar estado de ruta: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al cambiar estado: " + e.getMessage()));
        }
    }

    /**
     * Eliminar ruta (soft delete)
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar ruta", description = "Desactiva una ruta (soft delete)")
    public ResponseEntity<?> deleteRuta(@PathVariable String id) {
        try {
            log.info("DELETE /rutas/{}", id);
            
            rutaService.delete(id);
            log.info("Ruta eliminada (desactivada) exitosamente: {}", id);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Ruta desactivada exitosamente",
                    "id", id
            ));
            
        } catch (Exception e) {
            log.error("Error al eliminar ruta: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al eliminar ruta: " + e.getMessage()));
        }
    }

    /**
     * Obtener estadísticas de rutas
     */
    @GetMapping("/stats")
    @Operation(summary = "Obtener estadísticas", description = "Retorna estadísticas generales de rutas")
    public ResponseEntity<?> getStats() {
        try {
            log.info("GET /rutas/stats");
            
            Map<String, Object> stats = rutaService.getStats();
            log.debug("Estadísticas calculadas: {}", stats);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("Error al obtener estadísticas de rutas", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener estadísticas: " + e.getMessage()));
        }
    }

    /**
     * Obtener rutas activas (en proceso)
     */
    @GetMapping("/activas")
    @Operation(summary = "Obtener rutas activas", description = "Retorna las rutas que están en proceso")
    public ResponseEntity<?> getRutasActivas() {
        try {
            log.info("GET /rutas/activas");
            
            List<Ruta> rutasActivas = rutaService.findRutasEnProceso();
            
            return ResponseEntity.ok(Map.of(
                    "rutas", rutasActivas,
                    "total", rutasActivas.size()
            ));
            
        } catch (Exception e) {
            log.error("Error al obtener rutas activas", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener rutas activas: " + e.getMessage()));
        }
    }
}
