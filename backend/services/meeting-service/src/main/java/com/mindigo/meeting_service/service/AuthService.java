package com.mindigo.meeting_service.service;

import com.mindigo.meeting_service.dto.ApiResponseClass;
import com.mindigo.meeting_service.dto.UserProfileResponseFromAuth;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AuthService {

    @Autowired
    private RestTemplate restTemplate;

    public UserProfileResponseFromAuth getUserById(Long userId) {
        try {
            if (userId > Integer.MAX_VALUE || userId < Integer.MIN_VALUE) {
                throw new IllegalArgumentException("userId is out of valid range for Integer");
            }
            String authServiceUrl = "http://AUTH-SERVICE/api/v1/auth/profilebyid/" + userId.intValue();
            ResponseEntity<ApiResponseClass<UserProfileResponseFromAuth>> response = restTemplate.exchange(
                    authServiceUrl,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiResponseClass<UserProfileResponseFromAuth>>() {}
            );
            ApiResponseClass<UserProfileResponseFromAuth> apiResponse = response.getBody();
            return apiResponse != null ? apiResponse.getData() : null;
        } catch (Exception e) {
            System.err.println("Error fetching user profile: " + e.getMessage());
            return null;
        }
    }
}
