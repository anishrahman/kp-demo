package com.kpclothing.backend.service;

import com.kpclothing.backend.entity.Product;
import com.kpclothing.backend.entity.ProductMedia;
import com.kpclothing.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public static String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-+", "-").replaceAll("^-|-$", "");
    }

    public List<Product> getAll() {
        List<Product> products = repository.findAll();
        products.forEach(this::normalizeProductMedia);
        return products;
    }

    public List<Product> getPublicProducts() {
        List<Product> products = repository.findAll();
        List<Product> sanitized = new ArrayList<>();
        for (Product p : products) {
            normalizeProductMedia(p);
            // If upcoming design (New Collection), ensure real photo is never sent to public browser
            if (p.isUpcoming()) {
                Product safe = cloneSafe(p);
                safe.setImages(new ArrayList<>());
                safe.setMedia(new ArrayList<>());
                sanitized.add(safe);
            } else {
                sanitized.add(p);
            }
        }
        return sanitized;
    }

    public Optional<Product> getById(String id) {
        return repository.findById(id).map(p -> {
            normalizeProductMedia(p);
            return p;
        });
    }

    public Optional<Product> getBySlug(String slug) {
        return repository.findBySlug(slug).map(p -> {
            normalizeProductMedia(p);
            return p;
        });
    }

    public Optional<Product> getByCode(String code) {
        return repository.findByCode(code).map(p -> {
            normalizeProductMedia(p);
            return p;
        });
    }

    public Product save(Product product) {
        if (product.getId() == null || product.getId().trim().isEmpty()) {
            product.setId(UUID.randomUUID().toString());
        }

        String rawCat = product.getCategory();
        if (rawCat == null || rawCat.trim().isEmpty() || rawCat.equalsIgnoreCase("sarees")) {
            product.setCategory("Chettinad Cotton");
        } else {
            product.setCategory(rawCat.trim());
        }

        // Generate Category Slug
        product.setCategorySlug(toSlug(product.getCategory()));

        // Generate Product Slug (Name + Code)
        String baseSlug = toSlug(product.getName() + "-" + (product.getCode() != null ? product.getCode() : ""));
        if (baseSlug.isEmpty()) {
            baseSlug = "saree-" + product.getId();
        }
        product.setSlug(baseSlug);

        // Ensure Media and Images synchronization
        if (product.getMedia() == null) product.setMedia(new ArrayList<>());
        if (product.getImages() == null) product.setImages(new ArrayList<>());

        // If media was provided, sync images list with media URLs
        if (!product.getMedia().isEmpty()) {
            List<String> imageUrls = new ArrayList<>();
            for (ProductMedia m : product.getMedia()) {
                if ("IMAGE".equalsIgnoreCase(m.getType()) && m.getUrl() != null && !m.getUrl().isEmpty()) {
                    imageUrls.add(m.getUrl());
                }
            }
            product.setImages(imageUrls);
        } else if (!product.getImages().isEmpty()) {
            // Legacy images migration: convert images to OTHER media entries
            List<ProductMedia> mediaList = new ArrayList<>();
            for (int i = 0; i < product.getImages().size(); i++) {
                String url = product.getImages().get(i);
                if (url != null && !url.isEmpty()) {
                    mediaList.add(new ProductMedia(url, "IMAGE", "OTHER", i));
                }
            }
            product.setMedia(mediaList);
        }

        normalizeProductMedia(product);
        return repository.save(product);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }

    // Sort media items: FRONT -> BACK -> SIDE -> FABRIC -> OTHER -> VIDEO
    private void normalizeProductMedia(Product product) {
        if (product == null || product.getMedia() == null) return;

        Map<String, Integer> viewPriority = Map.of(
            "FRONT", 1,
            "BACK", 2,
            "SIDE", 3,
            "FABRIC", 4,
            "OTHER", 5
        );

        product.getMedia().sort((a, b) -> {
            boolean aIsVideo = "VIDEO".equalsIgnoreCase(a.getType());
            boolean bIsVideo = "VIDEO".equalsIgnoreCase(b.getType());
            if (aIsVideo && !bIsVideo) return 1;
            if (!aIsVideo && bIsVideo) return -1;

            int aPrio = viewPriority.getOrDefault(a.getView() != null ? a.getView().toUpperCase() : "OTHER", 5);
            int bPrio = viewPriority.getOrDefault(b.getView() != null ? b.getView().toUpperCase() : "OTHER", 5);
            if (aPrio != bPrio) return Integer.compare(aPrio, bPrio);
            return Integer.compare(a.getSortOrder(), b.getSortOrder());
        });
    }

    private Product cloneSafe(Product src) {
        Product p = new Product();
        p.setId(src.getId());
        p.setCode(src.getCode());
        p.setName(src.getName());
        p.setSlug(src.getSlug());
        p.setCategory(src.getCategory());
        p.setCategorySlug(src.getCategorySlug());
        p.setPrice(src.getPrice());
        p.setDescription(src.getDescription());
        p.setDetails(src.getDetails());
        p.setWeaver(src.getWeaver());
        p.setHandloom(src.isHandloom());
        p.setInStock(src.isInStock());
        p.setUpcoming(src.isUpcoming());
        p.setStockQuantity(src.getStockQuantity());
        p.setHighlights(src.getHighlights() != null ? new ArrayList<>(src.getHighlights()) : new ArrayList<>());
        p.setSareeLength(src.getSareeLength());
        p.setBlousePiece(src.getBlousePiece());
        p.setFabric(src.getFabric());
        p.setFabricWeight(src.getFabricWeight());
        p.setWeaveDetails(src.getWeaveDetails());
        p.setCareInstructions(src.getCareInstructions());
        p.setAuthenticityNote(src.getAuthenticityNote());
        p.setAvailabilityText(src.getAvailabilityText());
        return p;
    }
}