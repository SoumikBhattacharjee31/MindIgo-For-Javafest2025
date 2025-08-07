package com.mindigo.auth_service.utils;

import com.mindigo.auth_service.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ImageHelper {
    @Autowired
    private RestTemplate restTemplate;
    private final UserRepository repository;

    @Transactional
    @Async
    public void setImage(String email, MultipartFile file) {
        var user = repository.findUserByEmail(email);
        if (user == null) return;

        try {
            // Prepare the multipart form data
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            String fileServiceUrl = "http://FILE-SERVICE/api/v1/file/upload/images"; // Adjust to your file-service URL

            // Make the REST call to the file server
            ResponseEntity<String> response = restTemplate.postForEntity(fileServiceUrl, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String imageAddress = response.getBody();
                user.setProfileImageUrl(imageAddress);
                System.out.println("Uploaded image URL: " + imageAddress);
            } else {
                throw new RuntimeException("Failed to upload image: Invalid response from file-service");
            }
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error communicating with file-service: " + e.getMessage());
        }
    }

    public void storeUserProfileImage(Long id, MultipartFile file) {
        String email = repository.findById(Math.toIntExact(id)).orElseThrow(() -> new RuntimeException("User not found")).getEmail();
        setImage(email, file);
    }
}