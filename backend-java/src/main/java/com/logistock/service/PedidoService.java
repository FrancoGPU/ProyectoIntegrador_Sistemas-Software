package com.logistock.service;

import com.logistock.model.EstadoPedido;
import com.logistock.model.Pedido;
import com.logistock.repository.PedidoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    private static final Logger logger = LoggerFactory.getLogger(PedidoService.class);

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProductService productService;

    /**
     * Crear un nuevo pedido (ADMIN)
     * Automáticamente reduce el stock de los productos incluidos en el pedido
     */
    public Pedido crearPedido(Pedido pedido) {
        logger.info("🛒 Creando nuevo pedido con {} productos", pedido.getProductos().size());
        
        // Validar y reducir stock de cada producto ANTES de crear el pedido
        try {
            pedido.getProductos().forEach(productoPedido -> {
                logger.info("📦 Reduciendo stock del producto ID: {}, cantidad: {}", 
                    productoPedido.getProductoId(), productoPedido.getCantidad());
                productService.reducirStock(
                    productoPedido.getProductoId(), 
                    productoPedido.getCantidad()
                );
                logger.info("✅ Stock reducido exitosamente para producto: {}", productoPedido.getProductoId());
            });
        } catch (Exception e) {
            // Si falla la reducción de stock, lanzar excepción y no crear el pedido
            logger.error("❌ Error al reducir stock: {}", e.getMessage());
            throw new RuntimeException("Error al reducir stock: " + e.getMessage(), e);
        }
        
        pedido.setEstado(EstadoPedido.DISPONIBLE);
        pedido.setFechaCreacion(LocalDateTime.now());
        pedido.setFechaActualizacion(LocalDateTime.now());
        
        Pedido pedidoGuardado = pedidoRepository.save(pedido);
        logger.info("✅ Pedido creado exitosamente con ID: {}", pedidoGuardado.getId());
        return pedidoGuardado;
    }

    /**
     * Obtener todos los pedidos (ADMIN)
     */
    public List<Pedido> obtenerTodos() {
        return pedidoRepository.findAllByOrderByFechaCreacionDesc();
    }

    /**
     * Obtener pedido por ID
     */
    public Optional<Pedido> obtenerPorId(String id) {
        return pedidoRepository.findById(id);
    }

    /**
     * Obtener pedidos disponibles (USER)
     */
    public List<Pedido> obtenerDisponibles() {
        return pedidoRepository.findByEstadoOrderByFechaCreacionDesc(EstadoPedido.DISPONIBLE);
    }

    /**
     * Obtener pedidos por estado
     */
    public List<Pedido> obtenerPorEstado(EstadoPedido estado) {
        return pedidoRepository.findByEstadoOrderByFechaCreacionDesc(estado);
    }

    /**
     * Obtener mis entregas (USER) - pedidos asignados y en camino
     */
    public List<Pedido> obtenerMisEntregas(String usuarioId) {
        List<EstadoPedido> estadosActivos = Arrays.asList(
            EstadoPedido.ASIGNADO, 
            EstadoPedido.EN_CAMINO
        );
        return pedidoRepository.findByUsuarioAsignadoIdAndEstadoIn(usuarioId, estadosActivos);
    }

    /**
     * Tomar un pedido (USER)
     */
    public Pedido tomarPedido(String pedidoId, String usuarioId, String usuarioNombre) {
        Optional<Pedido> pedidoOpt = pedidoRepository.findById(pedidoId);
        
        if (pedidoOpt.isEmpty()) {
            throw new RuntimeException("Pedido no encontrado");
        }
        
        Pedido pedido = pedidoOpt.get();
        
        if (pedido.getEstado() != EstadoPedido.DISPONIBLE) {
            throw new RuntimeException("El pedido no está disponible");
        }
        
        pedido.setEstado(EstadoPedido.ASIGNADO);
        pedido.setUsuarioAsignadoId(usuarioId);
        pedido.setUsuarioAsignadoNombre(usuarioNombre);
        pedido.setFechaAsignacion(LocalDateTime.now());
        pedido.setFechaActualizacion(LocalDateTime.now());
        
        return pedidoRepository.save(pedido);
    }

    /**
     * Actualizar estado del pedido (USER)
     */
    public Pedido actualizarEstado(String pedidoId, String usuarioId, EstadoPedido nuevoEstado) {
        Optional<Pedido> pedidoOpt = pedidoRepository.findById(pedidoId);
        
        if (pedidoOpt.isEmpty()) {
            throw new RuntimeException("Pedido no encontrado");
        }
        
        Pedido pedido = pedidoOpt.get();
        
        // Verificar que el usuario sea el asignado al pedido
        if (!usuarioId.equals(pedido.getUsuarioAsignadoId())) {
            throw new RuntimeException("No tienes permiso para actualizar este pedido");
        }
        
        // Validar transiciones de estado válidas
        validarTransicionEstado(pedido.getEstado(), nuevoEstado);
        
        pedido.setEstado(nuevoEstado);
        pedido.setFechaActualizacion(LocalDateTime.now());
        
        if (nuevoEstado == EstadoPedido.ENTREGADO) {
            pedido.setFechaEntrega(LocalDateTime.now());
        }
        
        return pedidoRepository.save(pedido);
    }

    /**
     * Actualizar pedido completo (ADMIN)
     */
    public Pedido actualizarPedido(String id, Pedido pedidoActualizado) {
        Optional<Pedido> pedidoOpt = pedidoRepository.findById(id);
        
        if (pedidoOpt.isEmpty()) {
            throw new RuntimeException("Pedido no encontrado");
        }
        
        Pedido pedido = pedidoOpt.get();
        
        // Actualizar campos permitidos
        pedido.setClienteNombre(pedidoActualizado.getClienteNombre());
        pedido.setClienteDireccion(pedidoActualizado.getClienteDireccion());
        pedido.setClienteTelefono(pedidoActualizado.getClienteTelefono());
        pedido.setDireccionEntrega(pedidoActualizado.getDireccionEntrega());
        pedido.setObservaciones(pedidoActualizado.getObservaciones());
        pedido.setProductos(pedidoActualizado.getProductos());
        pedido.setFechaActualizacion(LocalDateTime.now());
        
        return pedidoRepository.save(pedido);
    }

    /**
     * Cancelar pedido (ADMIN)
     * Automáticamente restaura el stock de los productos del pedido cancelado
     */
    public Pedido cancelarPedido(String id) {
        Optional<Pedido> pedidoOpt = pedidoRepository.findById(id);
        
        if (pedidoOpt.isEmpty()) {
            throw new RuntimeException("Pedido no encontrado");
        }
        
        Pedido pedido = pedidoOpt.get();
        
        if (pedido.getEstado() == EstadoPedido.ENTREGADO) {
            throw new RuntimeException("No se puede cancelar un pedido ya entregado");
        }
        
        // Restaurar stock si el pedido no estaba ya cancelado
        if (pedido.getEstado() != EstadoPedido.CANCELADO) {
            logger.info("🔄 Restaurando stock del pedido cancelado ID: {}", id);
            try {
                pedido.getProductos().forEach(productoPedido -> {
                    logger.info("📦 Restaurando stock del producto ID: {}, cantidad: {}", 
                        productoPedido.getProductoId(), productoPedido.getCantidad());
                    productService.aumentarStock(
                        productoPedido.getProductoId(), 
                        productoPedido.getCantidad()
                    );
                    logger.info("✅ Stock restaurado para producto: {}", productoPedido.getProductoId());
                });
            } catch (Exception e) {
                logger.error("❌ Error al restaurar stock: {}", e.getMessage());
                throw new RuntimeException("Error al restaurar stock: " + e.getMessage(), e);
            }
        }
        
        pedido.setEstado(EstadoPedido.CANCELADO);
        pedido.setFechaActualizacion(LocalDateTime.now());
        
        Pedido pedidoCancelado = pedidoRepository.save(pedido);
        logger.info("✅ Pedido cancelado exitosamente: {}", id);
        return pedidoCancelado;
    }

    /**
     * Eliminar pedido (ADMIN)
     */
    public void eliminarPedido(String id) {
        pedidoRepository.deleteById(id);
    }

    /**
     * Obtener estadísticas de pedidos
     */
    public PedidoEstadisticas obtenerEstadisticas() {
        PedidoEstadisticas stats = new PedidoEstadisticas();
        stats.setDisponibles(pedidoRepository.countByEstado(EstadoPedido.DISPONIBLE));
        stats.setAsignados(pedidoRepository.countByEstado(EstadoPedido.ASIGNADO));
        stats.setEnCamino(pedidoRepository.countByEstado(EstadoPedido.EN_CAMINO));
        stats.setEntregados(pedidoRepository.countByEstado(EstadoPedido.ENTREGADO));
        stats.setCancelados(pedidoRepository.countByEstado(EstadoPedido.CANCELADO));
        stats.setTotal(pedidoRepository.count());
        return stats;
    }

    /**
     * Validar que la transición de estado sea válida
     */
    private void validarTransicionEstado(EstadoPedido estadoActual, EstadoPedido nuevoEstado) {
        // ASIGNADO -> EN_CAMINO o DISPONIBLE (liberar)
        if (estadoActual == EstadoPedido.ASIGNADO) {
            if (nuevoEstado != EstadoPedido.EN_CAMINO && nuevoEstado != EstadoPedido.DISPONIBLE) {
                throw new RuntimeException("Transición de estado no válida");
            }
        }
        // EN_CAMINO -> ENTREGADO
        else if (estadoActual == EstadoPedido.EN_CAMINO) {
            if (nuevoEstado != EstadoPedido.ENTREGADO) {
                throw new RuntimeException("Transición de estado no válida");
            }
        }
        else {
            throw new RuntimeException("No se puede actualizar el estado actual del pedido");
        }
    }

    /**
     * Clase interna para estadísticas
     */
    public static class PedidoEstadisticas {
        private long disponibles;
        private long asignados;
        private long enCamino;
        private long entregados;
        private long cancelados;
        private long total;

        // Getters y Setters
        public long getDisponibles() {
            return disponibles;
        }

        public void setDisponibles(long disponibles) {
            this.disponibles = disponibles;
        }

        public long getAsignados() {
            return asignados;
        }

        public void setAsignados(long asignados) {
            this.asignados = asignados;
        }

        public long getEnCamino() {
            return enCamino;
        }

        public void setEnCamino(long enCamino) {
            this.enCamino = enCamino;
        }

        public long getEntregados() {
            return entregados;
        }

        public void setEntregados(long entregados) {
            this.entregados = entregados;
        }

        public long getCancelados() {
            return cancelados;
        }

        public void setCancelados(long cancelados) {
            this.cancelados = cancelados;
        }

        public long getTotal() {
            return total;
        }

        public void setTotal(long total) {
            this.total = total;
        }
    }
}
