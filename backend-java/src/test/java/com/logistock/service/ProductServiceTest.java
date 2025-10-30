package com.logistock.service;

import com.logistock.dto.StockValidationResult;
import com.logistock.model.Product;
import com.logistock.model.ProductoPedido;
import com.logistock.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void validateStockForOrder_noWarnings() {
        Product p = new Product();
        p.setId("p1");
        p.setName("Producto A");
        p.setStock(20);
        p.setMinStock(5);
        p.setPrice(BigDecimal.valueOf(10.0));

        when(productRepository.findById("p1")).thenReturn(Optional.of(p));

        ProductoPedido pp = new ProductoPedido("p1", "Producto A", 3, 10.0);
        StockValidationResult res = productService.validateStockForOrder(List.of(pp));

        assertNotNull(res);
        assertFalse(res.isHasLowStockWarnings(), "No deberían existir advertencias");
        assertEquals(0, res.getWarnings().size());
    }

    @Test
    void validateStockForOrder_withWarnings() {
        Product p = new Product();
        p.setId("p2");
        p.setName("Producto B");
        p.setStock(5);
        p.setMinStock(5);
        p.setPrice(BigDecimal.valueOf(15.0));

        when(productRepository.findById("p2")).thenReturn(Optional.of(p));

        ProductoPedido pp = new ProductoPedido("p2", "Producto B", 1, 15.0);
        StockValidationResult res = productService.validateStockForOrder(List.of(pp));

        assertNotNull(res);
        assertTrue(res.isHasLowStockWarnings(), "Debería existir al menos una advertencia");
        assertEquals(1, res.getWarnings().size());
        assertEquals("Producto B", res.getWarnings().get(0).getProductName());
    }

    @Test
    void validateStockForOrder_productNotFound() {
        when(productRepository.findById("missing")).thenReturn(Optional.empty());

        ProductoPedido pp = new ProductoPedido("missing", "No existe", 1, 1.0);

        Exception ex = assertThrows(IllegalArgumentException.class, () -> {
            productService.validateStockForOrder(List.of(pp));
        });

        assertTrue(ex.getMessage().contains("Producto no encontrado"));
    }
}
