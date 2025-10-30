package com.logistock.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "pedidos")
public class Pedido {
    
    @Id
    private String id;
    
    private String clienteId;
    private String clienteNombre;
    private String clienteDireccion;
    private String clienteTelefono;
    
    private List<ProductoPedido> productos;
    
    private String direccionEntrega;
    private String observaciones;
    
    private EstadoPedido estado;
    
    private String usuarioAsignadoId;
    private String usuarioAsignadoNombre;
    
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private LocalDateTime fechaAsignacion;
    private LocalDateTime fechaEntrega;
    
    private double total;

    public Pedido() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
        this.estado = EstadoPedido.DISPONIBLE;
    }

    // Getters y Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getClienteId() {
        return clienteId;
    }

    public void setClienteId(String clienteId) {
        this.clienteId = clienteId;
    }

    public String getClienteNombre() {
        return clienteNombre;
    }

    public void setClienteNombre(String clienteNombre) {
        this.clienteNombre = clienteNombre;
    }

    public String getClienteDireccion() {
        return clienteDireccion;
    }

    public void setClienteDireccion(String clienteDireccion) {
        this.clienteDireccion = clienteDireccion;
    }

    public String getClienteTelefono() {
        return clienteTelefono;
    }

    public void setClienteTelefono(String clienteTelefono) {
        this.clienteTelefono = clienteTelefono;
    }

    public List<ProductoPedido> getProductos() {
        return productos;
    }

    public void setProductos(List<ProductoPedido> productos) {
        this.productos = productos;
        this.calcularTotal();
    }

    public String getDireccionEntrega() {
        return direccionEntrega;
    }

    public void setDireccionEntrega(String direccionEntrega) {
        this.direccionEntrega = direccionEntrega;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public EstadoPedido getEstado() {
        return estado;
    }

    public void setEstado(EstadoPedido estado) {
        this.estado = estado;
        this.fechaActualizacion = LocalDateTime.now();
    }

    public String getUsuarioAsignadoId() {
        return usuarioAsignadoId;
    }

    public void setUsuarioAsignadoId(String usuarioAsignadoId) {
        this.usuarioAsignadoId = usuarioAsignadoId;
    }

    public String getUsuarioAsignadoNombre() {
        return usuarioAsignadoNombre;
    }

    public void setUsuarioAsignadoNombre(String usuarioAsignadoNombre) {
        this.usuarioAsignadoNombre = usuarioAsignadoNombre;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public LocalDateTime getFechaAsignacion() {
        return fechaAsignacion;
    }

    public void setFechaAsignacion(LocalDateTime fechaAsignacion) {
        this.fechaAsignacion = fechaAsignacion;
    }

    public LocalDateTime getFechaEntrega() {
        return fechaEntrega;
    }

    public void setFechaEntrega(LocalDateTime fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    private void calcularTotal() {
        if (productos != null) {
            this.total = productos.stream()
                    .mapToDouble(ProductoPedido::getSubtotal)
                    .sum();
        }
    }
}
