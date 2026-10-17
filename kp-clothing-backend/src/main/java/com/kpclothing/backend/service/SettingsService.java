package com.kpclothing.backend.service;

import com.kpclothing.backend.entity.StoreSettings;
import com.kpclothing.backend.repository.StoreSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SettingsService {

    @Autowired
    private StoreSettingsRepository repository;

    public StoreSettings get() {
        StoreSettings s = repository.findById(1L).orElseGet(() -> {
            StoreSettings def = new StoreSettings();
            def.setId(1L);
            def.setBrandName("KP CLOTHING");
            def.setBrandTagline("COMFORT MEETS ELEGANCE");
            def.setWhatsappPhone("917397335037");
            def.setUpiId("kpclothing@upi");
            def.setUpiPayeeName("KP Clothing");
            def.setAboutHeading("Our Story & Artisanal Heritage");
            def.setAboutText("Handpicked sarees with a focus on comfort, craftsmanship and timeless elegance.");
            return repository.save(def);
        });
        if (s.getWhatsappPhone() == null || s.getWhatsappPhone().isBlank()) {
            s.setWhatsappPhone("917397335037");
        }
        if (s.getPhone() == null || s.getPhone().isBlank() || s.getPhone().contains("80561")) {
            s.setPhone("+91 7397335037");
        }
        if (s.getUpiId() == null || s.getUpiId().isBlank()) {
            s.setUpiId("kpclothing@upi");
        }
        if (s.getUpiPayeeName() == null || s.getUpiPayeeName().isBlank()) {
            s.setUpiPayeeName("KP Clothing");
        }
        return s;
    }

    public StoreSettings save(StoreSettings settings) {
        settings.setId(1L); // always overwrite the single settings row
        return repository.save(settings);
    }
}
