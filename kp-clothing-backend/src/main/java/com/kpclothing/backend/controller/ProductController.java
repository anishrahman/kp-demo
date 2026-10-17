package com.kpclothing.backend.controller;

import com.kpclothing.backend.entity.Product;
import com.kpclothing.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService service;

    @GetMapping
    public List<Product> getAll() {
        return service.getPublicProducts();
    }

    @GetMapping("/admin/all")
    public List<Product> getAllForAdmin() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable String id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Product> getBySlug(@PathVariable String slug) {
        return service.getBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping // admin only (protected by SecurityConfig)
    public Product create(@RequestBody Product product) {
        return service.save(product);
    }

    @PutMapping("/{id}") // admin only
    public Product update(@PathVariable String id, @RequestBody Product product) {
        product.setId(id);
        return service.save(product);
    }

    @DeleteMapping("/{id}") // admin only
    public ResponseEntity<?> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
