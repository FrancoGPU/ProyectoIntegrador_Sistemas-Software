package com.logistock.service;

import com.logistock.model.Product;
import com.logistock.repository.ProductRepository;
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
}
