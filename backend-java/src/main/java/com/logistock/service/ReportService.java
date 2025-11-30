package com.logistock.service;

import com.logistock.model.Cliente;
import com.logistock.model.Pedido;
import com.logistock.model.Product;
import com.logistock.model.Proveedor;
import com.logistock.model.Ruta;
import com.logistock.repository.ClienteRepository;
import com.logistock.repository.PedidoRepository;
import com.logistock.repository.ProductRepository;
import com.logistock.repository.ProveedorRepository;
import com.logistock.repository.RutaRepository;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

@Service
public class ReportService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RutaRepository rutaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    public ByteArrayInputStream generateInventoryPdf() {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Título
            com.lowagie.text.Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Reporte de Inventario - LogiStock", fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // Tabla
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new int[]{3, 6, 4, 3, 3});

            // Encabezados
            String[] headers = {"Código", "Nombre", "Categoría", "Stock", "Precio"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header));
                cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            // Datos
            List<Product> products = productRepository.findAll();
            NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(Locale.US);
            
            for (Product product : products) {
                table.addCell(product.getCode() != null ? product.getCode() : "");
                table.addCell(product.getName() != null ? product.getName() : "");
                table.addCell(product.getCategory() != null ? product.getCategory() : "");
                table.addCell(product.getStock() != null ? String.valueOf(product.getStock()) : "0");
                table.addCell(product.getPrice() != null ? currencyFormatter.format(product.getPrice()) : "$0.00");
            }

            document.add(table);
            document.close();

        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateInventoryExcel() throws IOException {
        String[] columns = {"Código", "Nombre", "Descripción", "Categoría", "Stock", "Precio", "Proveedor", "Ubicación"};

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Inventario");

            // Estilo de encabezado
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.BLUE.getIndex());
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            // Estilo de moneda
            CellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.setDataFormat(workbook.createDataFormat().getFormat("$#,##0.00"));

            // Fila de encabezado
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            // Datos
            List<Product> products = productRepository.findAll();
            int rowIdx = 1;
            for (Product product : products) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(product.getCode() != null ? product.getCode() : "");
                row.createCell(1).setCellValue(product.getName() != null ? product.getName() : "");
                row.createCell(2).setCellValue(product.getDescription() != null ? product.getDescription() : "");
                row.createCell(3).setCellValue(product.getCategory() != null ? product.getCategory() : "");
                row.createCell(4).setCellValue(product.getStock() != null ? product.getStock() : 0);
                
                org.apache.poi.ss.usermodel.Cell priceCell = row.createCell(5);
                if (product.getPrice() != null) {
                    priceCell.setCellValue(product.getPrice().doubleValue());
                } else {
                    priceCell.setCellValue(0.0);
                }
                priceCell.setCellStyle(currencyStyle);
                
                row.createCell(6).setCellValue(product.getSupplier() != null ? product.getSupplier() : "");
                row.createCell(7).setCellValue(product.getLocation() != null ? product.getLocation() : "");
            }

            // Auto-ajustar columnas
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            e.printStackTrace();
            throw new IOException("Error generating Excel: " + e.getMessage(), e);
        }
    }

    public ByteArrayInputStream generateRoutesPdf() {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Título
            com.lowagie.text.Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Reporte de Rutas - LogiStock", fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // Tabla
            PdfPTable table = new PdfPTable(6); // Código, Nombre, Origen, Destino, Estado, Conductor
            table.setWidthPercentage(100);
            table.setWidths(new int[]{3, 5, 4, 4, 3, 4});

            // Encabezados
            String[] headers = {"Código", "Nombre", "Origen", "Destino", "Estado", "Conductor"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header));
                cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            // Datos
            List<Ruta> rutas = rutaRepository.findAll();
            
            for (Ruta ruta : rutas) {
                table.addCell(ruta.getCodigo() != null ? ruta.getCodigo() : "");
                table.addCell(ruta.getNombre() != null ? ruta.getNombre() : "");
                table.addCell(ruta.getOrigen() != null ? ruta.getOrigen() : "");
                table.addCell(ruta.getDestino() != null ? ruta.getDestino() : "");
                table.addCell(ruta.getEstado() != null ? ruta.getEstado() : "");
                table.addCell(ruta.getConductorAsignado() != null ? ruta.getConductorAsignado() : "Sin asignar");
            }

            document.add(table);
            document.close();

        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateRoutesExcel() throws IOException {
        String[] columns = {"Código", "Nombre", "Origen", "Destino", "Distancia (km)", "Estado", "Prioridad", "Vehículo", "Conductor", "Costo Total"};

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Rutas");

            // Estilo de encabezado
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.BLUE.getIndex());
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            // Estilo de moneda
            CellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.setDataFormat(workbook.createDataFormat().getFormat("$#,##0.00"));

            // Fila de encabezado
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            // Datos
            List<Ruta> rutas = rutaRepository.findAll();
            int rowIdx = 1;
            for (Ruta ruta : rutas) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(ruta.getCodigo() != null ? ruta.getCodigo() : "");
                row.createCell(1).setCellValue(ruta.getNombre() != null ? ruta.getNombre() : "");
                row.createCell(2).setCellValue(ruta.getOrigen() != null ? ruta.getOrigen() : "");
                row.createCell(3).setCellValue(ruta.getDestino() != null ? ruta.getDestino() : "");
                
                if (ruta.getDistanciaKm() != null) {
                    row.createCell(4).setCellValue(ruta.getDistanciaKm().doubleValue());
                } else {
                    row.createCell(4).setCellValue(0.0);
                }

                row.createCell(5).setCellValue(ruta.getEstado() != null ? ruta.getEstado() : "");
                row.createCell(6).setCellValue(ruta.getPrioridad() != null ? ruta.getPrioridad() : "");
                row.createCell(7).setCellValue(ruta.getVehiculoAsignado() != null ? ruta.getVehiculoAsignado() : "");
                row.createCell(8).setCellValue(ruta.getConductorAsignado() != null ? ruta.getConductorAsignado() : "");
                
                org.apache.poi.ss.usermodel.Cell costCell = row.createCell(9);
                if (ruta.getCostoTotal() != null) {
                    costCell.setCellValue(ruta.getCostoTotal().doubleValue());
                } else {
                    costCell.setCellValue(0.0);
                }
                costCell.setCellStyle(currencyStyle);
            }

            // Auto-ajustar columnas
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            e.printStackTrace();
            throw new IOException("Error generating Excel: " + e.getMessage(), e);
        }
    }

    // --- CLIENTES ---

    public ByteArrayInputStream generateClientsPdf() {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Reporte de Clientes - LogiStock", fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new int[]{4, 4, 5, 3, 3});

            String[] headers = {"Nombre", "Empresa", "Email", "Teléfono", "Categoría"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header));
                cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            List<Cliente> clientes = clienteRepository.findAll();
            for (Cliente cliente : clientes) {
                table.addCell(cliente.getNombre() != null ? cliente.getNombre() : "");
                table.addCell(cliente.getEmpresa() != null ? cliente.getEmpresa() : "");
                table.addCell(cliente.getEmail() != null ? cliente.getEmail() : "");
                table.addCell(cliente.getTelefono() != null ? cliente.getTelefono() : "");
                table.addCell(cliente.getCategoria() != null ? cliente.getCategoria() : "");
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateClientsExcel() throws IOException {
        String[] columns = {"Nombre", "Empresa", "Email", "Teléfono", "Dirección", "Categoría", "Total Compras"};

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Clientes");

            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.BLUE.getIndex());
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            CellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.setDataFormat(workbook.createDataFormat().getFormat("$#,##0.00"));

            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            List<Cliente> clientes = clienteRepository.findAll();
            int rowIdx = 1;
            for (Cliente cliente : clientes) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(cliente.getNombre() != null ? cliente.getNombre() : "");
                row.createCell(1).setCellValue(cliente.getEmpresa() != null ? cliente.getEmpresa() : "");
                row.createCell(2).setCellValue(cliente.getEmail() != null ? cliente.getEmail() : "");
                row.createCell(3).setCellValue(cliente.getTelefono() != null ? cliente.getTelefono() : "");
                row.createCell(4).setCellValue(cliente.getDireccion() != null ? cliente.getDireccion() : "");
                row.createCell(5).setCellValue(cliente.getCategoria() != null ? cliente.getCategoria() : "");
                
                org.apache.poi.ss.usermodel.Cell totalCell = row.createCell(6);
                if (cliente.getTotalCompras() != null) {
                    totalCell.setCellValue(cliente.getTotalCompras().doubleValue());
                } else {
                    totalCell.setCellValue(0.0);
                }
                totalCell.setCellStyle(currencyStyle);
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            e.printStackTrace();
            throw new IOException("Error generating Excel: " + e.getMessage(), e);
        }
    }

    // --- PROVEEDORES ---

    public ByteArrayInputStream generateSuppliersPdf() {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Reporte de Proveedores - LogiStock", fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new int[]{4, 4, 5, 3, 3});

            String[] headers = {"Nombre", "Empresa", "Email", "Teléfono", "Tipo"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header));
                cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            List<Proveedor> proveedores = proveedorRepository.findAll();
            for (Proveedor proveedor : proveedores) {
                table.addCell(proveedor.getNombre() != null ? proveedor.getNombre() : "");
                table.addCell(proveedor.getEmpresa() != null ? proveedor.getEmpresa() : "");
                table.addCell(proveedor.getEmail() != null ? proveedor.getEmail() : "");
                table.addCell(proveedor.getTelefono() != null ? proveedor.getTelefono() : "");
                table.addCell(proveedor.getTipo() != null ? proveedor.getTipo() : "");
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateSuppliersExcel() throws IOException {
        String[] columns = {"Nombre", "Empresa", "Email", "Teléfono", "Dirección", "Tipo", "País", "Ciudad"};

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Proveedores");

            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.BLUE.getIndex());
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            List<Proveedor> proveedores = proveedorRepository.findAll();
            int rowIdx = 1;
            for (Proveedor proveedor : proveedores) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(proveedor.getNombre() != null ? proveedor.getNombre() : "");
                row.createCell(1).setCellValue(proveedor.getEmpresa() != null ? proveedor.getEmpresa() : "");
                row.createCell(2).setCellValue(proveedor.getEmail() != null ? proveedor.getEmail() : "");
                row.createCell(3).setCellValue(proveedor.getTelefono() != null ? proveedor.getTelefono() : "");
                row.createCell(4).setCellValue(proveedor.getDireccion() != null ? proveedor.getDireccion() : "");
                row.createCell(5).setCellValue(proveedor.getTipo() != null ? proveedor.getTipo() : "");
                row.createCell(6).setCellValue(proveedor.getPais() != null ? proveedor.getPais() : "");
                row.createCell(7).setCellValue(proveedor.getCiudad() != null ? proveedor.getCiudad() : "");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            e.printStackTrace();
            throw new IOException("Error generating Excel: " + e.getMessage(), e);
        }
    }

    // --- PEDIDOS ---

    public ByteArrayInputStream generateOrdersPdf() {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Reporte de Pedidos - LogiStock", fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new int[]{4, 3, 4, 4, 3});

            String[] headers = {"Cliente", "Estado", "Fecha Creación", "Dirección Entrega", "Total"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header));
                cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            List<Pedido> pedidos = pedidoRepository.findAll();
            NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(Locale.US);

            for (Pedido pedido : pedidos) {
                table.addCell(pedido.getClienteNombre() != null ? pedido.getClienteNombre() : "");
                table.addCell(pedido.getEstado() != null ? pedido.getEstado().toString() : "");
                table.addCell(pedido.getFechaCreacion() != null ? pedido.getFechaCreacion().toString() : "");
                table.addCell(pedido.getDireccionEntrega() != null ? pedido.getDireccionEntrega() : "");
                table.addCell(currencyFormatter.format(pedido.getTotal()));
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateOrdersExcel() throws IOException {
        String[] columns = {"ID Pedido", "Cliente", "Estado", "Fecha Creación", "Dirección Entrega", "Total"};

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Pedidos");

            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.BLUE.getIndex());
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            CellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.setDataFormat(workbook.createDataFormat().getFormat("$#,##0.00"));

            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            List<Pedido> pedidos = pedidoRepository.findAll();
            int rowIdx = 1;
            for (Pedido pedido : pedidos) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(pedido.getId() != null ? pedido.getId() : "");
                row.createCell(1).setCellValue(pedido.getClienteNombre() != null ? pedido.getClienteNombre() : "");
                row.createCell(2).setCellValue(pedido.getEstado() != null ? pedido.getEstado().toString() : "");
                row.createCell(3).setCellValue(pedido.getFechaCreacion() != null ? pedido.getFechaCreacion().toString() : "");
                row.createCell(4).setCellValue(pedido.getDireccionEntrega() != null ? pedido.getDireccionEntrega() : "");
                
                org.apache.poi.ss.usermodel.Cell totalCell = row.createCell(5);
                totalCell.setCellValue(pedido.getTotal());
                totalCell.setCellStyle(currencyStyle);
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            e.printStackTrace();
            throw new IOException("Error generating Excel: " + e.getMessage(), e);
        }
    }
}
