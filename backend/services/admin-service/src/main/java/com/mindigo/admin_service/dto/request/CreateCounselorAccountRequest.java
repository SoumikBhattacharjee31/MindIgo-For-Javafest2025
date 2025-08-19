package com.mindigo.admin_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCounselorAccountRequest {
    private String email;
    private String name;
    private String phoneNumber;
    private String medicalLicenseNumber;
    private String specialty;
    private String bio;
    private String profileImageUrl;
}

