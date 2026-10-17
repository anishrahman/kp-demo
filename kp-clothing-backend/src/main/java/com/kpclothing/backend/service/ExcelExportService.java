package com.kpclothing.backend.service;

import com.kpclothing.backend.entity.Order;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExcelExportService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm").withZone(ZoneId.of("Asia/Kolkata"));

    public ByteArrayInputStream ordersToExcel(List<Order> orders) throws IOException {

        String[] columns = {
                "Order ID", "Customer Name", "Phone", "Address",
                "Product Code", "Product Name", "Price (Rs)", "Date", "Status"
        };

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Orders");

            // ---- Header row styling ----
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_YELLOW.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // ---- Data rows ----
            int rowIdx = 1;
            for (Order order : orders) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(order.getId());
                row.createCell(1).setCellValue(order.getClientName());
                row.createCell(2).setCellValue(order.getClientPhone());
                row.createCell(3).setCellValue(order.getClientAddress());
                row.createCell(4).setCellValue(order.getProductCode());
                row.createCell(5).setCellValue(order.getProductName());
                row.createCell(6).setCellValue(order.getProductPrice());
                row.createCell(7).setCellValue(
                        order.getDate() != null ? DATE_FORMAT.format(order.getDate()) : "");
                row.createCell(8).setCellValue(order.getStatus());
            }

            // Auto-size columns so the sheet is readable when opened
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
