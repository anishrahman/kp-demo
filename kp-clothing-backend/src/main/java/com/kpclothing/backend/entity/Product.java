package com.kpclothing.backend.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @Column(nullable = false, updatable = false)
    private String id;

    @Column(unique = true, nullable = false)
    private String code; // e.g. KP001 or KP-CHT-01

    private String name;

    @Column(unique = true)
    private String slug; // e.g. chettinad-cotton-classic-kp001

    private String category; // e.g. Chettinad Cotton

    private String categorySlug; // e.g. chettinad-cotton

    @Column(nullable = true)
    private Double price = 0.0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "image_order")
    @Column(name = "image_url", length = 1000)
    private List<String> images = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_media", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "media_order")
    private List<ProductMedia> media = new ArrayList<>();

    @Column(length = 2000)
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_highlights", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "highlight_order")
    @Column(name = "highlight", length = 1000)
    private List<String> highlights = new ArrayList<>();

    @Column(length = 500)
    private String sareeLength;

    @Column(length = 500)
    private String blousePiece;

    @Column(length = 500)
    private String fabric;

    @Column(length = 500)
    private String fabricWeight;

    @Column(length = 500)
    private String weaveDetails;

    @Column(length = 1000)
    private String careInstructions;

    @Column(length = 1000)
    private String authenticityNote;

    @Column(length = 500)
    private String availabilityText;

    @Column(length = 2000)
    private String details;

    private String weaver;

    private boolean handloom = true;

    private boolean inStock = true;

    private boolean isUpcoming = false;

    @Column(nullable = true)
    private Integer stockQuantity = 10;

    public Product() {}

    // ---- Getters and setters ----
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCategorySlug() { return categorySlug; }
    public void setCategorySlug(String categorySlug) { this.categorySlug = categorySlug; }

    public double getPrice() { return price != null ? price : 0.0; }
    public void setPrice(Double price) { this.price = price != null ? price : 0.0; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public List<ProductMedia> getMedia() { return media; }
    public void setMedia(List<ProductMedia> media) { this.media = media; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getWeaver() { return weaver; }
    public void setWeaver(String weaver) { this.weaver = weaver; }

    public boolean isHandloom() { return handloom; }
    public void setHandloom(boolean handloom) { this.handloom = handloom; }

    public boolean isInStock() { return inStock; }
    public void setInStock(boolean inStock) { this.inStock = inStock; }

    public boolean isUpcoming() { return isUpcoming; }
    public void setUpcoming(boolean upcoming) { isUpcoming = upcoming; }

    public int getStockQuantity() { return stockQuantity != null ? stockQuantity : 0; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity != null ? stockQuantity : 0; }

    public List<String> getHighlights() { return highlights != null ? highlights : new ArrayList<>(); }
    public void setHighlights(List<String> highlights) { this.highlights = highlights != null ? highlights : new ArrayList<>(); }

    public String getSareeLength() { return sareeLength; }
    public void setSareeLength(String sareeLength) { this.sareeLength = sareeLength; }

    public String getBlousePiece() { return blousePiece; }
    public void setBlousePiece(String blousePiece) { this.blousePiece = blousePiece; }

    public String getFabric() { return fabric; }
    public void setFabric(String fabric) { this.fabric = fabric; }

    public String getFabricWeight() { return fabricWeight; }
    public void setFabricWeight(String fabricWeight) { this.fabricWeight = fabricWeight; }

    public String getWeaveDetails() { return weaveDetails; }
    public void setWeaveDetails(String weaveDetails) { this.weaveDetails = weaveDetails; }

    public String getCareInstructions() { return careInstructions; }
    public void setCareInstructions(String careInstructions) { this.careInstructions = careInstructions; }

    public String getAuthenticityNote() { return authenticityNote; }
    public void setAuthenticityNote(String authenticityNote) { this.authenticityNote = authenticityNote; }

    public String getAvailabilityText() { return availabilityText; }
    public void setAvailabilityText(String availabilityText) { this.availabilityText = availabilityText; }
}
