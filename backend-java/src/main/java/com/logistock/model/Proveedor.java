package com.logistock.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidad Proveedor - Representa un proveedor en el sistema
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "proveedores")
public class Proveedor {

    @Id
    private String id;

    @NotBlank(message = "El nombre del proveedor es obligatorio")
    @Size(min = 2, max = 150, message = "El nombre debe tener entre 2 y 150 caracteres")
    @TextIndexed
    private String nombre;

    @NotBlank(message = "La empresa es obligatoria")
    @Size(max = 200, message = "La empresa no puede tener más de 200 caracteres")
    @TextIndexed
    @Indexed
    private String empresa;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Email inválido")
    @Size(max = 100, message = "El email no puede tener más de 100 caracteres")
    @Indexed(unique = true)
    private String email;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^[\\d\\s\\-\\+\\(\\)]+$", message = "Formato de teléfono inválido")
    @Size(max = 20, message = "El teléfono no puede tener más de 20 caracteres")
    private String telefono;

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 300, message = "La dirección no puede tener más de 300 caracteres")
    private String direccion;

    @NotBlank(message = "El tipo es obligatorio")
    @Pattern(regexp = "^(Nacional|Internacional|Regional|Local)$", 
             message = "El tipo debe ser: Nacional, Internacional, Regional o Local")
    @Indexed
    @Builder.Default
    private String tipo = "Nacional";

    @Size(max = 20, message = "El RUC/NIT no puede tener más de 20 caracteres")
    @Indexed
    private String rucNit;

    @Size(max = 100, message = "El país no puede tener más de 100 caracteres")
    @Builder.Default
    private String pais = "Argentina";

    @Size(max = 100, message = "La ciudad no puede tener más de 100 caracteres")
    private String ciudad;

    // Términos comerciales
    @Min(value = 1, message = "Los días de pago deben ser al menos 1")
    @Max(value = 365, message = "Los días de pago no pueden ser más de 365")
    @Builder.Default
    private Integer diasPago = 30;

    @DecimalMin(value = "0.0", message = "El descuento no puede ser negativo")
    @DecimalMax(value = "100.0", message = "El descuento no puede ser mayor a 100%")
    @Builder.Default
    private BigDecimal descuentoGeneral = BigDecimal.ZERO;

    // Categorías de productos que suministra
    private List<String> categoriasProductos;

    @Builder.Default
    private Boolean isActive = true;

    @Size(max = 500, message = "Las notas no pueden tener más de 500 caracteres")
    private String notas;

    // Información de contacto adicional
    private ContactoComercial contactoComercial;

    // Métricas
    @Builder.Default
    private Integer totalOrdenes = 0;

    @Builder.Default
    private BigDecimal montoTotalCompras = BigDecimal.ZERO;

    private LocalDateTime ultimaOrden;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Clase interna para contacto comercial
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ContactoComercial {
        @Size(max = 100, message = "El nombre del contacto comercial no puede tener más de 100 caracteres")
        private String nombre;

        @Size(max = 100, message = "El cargo no puede tener más de 100 caracteres")
        private String cargo;

        @Pattern(regexp = "^[\\d\\s\\-\\+\\(\\)]*$", message = "Formato de teléfono inválido")
        @Size(max = 20, message = "El teléfono no puede tener más de 20 caracteres")
        private String telefono;

        @Email(message = "Email inválido")
        @Size(max = 100, message = "El email no puede tener más de 100 caracteres")
        private String email;
    }

    // Métodos de utilidad
    public String getNombreCompleto() {
        return nombre + " (" + empresa + ")";
    }

    public void setEmail(String email) {
        this.email = email != null ? email.toLowerCase() : null;
    }
}