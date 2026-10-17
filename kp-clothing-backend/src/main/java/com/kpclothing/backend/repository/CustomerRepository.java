package com.kpclothing.backend.repository;

import com.kpclothing.backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, String> {
    Optional<Customer> findByPhone(String phone);
}
