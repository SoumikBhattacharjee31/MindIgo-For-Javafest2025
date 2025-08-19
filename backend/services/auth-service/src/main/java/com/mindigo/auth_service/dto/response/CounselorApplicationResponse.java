package com.mindigo.auth_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CounselorApplicationResponse {
    private boolean success;
    private String message;
    private Long applicationId;
    private String status;
}