package com.logistock.service;

import com.logistock.model.Cliente;
import com.logistock.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Servicio para la gestión de clientes
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClienteService {

    private final ClienteRepository clienteRepository;

    /**
     * Obtener todos los clientes activos
     */
    public List<Cliente> findAll() {
        log.debug("Obteniendo todos los clientes activos");
        return clienteRepository.findByIsActiveTrue();
    }

    /**
     * Obtener clientes con paginación
     */
    public Page<Cliente> findAll(Pageable pageable) {
        log.debug("Obteniendo clientes con paginación: {}", pageable);
        return clienteRepository.findAll(pageable);
    }

    /**
     * Buscar cliente por ID
     */
    public Optional<Cliente> findById(String id) {
        log.debug("Buscando cliente por ID: {}", id);
        return clienteRepository.findById(id);
    }

    /**
     * Buscar cliente por email
     */
    public Optional<Cliente> findByEmail(String email) {
        log.debug("Buscando cliente por email: {}", email);
        return clienteRepository.findByEmail(email);
    }

    /**
     * Crear nuevo cliente
     */
    public Cliente save(Cliente cliente) {
        log.info("Creando nuevo cliente: {}", cliente.getNombre());
        
        // Validar que el email no existe
        if (cliente.getEmail() != null && clienteRepository.findByEmail(cliente.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un cliente con el email: " + cliente.getEmail());
        }
        
        return clienteRepository.save(cliente);
    }

    /**
     * Actualizar cliente existente
     */
    public Cliente update(String id, Cliente cliente) {
        log.info("Actualizando cliente ID: {}", id);
        
        Cliente existing = clienteRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado con ID: " + id));
        
        // Validar que el email no existe en otro cliente
        if (cliente.getEmail() != null && !cliente.getEmail().equals(existing.getEmail())) {
            Optional<Cliente> emailExists = clienteRepository.findByEmailAndIdNot(cliente.getEmail(), id);
            if (emailExists.isPresent()) {
                throw new IllegalArgumentException("Ya existe otro cliente con el email: " + cliente.getEmail());
            }
        }
        
        // Actualizar campos
        existing.setNombre(cliente.getNombre());
        existing.setEmpresa(cliente.getEmpresa());
        existing.setEmail(cliente.getEmail());
        existing.setTelefono(cliente.getTelefono());
        existing.setDireccion(cliente.getDireccion());
        existing.setCategoria(cliente.getCategoria());
        existing.setUltimaCompra(cliente.getUltimaCompra());
        existing.setTotalCompras(cliente.getTotalCompras());
        existing.setIsActive(cliente.getIsActive());
        existing.setNotas(cliente.getNotas());
        // existing.setContactoSecundario(cliente.getContactoSecundario()); // Eliminado por simplificación
        
        return clienteRepository.save(existing);
    }

    /**
     * Eliminar cliente (soft delete)
     */
    public void deleteById(String id) {
        log.info("Eliminando cliente ID: {}", id);
        
        Cliente cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado con ID: " + id));
        
        cliente.setIsActive(false);
        clienteRepository.save(cliente);
    }

    /**
     * Buscar clientes por categoría
     */
    public List<Cliente> findByCategoria(String categoria) {
        log.debug("Buscando clientes por categoría: {}", categoria);
        return clienteRepository.findByCategoria(categoria);
    }

    /**
     * Buscar clientes por texto
     */
    public List<Cliente> searchByText(String searchText) {
        log.debug("Buscando clientes por texto: {}", searchText);
        return clienteRepository.findByTextSearch(searchText);
    }

    /**
     * Buscar clientes por empresa
     */
    public List<Cliente> findByEmpresa(String empresa) {
        log.debug("Buscando clientes por empresa: {}", empresa);
        return clienteRepository.findByEmpresaContainingIgnoreCaseAndIsActiveTrue(empresa);
    }

    /**
     * Obtener top clientes por compras
     */
    public List<Cliente> getTopClientes(int limit) {
        log.debug("Obteniendo top {} clientes", limit);
        return clienteRepository.findTopClientsByTotalCompras(
            org.springframework.data.domain.PageRequest.of(0, limit));
    }

    /**
     * Contar clientes por categoría
     */
    public long countByCategoria(String categoria) {
        return clienteRepository.countByCategoria(categoria);
    }

    /**
     * Verificar si existe un cliente
     */
    public boolean existsById(String id) {
        return clienteRepository.existsById(id);
    }

    /**
     * Verificar si existe un email
     */
    public boolean existsByEmail(String email) {
        return clienteRepository.findByEmail(email).isPresent();
    }

    /**
     * Obtener clientes sin compras recientes
     */
    public List<Cliente> getClientesInactivos(int dias) {
        LocalDateTime fechaLimite = LocalDateTime.now().minusDays(dias);
        return clienteRepository.findClientsWithoutRecentPurchases(fechaLimite);
    }

}