package com.mindigo.admin_service.client;

import com.mindigo.admin_service.dto.request.CreateCounselorAccountRequest;
import com.mindigo.admin_service.dto.response.ApiResponseClass;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "auth-service", url = "${auth-service.url:http://localhost:8081}")
public interface AuthServiceClient {

    @PostMapping("/api/v1/auth/admin/create-counselor")
    ResponseEntity<ApiResponseClass<Void>> createCounselorAccount(
            @RequestBody CreateCounselorAccountRequest request,
            @RequestHeader("Authorization") String authorization
    );
}
