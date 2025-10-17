package com.logistock.repository;

import com.logistock.model.Proveedor;
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
 * Repositorio para la entidad Proveedor
 */
@Repository
public interface ProveedorRepository extends MongoRepository<Proveedor, String> {

    // Buscar por email (único)
    Optional<Proveedor> findByEmail(String email);

    // Buscar por RUC/NIT
    Optional<Proveedor> findByRucNit(String rucNit);

    // Buscar por tipo
    List<Proveedor> findByTipo(String tipo);

    // Buscar proveedores activos
    List<Proveedor> findByIsActiveTrue();

    // Buscar proveedores activos con paginación
    Page<Proveedor> findByIsActiveTrue(Pageable pageable);

    // Buscar por tipo (solo activos)
    List<Proveedor> findByTipoAndIsActiveTrue(String tipo);

    // Buscar por tipo con paginación
    Page<Proveedor> findByTipoAndIsActiveTrue(String tipo, Pageable pageable);
    
    // Buscar por nombre o empresa (contiene texto)
    List<Proveedor> findByNombreContainingIgnoreCaseOrEmpresaContainingIgnoreCase(String nombre, String empresa);

    // Buscar por texto en nombre o empresa
    @Query("{ $text: { $search: ?0 }, 'isActive': true }")
    List<Proveedor> findByTextSearch(String searchText);

    // Buscar por empresa
    List<Proveedor> findByEmpresaContainingIgnoreCaseAndIsActiveTrue(String empresa);

    // Buscar por país
    List<Proveedor> findByPaisAndIsActiveTrue(String pais);

    // Buscar por ciudad
    List<Proveedor> findByCiudadContainingIgnoreCaseAndIsActiveTrue(String ciudad);

    // Buscar proveedores con órdenes superiores a un monto
    @Query("{ 'montoTotalCompras': { $gte: ?0 }, 'isActive': true }")
    List<Proveedor> findByMontoTotalComprasGreaterThanEqual(BigDecimal monto);

    // Buscar proveedores que suministran una categoría específica
    @Query("{ 'categoriasProductos': { $in: [?0] }, 'isActive': true }")
    List<Proveedor> findByCategoriasProductosContaining(String categoria);

    // Contar proveedores por tipo
    long countByTipo(String tipo);

    // Verificar si existe un email (excluyendo un ID específico)
    @Query("{ 'email': ?0, '_id': { $ne: ?1 } }")
    Optional<Proveedor> findByEmailAndIdNot(String email, String id);

    // Verificar si existe un RUC/NIT (excluyendo un ID específico)
    @Query("{ 'rucNit': ?0, '_id': { $ne: ?1 } }")
    Optional<Proveedor> findByRucNitAndIdNot(String rucNit, String id);

    // Buscar proveedores con órdenes recientes
    @Query("{ 'ultimaOrden': { $gte: ?0 }, 'isActive': true }")
    List<Proveedor> findProveedoresWithRecentOrders(LocalDateTime fechaLimite);

    // Top proveedores por monto de compras
    @Query(value = "{ 'isActive': true }", sort = "{ 'montoTotalCompras': -1 }")
    List<Proveedor> findTopProveedoresByMontoCompras(Pageable pageable);
}