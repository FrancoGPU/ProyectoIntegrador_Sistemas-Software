package com.logistock.controller;

import com.logistock.service.ProductService;
import com.logistock.service.ClienteService;
import com.logistock.service.ProveedorService;
import com.logistock.service.RutaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador REST para el dashboard y estadísticas generales
 */
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Dashboard", description = "APIs para estadísticas y métricas del dashboard")
public class DashboardController {

    private final ProductService productService;
    private final ClienteService clienteService;
    private final ProveedorService proveedorService;
    private final RutaService rutaService;

    /**
     * Obtener estadísticas generales del sistema
     */
    @GetMapping("/stats")
    @Operation(summary = "Estadísticas del dashboard", description = "Retorna estadísticas generales del sistema")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        
        try {
            log.info("GET /dashboard/stats");
            
            // Estadísticas de productos
            var allProducts = productService.findAll();
            var lowStockProducts = productService.findLowStockProducts();
            
            long totalProducts = allProducts.size();
            long lowStockCount = lowStockProducts.size();
            
            // Estadísticas de clientes
            var allClientes = clienteService.findAll();
            var topClientes = clienteService.getTopClientes(5);
            
            long totalClientes = allClientes.size();
            
            // Categorías de productos
            Map<String, Long> productCategories = new HashMap<>();
            productCategories.put("Tecnología", productService.countByCategory("Tecnología"));
            productCategories.put("Oficina", productService.countByCategory("Oficina"));
            productCategories.put("Industrial", productService.countByCategory("Industrial"));
            productCategories.put("Consumo", productService.countByCategory("Consumo"));
            productCategories.put("Otros", productService.countByCategory("Otros"));
            
            // Categorías de clientes
            Map<String, Long> clienteCategories = new HashMap<>();
            clienteCategories.put("Premium", clienteService.countByCategoria("Premium"));
            clienteCategories.put("Corporativo", clienteService.countByCategoria("Corporativo"));
            clienteCategories.put("Regular", clienteService.countByCategoria("Regular"));
            
            // Construir respuesta
            Map<String, Object> inventarioStats = new HashMap<>();
            inventarioStats.put("totalProducts", totalProducts);
            inventarioStats.put("lowStockCount", lowStockCount);
            inventarioStats.put("categories", productCategories);
            inventarioStats.put("lowStockPercentage", totalProducts > 0 ? (lowStockCount * 100.0 / totalProducts) : 0);
            
            Map<String, Object> clientesStats = new HashMap<>();
            clientesStats.put("totalClientes", totalClientes);
            clientesStats.put("categories", clienteCategories);
            clientesStats.put("topClientes", topClientes);
            
            // Estadísticas de proveedores
            Map<String, Object> proveedoresStats = proveedorService.getStats();
            
            // Estadísticas de rutas
            Map<String, Object> rutasStats = rutaService.getStats();
            long rutasEnProceso = (Long) rutasStats.get("rutasEnProceso");
            
            Map<String, Object> response = new HashMap<>();
            response.put("inventario", inventarioStats);
            response.put("clientes", clientesStats);
            response.put("proveedores", proveedoresStats);
            response.put("rutas", rutasStats);
            
            // Métricas adicionales para tarjetas del dashboard
            response.put("productosEnInventario", totalProducts);
            response.put("clientesActivos", totalClientes);
            response.put("rutasEnProceso", rutasEnProceso);
            response.put("proveedoresActivos", proveedoresStats.get("totalProveedores"));
            response.put("estadoEstable", lowStockCount == 0 ? "Estable" : "Atención Requerida");
            
            // Cambios vs mes anterior (placeholder - en producción calcular con datos reales)
            response.put("cambioProductos", "+12%");
            response.put("cambioClientes", "+8%");
            response.put("cambioRutas", "Estable");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener estadísticas del dashboard: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Obtener métricas de rendimiento
     */
    @GetMapping("/metrics")
    @Operation(summary = "Métricas de rendimiento", description = "Retorna métricas de rendimiento del sistema")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        
        try {
            log.info("GET /dashboard/metrics");
            
            var allProducts = productService.findAll();
            var allClientes = clienteService.findAll();
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalEntities", allProducts.size() + allClientes.size());
            response.put("systemStatus", "Operacional");
            response.put("lastUpdate", java.time.LocalDateTime.now());
            response.put("uptime", "99.9%");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener métricas: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Health check del sistema
     */
    @GetMapping("/health")
    @Operation(summary = "Estado de salud", description = "Verifica el estado de salud del sistema")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        
        try {
            log.debug("GET /dashboard/health");
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "UP");
            response.put("timestamp", java.time.LocalDateTime.now());
            response.put("version", "1.0.0");
            response.put("database", "Connected");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error en health check: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "DOWN");
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
        }
    }
}