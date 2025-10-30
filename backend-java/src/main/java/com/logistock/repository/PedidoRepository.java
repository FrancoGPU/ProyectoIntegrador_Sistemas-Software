package com.logistock.repository;

import com.logistock.model.EstadoPedido;
import com.logistock.model.Pedido;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends MongoRepository<Pedido, String> {
    
    List<Pedido> findByEstado(EstadoPedido estado);
    
    List<Pedido> findByUsuarioAsignadoId(String usuarioId);
    
    List<Pedido> findByClienteId(String clienteId);
    
    List<Pedido> findByEstadoOrderByFechaCreacionDesc(EstadoPedido estado);
    
    List<Pedido> findAllByOrderByFechaCreacionDesc();
    
    List<Pedido> findByUsuarioAsignadoIdAndEstadoIn(String usuarioId, List<EstadoPedido> estados);
    
    long countByEstado(EstadoPedido estado);
}
