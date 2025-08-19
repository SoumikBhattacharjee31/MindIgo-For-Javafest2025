package com.mindigo.auth_service.services;

import com.mindigo.auth_service.dto.request.CounselorApplicationRequest;
import com.mindigo.auth_service.dto.response.CounselorApplicationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class AdminServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    public void createCounselorApplication(CounselorApplicationRequest request) {
        try {
            String adminServiceUrl = "http://ADMIN-SERVICE/api/v1/admin/counselor-applications/create";

            ResponseEntity<CounselorApplicationResponse> response = restTemplate.postForEntity(
                    adminServiceUrl,
                    request,
                    CounselorApplicationResponse.class
            );

            if (response.getStatusCode() != HttpStatus.CREATED || response.getBody() == null) {
                throw new RuntimeException("Failed to create counselor application: Invalid response from admin-service");
            }

            if (!response.getBody().isSuccess()) {
                throw new RuntimeException("Failed to create counselor application: " + response.getBody().getMessage());
            }

            log.info("Successfully created counselor application for email: {}", request.getEmail());

        } catch (HttpClientErrorException e) {
            log.error("HTTP error while creating counselor application: {}", e.getMessage());
            throw new RuntimeException("Failed to create counselor application: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error communicating with admin-service: {}", e.getMessage());
            throw new RuntimeException("Error communicating with admin-service: " + e.getMessage());
        }
    }

    public void updateCounselorApplicationStatus(String email, String status, String comments) {
        try {
            String adminServiceUrl = "http://ADMIN-SERVICE/api/v1/admin/counselor-applications/update-status";

            UpdateStatusRequest request = new UpdateStatusRequest(email, status, comments);

            ResponseEntity<CounselorApplicationResponse> response = restTemplate.postForEntity(
                    adminServiceUrl,
                    request,
                    CounselorApplicationResponse.class
            );

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new RuntimeException("Failed to update counselor application status: Invalid response from admin-service");
            }

            if (!response.getBody().isSuccess()) {
                throw new RuntimeException("Failed to update counselor application status: " + response.getBody().getMessage());
            }

            log.info("Successfully updated counselor application status for email: {}", email);

        } catch (HttpClientErrorException e) {
            log.error("HTTP error while updating counselor application status: {}", e.getMessage());
            throw new RuntimeException("Failed to update counselor application status: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error communicating with admin-service: {}", e.getMessage());
            throw new RuntimeException("Error communicating with admin-service: " + e.getMessage());
        }
    }

    // Inner class for update status request
    public static class UpdateStatusRequest {
        private String email;
        private String status;
        private String comments;

        public UpdateStatusRequest() {}

        public UpdateStatusRequest(String email, String status, String comments) {
            this.email = email;
            this.status = status;
            this.comments = comments;
        }

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getComments() { return comments; }
        public void setComments(String comments) { this.comments = comments; }
    }
}