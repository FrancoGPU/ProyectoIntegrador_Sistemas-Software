package com.logistock.repository;

import com.logistock.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio para la entidad User
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    /**
     * Buscar usuario por nombre de usuario
     * @param username Nombre de usuario
     * @return Optional con el usuario si existe
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Buscar usuario por email
     * @param email Email del usuario
     * @return Optional con el usuario si existe
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Verificar si existe un usuario con el username dado
     * @param username Nombre de usuario
     * @return true si existe, false si no
     */
    Boolean existsByUsername(String username);
    
    /**
     * Verificar si existe un usuario con el email dado
     * @param email Email del usuario
     * @return true si existe, false si no
     */
    Boolean existsByEmail(String email);
}
