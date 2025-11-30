package com.logistock.controller;

import com.logistock.dto.RegisterRequest;
import com.logistock.model.User;
import com.logistock.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/create-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createAdmin(@RequestBody RegisterRequest registerRequest) {
        try {
            if (userService.existsByUsername(registerRequest.getUsername())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El nombre de usuario ya está en uso");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            if (userService.existsByEmail(registerRequest.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El email ya está en uso");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            User newUser = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                registerRequest.getPassword(),
                "ADMIN"
            );

            User savedUser = userService.createUser(newUser);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Administrador creado exitosamente");
            response.put("username", savedUser.getUsername());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear administrador");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
