package com.kpclothing.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );
    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of(
            "video/mp4", "video/webm"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".webp", ".mp4", ".webm"
    );

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

    @Value("${server.port:5000}")
    private int serverPort;

    @PostMapping
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "slot", required = false) String slot) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File cannot be empty."));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 50 MB limit."));
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "media";
        String extension = "";
        int dot = originalFilename.lastIndexOf('.');
        if (dot >= 0) {
            extension = originalFilename.substring(dot).toLowerCase();
        }

        String detectedMime = detectMimeType(file);
        boolean isImage = ALLOWED_IMAGE_TYPES.contains(detectedMime)
                || extension.equals(".jpg") || extension.equals(".jpeg") || extension.equals(".png") || extension.equals(".webp");
        boolean isVideo = ALLOWED_VIDEO_TYPES.contains(detectedMime)
                || extension.equals(".mp4") || extension.equals(".webm");

        if (!isImage && !isVideo) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid file format (" + detectedMime + "). Allowed formats: JPEG, PNG, WebP (Images); MP4, WebM (Videos up to 50MB)."
            ));
        }

        if (extension.isEmpty() || !ALLOWED_EXTENSIONS.contains(extension)) {
            extension = isVideo ? ".mp4" : ".webp";
        }

        try {
            Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String slotPrefix = (slot != null && !slot.isBlank()) ? slot.trim().toLowerCase() + "_" : "";
            String uniqueFilename = slotPrefix + UUID.randomUUID() + extension;
            Path targetFile = uploadDir.resolve(uniqueFilename);

            try (InputStream is = file.getInputStream()) {
                Files.copy(is, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }

            // Build public URL: http://localhost:5000/uploads/<filename>
            String publicUrl;
            try {
                String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
                if (baseUrl != null && !baseUrl.isBlank()) {
                    publicUrl = baseUrl + "/uploads/" + uniqueFilename;
                } else {
                    publicUrl = "http://localhost:" + serverPort + "/uploads/" + uniqueFilename;
                }
            } catch (Exception e) {
                publicUrl = "http://localhost:" + serverPort + "/uploads/" + uniqueFilename;
            }

            return ResponseEntity.ok(Map.of(
                    "url", publicUrl,
                    "filename", uniqueFilename
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "File upload failed: " + e.getMessage()));
        }
    }

    private String detectMimeType(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[12];
            int read = is.read(header);
            if (read >= 3 && header[0] == (byte) 0xFF && header[1] == (byte) 0xD8 && header[2] == (byte) 0xFF) {
                return "image/jpeg";
            }
            if (read >= 8 && header[0] == (byte) 0x89 && header[1] == (byte) 0x4E && header[2] == (byte) 0x47) {
                return "image/png";
            }
            if (read >= 12 && header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F'
                    && header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P') {
                return "image/webp";
            }
            if (read >= 8 && header[4] == 'f' && header[5] == 't' && header[6] == 'y' && header[7] == 'p') {
                return "video/mp4";
            }
            if (read >= 4 && header[0] == 0x1A && header[1] == 0x45 && header[2] == (byte) 0xDF && header[3] == (byte) 0xA3) {
                return "video/webm";
            }
        } catch (Exception ignored) {}
        return file.getContentType() != null ? file.getContentType().toLowerCase() : "";
    }

    @PostMapping("/presign")
    public ResponseEntity<?> presign(@RequestBody Map<String, Object> body) {
        String filename = (String) body.getOrDefault("filename", "video.mp4");
        String extension = filename.contains(".") ? filename.substring(filename.lastIndexOf('.')).toLowerCase() : ".mp4";
        String uniqueFilename = UUID.randomUUID() + extension;
        String publicUrl = "http://localhost:" + serverPort + "/uploads/" + uniqueFilename;
        return ResponseEntity.ok(Map.of(
                "uploadUrl", "http://localhost:" + serverPort + "/api/upload",
                "downloadUrl", publicUrl,
                "key", uniqueFilename
        ));
    }

    @DeleteMapping
    public ResponseEntity<?> delete(@RequestBody Map<String, String> body) {
        String url = body.get("url");
        if (url != null) {
            try {
                String filename = url.contains("/") ? url.substring(url.lastIndexOf('/') + 1) : url;
                Path filePath = Paths.get("uploads").toAbsolutePath().normalize().resolve(filename);
                Files.deleteIfExists(filePath);
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of("success", true));
    }
}
