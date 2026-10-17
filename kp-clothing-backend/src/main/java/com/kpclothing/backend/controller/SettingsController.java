package com.kpclothing.backend.controller;

import com.kpclothing.backend.entity.StoreSettings;
import com.kpclothing.backend.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private SettingsService service;

    @GetMapping // public - store address, phone, story shown on site
    public StoreSettings get() {
        return service.get();
    }

    @PutMapping // admin only
    public StoreSettings update(@RequestBody StoreSettings settings) {
        return service.save(settings);
    }
}
