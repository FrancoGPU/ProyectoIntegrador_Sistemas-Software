package com.logistock.controller;

import com.logistock.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/inventory/pdf")
    public ResponseEntity<InputStreamResource> inventoryReportPdf() {
        ByteArrayInputStream bis = reportService.generateInventoryPdf();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=inventario.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/inventory/excel")
    public ResponseEntity<InputStreamResource> inventoryReportExcel() throws IOException {
        System.out.println("ReportController: Received request for Excel report");
        try {
            ByteArrayInputStream bis = reportService.generateInventoryExcel();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=inventario.xlsx");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new InputStreamResource(bis));
        } catch (Throwable e) {
            System.err.println("ReportController: Critical error generating Excel report: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
