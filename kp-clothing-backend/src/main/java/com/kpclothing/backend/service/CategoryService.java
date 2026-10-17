package com.kpclothing.backend.service;

import com.kpclothing.backend.entity.Category;
import com.kpclothing.backend.entity.Product;
import com.kpclothing.backend.repository.CategoryRepository;
import com.kpclothing.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository repository;

    @Autowired
    private ProductRepository productRepository;

    public List<Category> getAll() {
        if (repository.count() == 0) {
            seedDefaultCategories();
        }
        return repository.findAllByOrderByCreatedAtAsc();
    }

    public synchronized void seedDefaultCategories() {
        seedIfMissing("c-chettinad", "Chettinad Cotton", "chettinad-cotton", "Checks with gold zari borders", "mar");
        seedIfMissing("c-mangalagiri", "Mangalagiri", "mangalagiri", "Rich colour bands on black", "blk");
        seedIfMissing("c-kalamkari", "Kalamkari", "kalamkari", "Hand-painted style motifs", "kal");
        seedIfMissing("c-mulmul", "Mulmul Cotton", "mulmul-cotton", "Light, soft and breezy", "crm");
        seedIfMissing("c-new-collection", "New Collection", "new-collection", "Upcoming exclusive designs crafting on the loom", "nwc");
    }

    private void seedIfMissing(String id, String name, String slug, String desc, String swatch) {
        if (repository.findByNameIgnoreCase(name).isEmpty() && repository.findBySlug(slug).isEmpty()) {
            Category c = new Category(id, name, slug, desc, swatch);
            repository.save(c);
        }
    }

    public Category create(String name, String description) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }
        String cleanName = name.trim();
        Optional<Category> existing = repository.findByNameIgnoreCase(cleanName);
        if (existing.isPresent()) {
            return existing.get();
        }

        String slug = ProductService.toSlug(cleanName);
        if (slug.isEmpty()) {
            slug = "cat-" + UUID.randomUUID().toString().substring(0, 8);
        }

        // Handle slug conflict if any
        Optional<Category> bySlug = repository.findBySlug(slug);
        if (bySlug.isPresent()) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 4);
        }

        Category cat = new Category();
        cat.setId("cat-" + UUID.randomUUID().toString());
        cat.setName(cleanName);
        cat.setSlug(slug);
        cat.setDescription(description != null ? description.trim() : "");
        cat.setSwatchKey("mar");
        cat.setCreatedAt(Instant.now());

        return repository.save(cat);
    }

    public void delete(String id) {
        Category cat = repository.findById(id).orElseThrow(() ->
            new RuntimeException("Category not found: " + id));

        // Safety check: ensure no products are tagged with this category
        List<Product> products = productRepository.findAll();
        boolean inUse = products.stream().anyMatch(p ->
            (p.getCategory() != null && p.getCategory().equalsIgnoreCase(cat.getName())) ||
            (p.getCategorySlug() != null && p.getCategorySlug().equalsIgnoreCase(cat.getSlug()))
        );

        if (inUse) {
            throw new IllegalStateException("Cannot delete category '" + cat.getName() + "' because sarees are assigned to it.");
        }

        repository.delete(cat);
    }
}
