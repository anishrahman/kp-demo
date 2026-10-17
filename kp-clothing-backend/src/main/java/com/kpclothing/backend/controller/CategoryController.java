package com.kpclothing.backend.controller;

import com.kpclothing.backend.entity.Category;
import com.kpclothing.backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService service;

    @GetMapping
    public List<Category> getCategories() {
        return service.getAll();
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Map<String, String> body) {
        String name = body != null ? body.get("name") : null;
        String desc = body != null ? body.get("description") : null;
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category name is required"));
        }
        Category created = service.create(name, desc);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable String id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
