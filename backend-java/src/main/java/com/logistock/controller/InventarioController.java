package com.logistock.controller;

import com.logistock.model.Product;
import com.logistock.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión del inventario (productos)
 */
@RestController
@RequestMapping("/inventario")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Inventario", description = "APIs para la gestión de productos del inventario")
public class InventarioController {

    private final ProductService productService;

    /**
     * Obtener todos los productos
     */
    @GetMapping
    @Operation(summary = "Obtener todos los productos", description = "Retorna la lista de todos los productos activos")
    public ResponseEntity<Map<String, Object>> getAllProducts(
            @Parameter(description = "Número de página (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Campo para ordenar") @RequestParam(defaultValue = "name") String sortBy,
            @Parameter(description = "Dirección del ordenamiento") @RequestParam(defaultValue = "asc") String sortDir,
            @Parameter(description = "Categoría para filtrar") @RequestParam(required = false) String category,
            @Parameter(description = "Texto para búsqueda") @RequestParam(required = false) String search) {
        
        try {
            log.info("GET /inventario - page: {}, size: {}, sortBy: {}, sortDir: {}", page, size, sortBy, sortDir);
            
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            List<Product> products;
            
            if (search != null && !search.trim().isEmpty()) {
                products = productService.searchByText(search.trim());
            } else if (category != null && !category.trim().isEmpty()) {
                products = productService.findByCategory(category.trim());
            } else {
                products = productService.findAll();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("products", products);
            response.put("total", products.size());
            response.put("page", page);
            response.put("size", size);
            response.put("totalPages", (int) Math.ceil((double) products.size() / size));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener productos: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Obtener producto por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto por ID", description = "Retorna un producto específico por su ID")
    public ResponseEntity<Map<String, Object>> getProductById(
            @Parameter(description = "ID del producto") @PathVariable String id) {
        
        try {
            log.info("GET /inventario/{}", id);
            
            return productService.findById(id)
                .map(product -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("product", product);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Producto no encontrado");
                    errorResponse.put("message", "No existe un producto con ID: " + id);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
                });
                
        } catch (Exception e) {
            log.error("Error al obtener producto {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Crear nuevo producto
     */
    @PostMapping
    @Operation(summary = "Crear nuevo producto", description = "Crea un nuevo producto en el inventario")
    public ResponseEntity<Map<String, Object>> createProduct(
            @Parameter(description = "Datos del producto a crear") @Valid @RequestBody Product product) {
        
        try {
            log.info("POST /inventario - Creando producto: {}", product.getName());
            
            Product savedProduct = productService.save(product);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Producto creado exitosamente");
            response.put("product", savedProduct);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Error de validación al crear producto: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error de validación");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error al crear producto: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Actualizar producto existente
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar producto", description = "Actualiza un producto existente")
    public ResponseEntity<Map<String, Object>> updateProduct(
            @Parameter(description = "ID del producto") @PathVariable String id,
            @Parameter(description = "Datos actualizados del producto") @Valid @RequestBody Product product) {
        
        try {
            log.info("PUT /inventario/{} - Actualizando producto", id);
            
            Product updatedProduct = productService.update(id, product);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Producto actualizado exitosamente");
            response.put("product", updatedProduct);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Error de validación al actualizar producto {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error de validación");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error al actualizar producto {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Eliminar producto
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar producto", description = "Elimina un producto del inventario (soft delete)")
    public ResponseEntity<Map<String, Object>> deleteProduct(
            @Parameter(description = "ID del producto") @PathVariable String id) {
        
        try {
            log.info("DELETE /inventario/{}", id);
            
            productService.deleteById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Producto eliminado exitosamente");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Error al eliminar producto {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Producto no encontrado");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error al eliminar producto {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Obtener productos con stock bajo
     */
    @GetMapping("/low-stock")
    @Operation(summary = "Productos con stock bajo", description = "Retorna productos que necesitan reposición")
    public ResponseEntity<Map<String, Object>> getLowStockProducts() {
        
        try {
            log.info("GET /inventario/low-stock");
            
            List<Product> lowStockProducts = productService.findLowStockProducts();
            
            Map<String, Object> response = new HashMap<>();
            response.put("products", lowStockProducts);
            response.put("total", lowStockProducts.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener productos con stock bajo: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Estadísticas del inventario
     */
    @GetMapping("/stats")
    @Operation(summary = "Estadísticas del inventario", description = "Retorna estadísticas generales del inventario")
    public ResponseEntity<Map<String, Object>> getInventoryStats() {
        
        try {
            log.info("GET /inventario/stats");
            
            List<Product> allProducts = productService.findAll();
            List<Product> lowStockProducts = productService.findLowStockProducts();
            
            long totalProducts = allProducts.size();
            long lowStockCount = lowStockProducts.size();
            
            // Estadísticas por categoría
            Map<String, Long> categoryStats = new HashMap<>();
            categoryStats.put("Tecnología", productService.countByCategory("Tecnología"));
            categoryStats.put("Oficina", productService.countByCategory("Oficina"));
            categoryStats.put("Industrial", productService.countByCategory("Industrial"));
            categoryStats.put("Consumo", productService.countByCategory("Consumo"));
            categoryStats.put("Otros", productService.countByCategory("Otros"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalProducts", totalProducts);
            response.put("lowStockCount", lowStockCount);
            response.put("categoryStats", categoryStats);
            response.put("lowStockPercentage", totalProducts > 0 ? (lowStockCount * 100.0 / totalProducts) : 0);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener estadísticas del inventario: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}