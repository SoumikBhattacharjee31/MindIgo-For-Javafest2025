package com.mindigo.auth_service.repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ImageService {

    @Autowired
    private RestTemplate restTemplate;
    private final UserRepository repository;

    /**
     * This async method handles the file upload to the external file server.
     * It does not contain any database transactions itself.
     * @param email The user's email address.
     * @param file The image file to be uploaded.
     */
//    @Async
    public String processUserProfileImageUpload(String email, MultipartFile file) {

        try {
            String originalFilename = file.getOriginalFilename();
            String sanitizedFilename = sanitizeFilename(originalFilename);
            // Prepare the multipart form data
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return sanitizedFilename;
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            // Using the service name from the code, assuming it's a microservice registered with a discovery server.
            String fileServiceUrl = "http://FILE-SERVER/api/v1/file/upload/images";

            // Make the REST call to the file server
            ResponseEntity<String> response = restTemplate.postForEntity(fileServiceUrl, requestEntity, String.class);

//            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
//                String imageAddress = response.getBody();
//                // Call a separate, transactional method to update the user.
//                updateUserProfileImageUrl(email, imageAddress);
//                System.out.println("Uploaded image URL: " + imageAddress);
//            } else {
//                System.err.println("Failed to upload image: Invalid response from file-service");
//            }
            return response.getBody();
        } catch (HttpClientErrorException e) {
            System.err.println("Failed to upload image: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error communicating with file-service: " + e.getMessage());
        }
        return null;
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) {
            return "default_filename.png"; // Fallback in case filename is null
        }
        // Replace spaces and colons with underscores, and remove other invalid characters
        return filename.replaceAll("[\\s:]+", "_").replaceAll("[^a-zA-Z0-9._-]", "");
    }

    /**
     * This method is transactional and only handles the database update.
     * It should be called after the image has been successfully uploaded.
     * @param email The user's email address.
     * @param imageUrl The URL of the uploaded image.
     */
//    @Transactional
//    public void updateUserProfileImageUrl(String email, String imageUrl) throws InterruptedException {
//        User user = repository.findUserByEmail(email);
//        for (int i=0;i<10 && user == null; i++) {
//            Thread.sleep(1000);
//            user = repository.findUserByEmail(email);
//        }
//        if (user != null) {
//            user.setProfileImageUrl(imageUrl);
//            repository.save(user); // The save operation is wrapped in a transaction here.
//        } else {
//            System.err.println("User with email " + email + " not found during URL update.");
//        }
//    }
}
