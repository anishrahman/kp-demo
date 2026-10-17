package com.kpclothing.backend.config;

import com.kpclothing.backend.entity.Product;
import com.kpclothing.backend.entity.ProductMedia;
import com.kpclothing.backend.repository.ProductRepository;
import com.kpclothing.backend.service.AdminAuthService;
import com.kpclothing.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private AdminAuthService adminAuthService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.kpclothing.backend.repository.CustomerRepository customerRepository;

    @Autowired
    private com.kpclothing.backend.service.CategoryService categoryService;

    @Value("${ADMIN_USERNAME:admin}")
    private String adminUsername;

    @Value("${ADMIN_PASSWORD:changeme123}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        // 1. Create default admin if not exists
        adminAuthService.createAdminIfNotExists(adminUsername, adminPassword);

        // 2. Seed default categories if missing
        categoryService.seedDefaultCategories();

        // 3. Normalize any existing sarees with generic or mismatched 'Sarees' category
        normalizeExistingProducts();

        // 4. Seed boutique catalog products for each category if not already present
        seedBaseProductsIfMissing();

        // 4. Seed sample customer if none exists
        if (customerRepository.count() == 0) {
            com.kpclothing.backend.entity.Customer c = new com.kpclothing.backend.entity.Customer();
            c.setName("Priya Sundaram");
            c.setPhone("7397335037");
            c.setCity("Chennai");
            c.setEmail("priya@example.com");
            c.setOrderCount(2);
            c.setTotalSpent(3298.0);
            customerRepository.save(c);
        }
    }

    private void normalizeExistingProducts() {
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            String cat = p.getCategory();
            if (cat == null || cat.trim().isEmpty() || cat.equalsIgnoreCase("sarees")) {
                String name = (p.getName() != null ? p.getName() : "").toLowerCase();
                String desc = (p.getDescription() != null ? p.getDescription() : "").toLowerCase();

                String resolvedCategory = "Chettinad Cotton";
                if (name.contains("mangalagiri") || desc.contains("mangalagiri")) {
                    resolvedCategory = "Mangalagiri";
                } else if (name.contains("kalamkari") || desc.contains("kalamkari")) {
                    resolvedCategory = "Kalamkari";
                } else if (name.contains("mulmul") || desc.contains("mulmul")) {
                    resolvedCategory = "Mulmul Cotton";
                } else if (name.contains("chettinad") || name.contains("chettiand") || desc.contains("chettinad")) {
                    resolvedCategory = "Chettinad Cotton";
                }

                p.setCategory(resolvedCategory);
                p.setCategorySlug(ProductService.toSlug(resolvedCategory));
                productRepository.save(p);
            }
        }
    }

    private void seedBaseProductsIfMissing() {
        seedSingleProduct(
                "KP-CHT-01",
                "Chettinad Cotton Classic",
                "Chettinad Cotton",
                1399.0,
                12,
                "/images/mar.jpg",
                "Traditional bold checks with authentic gold zari border. Handloom cotton that softens with every wash."
        );

        seedSingleProduct(
                "KP-MAN-02",
                "Mangalagiri Colour Band",
                "Mangalagiri",
                1799.0,
                8,
                "/images/blk.jpg",
                "Pure Mangalagiri handloom cotton with rich Nizam border and distinctive striped pallu."
        );

        seedSingleProduct(
                "KP-KAL-03",
                "Kalamkari Hand-Painted Motif",
                "Kalamkari",
                2199.0,
                15,
                "/images/kal.jpg",
                "Authentic pen Kalamkari art crafted with organic vegetable dyes on handloom cotton."
        );

        seedSingleProduct(
                "KP-MUL-04",
                "Mulmul Cotton Breeze",
                "Mulmul Cotton",
                1299.0,
                10,
                "/images/crm.jpg",
                "Feather-light pure mulmul cotton with delicate floral motifs and lightweight gold tissue border."
        );
    }

    private void seedSingleProduct(String code, String name, String category, double price, int stockQty, String image, String desc) {
        if (productRepository.findByCode(code).isPresent()) {
            return;
        }

        Product p = new Product();
        p.setId(UUID.randomUUID().toString());
        p.setCode(code);
        p.setName(name);
        p.setCategory(category);
        p.setCategorySlug(ProductService.toSlug(category));
        p.setSlug(ProductService.toSlug(name + "-" + code));
        p.setPrice(price);
        p.setStockQuantity(stockQty);
        p.setInStock(stockQty > 0);
        p.setUpcoming(false);
        p.setHandloom(true);
        p.setDescription(desc);
        p.setDetails(String.format("{\"stockQuantity\":%d}", stockQty));

        List<String> images = new ArrayList<>();
        images.add(image);
        p.setImages(images);

        List<ProductMedia> media = new ArrayList<>();
        media.add(new ProductMedia(image, "IMAGE", "FRONT", 0));
        p.setMedia(media);

        productRepository.save(p);
    }
}
