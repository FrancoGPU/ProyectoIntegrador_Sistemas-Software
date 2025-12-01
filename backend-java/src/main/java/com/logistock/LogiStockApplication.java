package com.logistock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * LogiStock Solutions Backend Application
 * 
 * Sistema de Gestión Logística desarrollado con Spring Boot y MongoDB
 * 
 * @author FrancoGPU
 * @version 1.0.0
 */
@SpringBootApplication
@EnableMongoAuditing
@EnableScheduling
public class LogiStockApplication {

    public static void main(String[] args) {
        System.out.println("🚀 Iniciando LogiStock Solutions Backend...");
        SpringApplication.run(LogiStockApplication.class, args);
        System.out.println("✅ LogiStock Solutions Backend iniciado exitosamente!");
    }
}