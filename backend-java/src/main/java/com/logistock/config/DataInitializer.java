package com.logistock.config;

import com.logistock.model.User;
import com.logistock.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Inicializador de datos para crear usuarios por defecto
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
    }

    /**
     * Crear usuarios por defecto si no existen
     */
    private void initializeUsers() {
        try {
            // Crear usuario admin si no existe
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@logistock.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                admin.setEnabled(true);
                
                userRepository.save(admin);
                logger.info("✓ Usuario ADMIN creado exitosamente");
                logger.info("  - Username: admin");
                logger.info("  - Password: admin123");
            } else {
                logger.info("✓ Usuario admin ya existe");
            }

            // Crear usuario normal si no existe
            if (!userRepository.existsByUsername("usuario")) {
                User user = new User();
                user.setUsername("usuario");
                user.setEmail("usuario@logistock.com");
                user.setPassword(passwordEncoder.encode("user123"));
                user.setRole("USER");
                user.setEnabled(true);
                
                userRepository.save(user);
                logger.info("✓ Usuario USER creado exitosamente");
                logger.info("  - Username: usuario");
                logger.info("  - Password: user123");
            } else {
                logger.info("✓ Usuario usuario ya existe");
            }

            logger.info("===========================================");
            logger.info("Inicialización de usuarios completada");
            logger.info("===========================================");

        } catch (Exception e) {
            logger.error("Error al inicializar usuarios: " + e.getMessage(), e);
        }
    }
}
