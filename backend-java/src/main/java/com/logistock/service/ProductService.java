package com.logistock.service;

import com.logistock.model.Product;
import com.logistock.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Servicio para la gestión de productos (versión simplificada)
 */
@Service
public class ProductService {

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
}