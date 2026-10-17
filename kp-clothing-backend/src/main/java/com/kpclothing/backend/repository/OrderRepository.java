package com.kpclothing.backend.repository;

import com.kpclothing.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findAllByOrderByDateDesc();
    Optional<Order> findByOrderCode(String orderCode);
    List<Order> findByClientPhoneOrderByDateDesc(String clientPhone);
    List<Order> findByCustomerIdOrderByDateDesc(String customerId);
}
