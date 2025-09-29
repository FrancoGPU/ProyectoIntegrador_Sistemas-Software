package com.logistock.repository;

import com.logistock.model.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Cliente
 */
@Repository
public interface ClienteRepository extends MongoRepository<Cliente, String> {

    // Buscar por email (único)
    Optional<Cliente> findByEmail(String email);

    // Buscar por categoría
    List<Cliente> findByCategoria(String categoria);

    // Buscar clientes activos
    List<Cliente> findByIsActiveTrue();

    // Buscar por categoría con paginación
    Page<Cliente> findByCategoriaAndIsActiveTrue(String categoria, Pageable pageable);

    // Buscar por texto en nombre o empresa
    @Query("{ $text: { $search: ?0 }, 'isActive': true }")
    List<Cliente> findByTextSearch(String searchText);

    // Buscar por empresa
    List<Cliente> findByEmpresaContainingIgnoreCaseAndIsActiveTrue(String empresa);

    // Buscar clientes sin compras recientes
    @Query("{ 'ultimaCompra': { $lt: ?0 }, 'isActive': true }")
    List<Cliente> findClientsWithoutRecentPurchases(LocalDateTime fechaLimite);

    // Buscar clientes con compras superiores a un monto
    @Query("{ 'totalCompras': { $gte: ?0 }, 'isActive': true }")
    List<Cliente> findByTotalComprasGreaterThanEqual(BigDecimal monto);

    // Contar clientes por categoría
    long countByCategoria(String categoria);

    // Verificar si existe un email (excluyendo un ID específico)
    @Query("{ 'email': ?0, '_id': { $ne: ?1 } }")
    Optional<Cliente> findByEmailAndIdNot(String email, String id);

    // Buscar clientes registrados en un período
    @Query("{ 'fechaRegistro': { $gte: ?0, $lte: ?1 }, 'isActive': true }")
    List<Cliente> findByFechaRegistroBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    // Top clientes por monto de compras
    @Query(value = "{ 'isActive': true }", sort = "{ 'totalCompras': -1 }")
    List<Cliente> findTopClientsByTotalCompras(Pageable pageable);
}