package com.kpclothing.backend.repository;

import com.kpclothing.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    Optional<Product> findBySlug(String slug);
    Optional<Product> findByCode(String code);
    List<Product> findByCategorySlug(String categorySlug);
    List<Product> findByCategoryIgnoreCase(String category);
}
