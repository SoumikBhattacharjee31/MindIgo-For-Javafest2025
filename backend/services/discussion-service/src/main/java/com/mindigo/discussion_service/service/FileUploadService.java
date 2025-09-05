package com.mindigo.discussion_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadService {

    private final RestTemplate restTemplate;

    @Value("${services.file-server.url:http://FILE-SERVER}")
    private String fileServerUrl;

    public List<String> uploadImages(List<MultipartFile> images) {
        List<String> imageUrls = new ArrayList<>();

        for (MultipartFile image : images) {
            try {
                String imageUrl = uploadSingleImage(image);
                imageUrls.add(imageUrl);
            } catch (Exception e) {
                log.error("Failed to upload image: {}", image.getOriginalFilename(), e);
                throw new RuntimeException("Failed to upload image: " + image.getOriginalFilename());
            }
        }

        return imageUrls;
    }

    private String uploadSingleImage(MultipartFile image) throws Exception {
        String uploadUrl = fileServerUrl + "/api/v1/file/upload/images";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(image.getBytes()) {
            @Override
            public String getFilename() {
                return image.getOriginalFilename();
            }
        });

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(uploadUrl, requestEntity, Map.class);

        if (response.getBody() != null && (Boolean) response.getBody().get("success")) {
            return (String) response.getBody().get("data");
        }

        throw new RuntimeException("File upload failed");
    }
}