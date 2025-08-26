package com.mindigo.meeting_service.service;

import com.mindigo.meeting_service.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AuthService {

    @Autowired
    private RestTemplate restTemplate;

    public UserDto getUserById(Long userId) {
        try {
            String authServiceUrl = "http://AUTH-SERVICE/api/v1/auth/user/" + userId;
            ResponseEntity<UserDto> response = restTemplate.getForEntity(authServiceUrl, UserDto.class);
            return response.getBody();
        } catch (Exception e) {
            return null;
        }
    }
}
