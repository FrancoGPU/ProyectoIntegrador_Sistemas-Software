package com.logistock.dto;

import com.logistock.model.EstadoPedido;

public class ActualizarEstadoRequest {
    private EstadoPedido nuevoEstado;

    public ActualizarEstadoRequest() {
    }

    public ActualizarEstadoRequest(EstadoPedido nuevoEstado) {
        this.nuevoEstado = nuevoEstado;
    }

    public EstadoPedido getNuevoEstado() {
        return nuevoEstado;
    }

    public void setNuevoEstado(EstadoPedido nuevoEstado) {
        this.nuevoEstado = nuevoEstado;
    }
}
