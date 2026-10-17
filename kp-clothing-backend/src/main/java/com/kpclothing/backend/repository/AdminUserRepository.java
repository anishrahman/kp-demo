package com.kpclothing.backend.repository;

import com.kpclothing.backend.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, String> {
    Optional<AdminUser> findByUsername(String username);
}
