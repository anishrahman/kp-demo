package com.kpclothing.backend.controller;

import com.kpclothing.backend.entity.Customer;
import com.kpclothing.backend.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService service;

    @GetMapping // admin only
    public List<Customer> getAll() {
        return service.getAll();
    }

    @PostMapping("/register") // public - customer login/signup with name+phone
    public Customer register(@RequestBody Map<String, String> body) {
        return service.registerOrGet(body.get("name"), body.get("phone"), body.get("city"), body.get("email"));
    }
}
