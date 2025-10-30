package com.logistock.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO para resultado de validación de stock antes de crear pedido
 */
public class StockValidationResult {
    
    private boolean hasLowStockWarnings;
    private List<LowStockWarning> warnings;
    
    public StockValidationResult() {
        this.hasLowStockWarnings = false;
        this.warnings = new ArrayList<>();
    }
    
    public void addWarning(String productId, String productName, int currentStock, int minStock, int requestedQuantity, int resultingStock) {
        this.hasLowStockWarnings = true;
        this.warnings.add(new LowStockWarning(productId, productName, currentStock, minStock, requestedQuantity, resultingStock));
    }
    
    // Getters y Setters
    public boolean isHasLowStockWarnings() {
        return hasLowStockWarnings;
    }
    
    public void setHasLowStockWarnings(boolean hasLowStockWarnings) {
        this.hasLowStockWarnings = hasLowStockWarnings;
    }
    
    public List<LowStockWarning> getWarnings() {
        return warnings;
    }
    
    public void setWarnings(List<LowStockWarning> warnings) {
        this.warnings = warnings;
    }
    
    /**
     * Clase interna para cada advertencia de stock bajo
     */
    public static class LowStockWarning {
        private String productId;
        private String productName;
        private int currentStock;
        private int minStock;
        private int requestedQuantity;
        private int resultingStock;
        
        public LowStockWarning(String productId, String productName, int currentStock, int minStock, int requestedQuantity, int resultingStock) {
            this.productId = productId;
            this.productName = productName;
            this.currentStock = currentStock;
            this.minStock = minStock;
            this.requestedQuantity = requestedQuantity;
            this.resultingStock = resultingStock;
        }
        
        // Getters y Setters
        public String getProductId() {
            return productId;
        }
        
        public void setProductId(String productId) {
            this.productId = productId;
        }
        
        public String getProductName() {
            return productName;
        }
        
        public void setProductName(String productName) {
            this.productName = productName;
        }
        
        public int getCurrentStock() {
            return currentStock;
        }
        
        public void setCurrentStock(int currentStock) {
            this.currentStock = currentStock;
        }
        
        public int getMinStock() {
            return minStock;
        }
        
        public void setMinStock(int minStock) {
            this.minStock = minStock;
        }
        
        public int getRequestedQuantity() {
            return requestedQuantity;
        }
        
        public void setRequestedQuantity(int requestedQuantity) {
            this.requestedQuantity = requestedQuantity;
        }
        
        public int getResultingStock() {
            return resultingStock;
        }
        
        public void setResultingStock(int resultingStock) {
            this.resultingStock = resultingStock;
        }
    }
}
