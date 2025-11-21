```java
package com.logistock.controller;

import com.logistock.dto.product.ProductRequest;
import com.logistock.dto.product.ProductResponse;
import com.logistock.exception.ResourceNotFoundException;
import com.logistock.model.Product;
import com.logistock.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        
        log.info("GET /inventario - page: {}, size: {}, sortBy: {}, sortDir: {}", page, size, sortBy, sortDir);
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        List<Product> products;
        
        if (search != null && !search.trim().isEmpty()) {
            products = productService.searchByText(search.trim());
        } else if (category != null && !category.trim().isEmpty()) {
            products = productService.findByCategory(category.trim());
        } else {
            products = productService.findAll();
        }
        
        // Convertir a DTOs
        List<ProductResponse> productDTOs = products.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        
        // Simular paginación (ya que el servicio retorna todo por ahora)
        int start = Math.min((int)PageRequest.of(page, size).getOffset(), productDTOs.size());
        int end = Math.min((start + size), productDTOs.size());
        List<ProductResponse> pagedProducts = productDTOs.subList(start, end);
        
        Map<String, Object> response = new HashMap<>();
        response.put("products", pagedProducts);
        response.put("total", productDTOs.size());
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", (int) Math.ceil((double) productDTOs.size() / size));
        
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener producto por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto por ID", description = "Retorna un producto específico por su ID")
    public ResponseEntity<ProductResponse> getProductById(
            @Parameter(description = "ID del producto") @PathVariable String id) {
        
        log.info("GET /inventario/{}", id);
        
        Product product = productService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));
                
        return ResponseEntity.ok(mapToDTO(product));
    }

    /**
     * Crear nuevo producto
     */
    @PostMapping
    @Operation(summary = "Crear nuevo producto", description = "Crea un nuevo producto en el inventario")
    public ResponseEntity<Map<String, Object>> createProduct(
            @Parameter(description = "Datos del producto a crear") @Valid @RequestBody ProductRequest productRequest) {
        
        log.info("POST /inventario - Creando producto: {}", productRequest.getName());
        
        Product product = mapToEntity(productRequest);
        Product savedProduct = productService.save(product);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Producto creado exitosamente");
        response.put("product", mapToDTO(savedProduct));
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Actualizar producto existente
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar producto", description = "Actualiza un producto existente")
    public ResponseEntity<Map<String, Object>> updateProduct(
            @Parameter(description = "ID del producto") @PathVariable String id,
            @Parameter(description = "Datos actualizados del producto") @Valid @RequestBody ProductRequest productRequest) {
        
        log.info("PUT /inventario/{} - Actualizando producto", id);
        
        if (!productService.existsById(id)) {
            throw new ResourceNotFoundException("Producto no encontrado con ID: " + id);
        }

        Product product = mapToEntity(productRequest);
        // El servicio maneja la actualización de campos
        Product updatedProduct = productService.update(id, product);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Producto actualizado exitosamente");
        response.put("product", mapToDTO(updatedProduct));
        
        return ResponseEntity.ok(response);
    }

    /**
     * Eliminar producto
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar producto", description = "Elimina un producto del inventario (soft delete)")
    public ResponseEntity<Map<String, Object>> deleteProduct(
            @Parameter(description = "ID del producto") @PathVariable String id) {
        
        log.info("DELETE /inventario/{}", id);
        
        if (!productService.existsById(id)) {
            throw new ResourceNotFoundException("Producto no encontrado con ID: " + id);
        }
        
        productService.deleteById(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Producto eliminado exitosamente");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener productos con stock bajo
     */
    @GetMapping("/low-stock")
    @Operation(summary = "Productos con stock bajo", description = "Retorna productos que necesitan reposición")
    public ResponseEntity<Map<String, Object>> getLowStockProducts() {
        
        log.info("GET /inventario/low-stock");
        
        List<Product> lowStockProducts = productService.findLowStockProducts();
        List<ProductResponse> dtos = lowStockProducts.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("products", dtos);
        response.put("total", dtos.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Estadísticas del inventario
     */
    @GetMapping("/stats")
    @Operation(summary = "Estadísticas del inventario", description = "Retorna estadísticas generales del inventario")
    public ResponseEntity<Map<String, Object>> getInventoryStats() {
        
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
    }

    // Métodos de mapeo manual (podría usarse MapStruct en el futuro)
    private ProductResponse mapToDTO(Product product) {
        ProductResponse dto = new ProductResponse();
        dto.setId(product.getId());
        dto.setCode(product.getCode());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setCategory(product.getCategory());
        dto.setStock(product.getStock());
        dto.setMinStock(product.getMinStock());
        dto.setPrice(product.getPrice());
        dto.setSupplier(product.getSupplier());
        dto.setLocation(product.getLocation());
        dto.setIsActive(product.getIsActive());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        
        // Campo calculado
        if (product.getStock() <= product.getMinStock()) {
            dto.setStockStatus("low");
        } else if (product.getStock() <= product.getMinStock() * 1.5) {
            dto.setStockStatus("medium");
        } else {
            dto.setStockStatus("good");
        }
        
        return dto;
    }

    private Product mapToEntity(ProductRequest request) {
        Product product = new Product();
        product.setCode(request.getCode());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setStock(request.getStock());
        product.setMinStock(request.getMinStock());
        product.setPrice(request.getPrice());
        product.setSupplier(request.getSupplier());
        product.setLocation(request.getLocation());
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        return product;
    }
}
```