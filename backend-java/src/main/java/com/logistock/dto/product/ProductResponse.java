package com.logistock.dto.product;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductResponse {
    private String id;
    private String code;
    private String name;
    private String description;
    private String category;
    private Integer stock;
    private Integer minStock;
    private BigDecimal price;
    private String supplier;
    private String location;
    private Boolean isActive;
    private String stockStatus; // Computed field
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
