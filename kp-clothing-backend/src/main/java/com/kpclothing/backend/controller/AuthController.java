package com.kpclothing.backend.controller;

import com.kpclothing.backend.service.AdminAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String token = adminAuthService.login(body.get("username"), body.get("password"));

        if (token == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }
        return ResponseEntity.ok(Map.of("token", token));
    }
}
