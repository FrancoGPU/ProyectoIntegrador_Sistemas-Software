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

    @GetMapping("/routes/pdf")
    public ResponseEntity<InputStreamResource> routesReportPdf() {
        ByteArrayInputStream bis = reportService.generateRoutesPdf();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=rutas.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/routes/excel")
    public ResponseEntity<InputStreamResource> routesReportExcel() throws IOException {
        try {
            ByteArrayInputStream bis = reportService.generateRoutesExcel();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=rutas.xlsx");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new InputStreamResource(bis));
        } catch (Throwable e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // --- CLIENTES ---

    @GetMapping("/clients/pdf")
    public ResponseEntity<InputStreamResource> clientsReportPdf() {
        ByteArrayInputStream bis = reportService.generateClientsPdf();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=clientes.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/clients/excel")
    public ResponseEntity<InputStreamResource> clientsReportExcel() throws IOException {
        try {
            ByteArrayInputStream bis = reportService.generateClientsExcel();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=clientes.xlsx");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new InputStreamResource(bis));
        } catch (Throwable e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // --- PROVEEDORES ---

    @GetMapping("/suppliers/pdf")
    public ResponseEntity<InputStreamResource> suppliersReportPdf() {
        ByteArrayInputStream bis = reportService.generateSuppliersPdf();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=proveedores.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/suppliers/excel")
    public ResponseEntity<InputStreamResource> suppliersReportExcel() throws IOException {
        try {
            ByteArrayInputStream bis = reportService.generateSuppliersExcel();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=proveedores.xlsx");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new InputStreamResource(bis));
        } catch (Throwable e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // --- PEDIDOS ---

    @GetMapping("/orders/pdf")
    public ResponseEntity<InputStreamResource> ordersReportPdf() {
        ByteArrayInputStream bis = reportService.generateOrdersPdf();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=pedidos.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/orders/excel")
    public ResponseEntity<InputStreamResource> ordersReportExcel() throws IOException {
        try {
            ByteArrayInputStream bis = reportService.generateOrdersExcel();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=pedidos.xlsx");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(new InputStreamResource(bis));
        } catch (Throwable e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
