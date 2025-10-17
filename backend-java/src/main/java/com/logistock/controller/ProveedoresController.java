package com.logistock.controller;

import com.logistock.model.Proveedor;
import com.logistock.service.ProveedorService;
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
 * Controlador REST para la gestión de proveedores
 */
@RestController
@RequestMapping("/proveedores")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Proveedores", description = "APIs para la gestión de proveedores")
public class ProveedoresController {

    private final ProveedorService proveedorService;

    /**
     * Obtener todos los proveedores
     */
    @GetMapping
    @Operation(summary = "Obtener todos los proveedores", description = "Retorna la lista de todos los proveedores activos con filtros opcionales")
    public ResponseEntity<Map<String, Object>> getAllProveedores(
            @Parameter(description = "Número de página (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Campo para ordenar") @RequestParam(defaultValue = "nombre") String sortBy,
            @Parameter(description = "Dirección de ordenamiento") @RequestParam(defaultValue = "asc") String sortDirection,
            @Parameter(description = "Tipo para filtrar") @RequestParam(required = false) String tipo,
            @Parameter(description = "Texto para búsqueda") @RequestParam(required = false) String search,
            @Parameter(description = "Categoría de producto") @RequestParam(required = false) String categoria) {
        
        try {
            log.info("GET /proveedores - página: {}, tamaño: {}, tipo: {}, búsqueda: {}", page, size, tipo, search);
            
            List<Proveedor> proveedores;
            Map<String, Object> response = new HashMap<>();
            
            // Aplicar filtros
            if (search != null && !search.trim().isEmpty()) {
                proveedores = proveedorService.searchByText(search.trim());
                response.put("proveedores", proveedores);
                response.put("total", proveedores.size());
                response.put("page", 0);
                response.put("size", proveedores.size());
                response.put("totalPages", 1);
            } else if (tipo != null && !tipo.trim().isEmpty()) {
                proveedores = proveedorService.findByTipo(tipo.trim());
                response.put("proveedores", proveedores);
                response.put("total", proveedores.size());
                response.put("page", 0);
                response.put("size", proveedores.size());
                response.put("totalPages", 1);
            } else if (categoria != null && !categoria.trim().isEmpty()) {
                proveedores = proveedorService.findByCategoria(categoria.trim());
                response.put("proveedores", proveedores);
                response.put("total", proveedores.size());
                response.put("page", 0);
                response.put("size", proveedores.size());
                response.put("totalPages", 1);
            } else {
                // Sin filtros - usar paginación
                Page<Proveedor> pageResult = proveedorService.findAll(page, size, sortBy, sortDirection);
                response.put("proveedores", pageResult.getContent());
                response.put("total", pageResult.getTotalElements());
                response.put("page", pageResult.getNumber());
                response.put("size", pageResult.getSize());
                response.put("totalPages", pageResult.getTotalPages());
            }
            
            log.info("Proveedores encontrados: {}", response.get("total"));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener proveedores", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener proveedores: " + e.getMessage()));
        }
    }

    /**
     * Obtener proveedor por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener proveedor por ID", description = "Retorna un proveedor específico por su ID")
    public ResponseEntity<Object> getProveedorById(@PathVariable String id) {
        try {
            log.info("GET /proveedores/{}", id);
            
            return proveedorService.findById(id)
                    .<ResponseEntity<Object>>map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("error", "Proveedor no encontrado con ID: " + id)));
                            
        } catch (Exception e) {
            log.error("Error al obtener proveedor por ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener proveedor: " + e.getMessage()));
        }
    }

    /**
     * Crear nuevo proveedor
     */
    @PostMapping
    @Operation(summary = "Crear proveedor", description = "Crea un nuevo proveedor en el sistema")
    public ResponseEntity<?> createProveedor(@Valid @RequestBody Proveedor proveedor) {
        try {
            log.info("POST /proveedores - nombre: {}", proveedor.getNombre());
            
            Proveedor nuevoProveedor = proveedorService.create(proveedor);
            log.info("Proveedor creado exitosamente con ID: {}", nuevoProveedor.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProveedor);
            
        } catch (IllegalArgumentException e) {
            log.warn("Error de validación al crear proveedor: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al crear proveedor", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al crear proveedor: " + e.getMessage()));
        }
    }

    /**
     * Actualizar proveedor
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar proveedor", description = "Actualiza un proveedor existente")
    public ResponseEntity<?> updateProveedor(
            @PathVariable String id,
            @Valid @RequestBody Proveedor proveedor) {
        try {
            log.info("PUT /proveedores/{}", id);
            
            Proveedor proveedorActualizado = proveedorService.update(id, proveedor);
            log.info("Proveedor actualizado exitosamente: {}", id);
            
            return ResponseEntity.ok(proveedorActualizado);
            
        } catch (IllegalArgumentException e) {
            log.warn("Error de validación al actualizar proveedor: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (java.util.NoSuchElementException e) {
            log.warn("Proveedor no encontrado: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al actualizar proveedor: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al actualizar proveedor: " + e.getMessage()));
        }
    }

    /**
     * Eliminar proveedor (soft delete)
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar proveedor", description = "Desactiva un proveedor (soft delete)")
    public ResponseEntity<?> deleteProveedor(@PathVariable String id) {
        try {
            log.info("DELETE /proveedores/{}", id);
            
            proveedorService.delete(id);
            log.info("Proveedor eliminado (desactivado) exitosamente: {}", id);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Proveedor desactivado exitosamente",
                    "id", id
            ));
            
        } catch (Exception e) {
            log.error("Error al eliminar proveedor: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al eliminar proveedor: " + e.getMessage()));
        }
    }

    /**
     * Obtener estadísticas de proveedores
     */
    @GetMapping("/stats")
    @Operation(summary = "Obtener estadísticas", description = "Retorna estadísticas generales de proveedores")
    public ResponseEntity<?> getStats() {
        try {
            log.info("GET /proveedores/stats");
            
            Map<String, Object> stats = proveedorService.getStats();
            log.debug("Estadísticas calculadas: {}", stats);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("Error al obtener estadísticas de proveedores", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener estadísticas: " + e.getMessage()));
        }
    }

    /**
     * Obtener top proveedores
     */
    @GetMapping("/top")
    @Operation(summary = "Obtener top proveedores", description = "Retorna los proveedores con mayor monto de compras")
    public ResponseEntity<?> getTopProveedores(
            @Parameter(description = "Límite de resultados") @RequestParam(defaultValue = "5") int limit) {
        try {
            log.info("GET /proveedores/top - limit: {}", limit);
            
            List<Proveedor> topProveedores = proveedorService.getTopProveedores(limit);
            
            return ResponseEntity.ok(Map.of(
                    "proveedores", topProveedores,
                    "total", topProveedores.size()
            ));
            
        } catch (Exception e) {
            log.error("Error al obtener top proveedores", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener top proveedores: " + e.getMessage()));
        }
    }
}
