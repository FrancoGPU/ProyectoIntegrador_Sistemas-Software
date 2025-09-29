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

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidad Ruta - Representa una ruta de entrega en el sistema
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "rutas")
public class Ruta {

    @Id
    private String id;

    @NotBlank(message = "El código de la ruta es obligatorio")
    @Size(max = 20, message = "El código no puede tener más de 20 caracteres")
    @Indexed(unique = true)
    private String codigo;

    @NotBlank(message = "El nombre de la ruta es obligatorio")
    @Size(max = 150, message = "El nombre no puede tener más de 150 caracteres")
    private String nombre;

    @Size(max = 300, message = "La descripción no puede tener más de 300 caracteres")
    private String descripcion;

    @NotBlank(message = "El origen es obligatorio")
    @Size(max = 200, message = "El origen no puede tener más de 200 caracteres")
    private String origen;

    @NotBlank(message = "El destino es obligatorio")
    @Size(max = 200, message = "El destino no puede tener más de 200 caracteres")
    private String destino;

    // Paradas intermedias
    private List<Parada> paradas;

    @NotNull(message = "La distancia es obligatoria")
    @DecimalMin(value = "0.1", message = "La distancia debe ser mayor a 0")
    @Digits(integer = 6, fraction = 2, message = "Formato de distancia inválido")
    private BigDecimal distanciaKm;

    @NotNull(message = "El tiempo estimado es obligatorio")
    @Min(value = 1, message = "El tiempo estimado debe ser al menos 1 minuto")
    private Integer tiempoEstimadoMinutos;

    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "^(Planificada|En Proceso|Completada|Suspendida|Cancelada)$", 
             message = "El estado debe ser: Planificada, En Proceso, Completada, Suspendida o Cancelada")
    @Indexed
    @Builder.Default
    private String estado = "Planificada";

    @NotBlank(message = "La prioridad es obligatoria")
    @Pattern(regexp = "^(Baja|Media|Alta|Urgente)$", 
             message = "La prioridad debe ser: Baja, Media, Alta o Urgente")
    @Indexed
    @Builder.Default
    private String prioridad = "Media";

    // Información del vehículo asignado
    @Size(max = 100, message = "El vehículo asignado no puede tener más de 100 caracteres")
    private String vehiculoAsignado;

    @Size(max = 100, message = "El conductor asignado no puede tener más de 100 caracteres")
    private String conductorAsignado;

    // Costos asociados
    @DecimalMin(value = "0.0", message = "El costo de combustible no puede ser negativo")
    @Builder.Default
    private BigDecimal costoCombustible = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "El costo de peajes no puede ser negativo")
    @Builder.Default
    private BigDecimal costoPeajes = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Otros costos no pueden ser negativos")
    @Builder.Default
    private BigDecimal otrosCostos = BigDecimal.ZERO;

    // Fechas importantes
    private LocalDateTime fechaPlanificada;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFinalizacion;

    @Builder.Default
    private Boolean isActive = true;

    @Size(max = 500, message = "Las observaciones no pueden tener más de 500 caracteres")
    private String observaciones;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Clase interna para paradas
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Parada {
        @NotBlank(message = "La dirección de la parada es obligatoria")
        @Size(max = 200, message = "La dirección no puede tener más de 200 caracteres")
        private String direccion;

        @Size(max = 100, message = "El cliente no puede tener más de 100 caracteres")
        private String cliente;

        @Min(value = 1, message = "El tiempo estimado debe ser al menos 1 minuto")
        @Builder.Default
        private Integer tiempoEstimadoMinutos = 15;

        @Size(max = 300, message = "Las notas no pueden tener más de 300 caracteres")
        private String notas;

        @Builder.Default
        private Boolean completada = false;

        private LocalDateTime horaLlegada;
        private LocalDateTime horaSalida;
    }

    // Métodos de utilidad
    public BigDecimal getCostoTotal() {
        return costoCombustible.add(costoPeajes).add(otrosCostos);
    }

    public Integer getTiempoTotalConParadas() {
        int tiempoParadas = paradas != null ? 
            paradas.stream().mapToInt(Parada::getTiempoEstimadoMinutos).sum() : 0;
        return tiempoEstimadoMinutos + tiempoParadas;
    }

    public boolean isEnProceso() {
        return "En Proceso".equals(estado);
    }

    public boolean isCompletada() {
        return "Completada".equals(estado);
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo != null ? codigo.toUpperCase() : null;
    }
}