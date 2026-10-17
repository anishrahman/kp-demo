package com.kpclothing.backend.controller;

import com.kpclothing.backend.entity.Order;
import com.kpclothing.backend.service.ExcelExportService;
import com.kpclothing.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService service;

    @Autowired
    private ExcelExportService excelExportService;

    @GetMapping // admin only - view all orders
    public List<Order> getAll() {
        return service.getAll();
    }

    @GetMapping("/mine") // customer orders history
    public List<Order> getMyOrders(@RequestParam(value = "phone", required = false) String phone,
                                  @RequestParam(value = "customerId", required = false) String customerId) {
        return service.getOrdersByCustomer(phone, customerId);
    }

    @GetMapping("/code/{orderCode}")
    public ResponseEntity<Order> getByOrderCode(@PathVariable String orderCode) {
        return service.getByOrderCode(orderCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping // public - customer places order with 3-step checkout
    public ResponseEntity<?> create(@RequestBody Order order) {
        try {
            Order created = service.create(order);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Unable to process order. Please try again."));
        }
    }

    @PatchMapping("/{id}") // admin only - update status
    public Order updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return service.updateStatus(id, body.get("status"));
    }

    @PatchMapping("/{id}/pay") // admin only - mark manual UPI/WhatsApp payment as PAID
    public Order markPaid(@PathVariable String id) {
        return service.markPaid(id);
    }

    @DeleteMapping("/{id}") // admin only
    public ResponseEntity<?> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Excel export: admin clicks "Download Orders" button ----
    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportOrders() throws IOException {
        List<Order> orders = service.getAll();
        var excelStream = excelExportService.ordersToExcel(orders);

        String filename = "kp-orders-" + java.time.LocalDate.now() + ".xlsx";

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(excelStream));
    }
}
