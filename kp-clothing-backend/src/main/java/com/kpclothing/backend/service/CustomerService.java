package com.kpclothing.backend.service;

import com.kpclothing.backend.entity.Customer;
import com.kpclothing.backend.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository repository;

    public List<Customer> getAll() {
        return repository.findAll();
    }

    public Customer registerOrGet(String name, String phone, String city, String email) {
        Customer c = repository.findByPhone(phone).orElseGet(Customer::new);
        c.setName(name);
        c.setPhone(phone);
        c.setCity(city);
        c.setEmail(email);
        return repository.save(c);
    }
}
