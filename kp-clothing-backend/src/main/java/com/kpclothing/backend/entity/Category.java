package com.kpclothing.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @Column(nullable = false, updatable = false)
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(length = 1000)
    private String description;

    private String swatchKey;

    private Instant createdAt = Instant.now();

    public Category() {}

    public Category(String id, String name, String slug, String description, String swatchKey) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.swatchKey = swatchKey;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSwatchKey() { return swatchKey; }
    public void setSwatchKey(String swatchKey) { this.swatchKey = swatchKey; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
