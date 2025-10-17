package com.logistock.service;

import com.logistock.model.Proveedor;
import com.logistock.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de proveedores
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    /**
     * Obtener todos los proveedores activos
     */
    public List<Proveedor> findAll() {
        log.debug("Obteniendo todos los proveedores activos");
        return proveedorRepository.findByIsActiveTrue();
    }

    /**
     * Obtener proveedores con paginación
     */
    public Page<Proveedor> findAll(int page, int size, String sortBy, String sortDirection) {
        log.debug("Obteniendo proveedores - página: {}, tamaño: {}", page, size);
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return proveedorRepository.findByIsActiveTrue(pageable);
    }

    /**
     * Obtener proveedor por ID
     */
    public Optional<Proveedor> findById(String id) {
        log.debug("Buscando proveedor por ID: {}", id);
        return proveedorRepository.findById(id);
    }

    /**
     * Buscar proveedores por texto (nombre o empresa)
     */
    public List<Proveedor> searchByText(String searchText) {
        log.debug("Buscando proveedores por texto: {}", searchText);
        return proveedorRepository.findByNombreContainingIgnoreCaseOrEmpresaContainingIgnoreCase(
                searchText, searchText);
    }

    /**
     * Buscar por tipo
     */
    public List<Proveedor> findByTipo(String tipo) {
        log.debug("Buscando proveedores por tipo: {}", tipo);
        return proveedorRepository.findByTipoAndIsActiveTrue(tipo);
    }

    /**
     * Buscar por email
     */
    public Optional<Proveedor> findByEmail(String email) {
        log.debug("Buscando proveedor por email: {}", email);
        return proveedorRepository.findByEmail(email.toLowerCase());
    }

    /**
     * Buscar por RUC/NIT
     */
    public Optional<Proveedor> findByRucNit(String rucNit) {
        log.debug("Buscando proveedor por RUC/NIT: {}", rucNit);
        return proveedorRepository.findByRucNit(rucNit);
    }

    /**
     * Crear nuevo proveedor
     */
    public Proveedor create(Proveedor proveedor) {
        log.info("Creando nuevo proveedor: {}", proveedor.getNombre());
        
        // Validar que no exista email duplicado
        if (proveedor.getEmail() != null) {
            Optional<Proveedor> existingByEmail = findByEmail(proveedor.getEmail());
            if (existingByEmail.isPresent()) {
                throw new IllegalArgumentException("Ya existe un proveedor con el email: " + proveedor.getEmail());
            }
        }

        // Validar RUC/NIT único si está presente
        if (proveedor.getRucNit() != null && !proveedor.getRucNit().trim().isEmpty()) {
            Optional<Proveedor> existingByRuc = findByRucNit(proveedor.getRucNit());
            if (existingByRuc.isPresent()) {
                throw new IllegalArgumentException("Ya existe un proveedor con el RUC/NIT: " + proveedor.getRucNit());
            }
        }

        // Establecer valores por defecto
        if (proveedor.getIsActive() == null) {
            proveedor.setIsActive(true);
        }
        if (proveedor.getTotalOrdenes() == null) {
            proveedor.setTotalOrdenes(0);
        }
        if (proveedor.getMontoTotalCompras() == null) {
            proveedor.setMontoTotalCompras(BigDecimal.ZERO);
        }

        proveedor.setCreatedAt(LocalDateTime.now());
        proveedor.setUpdatedAt(LocalDateTime.now());

        return proveedorRepository.save(proveedor);
    }

    /**
     * Actualizar proveedor
     */
    public Proveedor update(String id, Proveedor proveedorActualizado) {
        log.info("Actualizando proveedor ID: {}", id);
        
        return proveedorRepository.findById(id)
                .map(proveedorExistente -> {
                    // Validar email único si cambió
                    if (proveedorActualizado.getEmail() != null && 
                        !proveedorActualizado.getEmail().equals(proveedorExistente.getEmail())) {
                        Optional<Proveedor> existingByEmail = findByEmail(proveedorActualizado.getEmail());
                        if (existingByEmail.isPresent() && !existingByEmail.get().getId().equals(id)) {
                            throw new IllegalArgumentException("Ya existe un proveedor con el email: " + proveedorActualizado.getEmail());
                        }
                    }

                    // Actualizar campos
                    proveedorExistente.setNombre(proveedorActualizado.getNombre());
                    proveedorExistente.setEmpresa(proveedorActualizado.getEmpresa());
                    proveedorExistente.setEmail(proveedorActualizado.getEmail());
                    proveedorExistente.setTelefono(proveedorActualizado.getTelefono());
                    proveedorExistente.setDireccion(proveedorActualizado.getDireccion());
                    proveedorExistente.setTipo(proveedorActualizado.getTipo());
                    proveedorExistente.setRucNit(proveedorActualizado.getRucNit());
                    proveedorExistente.setPais(proveedorActualizado.getPais());
                    proveedorExistente.setCiudad(proveedorActualizado.getCiudad());
                    proveedorExistente.setDiasPago(proveedorActualizado.getDiasPago());
                    proveedorExistente.setDescuentoGeneral(proveedorActualizado.getDescuentoGeneral());
                    proveedorExistente.setCategoriasProductos(proveedorActualizado.getCategoriasProductos());
                    proveedorExistente.setIsActive(proveedorActualizado.getIsActive());
                    proveedorExistente.setNotas(proveedorActualizado.getNotas());
                    proveedorExistente.setContactoComercial(proveedorActualizado.getContactoComercial());
                    proveedorExistente.setUpdatedAt(LocalDateTime.now());

                    return proveedorRepository.save(proveedorExistente);
                })
                .orElseThrow(() -> new NoSuchElementException("Proveedor no encontrado con ID: " + id));
    }

    /**
     * Eliminar proveedor (soft delete)
     */
    public void delete(String id) {
        log.info("Eliminando proveedor ID: {}", id);
        
        proveedorRepository.findById(id)
                .ifPresent(proveedor -> {
                    proveedor.setIsActive(false);
                    proveedor.setUpdatedAt(LocalDateTime.now());
                    proveedorRepository.save(proveedor);
                });
    }

    /**
     * Eliminar proveedor permanentemente
     */
    public void deleteHard(String id) {
        log.warn("Eliminación permanente de proveedor ID: {}", id);
        proveedorRepository.deleteById(id);
    }

    /**
     * Registrar orden de compra
     */
    public void registrarOrden(String proveedorId, BigDecimal monto) {
        log.info("Registrando orden para proveedor ID: {}, monto: {}", proveedorId, monto);
        
        proveedorRepository.findById(proveedorId)
                .ifPresent(proveedor -> {
                    proveedor.setTotalOrdenes(proveedor.getTotalOrdenes() + 1);
                    proveedor.setMontoTotalCompras(proveedor.getMontoTotalCompras().add(monto));
                    proveedor.setUltimaOrden(LocalDateTime.now());
                    proveedor.setUpdatedAt(LocalDateTime.now());
                    proveedorRepository.save(proveedor);
                });
    }

    /**
     * Obtener estadísticas de proveedores
     */
    public Map<String, Object> getStats() {
        log.debug("Calculando estadísticas de proveedores");
        
        List<Proveedor> allProveedores = proveedorRepository.findByIsActiveTrue();
        
        Map<String, Object> stats = new HashMap<>();
        
        // Totales generales
        stats.put("totalProveedores", allProveedores.size());
        stats.put("totalActivos", allProveedores.stream().filter(Proveedor::getIsActive).count());
        
        // Por tipo
        Map<String, Long> porTipo = allProveedores.stream()
                .collect(Collectors.groupingBy(Proveedor::getTipo, Collectors.counting()));
        stats.put("porTipo", porTipo);
        
        // Por país
        Map<String, Long> porPais = allProveedores.stream()
                .filter(p -> p.getPais() != null)
                .collect(Collectors.groupingBy(Proveedor::getPais, Collectors.counting()));
        stats.put("porPais", porPais);
        
        // Métricas financieras
        BigDecimal montoTotalCompras = allProveedores.stream()
                .map(Proveedor::getMontoTotalCompras)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("montoTotalCompras", montoTotalCompras);
        
        Integer totalOrdenes = allProveedores.stream()
                .mapToInt(Proveedor::getTotalOrdenes)
                .sum();
        stats.put("totalOrdenes", totalOrdenes);
        
        // Promedio días de pago
        OptionalDouble avgDiasPago = allProveedores.stream()
                .mapToInt(Proveedor::getDiasPago)
                .average();
        stats.put("promedioDiasPago", avgDiasPago.isPresent() ? avgDiasPago.getAsDouble() : 0);
        
        return stats;
    }

    /**
     * Obtener top proveedores por monto de compras
     */
    public List<Proveedor> getTopProveedores(int limit) {
        log.debug("Obteniendo top {} proveedores", limit);
        
        return proveedorRepository.findByIsActiveTrue().stream()
                .sorted((p1, p2) -> p2.getMontoTotalCompras().compareTo(p1.getMontoTotalCompras()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Contar proveedores activos
     */
    public long countActive() {
        return proveedorRepository.findByIsActiveTrue().size();
    }

    /**
     * Obtener proveedores por categoría de producto
     */
    public List<Proveedor> findByCategoria(String categoria) {
        log.debug("Buscando proveedores que suministran categoría: {}", categoria);
        return proveedorRepository.findByCategoriasProductosContaining(categoria);
    }
}
