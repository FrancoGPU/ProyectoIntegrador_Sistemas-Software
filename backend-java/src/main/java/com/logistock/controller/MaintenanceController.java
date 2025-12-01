package com.logistock.controller;

import com.logistock.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/maintenance")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    @PostMapping("/run")
    public ResponseEntity<Map<String, String>> runMaintenance() {
        String report = maintenanceService.runManualMaintenance();
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Mantenimiento ejecutado correctamente");
        response.put("report", report);
        
        return ResponseEntity.ok(response);
    }
}
