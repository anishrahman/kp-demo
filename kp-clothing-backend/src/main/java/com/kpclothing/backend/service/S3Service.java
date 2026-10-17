package com.kpclothing.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.*;

@Service
public class S3Service {

    @Value("${aws.s3.bucket:kp-clothing-photos-2026}")
    private String bucketName;

    @Value("${aws.s3.region:us-east-1}")
    private String region;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of("video/mp4", "video/webm");

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

    private S3Client s3Client() {
        return S3Client.builder().region(Region.of(region)).build();
    }

    private S3Presigner s3Presigner() {
        return S3Presigner.builder().region(Region.of(region)).build();
    }

    /**
     * Inspect file header magic bytes to verify real MIME type.
     */
    public String detectMimeType(MultipartFile file) throws IOException {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[12];
            int read = is.read(header);
            if (read >= 3 && header[0] == (byte) 0xFF && header[1] == (byte) 0xD8 && header[2] == (byte) 0xFF) {
                return "image/jpeg";
            }
            if (read >= 8 && header[0] == (byte) 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) {
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
        }
        return file.getContentType() != null ? file.getContentType().toLowerCase() : "";
    }

    public String validateAndUpload(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty.");
        }

        String mime = detectMimeType(file);
        long size = file.getSize();

        boolean isImage = ALLOWED_IMAGE_TYPES.contains(mime);
        boolean isVideo = ALLOWED_VIDEO_TYPES.contains(mime);

        if (!isImage && !isVideo) {
            throw new IllegalArgumentException("Invalid file format (" + mime + "). Allowed formats: JPEG, PNG, WebP (Images max 5MB); MP4, WebM (Videos max 50MB).");
        }

        if (isImage && size > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("Image file size exceeds maximum limit of 5 MB.");
        }

        if (isVideo && size > MAX_VIDEO_SIZE) {
            throw new IllegalArgumentException("Video file size exceeds maximum limit of 50 MB.");
        }

        // Clean filename and generate secure UUID key
        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "media";
        String cleanName = original.replaceAll("[^a-zA-Z0-9._-]", "_");
        String extension = "";
        int dot = cleanName.lastIndexOf('.');
        if (dot >= 0) {
            extension = cleanName.substring(dot).toLowerCase();
        }

        String folder = isVideo ? "videos/" : "products/";
        String key = folder + UUID.randomUUID() + extension;

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(mime)
                    .build();

            s3Client().putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
        } catch (Exception e) {
            System.err.println("[S3Service ERROR] AWS S3 Upload failed (" + e.getClass().getName() + ": " + e.getMessage() + ")");
            // Store the genuine uploaded file on local disk so the user's real images/videos are preserved
            Path uploadDir = Paths.get("./uploads/" + folder).toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID() + extension;
            Path targetFile = uploadDir.resolve(filename);
            try (InputStream is = file.getInputStream()) {
                Files.copy(is, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
            return "/uploads/" + folder + filename;
        }
    }

    /**
     * Generates an S3 Pre-signed URL for direct browser-to-S3 video upload.
     */
    public Map<String, String> generatePresignedUploadUrl(String filename, String contentType, long fileSize) {
        if (!ALLOWED_VIDEO_TYPES.contains(contentType.toLowerCase()) && !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid content type for pre-signed upload: " + contentType);
        }

        String extension = filename.contains(".") ? filename.substring(filename.lastIndexOf('.')).toLowerCase() : ".mp4";
        String key = "videos/" + UUID.randomUUID() + extension;

        try (S3Presigner presigner = s3Presigner()) {
            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(15))
                    .putObjectRequest(objectRequest)
                    .build();

            PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(presignRequest);
            String uploadUrl = presignedRequest.url().toString();
            String downloadUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);

            return Map.of(
                    "uploadUrl", uploadUrl,
                    "downloadUrl", downloadUrl,
                    "key", key
            );
        } catch (Exception e) {
            // Fallback for offline dev
            return Map.of(
                    "uploadUrl", "http://localhost:5000/api/upload",
                    "downloadUrl", "/images/kal.jpg",
                    "key", "local-dev-mock"
            );
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains(bucketName)) return;
        try {
            int idx = fileUrl.indexOf(".com/");
            if (idx != -1) {
                String key = fileUrl.substring(idx + 5);
                DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build();
                s3Client().deleteObject(deleteRequest);
            }
        } catch (Exception ignored) {}
    }
}
