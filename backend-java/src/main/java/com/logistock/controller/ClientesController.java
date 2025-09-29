package com.logistock.controller;

import com.logistock.model.Cliente;
import com.logistock.service.ClienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión de clientes
 */
@RestController
@RequestMapping("/clientes")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Clientes", description = "APIs para la gestión de clientes")
public class ClientesController {

    private final ClienteService clienteService;

    /**
     * Obtener todos los clientes
     */
    @GetMapping
    @Operation(summary = "Obtener todos los clientes", description = "Retorna la lista de todos los clientes activos")
    public ResponseEntity<Map<String, Object>> getAllClientes(
            @Parameter(description = "Categoría para filtrar") @RequestParam(required = false) String categoria,
            @Parameter(description = "Texto para búsqueda") @RequestParam(required = false) String search,
            @Parameter(description = "Empresa para filtrar") @RequestParam(required = false) String empresa) {
        
        try {
            log.info("GET /clientes - categoria: {}, search: {}, empresa: {}", categoria, search, empresa);
            
            List<Cliente> clientes;
            
            if (search != null && !search.trim().isEmpty()) {
                clientes = clienteService.searchByText(search.trim());
            } else if (categoria != null && !categoria.trim().isEmpty()) {
                clientes = clienteService.findByCategoria(categoria.trim());
            } else if (empresa != null && !empresa.trim().isEmpty()) {
                clientes = clienteService.findByEmpresa(empresa.trim());
            } else {
                clientes = clienteService.findAll();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("clientes", clientes);
            response.put("total", clientes.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener clientes: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Obtener cliente por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener cliente por ID", description = "Retorna un cliente específico por su ID")
    public ResponseEntity<Map<String, Object>> getClienteById(
            @Parameter(description = "ID del cliente") @PathVariable String id) {
        
        try {
            log.info("GET /clientes/{}", id);
            
            return clienteService.findById(id)
                .map(cliente -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("cliente", cliente);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Cliente no encontrado");
                    errorResponse.put("message", "No existe un cliente con ID: " + id);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
                });
                
        } catch (Exception e) {
            log.error("Error al obtener cliente {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Crear nuevo cliente
     */
    @PostMapping
    @Operation(summary = "Crear nuevo cliente", description = "Crea un nuevo cliente en el sistema")
    public ResponseEntity<Map<String, Object>> createCliente(
            @Parameter(description = "Datos del cliente a crear") @Valid @RequestBody Cliente cliente) {
        
        try {
            log.info("POST /clientes - Creando cliente: {}", cliente.getNombre());
            
            Cliente savedCliente = clienteService.save(cliente);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cliente creado exitosamente");
            response.put("cliente", savedCliente);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Error de validación al crear cliente: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error de validación");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error al crear cliente: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Actualizar cliente existente
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar cliente", description = "Actualiza un cliente existente")
    public ResponseEntity<Map<String, Object>> updateCliente(
            @Parameter(description = "ID del cliente") @PathVariable String id,
            @Parameter(description = "Datos actualizados del cliente") @Valid @RequestBody Cliente cliente) {
        
        try {
            log.info("PUT /clientes/{} - Actualizando cliente", id);
            
            Cliente updatedCliente = clienteService.update(id, cliente);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cliente actualizado exitosamente");
            response.put("cliente", updatedCliente);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Error de validación al actualizar cliente {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error de validación");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error al actualizar cliente {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Eliminar cliente
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar cliente", description = "Elimina un cliente del sistema (soft delete)")
    public ResponseEntity<Map<String, Object>> deleteCliente(
            @Parameter(description = "ID del cliente") @PathVariable String id) {
        
        try {
            log.info("DELETE /clientes/{}", id);
            
            clienteService.deleteById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cliente eliminado exitosamente");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Error al eliminar cliente {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Cliente no encontrado");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error al eliminar cliente {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Obtener top clientes
     */
    @GetMapping("/top")
    @Operation(summary = "Top clientes", description = "Retorna los clientes con mayor volumen de compras")
    public ResponseEntity<Map<String, Object>> getTopClientes(
            @Parameter(description = "Límite de resultados") @RequestParam(defaultValue = "10") int limit) {
        
        try {
            log.info("GET /clientes/top - limit: {}", limit);
            
            List<Cliente> topClientes = clienteService.getTopClientes(limit);
            
            Map<String, Object> response = new HashMap<>();
            response.put("clientes", topClientes);
            response.put("total", topClientes.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener top clientes: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Estadísticas de clientes
     */
    @GetMapping("/stats")
    @Operation(summary = "Estadísticas de clientes", description = "Retorna estadísticas generales de clientes")
    public ResponseEntity<Map<String, Object>> getClientesStats() {
        
        try {
            log.info("GET /clientes/stats");
            
            List<Cliente> allClientes = clienteService.findAll();
            long totalClientes = allClientes.size();
            
            // Estadísticas por categoría
            Map<String, Long> categoryStats = new HashMap<>();
            categoryStats.put("Premium", clienteService.countByCategoria("Premium"));
            categoryStats.put("Corporativo", clienteService.countByCategoria("Corporativo"));
            categoryStats.put("Regular", clienteService.countByCategoria("Regular"));
            
            // Clientes inactivos (sin compras en 30 días)
            List<Cliente> clientesInactivos = clienteService.getClientesInactivos(30);
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalClientes", totalClientes);
            response.put("categoryStats", categoryStats);
            response.put("clientesInactivos", clientesInactivos.size());
            response.put("clientesActivos", totalClientes - clientesInactivos.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener estadísticas de clientes: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}