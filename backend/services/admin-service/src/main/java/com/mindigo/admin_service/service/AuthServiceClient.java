package com.mindigo.admin_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class AuthServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    public void updateCounselorStatus(String email, String status, String comments) {
        try {
            String authServiceUrl = "http://AUTH-SERVICE/api/v1/auth/admin/update-counselor-status";

            CounselorStatusUpdateRequest request = new CounselorStatusUpdateRequest(email, status, comments);

            ResponseEntity<AuthServiceResponse> response = restTemplate.postForEntity(
                    authServiceUrl,
                    request,
                    AuthServiceResponse.class
            );

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new RuntimeException("Failed to update counselor status: Invalid response from auth-service");
            }

            if (!response.getBody().isSuccess()) {
                throw new RuntimeException("Failed to update counselor status: " + response.getBody().getMessage());
            }

            log.info("Successfully updated counselor status in auth service for email: {}", email);

        } catch (HttpClientErrorException e) {
            log.error("HTTP error while updating counselor status: {}", e.getMessage());
            throw new RuntimeException("Failed to update counselor status: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error communicating with auth-service: {}", e.getMessage());
            throw new RuntimeException("Error communicating with auth-service: " + e.getMessage());
        }
    }

    // Inner classes for request/response
    public static class CounselorStatusUpdateRequest {
        private String email;
        private String status;
        private String comments;

        public CounselorStatusUpdateRequest() {}

        public CounselorStatusUpdateRequest(String email, String status, String comments) {
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

    public static class AuthServiceResponse {
        private boolean success;
        private String message;

        public AuthServiceResponse() {}

        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}