package com.logistock.model;

public enum EstadoPedido {
    DISPONIBLE,    // Pedido creado, listo para ser tomado
    ASIGNADO,      // Pedido asignado a un usuario
    EN_CAMINO,     // Usuario está en camino con el pedido
    ENTREGADO,     // Pedido entregado exitosamente
    CANCELADO      // Pedido cancelado por admin
}
