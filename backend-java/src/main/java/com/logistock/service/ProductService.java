package com.logistock.service;

import com.logistock.dto.StockValidationResult;
import com.logistock.model.Product;
import com.logistock.model.ProductoPedido;
import com.logistock.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Servicio para la gestión de productos (versión simplificada)
 */
@Service
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private ProductRepository productRepository;

    /**
     * Obtener todos los productos
     */
    public List<Product> findAll() {
        return productRepository.findAll();
    }

    /**
     * Buscar producto por ID
     */
    public Optional<Product> findById(String id) {
        return productRepository.findById(id);
    }

    /**
     * Crear nuevo producto
     */
    public Product save(Product product) {
        return productRepository.save(product);
    }

    /**
     * Eliminar producto
     */
    public void deleteById(String id) {
        productRepository.deleteById(id);
    }

    /**
     * Actualizar producto existente
     */
    public Product update(String id, Product product) {
        Optional<Product> existingOpt = productRepository.findById(id);
        if (existingOpt.isPresent()) {
            Product existing = existingOpt.get();
            existing.setName(product.getName());
            existing.setDescription(product.getDescription());
            existing.setCategory(product.getCategory());
            existing.setStock(product.getStock());
            existing.setMinStock(product.getMinStock());
            existing.setPrice(product.getPrice());
            existing.setSupplier(product.getSupplier());
            existing.setLocation(product.getLocation());
            return productRepository.save(existing);
        }
        throw new IllegalArgumentException("Producto no encontrado con ID: " + id);
    }

    /**
     * Buscar productos por categoría
     */
    public List<Product> findByCategory(String category) {
        // Por ahora retornamos todos los productos
        return productRepository.findAll();
    }

    /**
     * Buscar productos por texto
     */
    public List<Product> searchByText(String searchText) {
        // Por ahora retornamos todos los productos
        return productRepository.findAll();
    }

    /**
     * Buscar productos con stock bajo
     */
    public List<Product> findLowStockProducts() {
        // Por ahora retornamos todos los productos
        return productRepository.findAll();
    }

    /**
     * Contar productos por categoría
     */
    public long countByCategory(String category) {
        // Por ahora retornamos el total de productos
        return productRepository.count();
    }

    /**
     * Verificar si existe un producto
     */
    public boolean existsById(String id) {
        return productRepository.existsById(id);
    }

    /**
     * Reducir el stock de un producto
     * @param productId ID del producto
     * @param cantidad Cantidad a reducir
     * @throws IllegalArgumentException si el producto no existe
     * @throws IllegalStateException si no hay suficiente stock
     */
    public void reducirStock(String productId, int cantidad) {
        logger.info("📉 Reduciendo stock - Producto ID: {}, Cantidad: {}", productId, cantidad);
        
        Product producto = productRepository.findById(productId)
            .orElseThrow(() -> {
                logger.error("❌ Producto no encontrado con ID: {}", productId);
                return new IllegalArgumentException("Producto no encontrado con ID: " + productId);
            });
        
        int stockActual = producto.getStock();
        logger.info("📊 Stock actual del producto '{}': {}", producto.getName(), stockActual);
        
        if (stockActual < cantidad) {
            logger.error("❌ Stock insuficiente - Producto: {}, Stock actual: {}, Solicitado: {}", 
                producto.getName(), stockActual, cantidad);
            throw new IllegalStateException(
                String.format("Stock insuficiente para el producto '%s'. Stock actual: %d, solicitado: %d", 
                    producto.getName(), stockActual, cantidad)
            );
        }
        
        int nuevoStock = stockActual - cantidad;
        producto.setStock(nuevoStock);
        productRepository.save(producto);
        logger.info("✅ Stock actualizado - Producto: {}, Anterior: {}, Nuevo: {}", 
            producto.getName(), stockActual, nuevoStock);
    }

    /**
     * Aumentar el stock de un producto (para devoluciones o cancelaciones)
     * @param productId ID del producto
     * @param cantidad Cantidad a aumentar
     * @throws IllegalArgumentException si el producto no existe
     */
    public void aumentarStock(String productId, int cantidad) {
        logger.info("📈 Aumentando stock - Producto ID: {}, Cantidad: {}", productId, cantidad);
        
        Product producto = productRepository.findById(productId)
            .orElseThrow(() -> {
                logger.error("❌ Producto no encontrado con ID: {}", productId);
                return new IllegalArgumentException("Producto no encontrado con ID: " + productId);
            });
        
        int stockActual = producto.getStock();
        int nuevoStock = stockActual + cantidad;
        producto.setStock(nuevoStock);
        productRepository.save(producto);
        logger.info("✅ Stock restaurado - Producto: {}, Anterior: {}, Nuevo: {}", 
            producto.getName(), stockActual, nuevoStock);
    }

    /**
     * Validar si reducir stock dejará productos por debajo del stock mínimo
     * @param productId ID del producto
     * @param cantidad Cantidad a reducir
     * @return true si el stock resultante quedará por debajo del mínimo
     */
    public StockValidationResult validateStockReduction(String productId, int cantidad) {
        StockValidationResult result = new StockValidationResult();
        
        Product producto = productRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + productId));
        
        int stockActual = producto.getStock();
        int stockResultante = stockActual - cantidad;
        int stockMinimo = producto.getMinStock() != null ? producto.getMinStock() : 0;
        
        if (stockResultante < stockMinimo) {
            logger.warn("⚠️ Advertencia: Stock bajo - Producto: {}, Stock resultante: {}, Stock mínimo: {}", 
                producto.getName(), stockResultante, stockMinimo);
            result.addWarning(productId, producto.getName(), stockActual, stockMinimo, cantidad, stockResultante);
        }
        
        return result;
    }

    /**
     * Validar stock para múltiples productos (validación de pedido completo)
     * @param productos Lista de productos del pedido
     * @return StockValidationResult con advertencias si algún producto queda bajo el mínimo
     */
    public StockValidationResult validateStockForOrder(List<ProductoPedido> productos) {
        logger.info("🔍 Validando stock para {} productos del pedido", productos.size());
        StockValidationResult result = new StockValidationResult();
        
        for (ProductoPedido productoPedido : productos) {
            Product producto = productRepository.findById(productoPedido.getProductoId())
                .orElseThrow(() -> {
                    logger.error("❌ Producto no encontrado: {}", productoPedido.getProductoId());
                    return new IllegalArgumentException("Producto no encontrado: " + productoPedido.getProductoId());
                });
            
            int stockActual = producto.getStock();
            int cantidad = productoPedido.getCantidad();
            int stockResultante = stockActual - cantidad;
            int stockMinimo = producto.getMinStock() != null ? producto.getMinStock() : 0;
            
            logger.debug("📊 Validando producto: {} - Stock actual: {}, Solicitado: {}, Resultante: {}, Mínimo: {}",
                producto.getName(), stockActual, cantidad, stockResultante, stockMinimo);
            
            if (stockResultante < stockMinimo) {
                logger.warn("⚠️ ADVERTENCIA: {} quedará con stock bajo el mínimo ({} < {})", 
                    producto.getName(), stockResultante, stockMinimo);
                result.addWarning(
                    producto.getId(),
                    producto.getName(),
                    stockActual,
                    stockMinimo,
                    cantidad,
                    stockResultante
                );
            }
        }
        
        if (result.isHasLowStockWarnings()) {
            logger.warn("⚠️ Validación completada: {} productos con advertencia de stock bajo", result.getWarnings().size());
        } else {
            logger.info("✅ Validación completada: Todos los productos tienen stock suficiente");
        }
        
        return result;
    }
}