package com.kpclothing.backend.service;

import com.kpclothing.backend.config.JwtUtil;
import com.kpclothing.backend.entity.AdminUser;
import com.kpclothing.backend.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    @Autowired
    private AdminUserRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Returns a JWT token if login succeeds, or null if the username/password is wrong.
     */
    public String login(String username, String rawPassword) {
        AdminUser user = repository.findByUsername(username).orElse(null);
        if (user == null) return null;

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            return null;
        }
        return jwtUtil.generateToken(username);
    }

    /**
     * Run once (e.g. via CommandLineRunner) to create the first admin account.
     * See DataSeeder.java.
     */
    public void createAdminIfNotExists(String username, String rawPassword) {
        if (repository.findByUsername(username).isEmpty()) {
            AdminUser user = new AdminUser();
            user.setUsername(username);
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            repository.save(user);
        }
    }
}
